import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({ example: 'admin@example.com', description: 'Email (for SUPER_ADMIN/ADMIN login)' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '01800000001', description: 'Phone (for staff login)' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: 1, description: 'Store ID — required for store staff login' })
  @IsOptional()
  @IsNumber()
  storeId?: number;
}
