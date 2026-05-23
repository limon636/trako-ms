import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockAdjustmentDto {
  @ApiProperty({ example: 10, description: 'Positive to add, negative to deduct' })
  @IsInt()
  @IsNotEmpty()
  quantityChange: number;

  @ApiPropertyOptional({ example: 'Opening stock entry' })
  @IsOptional()
  @IsString()
  note?: string;
}
