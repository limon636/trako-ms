import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from '../../entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
  ) {}

  async create(storeId: number, dto: CreateProductCategoryDto): Promise<ProductCategory> {
    const exists = await this.categoryRepo.findOne({
      where: { storeId, name: dto.name },
    });
    if (exists) throw new ConflictException('Category already exists');

    const category = this.categoryRepo.create({ storeId, name: dto.name });
    return this.categoryRepo.save(category);
  }

  findAll(storeId: number): Promise<ProductCategory[]> {
    return this.categoryRepo.find({ where: { storeId }, order: { name: 'ASC' } });
  }

  async findOne(storeId: number, id: number): Promise<ProductCategory> {
    const cat = await this.categoryRepo.findOne({ where: { id, storeId } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async update(storeId: number, id: number, dto: CreateProductCategoryDto): Promise<ProductCategory> {
    const cat = await this.findOne(storeId, id);
    cat.name = dto.name;
    return this.categoryRepo.save(cat);
  }

  async remove(storeId: number, id: number): Promise<void> {
    const cat = await this.findOne(storeId, id);
    await this.categoryRepo.remove(cat);
  }
}
