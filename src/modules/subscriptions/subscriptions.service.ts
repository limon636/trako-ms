import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  async getCurrent(ownerId: number): Promise<Subscription> {
    const sub = await this.subscriptionRepo.findOne({
      where: { ownerId },
      relations: { plan: true },
      order: { createdAt: 'DESC' },
    });
    if (!sub) throw new NotFoundException('No subscription found');
    return sub;
  }

  async getHistory(ownerId: number): Promise<Subscription[]> {
    return this.subscriptionRepo.find({
      where: { ownerId },
      relations: { plan: true },
      order: { createdAt: 'DESC' },
    });
  }

  async subscribe(ownerId: number, dto: CreateSubscriptionDto): Promise<Subscription> {
    const plan = await this.planRepo.findOne({ where: { id: dto.planId, isActive: true } });
    if (!plan) throw new NotFoundException('Plan not found');

    // Cancel any existing active subscription
    await this.subscriptionRepo.update(
      { ownerId, status: SubscriptionStatus.ACTIVE },
      { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
    );

    const now = new Date();
    const endsAt = new Date(now);
    if (dto.billingCycle === 'yearly') {
      endsAt.setFullYear(endsAt.getFullYear() + 1);
    } else if (dto.billingCycle === 'monthly') {
      endsAt.setMonth(endsAt.getMonth() + 1);
    } else {
      throw new BadRequestException('Trial plan must be assigned by system');
    }

    const subscription = this.subscriptionRepo.create({
      ownerId,
      planId: plan.id,
      billingCycle: dto.billingCycle,
      status: SubscriptionStatus.ACTIVE,
      startsAt: now,
      endsAt,
    });

    return this.subscriptionRepo.save(subscription);
  }

  async cancel(ownerId: number): Promise<Subscription> {
    const sub = await this.subscriptionRepo.findOne({
      where: { ownerId, status: SubscriptionStatus.ACTIVE },
    });
    if (!sub) throw new NotFoundException('No active subscription to cancel');

    sub.status = SubscriptionStatus.CANCELLED;
    sub.cancelledAt = new Date();
    sub.autoRenew = false;
    return this.subscriptionRepo.save(sub);
  }
}
