-- ============================================================
-- TRAKO BACKEND DATABASE SCHEMA
-- Multi-Store + Subscription Architecture
-- MySQL 8.0+
-- ============================================================
USE trako;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- SECTION 1: SUBSCRIPTION LAYER
-- ============================================================

CREATE TABLE subscription_plans (
    id               TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(50)     NOT NULL,
    slug             VARCHAR(50)     NOT NULL UNIQUE,        -- free | starter | pro | business
    price_monthly    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    price_yearly     DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    max_stores       TINYINT         NOT NULL DEFAULT 1,     -- -1 = unlimited
    max_products     INT             NOT NULL DEFAULT 50,    -- -1 = unlimited
    max_users        TINYINT         NOT NULL DEFAULT 2,     -- -1 = unlimited
    max_orders_month INT             NOT NULL DEFAULT 100,   -- -1 = unlimited
    features         JSON            NULL,                   -- {"reports":true,"whatsapp":true}
    is_active        TINYINT(1)      NOT NULL DEFAULT 1,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 2: (Owners merged into users as SUPER_ADMIN role)
-- ============================================================

-- ============================================================
-- SECTION 3: SUBSCRIPTIONS & BILLING
-- ============================================================

CREATE TABLE subscriptions (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT UNSIGNED NOT NULL,
    plan_id       TINYINT UNSIGNED NOT NULL,
    billing_cycle ENUM('monthly','yearly','trial') NOT NULL DEFAULT 'monthly',
    status        ENUM('active','expired','cancelled','grace_period') NOT NULL DEFAULT 'active',
    trial_ends_at DATETIME        NULL,
    starts_at     DATETIME        NOT NULL,
    ends_at       DATETIME        NOT NULL,
    cancelled_at  DATETIME        NULL,
    auto_renew    TINYINT(1)      NOT NULL DEFAULT 1,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE subscription_invoices (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    subscription_id BIGINT UNSIGNED NOT NULL,
    invoice_number  VARCHAR(30)     NOT NULL UNIQUE,
    amount          DECIMAL(10,2)   NOT NULL,
    currency        VARCHAR(5)      NOT NULL DEFAULT 'BDT',
    payment_method  VARCHAR(50)     NULL,       -- bKash, Card, Bank
    transaction_id  VARCHAR(150)    NULL,
    status          ENUM('paid','unpaid','refunded') NOT NULL DEFAULT 'unpaid',
    paid_at         TIMESTAMP       NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)         REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- ============================================================
-- SECTION 4: STORES (Multi-store tenancy root)
-- ============================================================

CREATE TABLE stores (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid          CHAR(36)        NOT NULL UNIQUE DEFAULT (UUID()),
    user_id       BIGINT UNSIGNED NOT NULL,
    name          VARCHAR(150)    NOT NULL,
    business_type VARCHAR(80)     NULL,
    trade_license VARCHAR(100)    NULL,
    phone         VARCHAR(20)     NULL,
    email         VARCHAR(150)    NULL,
    address       TEXT            NULL,
    city          VARCHAR(80)     NULL,
    logo_url      VARCHAR(500)    NULL,
    currency      VARCHAR(10)     NOT NULL DEFAULT 'BDT',
    timezone      VARCHAR(50)     NOT NULL DEFAULT 'Asia/Dhaka',
    is_active     TINYINT(1)      NOT NULL DEFAULT 1,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    TIMESTAMP       NULL,
    INDEX idx_store_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- SECTION 5: USERS (Staff scoped to a store)
-- ============================================================

CREATE TABLE users (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid          CHAR(36)        NOT NULL UNIQUE DEFAULT (UUID()),
    store_id      BIGINT UNSIGNED NULL,           -- NULL for SUPER_ADMIN
    name          VARCHAR(100)    NOT NULL,
    phone         VARCHAR(20)     NOT NULL,
    email         VARCHAR(150)    NULL UNIQUE,
    password_hash VARCHAR(255)    NOT NULL,
    role          ENUM('SUPER_ADMIN','ADMIN','MANAGER','SALES_STAFF','ACCOUNTANT','DELIVERY_STAFF') NOT NULL DEFAULT 'SALES_STAFF',
    permissions   JSON            NULL,           -- granular overrides e.g. {"delete_order":false}
    is_active     TINYINT(1)      NOT NULL DEFAULT 1,
    last_login_at TIMESTAMP       NULL,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    TIMESTAMP       NULL,
    UNIQUE KEY uq_user_phone_store (store_id, phone),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE user_refresh_tokens (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT UNSIGNED NOT NULL,
    token_hash   VARCHAR(255)    NOT NULL UNIQUE,
    device_info  VARCHAR(255)    NULL,
    ip_address   VARCHAR(45)     NULL,
    expires_at   TIMESTAMP       NOT NULL,
    revoked_at   TIMESTAMP       NULL,
    created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- SECTION 6: CATALOG
-- ============================================================

CREATE TABLE product_categories (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id   BIGINT UNSIGNED NOT NULL,
    name       VARCHAR(100)    NOT NULL,
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_category_store (store_id, name),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE products (
    id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id             BIGINT UNSIGNED NOT NULL,
    category_id          BIGINT UNSIGNED NULL,
    name                 VARCHAR(200)    NOT NULL,
    sku                  VARCHAR(80)     NOT NULL,
    unit                 ENUM('Piece','KG','Litre','Box','Dozen','Meter','Pack') NOT NULL DEFAULT 'Piece',
    purchase_price       DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    selling_price        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    low_stock_threshold  INT             NOT NULL DEFAULT 5,
    description          TEXT            NULL,
    photo_url            VARCHAR(500)    NULL,
    is_active            TINYINT(1)      NOT NULL DEFAULT 1,
    created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at           TIMESTAMP       NULL,
    UNIQUE KEY uq_sku_store (store_id, sku),
    FOREIGN KEY (store_id)    REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

-- Stock ledger: single source of truth for inventory movements
-- stock is derived: SUM(quantity_change) per product
CREATE TABLE stock_ledger (
    id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id         BIGINT UNSIGNED NOT NULL,
    product_id       BIGINT UNSIGNED NOT NULL,
    reference_type   ENUM('PURCHASE','ORDER','ADJUSTMENT') NOT NULL,
    reference_id     BIGINT UNSIGNED NOT NULL,
    quantity_change  INT             NOT NULL,   -- positive = in, negative = out
    balance_after    INT             NOT NULL,   -- denormalized for fast history display
    note             VARCHAR(200)    NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stock_product (store_id, product_id),
    FOREIGN KEY (store_id)   REFERENCES stores(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- SECTION 7: PEOPLE
-- ============================================================

CREATE TABLE customers (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id        BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    alternate_phone VARCHAR(20)     NULL,
    email           VARCHAR(150)    NULL,
    gender          ENUM('Male','Female','Other') NULL,
    address         TEXT            NULL,
    city            VARCHAR(80)     NULL,
    customer_type   ENUM('REGULAR','VIP','WHOLESALE') NOT NULL DEFAULT 'REGULAR',
    note            TEXT            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP       NULL,
    INDEX idx_customer_phone (store_id, phone),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE dealers (
    id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id             BIGINT UNSIGNED NOT NULL,
    business_name        VARCHAR(150)    NOT NULL,
    contact_person       VARCHAR(100)    NOT NULL,
    phone                VARCHAR(20)     NOT NULL,
    alternate_phone      VARCHAR(20)     NULL,
    email                VARCHAR(150)    NULL,
    address              TEXT            NULL,
    categories           JSON            NULL,   -- ["Electronics","Clothing"]
    payment_terms        VARCHAR(100)    NULL,
    opening_balance_due  DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    note                 TEXT            NULL,
    is_active            TINYINT(1)      NOT NULL DEFAULT 1,
    created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at           TIMESTAMP       NULL,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- ============================================================
-- SECTION 8: ORDERS (Sales)
-- ============================================================

CREATE TABLE orders (
    id                     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id               BIGINT UNSIGNED NOT NULL,
    order_number           VARCHAR(30)     NOT NULL,   -- e.g. ORD-20260523-0001
    customer_id            BIGINT UNSIGNED NOT NULL,
    created_by             BIGINT UNSIGNED NULL,       -- staff user
    delivery_address       TEXT            NOT NULL,
    subtotal               DECIMAL(12,2)   NOT NULL,
    discount_type          ENUM('FLAT','PERCENT') NULL,
    discount_amount        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    delivery_charge        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    grand_total            DECIMAL(12,2)   NOT NULL,
    advance_paid           DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    due_amount             DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    payment_method         ENUM('CASH','BANK_TRANSFER','BKASH','NAGAD','COD','OTHER') NOT NULL,
    payment_status         ENUM('PAID','PARTIAL','DUE') NOT NULL DEFAULT 'DUE',
    order_status           ENUM('NEW','PROCESSING','PACKED','SHIPPED','DELIVERED','CANCELLED','RETURNED') NOT NULL DEFAULT 'NEW',
    delivery_method        ENUM('HOME_DELIVERY','PICKUP','COURIER') NOT NULL,
    courier_name           VARCHAR(80)     NULL,       -- Pathao, Steadfast, RedX, etc.
    tracking_id            VARCHAR(100)    NULL,
    expected_delivery_date DATE            NULL,
    note                   TEXT            NULL,
    created_at             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at             TIMESTAMP       NULL,
    UNIQUE KEY uq_order_number_store (store_id, order_number),
    INDEX idx_order_customer (store_id, customer_id),
    INDEX idx_order_status   (store_id, order_status),
    INDEX idx_order_created  (store_id, created_at),
    FOREIGN KEY (store_id)    REFERENCES stores(id)    ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE SET NULL
);

CREATE TABLE order_items (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id     BIGINT UNSIGNED NOT NULL,
    product_id   BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(200)    NOT NULL,   -- price/name snapshot at order time
    sku          VARCHAR(80)     NOT NULL,
    quantity     INT UNSIGNED    NOT NULL,
    unit_price   DECIMAL(12,2)   NOT NULL,
    line_total   DECIMAL(12,2)   NOT NULL,
    INDEX idx_order_items_order (order_id),
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE order_status_history (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id    BIGINT UNSIGNED NOT NULL,
    from_status VARCHAR(20)     NULL,
    to_status   VARCHAR(20)     NOT NULL,
    changed_by  BIGINT UNSIGNED NULL,
    tracking_id VARCHAR(100)    NULL,
    note        TEXT            NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)  ON DELETE SET NULL
);

-- ============================================================
-- SECTION 9: PURCHASES
-- ============================================================

CREATE TABLE purchases (
    id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id           BIGINT UNSIGNED NOT NULL,
    purchase_number    VARCHAR(30)     NOT NULL,
    dealer_id          BIGINT UNSIGNED NOT NULL,
    created_by         BIGINT UNSIGNED NULL,
    subtotal           DECIMAL(12,2)   NOT NULL,
    additional_charges DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    grand_total        DECIMAL(12,2)   NOT NULL,
    amount_paid        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    due_amount         DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    payment_method     ENUM('CASH','BANK_TRANSFER','BKASH','NAGAD','CREDIT','OTHER') NOT NULL,
    payment_status     ENUM('PAID','PARTIAL','DUE') NOT NULL DEFAULT 'DUE',
    invoice_number     VARCHAR(100)    NULL,
    purchase_date      DATE            NOT NULL,
    note               TEXT            NULL,
    created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at         TIMESTAMP       NULL,
    UNIQUE KEY uq_purchase_number_store (store_id, purchase_number),
    INDEX idx_purchase_dealer  (store_id, dealer_id),
    INDEX idx_purchase_created (store_id, created_at),
    FOREIGN KEY (store_id)   REFERENCES stores(id)  ON DELETE CASCADE,
    FOREIGN KEY (dealer_id)  REFERENCES dealers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE SET NULL
);

CREATE TABLE purchase_items (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    purchase_id  BIGINT UNSIGNED NOT NULL,
    product_id   BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(200)    NOT NULL,   -- snapshot
    quantity     INT UNSIGNED    NOT NULL,
    unit_cost    DECIMAL(12,2)   NOT NULL,
    line_total   DECIMAL(12,2)   NOT NULL,
    INDEX idx_purchase_items_purchase (purchase_id),
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE RESTRICT
);

-- ============================================================
-- SECTION 10: PAYMENTS (Due collection for orders & purchases)
-- ============================================================

CREATE TABLE payments (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id       BIGINT UNSIGNED NOT NULL,
    reference_type ENUM('ORDER','PURCHASE') NOT NULL,
    reference_id   BIGINT UNSIGNED NOT NULL,
    amount         DECIMAL(12,2)   NOT NULL,
    payment_method ENUM('CASH','BANK_TRANSFER','BKASH','NAGAD','COD','CREDIT','OTHER') NOT NULL,
    payment_date   DATE            NOT NULL,
    recorded_by    BIGINT UNSIGNED NULL,
    note           TEXT            NULL,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_payment_ref     (reference_type, reference_id),
    INDEX idx_payment_store   (store_id, payment_date),
    FOREIGN KEY (store_id)    REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)  ON DELETE SET NULL
);

-- ============================================================
-- SECTION 11: EXPENSES
-- ============================================================

CREATE TABLE expense_categories (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id   BIGINT UNSIGNED NOT NULL,
    name       VARCHAR(80)     NOT NULL,
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_exp_cat_store (store_id, name),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE expenses (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id       BIGINT UNSIGNED NOT NULL,
    category_id    BIGINT UNSIGNED NULL,
    description    TEXT            NOT NULL,
    amount         DECIMAL(12,2)   NOT NULL,
    payment_method ENUM('CASH','BANK_TRANSFER','BKASH','NAGAD','OTHER') NOT NULL,
    paid_to        VARCHAR(100)    NULL,
    receipt_url    VARCHAR(500)    NULL,
    expense_date   DATE            NOT NULL,
    recorded_by    BIGINT UNSIGNED NULL,
    note           TEXT            NULL,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at     TIMESTAMP       NULL,
    INDEX idx_expense_date (store_id, expense_date),
    FOREIGN KEY (store_id)    REFERENCES stores(id)           ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id)            ON DELETE SET NULL
);

-- ============================================================
-- SECTION 12: STORE SETTINGS & NOTIFICATIONS
-- ============================================================

CREATE TABLE store_settings (
    store_id   BIGINT UNSIGNED NOT NULL,
    `key`      VARCHAR(80)     NOT NULL,
    value      TEXT            NOT NULL,
    updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (store_id, `key`),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id       BIGINT UNSIGNED NOT NULL,
    user_id        BIGINT UNSIGNED NULL,               -- NULL = all store users
    title          VARCHAR(200)    NOT NULL,
    message        TEXT            NOT NULL,
    type           ENUM('ORDER_NEW','ORDER_STATUS','LOW_STOCK','PAYMENT','SECURITY','SYSTEM') NOT NULL,
    reference_type VARCHAR(30)     NULL,
    reference_id   BIGINT UNSIGNED NULL,
    is_read        TINYINT(1)      NOT NULL DEFAULT 0,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_user (store_id, user_id, is_read),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEED: Default subscription plans (BDT pricing)
-- ============================================================

INSERT INTO subscription_plans
    (name, slug, price_monthly, price_yearly, max_stores, max_products, max_users, max_orders_month, features)
VALUES
    ('Free',     'free',      0,      0,   1,   50,  2,    100,  '{"reports":false,"whatsapp":false,"multi_store":false,"priority_support":false}'),
    ('Starter',  'starter',   299,  2990,  1,  500,  5,    500,  '{"reports":true,"whatsapp":false,"multi_store":false,"priority_support":false}'),
    ('Pro',      'pro',       799,  7990,  3, 2000, 15,   2000,  '{"reports":true,"whatsapp":true,"multi_store":true,"priority_support":false}'),
    ('Business', 'business', 1999, 19990, -1,   -1, -1,     -1,  '{"reports":true,"whatsapp":true,"multi_store":true,"priority_support":true}');




