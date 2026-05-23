import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { Dealer } from './dealer.entity';
import { User } from './user.entity';
import { PurchaseItem } from './purchase-item.entity';

export enum PurchasePaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  CREDIT = 'CREDIT',
  OTHER = 'OTHER',
}

export enum PurchasePaymentStatus {
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  DUE = 'DUE',
}

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'store_id', type: 'bigint', unsigned: true })
  storeId: number;

  @Column({ name: 'purchase_number', length: 30 })
  purchaseNumber: string;

  @Column({ name: 'dealer_id', type: 'bigint', unsigned: true })
  dealerId: number;

  @Column({ name: 'created_by', type: 'bigint', unsigned: true, nullable: true })
  createdBy: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ name: 'additional_charges', type: 'decimal', precision: 12, scale: 2, default: 0 })
  additionalCharges: number;

  @Column({ name: 'grand_total', type: 'decimal', precision: 12, scale: 2 })
  grandTotal: number;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ name: 'due_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  dueAmount: number;

  @Column({ name: 'payment_method', type: 'enum', enum: PurchasePaymentMethod })
  paymentMethod: PurchasePaymentMethod;

  @Column({ name: 'payment_status', type: 'enum', enum: PurchasePaymentStatus, default: PurchasePaymentStatus.DUE })
  paymentStatus: PurchasePaymentStatus;

  @Column({ name: 'invoice_number', type: 'varchar', length: 100, nullable: true })
  invoiceNumber: string | null;

  @Column({ name: 'purchase_date', type: 'date' })
  purchaseDate: string;

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

  @ManyToOne(() => Dealer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'dealer_id' })
  dealer: Dealer;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User | null;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, { cascade: true })
  items: PurchaseItem[];
}
