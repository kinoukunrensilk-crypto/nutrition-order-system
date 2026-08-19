-- ==========================================================
-- 栄養管理物品発注システム Cloudflare D1 データベーススキーマ
-- ==========================================================

-- 1. システム設定・マスタ管理 (Settings)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
);

-- 2. 業者マスタ (Vendors)
CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    fax TEXT NOT NULL,
    contact TEXT NOT NULL DEFAULT '担当様',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
);

-- 3. 商品マスタ (Products)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    vendor_id INTEGER NOT NULL,
    is_toromi INTEGER NOT NULL DEFAULT 0,
    allow_personal INTEGER NOT NULL DEFAULT 1,
    allow_facility INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
);

-- 4. 発注ヘッダー (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE,
    unit TEXT NOT NULL,
    nutritionist TEXT,
    staff_name TEXT NOT NULL,
    order_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours')),
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'processed', 'faxed', 'cancelled'
    memo TEXT,
    approved_by TEXT,
    approved_at TEXT,
    faxed_at TEXT,
    ip_address TEXT
);

-- 5. 発注明細 (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    vendor_id INTEGER NOT NULL,
    vendor_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    is_personal INTEGER NOT NULL DEFAULT 0,
    personal_memo TEXT,
    is_facility INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 6. セキュリティ＆アクセス監査ログ (Audit Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT,
    user_agent TEXT,
    action TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
);

-- 初期マスタデータ投入
INSERT OR IGNORE INTO vendors (id, name, fax, contact, sort_order) VALUES
(1, 'アサヒ物産株式会社', '099-245-6556', '担当様', 1),
(2, '藤安醸造株式会社', '099-262-1357', '担当様', 2),
(3, '有限会社 山口米店', '0995-43-1789', '担当様', 3);

INSERT OR IGNORE INTO products (id, name, unit, vendor_id, is_toromi, allow_personal, allow_facility, sort_order) VALUES
(101, 'ソフティアS', '個', 1, 1, 1, 1, 1),
(102, 'つるりんこ Quickly (800g/袋)', '袋', 1, 1, 1, 1, 2),
(103, 'とろみ調整 つるりんこ (3g×50本/箱)', '箱', 1, 1, 1, 1, 3),
(201, 'だしするが', '個', 1, 0, 0, 1, 4),
(202, 'ふりかけ大袋', '袋', 1, 0, 1, 1, 5),
(203, 'イオンサポート桃', '個', 1, 0, 1, 1, 6),
(204, 'イオンサポートりんご', '個', 1, 0, 1, 1, 7),
(301, '濃口醤油 1.8ℓ', '本', 2, 0, 0, 1, 8),
(302, '薄口醤油 1.8ℓ', '本', 2, 0, 0, 1, 9),
(303, 'すり味噌', '個', 2, 0, 0, 1, 10),
(401, '無洗米・精米', 'kg', 3, 0, 0, 1, 11);

INSERT OR IGNORE INTO settings (key, value) VALUES
('nutritionists', '["野元 史彦","管理栄養士2"]'),
('units', '["2W","2E","3W","3E","4W","4E","5W","5E","その他"]'),
('deadlineTime', '"14:00"'),
('orderDaysList', '{"月":true,"火":true,"水":true,"木":true,"金":true,"土":true,"日":false}'),
('allowed_ips', '[]'),
('facility_name', '"特別養護老人ホーム シルクロード七福神"');
