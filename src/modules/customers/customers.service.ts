import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  create(storeId: number, dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepo.create({ ...dto, storeId });
    return this.customerRepo.save(customer);
  }

  findAll(storeId: number, search?: string): Promise<Customer[]> {
    const where = search
      ? [
          { storeId, name: ILike(`%${search}%`) },
          { storeId, phone: ILike(`%${search}%`) },
        ]
      : { storeId };
    return this.customerRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(storeId: number, id: number): Promise<Customer> {
    const c = await this.customerRepo.findOne({ where: { id, storeId } });
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }

  async update(storeId: number, id: number, dto: Partial<CreateCustomerDto>): Promise<Customer> {
    const customer = await this.findOne(storeId, id);
    Object.assign(customer, dto);
    return this.customerRepo.save(customer);
  }

  async remove(storeId: number, id: number): Promise<void> {
    const customer = await this.findOne(storeId, id);
    await this.customerRepo.softRemove(customer);
  }
}
