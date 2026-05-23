import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Owner } from '../../entities/owner.entity';
import { OwnerRefreshToken } from '../../entities/owner-refresh-token.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Subscription } from '../../entities/subscription.entity';
import { OwnersService } from './owners.service';
import { OwnersController } from './owners.controller';
import { OwnerJwtStrategy } from './strategies/owner-jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Owner, OwnerRefreshToken, SubscriptionPlan, Subscription]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [OwnersController],
  providers: [OwnersService, OwnerJwtStrategy],
  exports: [OwnersService, TypeOrmModule],
})
export class OwnersModule {}
