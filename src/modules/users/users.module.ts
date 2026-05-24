import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../../entities/user.entity';
import { UserRefreshToken } from '../../entities/user-refresh-token.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';
import { SubscriptionLimitsGuard } from '../../common/guards/subscription-limits.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRefreshToken]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserJwtStrategy, SubscriptionLimitsGuard],
  exports: [UsersService, TypeOrmModule, UserJwtStrategy],
})
export class UsersModule {}

