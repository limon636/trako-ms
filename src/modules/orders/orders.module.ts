import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { OrderStatusHistory } from '../../entities/order-status-history.entity';
import { Product } from '../../entities/product.entity';
import { StockLedger } from '../../entities/stock-ledger.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SubscriptionLimitsGuard } from '../../common/guards/subscription-limits.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderStatusHistory, Product, StockLedger])],
  controllers: [OrdersController],
  providers: [OrdersService, SubscriptionLimitsGuard],
  exports: [TypeOrmModule],
})
export class OrdersModule {}
