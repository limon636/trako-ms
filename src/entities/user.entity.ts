import {
  BeforeInsert,
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
import { v4 as uuidv4 } from 'uuid';
import { Store } from './store.entity';
import { UserRefreshToken } from './user-refresh-token.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALES_STAFF = 'SALES_STAFF',
  ACCOUNTANT = 'ACCOUNTANT',
  DELIVERY_STAFF = 'DELIVERY_STAFF',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @Column({ name: 'store_id', type: 'bigint', unsigned: true })
  storeId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.SALES_STAFF })
  role: UserRole;

  @Column({ type: 'json', nullable: true })
  permissions: Record<string, boolean> | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Store, (store) => store.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => UserRefreshToken, (token) => token.user)
  refreshTokens: UserRefreshToken[];

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
