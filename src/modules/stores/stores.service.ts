import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  async create(userId: number, dto: CreateStoreDto): Promise<Store> {
    const existing = await this.storeRepo.find({ where: { userId } });
    if (!existing || existing.length === 0) {
      dto.isDefault = true;
    }

    const store = this.storeRepo.create({ ...dto, userId });
    return this.storeRepo.save(store);
  }

  async findAll(userId: number): Promise<Store[]> {
    return this.storeRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, storeId: number): Promise<Store> {
    const store = await this.storeRepo.findOne({
      where: { id: storeId, userId },
    });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async update(userId: number, storeId: number, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(userId, storeId);
    if (dto.isDefault) {
      const existingDefault = await this.storeRepo.findOne({ where: { userId, isDefault: true } });
      if (existingDefault && existingDefault.id !== storeId) {
        existingDefault.isDefault = false;
        await this.storeRepo.save(existingDefault);
      }
    }
    Object.assign(store, dto);
    return this.storeRepo.save(store);
  }

  async remove(userId: number, storeId: number): Promise<void> {
    const store = await this.findOne(userId, storeId);
    await this.storeRepo.softRemove(store);
  }

  async assertOwnership(userId: number, storeId: number): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { id: storeId, userId } });
    if (!store) throw new ForbiddenException('Access denied to this store');
    return store;
  }
}
