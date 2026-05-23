import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// ── Entities ──────────────────────────────────────────────────────────────────
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Owner } from './entities/owner.entity';
import { OwnerRefreshToken } from './entities/owner-refresh-token.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionInvoice } from './entities/subscription-invoice.entity';
import { Store } from './entities/store.entity';
import { User } from './entities/user.entity';
import { UserRefreshToken } from './entities/user-refresh-token.entity';
import { ProductCategory } from './entities/product-category.entity';
import { Product } from './entities/product.entity';
import { StockLedger } from './entities/stock-ledger.entity';
import { Customer } from './entities/customer.entity';
import { Dealer } from './entities/dealer.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { Payment } from './entities/payment.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { Expense } from './entities/expense.entity';
import { StoreSetting } from './entities/store-setting.entity';
import { Notification } from './entities/notification.entity';

// ── Feature Modules ───────────────────────────────────────────────────────────
import { OwnersModule } from './modules/owners/owners.module';
import { UsersModule } from './modules/users/users.module';
import { SubscriptionPlansModule } from './modules/subscription-plans/subscription-plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { StoresModule } from './modules/stores/stores.module';
import { ProductCategoriesModule } from './modules/product-categories/product-categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DealersModule } from './modules/dealers/dealers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { StoreSettingsModule } from './modules/store-settings/store-settings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

const ALL_ENTITIES = [
  SubscriptionPlan, Owner, OwnerRefreshToken, Subscription, SubscriptionInvoice,
  Store, User, UserRefreshToken, ProductCategory, Product, StockLedger,
  Customer, Dealer, Order, OrderItem, OrderStatusHistory,
  Purchase, PurchaseItem, Payment, ExpenseCategory, Expense,
  StoreSetting, Notification,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        entities: ALL_ENTITIES,
        synchronize: config.get<string>('nodeEnv') !== 'production', // use migrations in prod
        charset: 'utf8mb4',
        timezone: '+06:00',
      }),
    }),
    // ── Feature modules ────────────────────────────────────────────────────────
    OwnersModule,
    UsersModule,
    SubscriptionPlansModule,
    SubscriptionsModule,
    StoresModule,
    ProductCategoriesModule,
    ProductsModule,
    CustomersModule,
    DealersModule,
    OrdersModule,
    PurchasesModule,
    PaymentsModule,
    ExpensesModule,
    StoreSettingsModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}

