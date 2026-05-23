import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: '01800000001' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Pass@1234' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 1, description: 'Store ID to authenticate against' })
  @IsNotEmpty()
  storeId: number;
}
