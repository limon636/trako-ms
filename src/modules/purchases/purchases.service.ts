import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Purchase, PurchasePaymentStatus } from '../../entities/purchase.entity';
import { PurchaseItem } from '../../entities/purchase-item.entity';
import { Product } from '../../entities/product.entity';
import { StockLedger, StockReferenceType } from '../../entities/stock-ledger.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepo: Repository<Purchase>,
    private readonly dataSource: DataSource,
  ) {}

  async create(storeId: number, userId: number | null, dto: CreatePurchaseDto): Promise<Purchase> {
    return this.dataSource.transaction(async (manager) => {
      let subtotal = 0;
      const items: PurchaseItem[] = [];

      for (const itemDto of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: itemDto.productId, storeId },
        });
        if (!product) throw new BadRequestException(`Product ${itemDto.productId} not found`);

        const lineTotal = itemDto.quantity * itemDto.unitCost;
        subtotal += lineTotal;

        items.push(
          manager.create(PurchaseItem, {
            productId: product.id,
            productName: product.name,
            quantity: itemDto.quantity,
            unitCost: itemDto.unitCost,
            lineTotal,
          }),
        );
      }

      const additionalCharges = dto.additionalCharges ?? 0;
      const grandTotal = subtotal + additionalCharges;
      const amountPaid = dto.amountPaid ?? 0;
      const dueAmount = grandTotal - amountPaid;

      const count = await manager.count(Purchase, { where: { storeId } });
      const purchaseNumber = `PUR-${String(count + 1).padStart(6, '0')}`;

      const purchase = manager.create(Purchase, {
        storeId,
        purchaseNumber,
        dealerId: dto.dealerId,
        createdBy: userId,
        subtotal,
        additionalCharges,
        grandTotal,
        amountPaid,
        dueAmount,
        paymentMethod: dto.paymentMethod,
        paymentStatus:
          dueAmount <= 0
            ? PurchasePaymentStatus.PAID
            : amountPaid > 0
              ? PurchasePaymentStatus.PARTIAL
              : PurchasePaymentStatus.DUE,
        invoiceNumber: dto.invoiceNumber ?? null,
        purchaseDate: dto.purchaseDate,
        note: dto.note ?? null,
      });

      const savedPurchase = await manager.save(Purchase, purchase);

      for (const item of items) {
        item.purchaseId = savedPurchase.id;
        await manager.save(PurchaseItem, item);

        // Add to stock
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
        await manager.save(StockLedger, {
          storeId,
          productId: item.productId,
          referenceType: StockReferenceType.PURCHASE,
          referenceId: savedPurchase.id,
          quantityChange: item.quantity,
          balanceAfter: currentStock + item.quantity,
        });
      }

      return manager.findOne(Purchase, {
        where: { id: savedPurchase.id },
        relations: { items: true, dealer: true },
      }) as Promise<Purchase>;
    });
  }

  findAll(storeId: number): Promise<Purchase[]> {
    return this.purchaseRepo.find({
      where: { storeId },
      relations: { dealer: true, items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(storeId: number, id: number): Promise<Purchase> {
    const purchase = await this.purchaseRepo.findOne({
      where: { id, storeId },
      relations: { dealer: true, items: true, creator: true },
    });
    if (!purchase) throw new NotFoundException('Purchase not found');
    return purchase;
  }
}
