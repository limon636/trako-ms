import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentPaymentMethod, PaymentReferenceType } from '../../../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ enum: PaymentReferenceType })
  @IsEnum(PaymentReferenceType)
  referenceType: PaymentReferenceType;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  referenceId: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: PaymentPaymentMethod })
  @IsEnum(PaymentPaymentMethod)
  paymentMethod: PaymentPaymentMethod;

  @ApiProperty({ example: '2026-05-23' })
  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
