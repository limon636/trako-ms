import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn({ type: 'tinyint', unsigned: true })
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50, unique: true })
  slug: string;

  @Column({ name: 'price_monthly', type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceMonthly: number;

  @Column({ name: 'price_yearly', type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceYearly: number;

  @Column({ name: 'max_stores', type: 'tinyint', default: 1 })
  maxStores: number; // -1 = unlimited

  @Column({ name: 'max_products', type: 'int', default: 50 })
  maxProducts: number; // -1 = unlimited

  @Column({ name: 'max_users', type: 'tinyint', default: 2 })
  maxUsers: number; // -1 = unlimited

  @Column({ name: 'max_orders_month', type: 'int', default: 100 })
  maxOrdersMonth: number; // -1 = unlimited

  @Column({ type: 'json', nullable: true })
  features: Record<string, boolean> | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
