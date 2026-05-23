import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ example: 'My Shop' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: 'Retail' })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tradeLicense?: string;

  @ApiPropertyOptional({ example: '01700000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'shop@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ default: 'BDT' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ default: 'Asia/Dhaka' })
  @IsOptional()
  @IsString()
  timezone?: string;
}
