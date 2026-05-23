import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingCycle } from '../../../entities/subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  planId: number;

  @ApiProperty({ enum: BillingCycle })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}
