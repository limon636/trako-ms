import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Owner } from '../../entities/owner.entity';
import { OwnerRefreshToken } from '../../entities/owner-refresh-token.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Subscription, BillingCycle, SubscriptionStatus } from '../../entities/subscription.entity';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginOwnerDto } from './dto/login-owner.dto';
import { OwnerJwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class OwnersService {
  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepo: Repository<Owner>,
    @InjectRepository(OwnerRefreshToken)
    private readonly refreshTokenRepo: Repository<OwnerRefreshToken>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterOwnerDto): Promise<{ accessToken: string; refreshToken: string }> {
    const existing = await this.ownerRepo.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });
    if (existing) {
      throw new ConflictException('Email or phone already registered');
    }

    const saltRounds = this.configService.get<number>('bcryptSaltRounds') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const owner = this.ownerRepo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
    });
    await this.ownerRepo.save(owner);

    // Assign free plan subscription
    const freePlan = await this.planRepo.findOne({ where: { slug: 'free' } });
    if (freePlan) {
      const now = new Date();
      const endsAt = new Date(now);
      endsAt.setFullYear(endsAt.getFullYear() + 100); // free plan never expires practically

      const subscription = this.subscriptionRepo.create({
        ownerId: owner.id,
        planId: freePlan.id,
        billingCycle: BillingCycle.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        startsAt: now,
        endsAt,
      });
      await this.subscriptionRepo.save(subscription);
    }

    return this.generateTokens(owner);
  }

  async login(
    dto: LoginOwnerDto,
    ip?: string,
    deviceInfo?: string,
  ): Promise<{ accessToken: string; refreshToken: string; owner: Partial<Owner> }> {
    const owner = await this.ownerRepo.findOne({
      where: { email: dto.email },
      select: { id: true, uuid: true, name: true, email: true, phone: true, passwordHash: true, isActive: true },
    });

    if (!owner || !owner.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, owner.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(owner, ip, deviceInfo);
    const { passwordHash: _pw, ...safeOwner } = owner;
    return { ...tokens, owner: safeOwner };
  }

  async refresh(
    refreshToken: string,
    ip?: string,
    deviceInfo?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    // Find by comparing hashes — we store the hash, so we must iterate
    // Better: store token hash using a deterministic method
    const stored = await this.refreshTokenRepo
      .createQueryBuilder('t')
      .where('t.revoked_at IS NULL')
      .andWhere('t.expires_at > NOW()')
      .getMany();

    let validToken: OwnerRefreshToken | undefined;
    for (const t of stored) {
      const match = await bcrypt.compare(refreshToken, t.tokenHash);
      if (match) {
        validToken = t;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token
    validToken.revokedAt = new Date();
    await this.refreshTokenRepo.save(validToken);

    const owner = await this.ownerRepo.findOne({
      where: { id: validToken.ownerId, isActive: true },
    });
    if (!owner) {
      throw new UnauthorizedException('Owner not found');
    }

    return this.generateTokens(owner, ip, deviceInfo);
  }

  async logout(refreshToken: string): Promise<void> {
    const stored = await this.refreshTokenRepo
      .createQueryBuilder('t')
      .where('t.revoked_at IS NULL')
      .getMany();

    for (const t of stored) {
      const match = await bcrypt.compare(refreshToken, t.tokenHash);
      if (match) {
        t.revokedAt = new Date();
        await this.refreshTokenRepo.save(t);
        return;
      }
    }
  }

  async getProfile(ownerId: number): Promise<Owner> {
    const owner = await this.ownerRepo.findOne({ where: { id: ownerId } });
    if (!owner) throw new BadRequestException('Owner not found');
    return owner;
  }

  private async generateTokens(
    owner: Owner,
    ip?: string,
    deviceInfo?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: OwnerJwtPayload = {
      sub: owner.id,
      uuid: owner.uuid,
      type: 'owner',
    };

    const accessToken = this.jwtService.sign(payload as unknown as Record<string, unknown>, {
      secret: this.configService.get<string>('jwt.owner.secret'),
      expiresIn: (this.configService.get<string>('jwt.owner.expiresIn') ?? '15m') as never,
    });

    const rawRefreshToken = this.jwtService.sign(payload as unknown as Record<string, unknown>, {
      secret: this.configService.get<string>('jwt.owner.refreshSecret'),
      expiresIn: (this.configService.get<string>('jwt.owner.refreshExpiresIn') ?? '7d') as never,
    });

    const saltRounds = this.configService.get<number>('bcryptSaltRounds') ?? 12;
    const tokenHash = await bcrypt.hash(rawRefreshToken, saltRounds);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const storedToken = this.refreshTokenRepo.create({
      ownerId: owner.id,
      tokenHash,
      ipAddress: ip ?? null,
      deviceInfo: deviceInfo ?? null,
      expiresAt,
    });
    await this.refreshTokenRepo.save(storedToken);

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
