import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true })
  orderId: number;

  @Column({ name: 'from_status', type: 'varchar', length: 20, nullable: true })
  fromStatus: string | null;

  @Column({ name: 'to_status', length: 20 })
  toStatus: string;

  @Column({ name: 'changed_by', type: 'bigint', unsigned: true, nullable: true })
  changedBy: number | null;

  @Column({ name: 'tracking_id', type: 'varchar', length: 100, nullable: true })
  trackingId: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Order, (order) => order.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User | null;
}
