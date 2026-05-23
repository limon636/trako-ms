import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { OwnerJwtGuard } from '../../common/guards/owner-jwt.guard';
import { CurrentOwner } from '../../common/decorators/current-owner.decorator';
import { Owner } from '../../entities/owner.entity';

@ApiBearerAuth()
@ApiTags('Subscriptions')
@UseGuards(OwnerJwtGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Get current active subscription' })
  @Get('current')
  getCurrent(@CurrentOwner() owner: Owner) {
    return this.subscriptionsService.getCurrent(owner.id);
  }

  @ApiOperation({ summary: 'Get subscription history' })
  @Get('history')
  getHistory(@CurrentOwner() owner: Owner) {
    return this.subscriptionsService.getHistory(owner.id);
  }

  @ApiOperation({ summary: 'Subscribe or upgrade to a plan' })
  @Post()
  subscribe(@CurrentOwner() owner: Owner, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.subscribe(owner.id, dto);
  }

  @ApiOperation({ summary: 'Cancel current subscription' })
  @HttpCode(HttpStatus.OK)
  @Post('cancel')
  cancel(@CurrentOwner() owner: Owner) {
    return this.subscriptionsService.cancel(owner.id);
  }
}
