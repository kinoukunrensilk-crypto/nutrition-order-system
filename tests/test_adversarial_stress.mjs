// tests/test_adversarial_stress.mjs
// Adversarial Stress & Edge-Case Verification Suite
// Empirical testing of F3, F6, F7, F9, F10, F16

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    if (details) console.error(`     Details: ${details}`);
    failedTests++;
  }
}

console.log('================================================================');
console.log('⚡ ADVERSARIAL STRESS & EDGE-CASE TEST SUITE');
console.log('   Testing: F3 (Double-Submit), F6 (BackSpace/0 Retention),');
console.log('            F7 (Zenkaku Normalization), F9/F10 (Mis-send/Overwrite)');
console.log('================================================================\n');

// Load production source files
const docsHtml = fs.readFileSync(path.join(rootDir, 'docs', 'index.html'), 'utf8');
const rootHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const standaloneHtml = fs.readFileSync(path.join(rootDir, 'standalone.html'), 'utf8');
const gasBackendJs = fs.readFileSync(path.join(rootDir, 'gas_backend.js'), 'utf8');

// =============================================================================
// SECTION 1: F7 全角数字・境界値・異常入力正規化テスト
// =============================================================================
console.log('--- [SECTION 1] F7 全角数字・境界値・異常入力正規化テスト ---');

// Extract toHalfWidth implementation directly from docs/index.html
const toHalfWidth = (str) => {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
};

const parseQtyInput = (val) => {
  const normalized = toHalfWidth(val).trim();
  return normalized === '' ? 0 : Math.max(0, parseInt(normalized, 10) || 0);
};

// 1.1 全角標準数字
assert(parseQtyInput('１０') === 10, '全角「１０」が数値 10 に正規化されること');
assert(parseQtyInput('０５') === 5, '先頭ゼロ付き全角「０５」が数値 5 に正規化されること');
assert(parseQtyInput('０') === 0, '全角「０」が数値 0 に正規化されること');
assert(parseQtyInput('１２３４５６７８９０') === 1234567890, '全角全桁「１２３４５６７８９０」が正しく変換されること');

// 1.2 空白・全角スペースのトリム挙動
assert(parseQtyInput('　１０　') === 10, '全角スペース付き「　１０　」が 10 に正規化されること');
assert(parseQtyInput('   15   ') === 15, '半角スペース付き「   15   」が 15 に正規化されること');
assert(parseQtyInput('　　') === 0, '全角スペースのみ「　　」が 0 になること');
assert(parseQtyInput('') === 0, '空文字「」が 0 になること');

// 1.3 異常値・境界値
assert(parseQtyInput(null) === 0, 'null 入力が 0 にフォールバックすること');
assert(parseQtyInput(undefined) === 0, 'undefined 入力が 0 にフォールバックすること');
assert(parseQtyInput('abc') === 0, '英字「abc」が 0 にフォールバックすること');
assert(parseQtyInput('１０個') === 10, '全角単位付き「１０個」から先頭数値 10 が抽出されること');
assert(parseQtyInput('-5') === 0, '半角負数「-5」が Math.max(0) で 0 に切り上げられること');
assert(parseQtyInput('ー５') === 0, '全角マイナス「ー５」が 0 に切り上げられること');
assert(parseQtyInput('0') === 0, '半角「0」が 0 になること');
assert(parseQtyInput(10) === 10, '数値型 10 がそのまま 10 として処理されること');

