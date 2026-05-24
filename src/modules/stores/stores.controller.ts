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
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import { SubscriptionLimitsGuard } from '../../common/guards/subscription-limits.guard';
import { SubscriptionLimit, LimitType } from '../../common/decorators/subscription-limit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiBearerAuth()
@ApiTags('Stores')
@UseGuards(UserJwtGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @ApiOperation({ summary: 'List owner stores' })
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.storesService.findAll(user.id);
  }

  @ApiOperation({ summary: 'Create new store (checks max_stores limit)' })
  @UseGuards(SubscriptionLimitsGuard)
  @SubscriptionLimit(LimitType.STORES)
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateStoreDto) {
    return this.storesService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Get store by ID' })
  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.storesService.findOne(user.id, id);
  }

  @ApiOperation({ summary: 'Update store' })
  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.update(user.id, id, dto);
  }

  @ApiOperation({ summary: 'Soft-delete store' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.storesService.remove(user.id, id);
  }
}
