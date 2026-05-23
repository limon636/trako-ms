import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from './subscription.entity';
import { Store } from './store.entity';
import { OwnerRefreshToken } from './owner-refresh-token.entity';

@Entity('owners')
export class Owner {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash: string;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ name: 'phone_verified_at', type: 'timestamp', nullable: true })
  phoneVerifiedAt: Date | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Store, (store) => store.owner)
  stores: Store[];

  @OneToMany(() => Subscription, (sub) => sub.owner)
  subscriptions: Subscription[];

  @OneToMany(() => OwnerRefreshToken, (token) => token.owner)
  refreshTokens: OwnerRefreshToken[];

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
