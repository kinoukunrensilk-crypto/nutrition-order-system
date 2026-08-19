import { onRequest as middleware } from '../functions/_middleware.js';
import { onRequestGet as initGet } from '../functions/api/init.js';
import { onRequestGet as ordersGet, onRequestPost as ordersPost, onRequestDelete as ordersDelete } from '../functions/api/orders.js';
import { onRequestGet as settingsGet, onRequestPost as settingsPost } from '../functions/api/settings.js';

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`✅ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${msg}`);
    failed++;
  }
}

class MockD1 {
  constructor() {
    this.settings = new Map([
      ['nutritionists', JSON.stringify(['野元 史彦', '管理栄養士2'])],
      ['deadlineTime', JSON.stringify('14:00')],
      ['orderDaysList', JSON.stringify({'月': true, '火': true, '水': true, '木': true, '金': true, '土': true, '日': false})],
      ['allowed_ips', JSON.stringify([])],
      ['facility_name', JSON.stringify('特別養護老人ホーム シルクロード七福神')]
    ]);
    this.vendors = new Map([
      [1, { id: 1, name: 'アサヒ物産株式会社', fax: '099-245-6556', contact: '担当様', sort_order: 1, is_active: 1 }],
      [2, { id: 2, name: '藤安醸造株式会社', fax: '099-262-1357', contact: '担当様', sort_order: 2, is_active: 1 }],
      [3, { id: 3, name: '有限会社 山口米店', fax: '0995-43-1789', contact: '担当様', sort_order: 3, is_active: 1 }]
    ]);
    this.products = new Map([
      [101, { id: 101, name: 'ソフティアS', unit: '個', vendor_id: 1, is_toromi: 1, allow_personal: 1, allow_facility: 1, sort_order: 1, is_active: 1 }],
      [102, { id: 102, name: 'つるりんこ Quickly (800g/袋)', unit: '袋', vendor_id: 1, is_toromi: 1, allow_personal: 1, allow_facility: 1, sort_order: 2, is_active: 1 }],
      [201, { id: 201, name: 'だしするが', unit: '個', vendor_id: 1, is_toromi: 0, allow_personal: 0, allow_facility: 1, sort_order: 3, is_active: 1 }]
    ]);
    this.orders = new Map();
    this.order_items = new Map();
    this.audit_logs = new Map();
    this.nextOrderId = 1;
    this.nextItemId = 1;
    this.nextLogId = 1;
  }

  prepare(query) {
    const db = this;
    let bound = [];
    return {
      bind(...p) {
        bound = p;
        return this;
      },
      async first() {
        const r = await this.all();
        return r.results ? r.results[0] : null;
      },
      async all() {
        const q = query.trim();
        if (q.includes("SELECT value FROM settings WHERE key = 'allowed_ips'")) {
          const v = db.settings.get('allowed_ips');
          return { results: v ? [{ key: 'allowed_ips', value: v }] : [] };
        }
        if (q.includes("SELECT key, value FROM settings")) {
          return { results: Array.from(db.settings.entries()).map(([k, v]) => ({ key: k, value: v })) };
        }
        if (q.includes("FROM vendors")) {
          return { results: Array.from(db.vendors.values()) };
        }
        if (q.includes("FROM products")) {
          return {
            results: Array.from(db.products.values()).map(p => ({
              ...p,
              vendorId: p.vendor_id,
              isToromi: p.is_toromi,
              allowPersonal: p.allow_personal,
              allowFacility: p.allow_facility
            }))
          };
        }
        if (q.includes("FROM orders")) {
          return { results: Array.from(db.orders.values()) };
        }
        if (q.includes("FROM order_items")) {
          return { results: Array.from(db.order_items.values()) };
        }
        return { results: [] };
      },
      async run() {
        const q = query.trim();
        if (q.startsWith("INSERT INTO orders")) {
          const [orderNumber, unit, nutritionist, staffName, orderDate, createdAt, memo, ip] = bound;
          const id = db.nextOrderId++;
          db.orders.set(id, { id, order_number: orderNumber, unit, nutritionist, staff_name: staffName, order_date: orderDate, created_at: createdAt, status: 'submitted', memo, ip_address: ip });
          return { meta: { last_row_id: id } };
        }
        if (q.startsWith("INSERT INTO order_items")) {
          const [orderId, productId, productName, vendorId, vendorName, unit, quantity, isPersonal, personalMemo, isFacility] = bound;
          const id = db.nextItemId++;
          db.order_items.set(id, { id, order_id: orderId, product_id: productId, product_name: productName, vendor_id: vendorId, vendor_name: vendorName, unit, quantity, is_personal: isPersonal, personal_memo: personalMemo, is_facility: isFacility });
          return { meta: { last_row_id: id } };
        }
        if (q.startsWith("INSERT INTO audit_logs")) {
          const [ip, ua, action, details] = bound;
          const id = db.nextLogId++;
          db.audit_logs.set(id, { id, ip_address: ip, user_agent: ua, action, details });
          return { meta: { last_row_id: id } };
        }
        if (q.startsWith("INSERT OR REPLACE INTO settings")) {
          if (q.includes("'allowed_ips'")) {
            db.settings.set('allowed_ips', bound[0]);
          } else {
            const [k, v] = bound;
            db.settings.set(k, v);
          }
          return { meta: {} };
        }
        if (q.startsWith("DELETE FROM orders")) {
          const [id] = bound;
          db.orders.delete(Number(id));
          return { meta: {} };
        }
        return { meta: {} };
      }
    };
  }

  async batch(stmts) {
    for (const s of stmts) {
      await s.run();
    }
    return { success: true };
  }
}

