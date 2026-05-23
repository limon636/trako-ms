import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dealer } from '../../entities/dealer.entity';
import { CreateDealerDto } from './dto/create-dealer.dto';

@Injectable()
export class DealersService {
  constructor(
    @InjectRepository(Dealer)
    private readonly dealerRepo: Repository<Dealer>,
  ) {}

  create(storeId: number, dto: CreateDealerDto): Promise<Dealer> {
    const dealer = this.dealerRepo.create({ ...dto, storeId });
    return this.dealerRepo.save(dealer);
  }

  findAll(storeId: number): Promise<Dealer[]> {
    return this.dealerRepo.find({ where: { storeId }, order: { businessName: 'ASC' } });
  }

  async findOne(storeId: number, id: number): Promise<Dealer> {
    const dealer = await this.dealerRepo.findOne({ where: { id, storeId } });
    if (!dealer) throw new NotFoundException('Dealer not found');
    return dealer;
  }

  async update(storeId: number, id: number, dto: Partial<CreateDealerDto>): Promise<Dealer> {
    const dealer = await this.findOne(storeId, id);
    Object.assign(dealer, dto);
    return this.dealerRepo.save(dealer);
  }

  async remove(storeId: number, id: number): Promise<void> {
    const dealer = await this.findOne(storeId, id);
    await this.dealerRepo.softRemove(dealer);
  }
}