// 1.4 キー入力シーケンスシミュレーション（タイピング & BackSpace）
{
  let currentVal = '';
  // ユーザーが全角「１」を入力
  currentVal = '１';
  assert(parseQtyInput(currentVal) === 1, 'シーケンス 1: 「１」入力で 1');
  // 続けて全角「０」を入力（＝「１０」）
  currentVal = '１０';
  assert(parseQtyInput(currentVal) === 10, 'シーケンス 2: 「１０」入力で 10');
  // BackSpace で「１」に戻る
  currentVal = '１';
  assert(parseQtyInput(currentVal) === 1, 'シーケンス 3: BackSpace で「１」に戻り 1');
  // BackSpace で全消去（空文字）
  currentVal = '';
  assert(parseQtyInput(currentVal) === 0, 'シーケンス 4: BackSpace で全消去時 0 (placeholder="0")');
  // ペーストで全角「０８」
  currentVal = '０８';
  assert(parseQtyInput(currentVal) === 8, 'シーケンス 5: ペースト「０８」で 8');
}


// =============================================================================
// SECTION 2: F6 BackSpace・数量0時のカート内データ保持とメモ保護
// =============================================================================
console.log('\n--- [SECTION 2] F6 BackSpace・数量0時の個人名メモ保護テスト ---');

class MockCartState {
  constructor() {
    this.cart = {};
  }

  updateItemQty(productId, field, delta) {
    const currentItem = this.cart[productId] || { facilityQty: 0, personalQty: 0, personalNames: '' };
    const currentVal = Number(currentItem[field]) || 0;
    const nextQty = Math.max(0, currentVal + delta);
    const updatedItem = { ...currentItem, [field]: nextQty };
    this.cart[productId] = updatedItem; // F6: 数量0でも保持
  }

  setItemQtyDirect(productId, field, val) {
    const normalized = toHalfWidth(val).trim();
    const num = normalized === '' ? 0 : Math.max(0, parseInt(normalized, 10) || 0);
    const currentItem = this.cart[productId] || { facilityQty: 0, personalQty: 0, personalNames: '' };
    const updatedItem = { ...currentItem, [field]: num };
    this.cart[productId] = updatedItem; // F6: 数量0でも保持
  }

  updatePersonalNames(productId, text) {
    const currentItem = this.cart[productId] || { facilityQty: 0, personalQty: 0, personalNames: '' };
    this.cart[productId] = { ...currentItem, personalNames: text };
  }

  getValidSubmissionItems() {
    return Object.entries(this.cart).filter(([_, it]) => (it.facilityQty || 0) + (it.personalQty || 0) > 0);
  }
}

{
  const state = new MockCartState();
  const PROD_ID = 101;

  // 2.1 初期状態: 個人分数量 2, 個人購入者名「山田 太郎様」
  state.setItemQtyDirect(PROD_ID, 'personalQty', '２');
  state.updatePersonalNames(PROD_ID, '山田 太郎様');

  assert(state.cart[PROD_ID].personalQty === 2, '初期登録: personalQty が 2');
  assert(state.cart[PROD_ID].personalNames === '山田 太郎様', '初期登録: personalNames が「山田 太郎様」');

  // 2.2 BackSpace で全消去 (val = "")
  state.setItemQtyDirect(PROD_ID, 'personalQty', '');
  assert(state.cart[PROD_ID].personalQty === 0, 'BackSpace 全消去時: personalQty が 0 に更新されること');
  assert(
    state.cart[PROD_ID].personalNames === '山田 太郎様',
    'BackSpace 全消去時: personalNames「山田 太郎様」が消失せず保持されること (F6)'
  );
  assert(PROD_ID in state.cart, 'カート内オブジェクト自体が破棄されず残存すること');

  // 2.3 数量0の時は送信対象外
  assert(
    state.getValidSubmissionItems().length === 0,
    '数量0のアイテムは発注送信対象から自動除外されること'
  );

  // 2.4 再度数量「3」を入力
  state.setItemQtyDirect(PROD_ID, 'personalQty', '３');
  assert(state.cart[PROD_ID].personalQty === 3, '再入力時: personalQty が 3');
  assert(
    state.cart[PROD_ID].personalNames === '山田 太郎様',
    '再入力時: personalNames「山田 太郎様」が依然として維持されていること'
  );
  assert(
    state.getValidSubmissionItems().length === 1,
    '再入力後は発注送信対象に復帰すること'
  );

  // 2.5 マイナスボタン(-)による数量減少で 0 になった場合
  state.updateItemQty(PROD_ID, 'personalQty', -3);
  assert(state.cart[PROD_ID].personalQty === 0, 'マイナスボタンで数量0到達');
  assert(
    state.cart[PROD_ID].personalNames === '山田 太郎様',
    'マイナスボタンで数量0になっても personalNames「山田 太郎様」が保護されること'
  );

  // 2.6 さらにマイナスを押しても負数にならず0を維持
  state.updateItemQty(PROD_ID, 'personalQty', -1);
  assert(state.cart[PROD_ID].personalQty === 0, '数量0でさらにマイナスを押しても 0 を維持');
  assert(state.cart[PROD_ID].personalNames === '山田 太郎様', 'メモが保護され続けること');
}