async function main() {
  console.log('================================================================');
  console.log('🧪 栄養管理物品発注システム Cloudflare Functions & D1 厳格自動検証');
  console.log('================================================================\n');
  const db = new MockD1();

  // Test 1: Middleware (Open Mode)
  console.log('1. 施設IP制限ミドルウェア検証（未設定・オープンモード）:');
  const r1 = new Request('http://localhost/api/init', { headers: { 'cf-connecting-ip': '192.168.1.50' } });
  let ok1 = false;
  await middleware({ request: r1, env: { DB: db }, next: async () => { ok1 = true; return new Response('OK'); } });
  assert(ok1 === true, 'allowed_ips が空の時は全通信を許可（開発・移行準備モード）');

  // Test 2: Middleware (Enforced Mode)
  console.log('\n2. 施設IP制限ミドルウェア検証（施設Wi-Fi限定モード発動）:');
  db.settings.set('allowed_ips', JSON.stringify(['210.140.50.100']));
  
  // External IP (Rejection)
  const rBad = new Request('http://localhost/api/init', { headers: { 'cf-connecting-ip': '133.200.1.20' } });
  const resBad = await middleware({ request: rBad, env: { DB: db }, next: async () => new Response('NO') });
  assert(resBad.status === 403, '外部IPからのAPIアクセスを403で完全ブロック');
  const badJson = await resBad.json();
  assert(badJson.error === 'FORBIDDEN_IP', 'エラーコード FORBIDDEN_IP を返却');

  // HTML page access from external IP
  const rBadHtml = new Request('http://localhost/', { headers: { 'cf-connecting-ip': '133.200.1.20' } });
  const resBadHtml = await middleware({ request: rBadHtml, env: { DB: db }, next: async () => new Response('NO') });
  assert(resBadHtml.status === 403, '外部IPからのWeb画面アクセスを403でブロック');
  const htmlContent = await resBadHtml.text();
  assert(htmlContent.includes('施設のWi-Fi接続が必要です'), '親切な施設Wi-Fi接続ガイダンスHTMLを返却');

  // Facility Wi-Fi IP (Pass)
  const rGood = new Request('http://localhost/api/init', { headers: { 'cf-connecting-ip': '210.140.50.100' } });
  let okGood = false;
  await middleware({ request: rGood, env: { DB: db }, next: async () => { okGood = true; return new Response('OK'); } });
  assert(okGood === true, '施設Wi-FiのIPからのアクセスを正常許可');

  // Test 3: API /api/init
  console.log('\n3. API /api/init マスタ一括取得テスト:');
  const initRes = await initGet({ env: { DB: db }, request: new Request('http://localhost/api/init') });
  assert(initRes.status === 200, '/api/init が 200 OK を返却');
  const initData = (await initRes.json()).data;
  assert(initData.vendors.length === 3, '業者マスタ 3件取得');
  assert(initData.products.length === 3, '商品マスタ 3件取得');
  assert(initData.settings.nutritionists.includes('野元 史彦'), '管理栄養士設定 取得');

  // Test 4: API /api/orders POST
  console.log('\n4. API /api/orders POST 発注トランザクション登録テスト:');
  const payload = {
    unit: '2W',
    staffName: '佐藤 健太',
    orderDate: '2026/08/18',
    nutritionist: '野元 史彦',
    memo: '緊急トロミ補充',
    items: [
      { id: 101, name: 'ソフティアS', vendorId: 1, unit: '個', facilityQty: 2, personalQty: 1, personalMemo: '山田様分' },
      { id: 201, name: 'だしするが', vendorId: 1, unit: '個', facilityQty: 1, personalQty: 0, personalMemo: '' }
    ]
  };
  const postReq = new Request('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '210.140.50.100' },
    body: JSON.stringify(payload)
  });
  const postRes = await ordersPost({ env: { DB: db }, request: postReq });
  assert(postRes.status === 201, '/api/orders POST が 201 Created を返却');
  const postJson = await postRes.json();
  assert(postJson.success === true, 'D1保存成功フラグ true');
  assert(db.orders.size === 1, 'orders テーブルにヘッダー1件格納');
  assert(db.order_items.size === 3, 'order_items テーブルに3明細（施設2+個人1）格納');

  // Test 5: API /api/orders GET
  console.log('\n5. API /api/orders GET 発注一覧・明細取得テスト:');
  const getReq = new Request('http://localhost/api/orders?unit=2W');
  const getRes = await ordersGet({ env: { DB: db }, request: getReq });
  const getJson = await getRes.json();
  assert(getJson.success === true, '/api/orders GET 成功');
  assert(getJson.orders.length === 1, '2Wユニットの発注 1件取得');
  assert(getJson.orders[0].items.length === 3, '発注内に3件の明細取得');

  // Test 6: API /api/settings POST
  console.log('\n6. API /api/settings POST 施設IP・設定更新テスト:');
  const setReq = new Request('http://localhost/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update_allowed_ips', allowedIps: ['210.140.50.100', '192.168.1.1'] })
  });
  const setRes = await settingsPost({ env: { DB: db }, request: setReq });
  assert(setRes.status === 200, '/api/settings POST が 200 OK を返却');
  const ips = JSON.parse(db.settings.get('allowed_ips'));
  assert(ips.length === 2, '施設許可IPがD1内で2件に正常更新');

  console.log('\n================================================================');
  console.log(`検証結果: ✅ PASS: ${passed} / ❌ FAIL: ${failed}`);
  console.log('================================================================\n');
  if (failed === 0) {
    console.log('🎉 厳格検証テストに全件合格しました！');
  } else {
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});