import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment, PaymentReferenceType } from '../../entities/payment.entity';
import { Order, PaymentStatus } from '../../entities/order.entity';
import { Purchase, PurchasePaymentStatus } from '../../entities/purchase.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly dataSource: DataSource,
  ) {}

  async create(storeId: number, userId: number | null, dto: CreatePaymentDto): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const payment = manager.create(Payment, {
        storeId,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        paymentDate: dto.paymentDate,
        recordedBy: userId,
        note: dto.note ?? null,
      });

      const savedPayment = await manager.save(Payment, payment);

      // Update due amounts on parent entity
      if (dto.referenceType === PaymentReferenceType.ORDER) {
        const order = await manager.findOne(Order, {
          where: { id: dto.referenceId, storeId },
        });
        if (order) {
          order.dueAmount = Math.max(0, Number(order.dueAmount) - dto.amount);
          order.advancePaid = Number(order.advancePaid) + dto.amount;
          order.paymentStatus =
            order.dueAmount <= 0
              ? PaymentStatus.PAID
              : PaymentStatus.PARTIAL;
          await manager.save(Order, order);
        }
      } else if (dto.referenceType === PaymentReferenceType.PURCHASE) {
        const purchase = await manager.findOne(Purchase, {
          where: { id: dto.referenceId, storeId },
        });
        if (purchase) {
          purchase.dueAmount = Math.max(0, Number(purchase.dueAmount) - dto.amount);
          purchase.amountPaid = Number(purchase.amountPaid) + dto.amount;
          purchase.paymentStatus =
            purchase.dueAmount <= 0
              ? PurchasePaymentStatus.PAID
              : PurchasePaymentStatus.PARTIAL;
          await manager.save(Purchase, purchase);
        }
      }

      return savedPayment;
    });
  }

  findAll(storeId: number): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(storeId: number, id: number): Promise<Payment> {
    const p = await this.paymentRepo.findOne({ where: { id, storeId } });
    if (!p) throw new NotFoundException('Payment not found');
    return p;
  }
}
