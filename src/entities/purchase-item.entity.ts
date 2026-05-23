import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Purchase } from './purchase.entity';
import { Product } from './product.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'purchase_id', type: 'bigint', unsigned: true })
  purchaseId: number;

  @Column({ name: 'product_id', type: 'bigint', unsigned: true })
  productId: number;

  @Column({ name: 'product_name', length: 200 })
  productName: string;

  @Column({ type: 'int', unsigned: true })
  quantity: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 12, scale: 2 })
  unitCost: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 12, scale: 2 })
  lineTotal: number;

  @ManyToOne(() => Purchase, (purchase) => purchase.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
