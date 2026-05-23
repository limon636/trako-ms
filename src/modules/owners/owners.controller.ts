import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { OwnersService } from './owners.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginOwnerDto } from './dto/login-owner.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OwnerJwtGuard } from '../../common/guards/owner-jwt.guard';
import { CurrentOwner } from '../../common/decorators/current-owner.decorator';
import { Owner } from '../../entities/owner.entity';

@ApiTags('Owner Auth')
@Controller('auth/owner')
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @ApiOperation({ summary: 'Register a new owner account' })
  @Post('register')
  register(@Body() dto: RegisterOwnerDto) {
    return this.ownersService.register(dto);
  }

  @ApiOperation({ summary: 'Owner login' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginOwnerDto, @Req() req: Request) {
    const ip = (req.ip ?? '').replace('::ffff:', '');
    const deviceInfo = req.headers['user-agent'] ?? undefined;
    return this.ownersService.login(dto, ip, deviceInfo as string);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const ip = (req.ip ?? '').replace('::ffff:', '');
    const deviceInfo = req.headers['user-agent'] ?? undefined;
    return this.ownersService.refresh(dto.refreshToken, ip, deviceInfo as string);
  }

  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.ownersService.logout(dto.refreshToken);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current owner profile' })
  @UseGuards(OwnerJwtGuard)
  @Get('profile')
  getProfile(@CurrentOwner() owner: Owner) {
    return this.ownersService.getProfile(owner.id);
  }
}
