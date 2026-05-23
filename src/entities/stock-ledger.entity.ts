import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { Product } from './product.entity';

export enum StockReferenceType {
  PURCHASE = 'PURCHASE',
  ORDER = 'ORDER',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('stock_ledger')
export class StockLedger {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'store_id', type: 'bigint', unsigned: true })
  storeId: number;

  @Column({ name: 'product_id', type: 'bigint', unsigned: true })
  productId: number;

  @Column({ name: 'reference_type', type: 'enum', enum: StockReferenceType })
  referenceType: StockReferenceType;

  @Column({ name: 'reference_id', type: 'bigint', unsigned: true })
  referenceId: number;

  @Column({ name: 'quantity_change', type: 'int' })
  quantityChange: number; // positive = in, negative = out

  @Column({ name: 'balance_after', type: 'int' })
  balanceAfter: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
