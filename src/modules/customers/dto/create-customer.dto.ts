import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType, Gender } from '../../../entities/customer.entity';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Ahmed Khan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '01700000001' })
  @IsString()
  @Matches(/^(\+?880|0)?1[3-9]\d{8}$/, { message: 'Invalid phone number' })
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: CustomerType, default: CustomerType.REGULAR })
  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
