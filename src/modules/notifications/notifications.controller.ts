import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiBearerAuth()
@ApiTags('Notifications')
@UseGuards(UserJwtGuard)
@Controller('stores/:storeId/notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @ApiOperation({ summary: 'Get unread notifications' })
  @Get()
  findAll(
    @Param('storeId', ParseIntPipe) storeId: number,
    @CurrentUser() user: User,
  ) {
    return this.service.findAll(storeId, user.id);
  }

  @ApiOperation({ summary: 'Mark notification as read' })
  @Patch(':id/read')
  markRead(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.markRead(storeId, id);
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('read-all')
  markAllRead(
    @Param('storeId', ParseIntPipe) storeId: number,
    @CurrentUser() user: User,
  ) {
    return this.service.markAllRead(storeId, user.id);
  }
}
