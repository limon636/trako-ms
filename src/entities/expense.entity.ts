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
import { ExpenseCategory } from './expense-category.entity';
import { User } from './user.entity';

export enum ExpensePaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  OTHER = 'OTHER',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'store_id', type: 'bigint', unsigned: true })
  storeId: number;

  @Column({ name: 'category_id', type: 'bigint', unsigned: true, nullable: true })
  categoryId: number | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', type: 'enum', enum: ExpensePaymentMethod })
  paymentMethod: ExpensePaymentMethod;

  @Column({ name: 'paid_to', type: 'varchar', length: 100, nullable: true })
  paidTo: string | null;

  @Column({ name: 'receipt_url', type: 'varchar', length: 500, nullable: true })
  receiptUrl: string | null;

  @Column({ name: 'expense_date', type: 'date' })
  expenseDate: string;

  @Column({ name: 'recorded_by', type: 'bigint', unsigned: true, nullable: true })
  recordedBy: number | null;

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

  @ManyToOne(() => ExpenseCategory, (cat) => cat.expenses, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: ExpenseCategory | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by' })
  recorder: User | null;
}