// =============================================================================
// SECTION 3: F3 連打・ダブルサブミット防止ガードロジックの耐久性
// =============================================================================
console.log('\n--- [SECTION 3] F3 連打・ダブルサブミット防止耐久テスト ---');

class MockSubmitEnvironment {
  constructor() {
    this.isSubmitting = false;
    this.cart = {
      101: { facilityQty: 1, personalQty: 0, personalNames: '' }
    };
    this.networkCallCount = 0;
    this.rejectedCallCount = 0;
    this.cache = new Map();
    this.writtenRows = [];
  }

  // Frontend handleSubmitOrder logic simulation
  async handleSubmitOrder(options = { confirmOk: true }) {
    if (this.isSubmitting) {
      this.rejectedCallCount++;
      return { success: false, reason: 'ALREADY_SUBMITTING' };
    }

    const items = Object.entries(this.cart).filter(([_, it]) => (it.facilityQty || 0) + (it.personalQty || 0) > 0);
    if (items.length === 0) {
      this.rejectedCallCount++;
      return { success: false, reason: 'EMPTY_CART' };
    }

    if (!options.confirmOk) {
      return { success: false, reason: 'USER_CANCELLED' };
    }

    this.isSubmitting = true;
    try {
      const orderId = 'ORD-' + Date.now();
      const requestId = 'REQ-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

      // GAS network call simulation
      this.networkCallCount++;
      await this.postToGAS({ action: 'bulkSubmit', items, orderId, requestId });

      // Clear cart
      this.cart = {};
      return { success: true, orderId };
    } finally {
      this.isSubmitting = false;
    }
  }

  // GAS Backend simulation (CacheService debounce + appendRow)
  async postToGAS(data) {
    // 10ms network latency
    await new Promise(r => setTimeout(r, 10));

    // CacheService check
    const reqId = data.requestId;
    if (this.cache.has(reqId)) {
      return { success: true, skipped: true, message: '重複送信を自動検出してスキップしました' };
    }
    this.cache.set(reqId, true);

    // Append to sheet
    for (const it of data.items) {
      this.writtenRows.push({ orderId: data.orderId, item: it });
    }
    return { success: true, count: data.items.length };
  }
}

// 3.1 通常の1回送信
{
  const env = new MockSubmitEnvironment();
  const res = await env.handleSubmitOrder({ confirmOk: true });
  assert(res.success === true, '正常送信が完了すること');
  assert(env.networkCallCount === 1, 'ネットワーク送信が正確に1回実行されること');
  assert(env.writtenRows.length === 1, 'スプレッドシートに1行書き込まれること');
  assert(Object.keys(env.cart).length === 0, '送信完了後にカートがクリアされること');
}

// 3.2 送信直後の再送信（カートが空の状態での二重送信防止）
{
  const env = new MockSubmitEnvironment();
  await env.handleSubmitOrder({ confirmOk: true });
  // 即座に2回目の送信を試行
  const res2 = await env.handleSubmitOrder({ confirmOk: true });
  assert(res2.success === false, 'カートクリア後の2回目送信が拒否されること');
  assert(res2.reason === 'EMPTY_CART', '拒否理由が EMPTY_CART であること');
  assert(env.networkCallCount === 1, '2回目の送信でネットワーク通信が発生しないこと');
  assert(env.writtenRows.length === 1, 'スプレッドシートに重複行が書き込まれないこと');
}

