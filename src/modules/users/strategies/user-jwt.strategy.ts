import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserJwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { User } from '../../../entities/user.entity';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.user.secret') ?? 'user_secret',
    });
  }

  async validate(payload: UserJwtPayload): Promise<User> {
    if (payload.type !== 'user') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.userRepo.findOne({
      where: { id: payload.sub, isActive: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
