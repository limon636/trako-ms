import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { StoreAccessGuard } from '../../common/guards/store-access.guard';
import { SubscriptionLimitsGuard } from '../../common/guards/subscription-limits.guard';
import { SubscriptionLimit, LimitType } from '../../common/decorators/subscription-limit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiBearerAuth()
@ApiTags('Orders')
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'List orders' })
  @ApiQuery({ name: 'status', required: false })
  @Get()
  findAll(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAll(storeId, status);
  }

  @ApiOperation({ summary: 'Create order (checks max_orders_month limit)' })
  @UseGuards(SubscriptionLimitsGuard)
  @SubscriptionLimit(LimitType.ORDERS_MONTH)
  @Post()
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @CurrentUser() user: User,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(storeId, user.id, dto);
  }

  @ApiOperation({ summary: 'Get order by ID' })
  @Get(':id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(storeId, id);
  }

  @ApiOperation({ summary: 'Update order status' })
  @Patch(':id/status')
  updateStatus(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(storeId, id, user.id, dto);
  }
}
