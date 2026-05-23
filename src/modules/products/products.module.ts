import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { StockLedger } from '../../entities/stock-ledger.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SubscriptionLimitsGuard } from '../../common/guards/subscription-limits.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Product, StockLedger])],
  controllers: [ProductsController],
  providers: [ProductsService, SubscriptionLimitsGuard],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