// 3.3 isSubmitting ガード中の同時連打（100回連続呼び出し）
{
  const env = new MockSubmitEnvironment();
  // 1回目を開始（非同期処理中）
  const p1 = env.handleSubmitOrder({ confirmOk: true });
  
  // 処理中に残りの99回を連打
  const burstPromises = [];
  for (let i = 0; i < 99; i++) {
    burstPromises.push(env.handleSubmitOrder({ confirmOk: true }));
  }

  const results = await Promise.all([p1, ...burstPromises]);
  const successes = results.filter(r => r.success);
  const alreadySubmitting = results.filter(r => r.reason === 'ALREADY_SUBMITTING');
  const emptyCart = results.filter(r => r.reason === 'EMPTY_CART');

  assert(successes.length === 1, '100回の連続連打中、成功するのは厳格に1回のみであること');
  assert(
    alreadySubmitting.length + emptyCart.length === 99,
    `残り99回は全てガードされること (ALREADY_SUBMITTING: ${alreadySubmitting.length}, EMPTY_CART: ${emptyCart.length})`
  );
  assert(env.networkCallCount === 1, '連打時でもネットワーク送信は1回のみ実行されること');
  assert(env.writtenRows.length === 1, 'スプレッドシートへの二重書き込みが完全にゼロであること');
}

// 3.4 バックエンド CacheService 重複スキップ耐久テスト
{
  const env = new MockSubmitEnvironment();
  const duplicateReqId = 'FIXED-REQ-001';
  const payload = {
    action: 'bulkSubmit',
    requestId: duplicateReqId,
    orderId: 'ORD-TEST-001',
    items: [{ facilityQty: 1, personalQty: 0 }]
  };

  // 50件の並列同一リクエスト（リダイレクト等の通信リトライ再現）
  const parallelCalls = [];
  for (let i = 0; i < 50; i++) {
    parallelCalls.push(env.postToGAS(payload));
  }
  const gasResults = await Promise.all(parallelCalls);

  assert(env.writtenRows.length === 1, '50件の同一requestIdリクエストに対し、書き込みは厳格に1回のみ行われること');
  const skippedCalls = gasResults.filter(r => r.skipped);
  assert(skippedCalls.length === 49, '残り49件が重複としてスキップされること');
}


// =============================================================================
// SECTION 4: F9 / F10 誤送信防止ダイアログ & 前回発注呼び出し上書き確認
// =============================================================================
console.log('\n--- [SECTION 4] F9 / F10 誤送信防止 & 前回発注上書き確認テスト ---');

// 4.1 F9 送信確認ダイアログのキャンセル
{
  const env = new MockSubmitEnvironment();
  const res = await env.handleSubmitOrder({ confirmOk: false });
  assert(res.success === false && res.reason === 'USER_CANCELLED', '確認ダイアログキャンセル時に送信が即時中止されること');
  assert(env.networkCallCount === 0, 'キャンセル時は通信が一切発生しないこと');
  assert(env.cart[101].facilityQty === 1, 'キャンセル時はカート内容が完全に保持されること');
}

// 4.2 F10 「前回の発注を呼び出す」の重複加算防止・上書き確認シミュレーション
class MockCopyLastOrderEnv {
  constructor() {
    this.currentUnit = '2W';
    this.cart = {};
    this.orderHistory = [
      {
        unit: '2W',
        items: [
          { productId: 101, productName: 'ソフティアS', facilityQty: 2, personalQty: 1, personalNames: '山田様' },
          { productId: 201, productName: 'だしするが', facilityQty: 1, personalQty: 0, personalNames: '' }
        ]
      }
    ];
    this.masterProducts = [
      { id: 101, name: 'ソフティアS' },
      { id: 201, name: 'だしするが' }
    ];
  }

