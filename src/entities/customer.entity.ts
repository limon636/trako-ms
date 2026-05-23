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

export enum CustomerType {
  REGULAR = 'REGULAR',
  VIP = 'VIP',
  WHOLESALE = 'WHOLESALE',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'store_id', type: 'bigint', unsigned: true })
  storeId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'alternate_phone', type: 'varchar', length: 20, nullable: true })
  alternatePhone: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  city: string | null;

  @Column({ name: 'customer_type', type: 'enum', enum: CustomerType, default: CustomerType.REGULAR })
  customerType: CustomerType;

  @Column({ type: 'text', nullable: true })
  note: string | null;

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
