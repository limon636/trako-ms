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
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RefreshTokenDto } from '../owners/dto/refresh-token.dto';
import { OwnerJwtGuard } from '../../common/guards/owner-jwt.guard';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import { SubscriptionLimitsGuard } from '../../common/guards/subscription-limits.guard';
import { SubscriptionLimit, LimitType } from '../../common/decorators/subscription-limit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Store Users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Auth endpoints ──────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Staff login' })
  @HttpCode(HttpStatus.OK)
  @Post('auth/user/login')
  login(@Body() dto: LoginUserDto, @Req() req: Request) {
    const ip = (req.ip ?? '').replace('::ffff:', '');
    const deviceInfo = req.headers['user-agent'] ?? undefined;
    return this.usersService.login(dto, ip, deviceInfo as string);
  }

  @ApiOperation({ summary: 'Refresh staff access token' })
  @HttpCode(HttpStatus.OK)
  @Post('auth/user/refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const ip = (req.ip ?? '').replace('::ffff:', '');
    const deviceInfo = req.headers['user-agent'] ?? undefined;
    return this.usersService.refresh(dto, ip, deviceInfo as string);
  }

  @ApiOperation({ summary: 'Staff logout' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('auth/user/logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.usersService.logout(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @UseGuards(UserJwtGuard)
  @Get('auth/user/profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  // ─── Store staff management (owner only) ─────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List store staff (owner access)' })
  @UseGuards(OwnerJwtGuard)
  @Get('stores/:storeId/users')
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.usersService.findAll(storeId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add staff to store (checks max_users limit)' })
  @UseGuards(OwnerJwtGuard, SubscriptionLimitsGuard)
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
  @UseGuards(OwnerJwtGuard)
  @Get('stores/:storeId/users/:id')
  findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(storeId, id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update staff member' })
  @UseGuards(OwnerJwtGuard)
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
  @UseGuards(OwnerJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('stores/:storeId/users/:id')
  remove(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.remove(storeId, id);
  }
}
