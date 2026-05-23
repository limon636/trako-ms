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

@Entity('dealers')
export class Dealer {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'store_id', type: 'bigint', unsigned: true })
  storeId: number;

  @Column({ name: 'business_name', length: 150 })
  businessName: string;

  @Column({ name: 'contact_person', length: 100 })
  contactPerson: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'alternate_phone', type: 'varchar', length: 20, nullable: true })
  alternatePhone: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'json', nullable: true })
  categories: string[] | null;

  @Column({ name: 'payment_terms', type: 'varchar', length: 100, nullable: true })
  paymentTerms: string | null;

  @Column({ name: 'opening_balance_due', type: 'decimal', precision: 12, scale: 2, default: 0 })
  openingBalanceDue: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
