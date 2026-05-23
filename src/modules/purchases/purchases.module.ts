import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from '../../entities/purchase.entity';
import { PurchaseItem } from '../../entities/purchase-item.entity';
import { Product } from '../../entities/product.entity';
import { StockLedger } from '../../entities/stock-ledger.entity';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem, Product, StockLedger])],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [TypeOrmModule],
})
export class PurchasesModule {}
