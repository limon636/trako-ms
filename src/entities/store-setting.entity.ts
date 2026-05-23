import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from './store.entity';

@Entity('store_settings')
export class StoreSetting {
  @PrimaryColumn({ name: 'store_id', type: 'bigint', unsigned: true })
  storeId: number;

  @PrimaryColumn({ name: 'key', length: 80 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
