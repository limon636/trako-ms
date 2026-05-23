import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, SubscriptionPlan])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [TypeOrmModule],
})
export class SubscriptionsModule {}
