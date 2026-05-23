import {
  ArrayMinSize,
  IsArray,
  IsDateString,
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
import { PurchasePaymentMethod } from '../../../entities/purchase.entity';

export class PurchaseItemDto {
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
  unitCost: number;
}

export class CreatePurchaseDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  dealerId: number;

  @ApiProperty({ type: [PurchaseItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  additionalCharges?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @ApiProperty({ enum: PurchasePaymentMethod })
  @IsEnum(PurchasePaymentMethod)
  paymentMethod: PurchasePaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiProperty({ example: '2026-05-23' })
  @IsDateString()
  @IsNotEmpty()
  purchaseDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
