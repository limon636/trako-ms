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
import { Customer } from './customer.entity';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  COD = 'COD',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  DUE = 'DUE',
}

export enum OrderStatus {
  NEW = 'NEW',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum DeliveryMethod {
  HOME_DELIVERY = 'HOME_DELIVERY',
  PICKUP = 'PICKUP',
  COURIER = 'COURIER',
}

export enum DiscountType {
  FLAT = 'FLAT',
  PERCENT = 'PERCENT',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'store_id', type: 'bigint', unsigned: true })
  storeId: number;

  @Column({ name: 'order_number', length: 30 })
  orderNumber: string;

  @Column({ name: 'customer_id', type: 'bigint', unsigned: true })
  customerId: number;

  @Column({ name: 'created_by', type: 'bigint', unsigned: true, nullable: true })
  createdBy: number | null;

  @Column({ name: 'delivery_address', type: 'text' })
  deliveryAddress: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ name: 'discount_type', type: 'enum', enum: DiscountType, nullable: true })
  discountType: DiscountType | null;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'delivery_charge', type: 'decimal', precision: 12, scale: 2, default: 0 })
  deliveryCharge: number;

  @Column({ name: 'grand_total', type: 'decimal', precision: 12, scale: 2 })
  grandTotal: number;

  @Column({ name: 'advance_paid', type: 'decimal', precision: 12, scale: 2, default: 0 })
  advancePaid: number;

  @Column({ name: 'due_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  dueAmount: number;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.DUE })
  paymentStatus: PaymentStatus;

  @Column({ name: 'order_status', type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  orderStatus: OrderStatus;

  @Column({ name: 'delivery_method', type: 'enum', enum: DeliveryMethod })
  deliveryMethod: DeliveryMethod;

  @Column({ name: 'courier_name', type: 'varchar', length: 80, nullable: true })
  courierName: string | null;

  @Column({ name: 'tracking_id', type: 'varchar', length: 100, nullable: true })
  trackingId: string | null;

  @Column({ name: 'expected_delivery_date', type: 'date', nullable: true })
  expectedDeliveryDate: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Store, (store) => store.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (h) => h.order, { cascade: true })
  statusHistory: OrderStatusHistory[];
}
