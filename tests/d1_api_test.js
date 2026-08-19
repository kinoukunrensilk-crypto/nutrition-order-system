// ==========================================================
// D1 API Unit & Integration Test
// ==========================================================

import { onRequestGet as getOrders, onRequestPost as postOrder, onRequestPut as putOrder } from '../functions/api/orders.js';
import { onRequestGet as getSettings, onRequestPost as postSettings } from '../functions/api/settings.js';
import { onRequestGet as getInit } from '../functions/api/init.js';

// Mock in-memory D1 DB
class MockD1 {
  constructor() {
    this.tables = {
      settings: [
        { key: 'nutritionists', value: '["野元 史彦","管理栄養士2"]', updated_at: '2026-08-19 12:00:00' },
        { key: 'allowed_ips', value: '[]', updated_at: '2026-08-19 12:00:00' },
        { key: 'units', value: '["2W","2E","3W","3E","4W","4E","5W","5E","その他"]', updated_at: '2026-08-19 12:00:00' }
      ],
      vendors: [
        { id: 1, name: 'アサヒ物産株式会社', fax: '099-245-6556', contact: '担当様', sort_order: 1, is_active: 1 },
        { id: 2, name: '藤安醸造株式会社', fax: '099-262-1357', contact: '担当様', sort_order: 2, is_active: 1 },
        { id: 3, name: '有限会社 山口米店', fax: '0995-43-1789', contact: '担当様', sort_order: 3, is_active: 1 }
      ],
      products: [
        { id: 101, name: 'ソフティアS', unit: '個', vendor_id: 1, is_toromi: 1, allow_personal: 1, allow_facility: 1, sort_order: 1, is_active: 1 },
        { id: 401, name: '無洗米・精米', unit: 'kg', vendor_id: 3, is_toromi: 0, allow_personal: 0, allow_facility: 1, sort_order: 2, is_active: 1 }
      ],
      orders: [],
      order_items: [],
      audit_logs: []
    };
    this.lastOrderId = 1;
    this.lastItemId = 1;
  }

  createStmt(sql, boundParams = []) {
    const self = this;
    return {
      bind(...params) {
        return self.createStmt(sql, params);
      },
      async all() {
        if (sql.includes('FROM settings')) {
          return { results: [...self.tables.settings] };
        }
        if (sql.includes('FROM vendors')) {
          return { results: self.tables.vendors.filter(v => v.is_active === 1) };
        }
        if (sql.includes('FROM products')) {
          return { results: self.tables.products.filter(p => p.is_active === 1) };
        }
        if (sql.includes('FROM orders')) {
          let res = [...self.tables.orders];
          if (boundParams.includes('2W')) res = res.filter(o => o.unit === '2W');
          return { results: res };
        }
        if (sql.includes('FROM order_items')) {
          return { results: [...self.tables.order_items] };
        }
        return { results: [] };
      },
      async first() {
        const res = await this.all();
        return res.results && res.results.length > 0 ? res.results[0] : null;
      },
      async run() {
        if (sql.includes('INSERT INTO orders')) {
          const [order_number, unit, nutritionist, staff_name, order_date, created_at, memo, ip_address] = boundParams;
          const orderId = self.lastOrderId++;
          self.tables.orders.push({
            id: orderId,
            order_number,
            unit,
            nutritionist,
            staff_name,
            order_date,
            created_at,
            status: 'submitted',
            memo,
            ip_address
          });
          return { meta: { last_row_id: orderId } };
        }
        if (sql.includes('INSERT INTO audit_logs')) {
          self.tables.audit_logs.push({ details: boundParams[2] });
          return { meta: {} };
        }
        if (sql.includes('INSERT INTO order_items')) {
          const [order_id, product_id, product_name, vendor_id, vendor_name, unit, quantity, is_personal, personal_memo, is_facility] = boundParams;
          self.tables.order_items.push({
            id: self.lastItemId++,
            order_id,
            product_id,
            product_name,
            vendor_id,
            vendor_name,
            unit,
            quantity,
            is_personal,
            personal_memo,
            is_facility
          });
          return { meta: {} };
        }
        return { meta: {} };
      }
    };
  }

  prepare(sql) {
    return this.createStmt(sql);
  }

  async batch(statements) {
    for (const stmt of statements) {
      if (stmt.run) await stmt.run();
    }
  }
}

async function runTests() {
  console.log('--- 🧪 Running Cloudflare D1 Backend Tests ---');
  const mockDb = new MockD1();
  const env = { DB: mockDb };

  // Test 1: /api/init
  console.log('1. Testing /api/init...');
  const initRes = await getInit({ env, request: new Request('http://localhost/api/init') });
  const initData = await initRes.json();
  if (!initData.success || initData.data.vendors.length !== 3) {
    throw new Error('Test 1 failed: /api/init data invalid');
  }
  console.log('   ✅ /api/init passed. Vendors:', initData.data.vendors.length, 'Products:', initData.data.products.length);

  // Test 2: /api/orders POST
  console.log('2. Testing /api/orders POST (New Order Submission)...');
  const orderPayload = {
    unit: '2W',
    staffName: 'テスト職員',
    orderDate: '2026-08-19',
    nutritionist: '野元 史彦',
    memo: 'テスト申送りメモ',
    items: [
      { id: 101, name: 'ソフティアS', vendorId: 1, unit: '個', facilityQty: 2, personalQty: 1, personalMemo: '佐藤様' },
      { id: 401, name: '無洗米・精米', vendorId: 3, unit: 'kg', facilityQty: 10, personalQty: 0, personalMemo: '' }
    ]
  };
  const postRes = await postOrder({
    env,
    request: new Request('http://localhost/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
  });
  const postData = await postRes.json();
  if (!postData.success || !postData.orderNumber) {
    throw new Error('Test 2 failed: Order submission failed');
  }
  console.log('   ✅ /api/orders POST passed. Order Number:', postData.orderNumber);

  // Test 3: /api/orders GET
  console.log('3. Testing /api/orders GET (History Fetch)...');
  const getRes = await getOrders({
    env,
    request: new Request('http://localhost/api/orders?unit=2W')
  });
  const getData = await getRes.json();
  if (!getData.success || getData.orders.length === 0) {
    throw new Error('Test 3 failed: Order history empty');
  }
  console.log('   ✅ /api/orders GET passed. Found orders:', getData.orders.length);

  console.log('\n🎉 ALL 3 D1 BACKEND TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
