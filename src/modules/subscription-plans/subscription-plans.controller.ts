import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';

@ApiTags('Subscription Plans')
@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  @ApiOperation({ summary: 'List all active subscription plans' })
  @Get()
  findAll(): Promise<SubscriptionPlan[]> {
    return this.planRepo.find({ where: { isActive: true }, order: { id: 'ASC' } });
  }
}
