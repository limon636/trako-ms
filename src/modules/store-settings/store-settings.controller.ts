import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StoreSettingsService } from './store-settings.service';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';

class SetSettingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;
}

@ApiBearerAuth()
@ApiTags('Store Settings')
@UseGuards(UserJwtGuard)
@Controller('stores/:storeId/settings')
export class StoreSettingsController {
  constructor(private readonly service: StoreSettingsService) {}

  @ApiOperation({ summary: 'Get all store settings' })
  @Get()
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAll(storeId);
  }

  @ApiOperation({ summary: 'Set a setting value' })
  @Put(':key')
  set(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('key') key: string,
    @Body() dto: SetSettingDto,
  ) {
    return this.service.set(storeId, key, dto.value);
  }

  @ApiOperation({ summary: 'Delete a setting' })
  @Delete(':key')
  delete(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('key') key: string,
  ) {
    return this.service.delete(storeId, key);
  }
}
