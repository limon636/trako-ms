import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
}

