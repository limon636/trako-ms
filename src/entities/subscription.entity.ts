import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Owner } from './owner.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionInvoice } from './subscription-invoice.entity';

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  TRIAL = 'trial',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  GRACE_PERIOD = 'grace_period',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'owner_id', type: 'bigint', unsigned: true })
  ownerId: number;

  @Column({ name: 'plan_id', type: 'tinyint', unsigned: true })
  planId: number;

  @Column({ name: 'billing_cycle', type: 'enum', enum: BillingCycle, default: BillingCycle.MONTHLY })
  billingCycle: BillingCycle;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ name: 'trial_ends_at', type: 'datetime', nullable: true })
  trialEndsAt: Date | null;

  @Column({ name: 'starts_at', type: 'datetime' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'datetime' })
  endsAt: Date;

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'auto_renew', default: true })
  autoRenew: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Owner, (owner) => owner.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: Owner;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @OneToMany(() => SubscriptionInvoice, (inv) => inv.subscription)
  invoices: SubscriptionInvoice[];
}
