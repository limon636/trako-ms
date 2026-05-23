import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { Request } from 'express';
import { LIMIT_TYPE_KEY, LimitType } from '../decorators/subscription-limit.decorator';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { Store } from '../../entities/store.entity';
import { User } from '../../entities/user.entity';
import { Product } from '../../entities/product.entity';
import { Order } from '../../entities/order.entity';
import { Owner } from '../../entities/owner.entity';

interface AuthRequest extends Request {
  user: Owner | User;
}

@Injectable()
export class SubscriptionLimitsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limitType = this.reflector.get<LimitType>(
      LIMIT_TYPE_KEY,
      context.getHandler(),
    );

    // No limit annotation — allow through
    if (!limitType) return true;

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const requestUser = request.user as (Owner & { storeId?: number }) | undefined;

    if (!requestUser) {
      throw new ForbiddenException('Authentication required');
    }

    // Resolve owner ID and store ID from the authenticated principal
    let ownerId: number;
    let storeId: number | undefined;

    if ('storeId' in requestUser && requestUser.storeId) {
      // Authenticated as a store User — look up owner via store
      storeId = requestUser.storeId;
      const store = await this.dataSource.getRepository(Store).findOne({
        where: { id: storeId },
        select: { id: true, ownerId: true },
      });
      if (!store) throw new ForbiddenException('Store not found');
      ownerId = store.ownerId;
    } else {
      // Authenticated as an Owner
      ownerId = (requestUser as Owner).id;
      // storeId from route param (for product/user/order limits)
      const paramStoreId =
        (request.params as Record<string, string>)['storeId'];
      storeId = paramStoreId ? parseInt(paramStoreId, 10) : undefined;
    }

    // Fetch active subscription with plan
    const subscription = await this.dataSource.getRepository(Subscription).findOne({
      where: {
        ownerId,
        status: SubscriptionStatus.ACTIVE,
        endsAt: MoreThanOrEqual(new Date()),
      },
      relations: { plan: true },
      order: { endsAt: 'DESC' },
    });

    if (!subscription) {
      throw new ForbiddenException(
        'No active subscription. Please subscribe to a plan to continue.',
      );
    }

    // Block all writes during grace_period / expired
    const blockedStatuses: SubscriptionStatus[] = [
      SubscriptionStatus.EXPIRED,
      SubscriptionStatus.CANCELLED,
    ];
    if (blockedStatuses.includes(subscription.status)) {
      throw new ForbiddenException(
        'Your subscription has expired. Please renew to make changes.',
      );
    }

    const plan = subscription.plan;

    switch (limitType) {
      case LimitType.STORES: {
        if (plan.maxStores === -1) break;
        const count = await this.dataSource.getRepository(Store).count({
          where: { ownerId, deletedAt: undefined },
          withDeleted: false,
        });
        if (count >= plan.maxStores) {
          throw new UnprocessableEntityException(
            `Your plan allows a maximum of ${plan.maxStores} store(s). Upgrade to add more.`,
          );
        }
        break;
      }

      case LimitType.PRODUCTS: {
        if (plan.maxProducts === -1) break;
        if (!storeId) throw new ForbiddenException('Store context required');
        const count = await this.dataSource.getRepository(Product).count({
          where: { storeId, deletedAt: undefined },
          withDeleted: false,
        });
        if (count >= plan.maxProducts) {
          throw new UnprocessableEntityException(
            `Your plan allows a maximum of ${plan.maxProducts} product(s). Upgrade to add more.`,
          );
        }
        break;
      }

      case LimitType.USERS: {
        if (plan.maxUsers === -1) break;
        if (!storeId) throw new ForbiddenException('Store context required');
        const count = await this.dataSource.getRepository(User).count({
          where: { storeId, deletedAt: undefined },
          withDeleted: false,
        });
        if (count >= plan.maxUsers) {
          throw new UnprocessableEntityException(
            `Your plan allows a maximum of ${plan.maxUsers} staff user(s). Upgrade to add more.`,
          );
        }
        break;
      }

      case LimitType.ORDERS_MONTH: {
        if (plan.maxOrdersMonth === -1) break;
        if (!storeId) throw new ForbiddenException('Store context required');
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const count = await this.dataSource
          .getRepository(Order)
          .createQueryBuilder('o')
          .where('o.store_id = :storeId', { storeId })
          .andWhere('o.created_at >= :monthStart', { monthStart })
          .andWhere('o.deleted_at IS NULL')
          .getCount();

        if (count >= plan.maxOrdersMonth) {
          throw new UnprocessableEntityException(
            `Your plan allows a maximum of ${plan.maxOrdersMonth} orders per month. Upgrade to continue.`,
          );
        }
        break;
      }
    }

    return true;
  }
}
