import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductUnit } from '../../../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ example: 'Samsung Galaxy A54' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'SKU-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  sku: string;

  @ApiPropertyOptional({ enum: ProductUnit, default: ProductUnit.PIECE })
  @IsOptional()
  @IsEnum(ProductUnit)
  unit?: ProductUnit;

  @ApiPropertyOptional({ example: 25000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiProperty({ example: 28000 })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  lowStockThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
