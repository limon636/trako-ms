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

  async create(ownerId: number, dto: CreateStoreDto): Promise<Store> {
    const store = this.storeRepo.create({ ...dto, ownerId });
    return this.storeRepo.save(store);
  }

  async findAll(ownerId: number): Promise<Store[]> {
    return this.storeRepo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(ownerId: number, storeId: number): Promise<Store> {
    const store = await this.storeRepo.findOne({
      where: { id: storeId, ownerId },
    });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async update(ownerId: number, storeId: number, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(ownerId, storeId);
    Object.assign(store, dto);
    return this.storeRepo.save(store);
  }

  async remove(ownerId: number, storeId: number): Promise<void> {
    const store = await this.findOne(ownerId, storeId);
    await this.storeRepo.softRemove(store);
  }

  async assertOwnership(ownerId: number, storeId: number): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { id: storeId, ownerId } });
    if (!store) throw new ForbiddenException('Access denied to this store');
    return store;
  }
}
