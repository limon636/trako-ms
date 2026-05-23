import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DeliveryMethod,
  DiscountType,
  PaymentMethod,
} from '../../../entities/order.entity';

export class OrderItemDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  customerId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryCharge?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  advancePaid?: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: DeliveryMethod })
  @IsEnum(DeliveryMethod)
  deliveryMethod: DeliveryMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courierName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackingId?: string;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
