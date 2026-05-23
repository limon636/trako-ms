import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { SubscriptionPlansController } from './subscription-plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan])],
  controllers: [SubscriptionPlansController],
  exports: [TypeOrmModule],
})
export class SubscriptionPlansModule {}
