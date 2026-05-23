import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../entities/payment.entity';
import { Order } from '../../entities/order.entity';
import { Purchase } from '../../entities/purchase.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order, Purchase])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [TypeOrmModule],
})
export class PaymentsModule {}
