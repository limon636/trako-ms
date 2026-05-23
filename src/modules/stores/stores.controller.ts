import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { OwnerJwtGuard } from '../../common/guards/owner-jwt.guard';
import { SubscriptionLimitsGuard } from '../../common/guards/subscription-limits.guard';
import { SubscriptionLimit, LimitType } from '../../common/decorators/subscription-limit.decorator';
import { CurrentOwner } from '../../common/decorators/current-owner.decorator';
import { Owner } from '../../entities/owner.entity';

@ApiBearerAuth()
@ApiTags('Stores')
@UseGuards(OwnerJwtGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @ApiOperation({ summary: 'List owner stores' })
  @Get()
  findAll(@CurrentOwner() owner: Owner) {
    return this.storesService.findAll(owner.id);
  }

  @ApiOperation({ summary: 'Create new store (checks max_stores limit)' })
  @UseGuards(SubscriptionLimitsGuard)
  @SubscriptionLimit(LimitType.STORES)
  @Post()
  create(@CurrentOwner() owner: Owner, @Body() dto: CreateStoreDto) {
    return this.storesService.create(owner.id, dto);
  }

  @ApiOperation({ summary: 'Get store by ID' })
  @Get(':id')
  findOne(@CurrentOwner() owner: Owner, @Param('id', ParseIntPipe) id: number) {
    return this.storesService.findOne(owner.id, id);
  }

  @ApiOperation({ summary: 'Update store' })
  @Patch(':id')
  update(
    @CurrentOwner() owner: Owner,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.update(owner.id, id, dto);
  }

  @ApiOperation({ summary: 'Soft-delete store' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@CurrentOwner() owner: Owner, @Param('id', ParseIntPipe) id: number) {
    return this.storesService.remove(owner.id, id);
  }
}
