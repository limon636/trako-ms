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
import { ExpensePaymentMethod } from '../../../entities/expense.entity';

export class CreateExpenseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  categoryId?: number;

  @ApiProperty({ example: 'Office rent payment' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: ExpensePaymentMethod })
  @IsEnum(ExpensePaymentMethod)
  paymentMethod: ExpensePaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paidTo?: string;

  @ApiProperty({ example: '2026-05-23' })
  @IsDateString()
  @IsNotEmpty()
  expenseDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateExpenseCategoryDto {
  @ApiProperty({ example: 'Rent' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
