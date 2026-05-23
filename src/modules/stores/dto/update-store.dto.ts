import { PartialType } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
