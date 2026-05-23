import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { UserRefreshToken } from '../../entities/user-refresh-token.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserJwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { RefreshTokenDto } from '../owners/dto/refresh-token.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRefreshToken)
    private readonly refreshTokenRepo: Repository<UserRefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(storeId: number, dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { storeId, phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException('Phone number already registered in this store');
    }

    const saltRounds = this.configService.get<number>('bcryptSaltRounds') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = this.userRepo.create({
      storeId,
      name: dto.name,
      phone: dto.phone,
      email: dto.email ?? null,
      passwordHash,
      role: dto.role,
    });
    return this.userRepo.save(user);
  }

  async findAll(storeId: number): Promise<User[]> {
    return this.userRepo.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(storeId: number, userId: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId, storeId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(storeId: number, userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(storeId, userId);
    if (dto.password) {
      const saltRounds = this.configService.get<number>('bcryptSaltRounds') ?? 12;
      user.passwordHash = await bcrypt.hash(dto.password, saltRounds);
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email ?? null;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    return this.userRepo.save(user);
  }

  async remove(storeId: number, userId: number): Promise<void> {
    const user = await this.findOne(storeId, userId);
    await this.userRepo.softRemove(user);
  }

  async login(
    dto: LoginUserDto,
    ip?: string,
    deviceInfo?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> }> {
    const user = await this.userRepo.findOne({
      where: { storeId: dto.storeId, phone: dto.phone },
      select: { id: true, uuid: true, storeId: true, name: true, phone: true, role: true, passwordHash: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
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

  private async generateTokens(
    user: User,
    ip?: string,
    deviceInfo?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: UserJwtPayload = {
      sub: user.id,
      uuid: user.uuid,
      storeId: user.storeId,
      role: user.role,
      type: 'user',
    };

    const accessToken = this.jwtService.sign(payload as unknown as Record<string, unknown>, {
      secret: this.configService.get<string>('jwt.user.secret'),
      expiresIn: (this.configService.get<string>('jwt.user.expiresIn') ?? '15m') as never,
    });

    const rawRefreshToken = this.jwtService.sign(payload as unknown as Record<string, unknown>, {
      secret: this.configService.get<string>('jwt.user.refreshSecret'),
      expiresIn: (this.configService.get<string>('jwt.user.refreshExpiresIn') ?? '7d') as never,
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
