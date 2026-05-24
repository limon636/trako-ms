import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FirebaseLoginDto {
  @ApiProperty({ example: 'uid_abc123', description: 'Firebase UID from the client SDK' })
  @IsString()
  @IsNotEmpty()
  firebase_uid: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email from the client SDK' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Firebase ID token obtained from the client SDK' })
  @IsString()
  @IsNotEmpty()
  id_token: string;

  @ApiProperty({
    example: 'google.com',
    description: 'Sign-in provider (e.g. google.com, password, phone)',
  })
  @IsString()
  @IsNotEmpty()
  provider: string;
}
