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

export enum NotificationType {
  ORDER_NEW = 'ORDER_NEW',
  ORDER_STATUS = 'ORDER_STATUS',
  LOW_STOCK = 'LOW_STOCK',
  PAYMENT = 'PAYMENT',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'store_id', type: 'bigint', unsigned: true })
  storeId: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
  userId: number | null;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ name: 'reference_type', type: 'varchar', length: 30, nullable: true })
  referenceType: string | null;

  @Column({ name: 'reference_id', type: 'bigint', unsigned: true, nullable: true })
  referenceId: number | null;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
