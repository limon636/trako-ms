import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginOwnerDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
