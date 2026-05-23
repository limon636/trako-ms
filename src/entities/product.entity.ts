import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { ProductCategory } from './product-category.entity';

export enum ProductUnit {
  PIECE = 'Piece',
  KG = 'KG',
  LITRE = 'Litre',
  BOX = 'Box',
  DOZEN = 'Dozen',
  METER = 'Meter',
  PACK = 'Pack',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'store_id', type: 'bigint', unsigned: true })
  storeId: number;

  @Column({ name: 'category_id', type: 'bigint', unsigned: true, nullable: true })
  categoryId: number | null;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 80 })
  sku: string;

  @Column({ type: 'enum', enum: ProductUnit, default: ProductUnit.PIECE })
  unit: ProductUnit;

  @Column({ name: 'purchase_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  purchasePrice: number;

  @Column({ name: 'selling_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  sellingPrice: number;

  @Column({ name: 'low_stock_threshold', type: 'int', default: 5 })
  lowStockThreshold: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Store, (store) => store.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => ProductCategory, (cat) => cat.products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory | null;
}
