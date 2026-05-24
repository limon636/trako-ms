import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { StoreAccessGuard } from '../../common/guards/store-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiBearerAuth()
@ApiTags('Purchases')
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/purchases')
export class PurchasesController {
  constructor(private readonly service: PurchasesService) {}

  @ApiOperation({ summary: 'List purchases' })
  @Get()
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAll(storeId);
  }

  @ApiOperation({ summary: 'Create purchase (adds stock automatically)' })
  @Post()
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @CurrentUser() user: User,
    @Body() dto: CreatePurchaseDto,
  ) {
    return this.service.create(storeId, user.id, dto);
  }

  @ApiOperation({ summary: 'Get purchase by ID' })
  @Get(':id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(storeId, id);
  }
}
