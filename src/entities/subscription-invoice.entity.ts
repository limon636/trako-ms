import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Subscription } from './subscription.entity';

export enum InvoiceStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  REFUNDED = 'refunded',
}

@Entity('subscription_invoices')
export class SubscriptionInvoice {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ name: 'subscription_id', type: 'bigint', unsigned: true })
  subscriptionId: number;

  @Column({ name: 'invoice_number', length: 30, unique: true })
  invoiceNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 5, default: 'BDT' })
  currency: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod: string | null;

  @Column({ name: 'transaction_id', type: 'varchar', length: 150, nullable: true })
  transactionId: string | null;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.UNPAID })
  status: InvoiceStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Subscription, (sub) => sub.invoices)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;
}
