import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import { User, UserRole } from '../../entities/user.entity';
import { UserRefreshToken } from '../../entities/user-refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { FirebaseLoginDto } from './dto/firebase-login.dto';
import { UserJwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRefreshToken)
    private readonly refreshTokenRepo: Repository<UserRefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('firebase.projectId'),
          clientEmail: this.configService.get<string>('firebase.clientEmail'),
          privateKey: (this.configService.get<string>('firebase.privateKey') ?? '').replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async login(
    dto: LoginDto,
    ip?: string,
    deviceInfo?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> }> {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Provide email or phone');
    }

    let user: User | null;

    if (dto.storeId) {
      // Store staff login: match by phone within the store
      if (!dto.phone) throw new BadRequestException('Phone is required for staff login');
      user = await this.userRepo.findOne({
        where: { storeId: dto.storeId, phone: dto.phone },
        select: { id: true, uuid: true, storeId: true, name: true, phone: true, email: true, role: true, passwordHash: true, isActive: true },
      });
    } else {
      // Admin login: match by email
      if (!dto.email) throw new BadRequestException('Email is required for admin login');
      user = await this.userRepo.findOne({
        where: { email: dto.email },
        select: { id: true, uuid: true, storeId: true, name: true, phone: true, email: true, role: true, passwordHash: true, isActive: true },
      });
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash ?? '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    const tokens = await this.generateTokens(user, ip, deviceInfo);
    const { passwordHash: _pw, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  }

  async refresh(
    dto: RefreshTokenDto,
    ip?: string,
    deviceInfo?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const stored = await this.refreshTokenRepo
      .createQueryBuilder('t')
      .where('t.revoked_at IS NULL')
      .andWhere('t.expires_at > NOW()')
      .getMany();

    let validToken: UserRefreshToken | undefined;
    for (const t of stored) {
      const match = await bcrypt.compare(dto.refreshToken, t.tokenHash);
      if (match) {
        validToken = t;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    validToken.revokedAt = new Date();
    await this.refreshTokenRepo.save(validToken);

    const user = await this.userRepo.findOne({
      where: { id: validToken.userId, isActive: true },
    });
    if (!user) throw new UnauthorizedException('User not found');

    return this.generateTokens(user, ip, deviceInfo);
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    const stored = await this.refreshTokenRepo
      .createQueryBuilder('t')
      .where('t.revoked_at IS NULL')
      .getMany();

    for (const t of stored) {
      const match = await bcrypt.compare(dto.refreshToken, t.tokenHash);
      if (match) {
        t.revokedAt = new Date();
        await this.refreshTokenRepo.save(t);
        return;
      }
    }
  }

  async firebaseLogin(
    dto: FirebaseLoginDto,
    ip?: string,
    deviceInfo?: string,
  ): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    // Verify the Firebase ID token
    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await admin.auth().verifyIdToken(dto.id_token);
    } catch {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }

    // Validate claims match the supplied values
    if (decoded.uid !== dto.firebase_uid) {
      throw new UnauthorizedException('firebase_uid does not match token');
    }
    if (decoded.email !== dto.email) {
      throw new UnauthorizedException('email does not match token');
    }
    const tokenProvider: string = (decoded.firebase as { sign_in_provider?: string })?.sign_in_provider ?? '';
    // remove .com from provider for consistency with client SDK values
    const normalizedProvider = tokenProvider.replace('.com', '');
    // Firebase uses "password" for email/password sign-in; treat "email" as an alias
    const expectedProvider = dto.provider.replace('.com', '');
    if (normalizedProvider !== expectedProvider) {
      console.log('Token provider:', normalizedProvider, 'Expected provider:', expectedProvider);
      throw new UnauthorizedException('provider does not match token');
    }

    // Find or create user
    let user = await this.userRepo.findOne({ where: { firebaseUid: dto.firebase_uid } });
    if (!user) {
      user = await this.userRepo.findOne({ where: { email: dto.email } });
    }

    if (!user) {
      // Register new user
      const newUser = this.userRepo.create({
        firebaseUid: dto.firebase_uid,
        email: dto.email,
        name: (decoded.name as string | undefined) ?? dto.email.split('@')[0],
        phone: (decoded.phone_number as string | undefined) ?? null,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      });
      user = await this.userRepo.save(newUser);
    } else {
      if (!user.isActive) {
        throw new UnauthorizedException('User account is disabled');
      }
      // Bind firebase_uid if user was found by email but has no firebaseUid yet
      if (!user.firebaseUid) {
        user.firebaseUid = dto.firebase_uid;
      }
    }

    user.lastLoginAt = new Date();
    user = await this.userRepo.save(user);

    const { accessToken, refreshToken } = await this.generateTokens(user, ip, deviceInfo);
    const expiresIn = this.parseExpiresIn(this.configService.get<string>('jwt.expiresIn') ?? '15m');

    return { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn };
  }

  private parseExpiresIn(value: string): number {
    const match = value.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return 900;
    const n = parseInt(match[1], 10);
    switch (match[2]) {
      case 's': return n;
      case 'm': return n * 60;
      case 'h': return n * 3600;
      case 'd': return n * 86400;
      default:  return 900;
    }
  }

  private async generateTokens(
    user: User,
    ip?: string,
    deviceInfo?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: UserJwtPayload = {
      sub: user.id,
      uuid: user.uuid,
      storeId: user.storeId ?? undefined,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload as unknown as Record<string, unknown>, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: (this.configService.get<string>('jwt.expiresIn') ?? '15m') as never,
    });

    const rawRefreshToken = this.jwtService.sign(payload as unknown as Record<string, unknown>, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d') as never,
    });

    const saltRounds = this.configService.get<number>('bcryptSaltRounds') ?? 12;
    const tokenHash = await bcrypt.hash(rawRefreshToken, saltRounds);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const storedToken = this.refreshTokenRepo.create({
      userId: user.id,
      tokenHash,
      ipAddress: ip ?? null,
      deviceInfo: deviceInfo ?? null,
      expiresAt,
    });
    await this.refreshTokenRepo.save(storedToken);

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
