import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { StockLedger, StockReferenceType } from '../../entities/stock-ledger.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(StockLedger)
    private readonly stockRepo: Repository<StockLedger>,
  ) {}

  async create(storeId: number, dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepo.findOne({ where: { storeId, sku: dto.sku } });
    if (existing) throw new ConflictException('SKU already exists in this store');

    const product = this.productRepo.create({ ...dto, storeId });
    return this.productRepo.save(product);
  }

  findAll(storeId: number): Promise<Product[]> {
    return this.productRepo.find({
      where: { storeId },
      relations: { category: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(storeId: number, id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id, storeId },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(storeId: number, id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(storeId, id);
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(storeId: number, id: number): Promise<void> {
    const product = await this.findOne(storeId, id);
    await this.productRepo.softRemove(product);
  }

  /**
   * Get current stock level for a product (sum of all ledger entries)
   */
  async getStock(storeId: number, productId: number): Promise<number> {
    await this.findOne(storeId, productId); // ensure ownership
    const result = await this.stockRepo
      .createQueryBuilder('s')
      .select('SUM(s.quantity_change)', 'total')
      .where('s.store_id = :storeId AND s.product_id = :productId', { storeId, productId })
      .getRawOne<{ total: string | null }>();
    return parseInt(result?.total ?? '0', 10);
  }

  /**
   * Manual stock adjustment
   */
  async adjust(
    storeId: number,
    productId: number,
    quantityChange: number,
    note?: string,
  ): Promise<StockLedger> {
    await this.findOne(storeId, productId);
    const currentStock = await this.getStock(storeId, productId);
    const balanceAfter = currentStock + quantityChange;

    const entry = this.stockRepo.create({
      storeId,
      productId,
      referenceType: StockReferenceType.ADJUSTMENT,
      referenceId: 0,
      quantityChange,
      balanceAfter,
      note: note ?? null,
    });
    return this.stockRepo.save(entry);
  }

  async getLedger(storeId: number, productId: number): Promise<StockLedger[]> {
    await this.findOne(storeId, productId);
    return this.stockRepo.find({
      where: { storeId, productId },
      order: { createdAt: 'DESC' },
    });
  }
}
