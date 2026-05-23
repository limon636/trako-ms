import { SetMetadata } from '@nestjs/common';

export enum LimitType {
  STORES = 'STORES',
  PRODUCTS = 'PRODUCTS',
  USERS = 'USERS',
  ORDERS_MONTH = 'ORDERS_MONTH',
}

export const LIMIT_TYPE_KEY = 'limitType';
export const SubscriptionLimit = (type: LimitType) =>
  SetMetadata(LIMIT_TYPE_KEY, type);
