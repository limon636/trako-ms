import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, DiscountType, PaymentStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { OrderStatusHistory } from '../../entities/order-status-history.entity';
import { Product } from '../../entities/product.entity';
import { StockLedger, StockReferenceType } from '../../entities/stock-ledger.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(StockLedger)
    private readonly stockRepo: Repository<StockLedger>,
    private readonly dataSource: DataSource,
  ) {}

  async create(storeId: number, userId: number | null, dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      // Build items with product snapshot
      let subtotal = 0;
      const items: OrderItem[] = [];

      for (const itemDto of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: itemDto.productId, storeId, isActive: true },
        });
        if (!product) {
          throw new BadRequestException(`Product ${itemDto.productId} not found`);
        }

        const lineTotal = itemDto.quantity * itemDto.unitPrice;
        subtotal += lineTotal;

        const item = manager.create(OrderItem, {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          lineTotal,
        });
        items.push(item);
      }

      // Calculate totals
      let discountAmount = dto.discountAmount ?? 0;
      if (dto.discountType === DiscountType.PERCENT) {
        discountAmount = (subtotal * discountAmount) / 100;
      }
      const deliveryCharge = dto.deliveryCharge ?? 0;
      const grandTotal = subtotal - discountAmount + deliveryCharge;
      const advancePaid = dto.advancePaid ?? 0;
      const dueAmount = grandTotal - advancePaid;

      // Generate order number
      const orderNumber = await this.generateOrderNumber(storeId, manager);

      const order = manager.create(Order, {
        storeId,
        orderNumber,
        customerId: dto.customerId,
        createdBy: userId,
        deliveryAddress: dto.deliveryAddress,
        subtotal,
        discountType: dto.discountType ?? null,
        discountAmount: dto.discountAmount ?? 0,
        deliveryCharge,
        grandTotal,
        advancePaid,
        dueAmount,
        paymentMethod: dto.paymentMethod,
        paymentStatus: dueAmount <= 0 ? PaymentStatus.PAID : advancePaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.DUE,
        deliveryMethod: dto.deliveryMethod,
        courierName: dto.courierName ?? null,
        trackingId: dto.trackingId ?? null,
        expectedDeliveryDate: dto.expectedDeliveryDate ?? null,
        note: dto.note ?? null,
      });

      const savedOrder = await manager.save(Order, order);

      // Save items and deduct stock
      for (const item of items) {
        item.orderId = savedOrder.id;
        await manager.save(OrderItem, item);

        // Deduct stock
        const currentStockResult = await manager
          .createQueryBuilder()
          .select('SUM(s.quantity_change)', 'total')
          .from(StockLedger, 's')
          .where('s.store_id = :storeId AND s.product_id = :productId', {
            storeId,
            productId: item.productId,
          })
          .getRawOne<{ total: string | null }>();

        const currentStock = parseInt(currentStockResult?.total ?? '0', 10);
        const balanceAfter = currentStock - item.quantity;

        await manager.save(StockLedger, {
          storeId,
          productId: item.productId,
          referenceType: StockReferenceType.ORDER,
          referenceId: savedOrder.id,
          quantityChange: -item.quantity,
          balanceAfter,
        });
      }

      // Initial status history
      await manager.save(OrderStatusHistory, {
        orderId: savedOrder.id,
        fromStatus: null,
        toStatus: 'NEW',
        changedBy: userId,
      });

      return manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: { items: true, customer: true },
      }) as Promise<Order>;
    });
  }

  findAll(storeId: number, status?: string): Promise<Order[]> {
    const where: Record<string, unknown> = { storeId };
    if (status) where['orderStatus'] = status;
    return this.orderRepo.find({
      where,
      relations: { customer: true, items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(storeId: number, id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id, storeId },
      relations: { customer: true, items: true, statusHistory: true, creator: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(
    storeId: number,
    orderId: number,
    userId: number | null,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { id: orderId, storeId } });
      if (!order) throw new NotFoundException('Order not found');

      const fromStatus = order.orderStatus;
      order.orderStatus = dto.orderStatus;
      if (dto.trackingId) order.trackingId = dto.trackingId;
      await manager.save(Order, order);

      await manager.save(OrderStatusHistory, {
        orderId,
        fromStatus,
        toStatus: dto.orderStatus,
        changedBy: userId,
        trackingId: dto.trackingId ?? null,
        note: dto.note ?? null,
      });

      return manager.findOne(Order, {
        where: { id: orderId },
        relations: { items: true, statusHistory: true },
      }) as Promise<Order>;
    });
  }

  private async generateOrderNumber(
    storeId: number,
    manager: import('typeorm').EntityManager,
  ): Promise<string> {
    const today = new Date();
    const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const count = await manager.count(Order, { where: { storeId } });
    const seq = String(count + 1).padStart(4, '0');
    return `ORD-${datePart}-${seq}`;
  }
}
