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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiBearerAuth()
@ApiTags('Payments')
@UseGuards(UserJwtGuard)
@Controller('stores/:storeId/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @ApiOperation({ summary: 'List payments for store' })
  @Get()
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAll(storeId);
  }

  @ApiOperation({ summary: 'Record a payment (updates order/purchase due amount)' })
  @Post()
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @CurrentUser() user: User,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.service.create(storeId, user.id, dto);
  }

  @ApiOperation({ summary: 'Get payment by ID' })
  @Get(':id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(storeId, id);
  }
}
