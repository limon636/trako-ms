import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { User } from './user.entity';

export enum PaymentReferenceType {
  ORDER = 'ORDER',
  PURCHASE = 'PURCHASE',
}

export enum PaymentPaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  COD = 'COD',
  CREDIT = 'CREDIT',
  OTHER = 'OTHER',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'store_id', type: 'bigint', unsigned: true })
  storeId: number;

  @Column({ name: 'reference_type', type: 'enum', enum: PaymentReferenceType })
  referenceType: PaymentReferenceType;

  @Column({ name: 'reference_id', type: 'bigint', unsigned: true })
  referenceId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentPaymentMethod })
  paymentMethod: PaymentPaymentMethod;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: string;

  @Column({ name: 'recorded_by', type: 'bigint', unsigned: true, nullable: true })
  recordedBy: number | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by' })
  recorder: User | null;
}
