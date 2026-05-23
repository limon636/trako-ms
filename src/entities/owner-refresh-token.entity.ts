import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Owner } from './owner.entity';

@Entity('owner_refresh_tokens')
export class OwnerRefreshToken {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'owner_id', type: 'bigint', unsigned: true })
  ownerId: number;

  @Column({ name: 'token_hash', length: 255, unique: true })
  tokenHash: string;

  @Column({ name: 'device_info', type: 'varchar', length: 255, nullable: true })
  deviceInfo: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Owner, (owner) => owner.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: Owner;
}
