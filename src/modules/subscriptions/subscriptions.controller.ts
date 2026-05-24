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
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiBearerAuth()
@ApiTags('Subscriptions')
@UseGuards(UserJwtGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Get current active subscription' })
  @Get('current')
  getCurrent(@CurrentUser() user: User) {
    return this.subscriptionsService.getCurrent(user.id);
  }

  @ApiOperation({ summary: 'Get subscription history' })
  @Get('history')
  getHistory(@CurrentUser() user: User) {
    return this.subscriptionsService.getHistory(user.id);
  }

  @ApiOperation({ summary: 'Subscribe or upgrade to a plan' })
  @Post()
  subscribe(@CurrentUser() user: User, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.subscribe(user.id, dto);
  }

  @ApiOperation({ summary: 'Cancel current subscription' })
  @HttpCode(HttpStatus.OK)
  @Post('cancel')
  cancel(@CurrentUser() user: User) {
    return this.subscriptionsService.cancel(user.id);
  }
}
