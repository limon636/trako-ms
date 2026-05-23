import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnerJwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { Owner } from '../../../entities/owner.entity';

@Injectable()
export class OwnerJwtStrategy extends PassportStrategy(Strategy, 'owner-jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(Owner)
    private readonly ownerRepo: Repository<Owner>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.owner.secret') ?? 'owner_secret',
    });
  }

  async validate(payload: OwnerJwtPayload): Promise<Owner> {
    if (payload.type !== 'owner') {
      throw new UnauthorizedException('Invalid token type');
    }
    const owner = await this.ownerRepo.findOne({
      where: { id: payload.sub, isActive: true },
    });
    if (!owner) {
      throw new UnauthorizedException('Owner not found or inactive');
    }
    return owner;
  }
}