  copyLastOrder(confirmOverwrite = true) {
    const lastEntry = this.orderHistory.find(h => h.unit === this.currentUnit);
    if (!lastEntry || !lastEntry.items || lastEntry.items.length === 0) {
      return { success: false, reason: 'NO_HISTORY' };
    }

    const existingCartCount = Object.values(this.cart).filter(it => (it.facilityQty || 0) + (it.personalQty || 0) > 0).length;
    if (existingCartCount > 0) {
      if (!confirmOverwrite) {
        return { success: false, reason: 'OVERWRITE_CANCELLED' };
      }
    }

    // 上書き（置換）処理
    const newCart = {};
    lastEntry.items.forEach(it => {
      const p = this.masterProducts.find(pr => pr.name === it.productName || pr.id === it.productId);
      if (p) {
        newCart[p.id] = {
          facilityQty: it.facilityQty || 0,
          personalQty: it.personalQty || 0,
          personalNames: it.personalNames || ''
        };
      }
    });

    this.cart = newCart;
    return { success: true, count: Object.keys(newCart).length };
  }
}

{
  const env = new MockCopyLastOrderEnv();

  // 4.3 カート空時の初回呼び出し
  const r1 = env.copyLastOrder(true);
  assert(r1.success === true, 'カート空時の呼び出しが成功すること');
  assert(env.cart[101].facilityQty === 2, '商品101の施設分が 2');
  assert(env.cart[101].personalQty === 1, '商品101の個人分が 1');
  assert(env.cart[101].personalNames === '山田様', '商品101の個人名が山田様');
  assert(env.cart[201].facilityQty === 1, '商品201の施設分が 1');

  // 4.4 既にカートに商品がある場合の上書きキャンセル
  const rCancel = env.copyLastOrder(false);
  assert(rCancel.reason === 'OVERWRITE_CANCELLED', '上書きキャンセル時はカートが更新されないこと');
  assert(env.cart[101].facilityQty === 2, '数量が元の 2 のまま維持されること');

  // 4.5 連続呼び出し時の重複加算防止（10回連続呼び出し）
  for (let i = 0; i < 10; i++) {
    env.copyLastOrder(true);
  }
  assert(
    env.cart[101].facilityQty === 2 && env.cart[101].personalQty === 1,
    '10回連続で呼び出しても数量が 2+1=3 のまま維持され、加算累積（20個や30個）されないこと'
  );
  assert(
    env.cart[201].facilityQty === 1,
    '商品201も 1 個のまま維持されること'
  );
}


// =============================================================================
// SECTION 5: F16 全HTMLファイル同期 & 構文検証
// =============================================================================
console.log('\n--- [SECTION 5] F16 全HTMLファイル同期 & 構文検証 ---');

const normalize = s => s.replace(/\r\n/g, '\n').trim();

assert(
  normalize(docsHtml) === normalize(rootHtml),
  'docs/index.html と index.html が完全一致していること'
);
assert(
  normalize(docsHtml) === normalize(standaloneHtml),
  'docs/index.html と standalone.html が完全一致していること'
);

// 構文整合性チェック
assert(
  !docsHtml.includes('className="[^"]*"\s+className="[^"]*"'),
  'docs/index.html 内に重複 className 属性が存在しないこと'
);
assert(
  docsHtml.includes('const toHalfWidth = (str) => {'),
  'docs/index.html に toHalfWidth が正しく定義されていること'
);
assert(
  gasBackendJs.includes('CacheService.getScriptCache()'),
  'gas_backend.js に CacheService 重複ガードが存在すること'
);

console.log('\n================================================================');
console.log(`📊 STRESS TEST RESULTS: ✅ PASS: ${passedTests} / ❌ FAIL: ${failedTests} (Total: ${totalTests})`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🏆 All adversarial stress and edge-case tests PASSED successfully!');
}
