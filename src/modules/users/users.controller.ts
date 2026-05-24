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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import { SubscriptionLimitsGuard } from '../../common/guards/subscription-limits.guard';
import { SubscriptionLimit, LimitType } from '../../common/decorators/subscription-limit.decorator';

@ApiTags('Store Users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List store staff' })
  @UseGuards(UserJwtGuard)
  @Get('stores/:storeId/users')
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.usersService.findAll(storeId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add staff to store (checks max_users limit)' })
  @UseGuards(UserJwtGuard, SubscriptionLimitsGuard)
  @SubscriptionLimit(LimitType.USERS)
  @Post('stores/:storeId/users')
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(storeId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get staff member by ID' })
  @UseGuards(UserJwtGuard)
  @Get('stores/:storeId/users/:id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(storeId, id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update staff member' })
  @UseGuards(UserJwtGuard)
  @Patch('stores/:storeId/users/:id')
  update(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(storeId, id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove staff member (soft delete)' })
  @UseGuards(UserJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('stores/:storeId/users/:id')
  remove(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.remove(storeId, id);
  }
}

