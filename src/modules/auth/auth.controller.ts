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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { FirebaseLoginDto } from './dto/firebase-login.dto';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login — all user types (SUPER_ADMIN, staff, etc.)' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = (req.ip ?? '').replace('::ffff:', '');
    const deviceInfo = req.headers['user-agent'] ?? undefined;
    return this.authService.login(dto, ip, deviceInfo as string);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const ip = (req.ip ?? '').replace('::ffff:', '');
    const deviceInfo = req.headers['user-agent'] ?? undefined;
    return this.authService.refresh(dto, ip, deviceInfo as string);
  }

  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }

  @ApiOperation({ summary: 'Firebase login / register — find or create user via Firebase ID token' })
  @HttpCode(HttpStatus.OK)
  @Post('firebase-login')
  firebaseLogin(@Body() dto: FirebaseLoginDto, @Req() req: Request) {
    const ip = (req.ip ?? '').replace('::ffff:', '');
    const deviceInfo = req.headers['user-agent'] ?? undefined;
    return this.authService.firebaseLogin(dto, ip, deviceInfo as string);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @UseGuards(UserJwtGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
