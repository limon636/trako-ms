import { IsNotEmpty, IsString, Matches, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane Staff' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '01800000001' })
  @IsString()
  @Matches(/^(\+?880|0)?1[3-9]\d{8}$/, { message: 'Invalid Bangladeshi phone number' })
  phone: string;

  @ApiPropertyOptional({ example: 'jane@store.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Pass@1234', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.SALES_STAFF })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
