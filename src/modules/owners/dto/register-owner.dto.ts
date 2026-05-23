import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterOwnerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '01700000000' })
  @IsString()
  @Matches(/^(\+?880|0)?1[3-9]\d{8}$/, { message: 'Invalid Bangladeshi phone number' })
  phone: string;

  @ApiProperty({ example: 'StrongP@ss1', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
