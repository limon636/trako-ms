import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../../entities/store.entity';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { SubscriptionLimitsGuard } from '../../common/guards/subscription-limits.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  controllers: [StoresController],
  providers: [StoresService, SubscriptionLimitsGuard],
  exports: [StoresService, TypeOrmModule],
})
export class StoresModule {}
