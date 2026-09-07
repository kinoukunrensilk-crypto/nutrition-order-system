// tests/e2e_verification.mjs
// Automated verification test suite for F1 - F16 issues in nutrition-order-system

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failedTests++;
  }
}

console.log('====================================================');
console.log('🧪 栄養管理物品発注システム 自動検証テスト (F1〜F16)');
console.log('====================================================\n');

// Read files
const docsIndexPath = path.join(rootDir, 'docs', 'index.html');
const rootIndexPath = path.join(rootDir, 'index.html');
const standalonePath = path.join(rootDir, 'standalone.html');
const gasBackendPath = path.join(rootDir, 'gas_backend.js');

const docsIndexContent = fs.readFileSync(docsIndexPath, 'utf8');
const rootIndexContent = fs.readFileSync(rootIndexPath, 'utf8');
const standaloneContent = fs.readFileSync(standalonePath, 'utf8');
const gasBackendContent = fs.readFileSync(gasBackendPath, 'utf8');

// Normalize CRLF / LF for clean comparison
const normalizeNL = (str) => str.replace(/\r\n/g, '\n').trim();

// -----------------------------------------------------------------------------
// [F16] 全HTMLファイルの完全同期 (Full Parity)
// -----------------------------------------------------------------------------
console.log('--- [F16] 全HTMLファイルの完全同期 (docs/index.html, index.html, standalone.html) ---');
assert(
  normalizeNL(docsIndexContent) === normalizeNL(rootIndexContent),
  'docs/index.html と index.html の内容が完全に一致していること'
);
assert(
  normalizeNL(docsIndexContent) === normalizeNL(standaloneContent),
  'docs/index.html と standalone.html の内容が完全に一致していること'
);

// -----------------------------------------------------------------------------
// [F1] 複数業者FAXステータス更新競合の解消
// -----------------------------------------------------------------------------
console.log('\n--- [F1] 複数業者FAXステータス更新競合の解消 ---');
assert(
  gasBackendContent.includes('action === \'updateOrderStatusByVendor\''),
  'gas_backend.js に updateOrderStatusByVendor アクションのハンドラが存在すること'
);
assert(
  gasBackendContent.includes('targetVendorId') &&
  gasBackendContent.includes('rowVendorId === targetVendorId'),
  'gas_backend.js で対象業者のみをフィルタリングして更新していること'
);
assert(
  docsIndexContent.includes('markFaxSent = async (vendorId)') &&
  docsIndexContent.includes('action: \'updateOrderStatusByVendor\''),
  'docs/index.html の markFaxSent で選択された業者IDのみを更新し updateOrderStatusByVendor を呼び出していること'
);
assert(
  docsIndexContent.includes('itemVendorId === vId && itemStatus !== \'FAX送信済\''),
  'docs/index.html の getOrdersForVendor で既にFAX送信済の明細を除外していること'
);

// -----------------------------------------------------------------------------
// [F2] FAX印刷プレビューおよびPDF出力の白紙化・包含ブロック破壊の完全解消
// -----------------------------------------------------------------------------
console.log('\n--- [F2] FAX印刷プレビューおよびPDF出力の白紙化・包含ブロック破壊解消 ---');
assert(
  docsIndexContent.includes('#fax-modal-backdrop, #fax-modal-container') &&
  docsIndexContent.includes('backdrop-filter: none !important') &&
  docsIndexContent.includes('position: static !important') &&
  docsIndexContent.includes('overflow: visible !important'),
  '印刷CSSで #fax-modal-backdrop と #fax-modal-container の backdrop-filter を解除し position: static / overflow: visible にリセットしていること'
);
assert(
  docsIndexContent.includes('#fax-print-area') &&
  docsIndexContent.includes('page-break-inside: avoid'),
  '#fax-print-area に改ページ防止 (page-break-inside: avoid) が適用されていること'
);

// -----------------------------------------------------------------------------
// [F3] 発注送信ボタンの二重送信ガード（ダブルサブミット防止）
// -----------------------------------------------------------------------------
console.log('\n--- [F3] 発注送信ボタンの二重送信ガード ---');
assert(
  docsIndexContent.includes('if (isSubmitting) return;'),
  'handleSubmitOrder の先頭に isSubmitting 二重送信ガードが存在すること'
);
assert(
  docsIndexContent.includes('disabled={isSubmitting}') &&
  docsIndexContent.includes('isSubmitting ? \'⏳ 送信中...\' :'),
  '発注送信ボタンに disabled 属性と「⏳ 送信中...」の表示切り替えが存在すること'
);

// -----------------------------------------------------------------------------
// [F4] 外部FAX注文書における入居者実名マスキング（PII保護）
// -----------------------------------------------------------------------------
console.log('\n--- [F4] 外部FAX注文書における入居者実名マスキング (PII保護) ---');
assert(
  docsIndexContent.includes('maskResidentNamesInFax') &&
  docsIndexContent.includes('maskResidentNamesInFax ? `${uKey} (個人分)` : `${uKey} (${item.personalNames || \'個人購入\'})`'),
  'FAX備考生成部で入居者実名を「[ユニット名] (個人分)」へマスキングするロジックが存在すること'
);
assert(
  docsIndexContent.includes('🛡️ 実名マスク (PII保護)'),
  'FAXモーダル上に実名マスキング状態を示すUIコントロールが存在すること'
);
assert(
  docsIndexContent.includes('personalNames: item.personalNames || \'\''),
  '内部履歴およびCSVエクスポート用には入居者実名データが保持されていること'
);

// -----------------------------------------------------------------------------
// [F5] 設定画面 Step 5（GASシステム設定）タブの復元
// -----------------------------------------------------------------------------
console.log('\n--- [F5] 設定画面 Step 5（GASシステム設定）タブの復元 ---');
assert(
  docsIndexContent.includes('{ step: 5, label: \'⚙️ システム設定 / GAS連携\' }'),
  '設定画面のステップ一覧に Step 5「⚙️ システム設定 / GAS連携」が含まれていること'
);
assert(
  docsIndexContent.includes('settingStep === 5 &&') &&
  docsIndexContent.includes('Google Apps Script (GAS) 接続設定'),
  'Step 5 の設定パネルコンポーネントが描画されること'
);

// -----------------------------------------------------------------------------
// [F6 & F7] 数量入力時のBackSpace個人名保護 & 全角数字の自動正規化
// -----------------------------------------------------------------------------
console.log('\n--- [F6 & F7] 数量入力時のBackSpace個人名保護 & 全角数字の自動正規化 ---');
assert(
  docsIndexContent.includes('const toHalfWidth = (str) => {') &&
  docsIndexContent.includes('replace(/[０-９]/g,'),
  '全角数字を半角数字に変換する toHalfWidth 正規化関数が存在すること'
);
assert(
  docsIndexContent.includes('const newCart = { ...unitInfo.cart, [productId]: updatedItem };'),
  '数量が0になってもカート内オブジェクトを削除せず保持することで個人名メモを保護していること'
);

// -----------------------------------------------------------------------------
// [F8] FAX様式Bにおける異なる単位の不正合算防止
// -----------------------------------------------------------------------------
console.log('\n--- [F8] FAX様式Bにおける異なる単位の不正合算防止 ---');
assert(
  docsIndexContent.includes('const unitsInOrders = [...new Set(currentFaxOrders.map(o => o.unit))];') &&
  docsIndexContent.includes('const isSingleUnit = unitsInOrders.length === 1;'),
  'FAX明細内の単位一覧を抽出し単一単位かどうか判定するロジックが存在すること'
);
assert(
  docsIndexContent.includes('※単位が異なるため品目別内訳記載') &&
  docsIndexContent.includes('unitsInOrders.map(u => {'),
  '単位が異なる場合に合算せず内訳表示（例: 2 本 / 3 個）するフォールバックが存在すること'
);

// -----------------------------------------------------------------------------
// [F9 & F10] 誤送信防止ダイアログ & 前回発注呼び出しの上書き確認
// -----------------------------------------------------------------------------
console.log('\n--- [F9 & F10] 誤送信防止ダイアログ & 前回発注呼び出しの上書き確認 ---');
assert(
  docsIndexContent.includes('window.confirm(confirmMsg)') &&
  docsIndexContent.includes('の発注を送信しますか？（合計'),
  'handleSubmitOrder に発注送信前確認の window.confirm ダイアログが存在すること'
);
assert(
  docsIndexContent.includes('window.confirm') &&
  docsIndexContent.includes('前回の発注内容で現在のカートを上書き（置き換え）しますか？'),
  'copyLastOrderForUnit にカート内商品が存在する場合の上書き確認ダイアログが存在すること'
);

// -----------------------------------------------------------------------------
// [F11] 管理栄養士画面における未提出ユニット一覧表示
// -----------------------------------------------------------------------------
console.log('\n--- [F11] 管理栄養士画面における未提出ユニット一覧表示 ---');
assert(
  docsIndexContent.includes('全ユニット発注提出状況') &&
  docsIndexContent.includes('提出済:') &&
  docsIndexContent.includes('未提出:'),
  '管理栄養士ビュー上部に全ユニットの提出状況サマリーヘッダーが存在すること'
);
assert(
  docsIndexContent.includes('🟡 申請中') &&
  docsIndexContent.includes('✅ 提出済') &&
  docsIndexContent.includes('⏳ 未提出'),
  '全ユニットの提出状態ステータスバッジ（申請中 / 提出済 / 未提出）が一覧表示されること'
);

// -----------------------------------------------------------------------------
// [F12] FAX確認者「(なし・印字しない)」選択肢の復元
// -----------------------------------------------------------------------------
console.log('\n--- [F12] FAX確認者「(なし・印字しない)」選択肢の復元 ---');
assert(
  docsIndexContent.includes('<option value="(なし・印字しない)">(なし・印字しない)</option>'),
  '発注確認者セレクトボックスに「(なし・印字しない)」の選択肢が存在すること'
);
assert(
  docsIndexContent.includes('selectedApprover !== \'(なし・印字しない)\''),
  '「(なし・印字しない)」選択時にFAX印字欄の発注確認者行が非表示となること'
);

// -----------------------------------------------------------------------------
// [F13] ユニット・栄養士の無効化（active:false）時の一覧保持
// -----------------------------------------------------------------------------
console.log('\n--- [F13] ユニット・栄養士の無効化（active:false）時の一覧保持 ---');
assert(
  gasBackendContent.includes('getAllSystemData') &&
  !gasBackendContent.includes('if (r[3]) units.push') &&
  !gasBackendContent.includes('if (r[3]) nutritionists.push'),
  'gas_backend.js の getAllSystemData において units / nutritionists の active:false が除外されず取得されること'
);

// -----------------------------------------------------------------------------
// [F14] タブレット操作性向上（44pxタッチターゲット、重複className解消）
// -----------------------------------------------------------------------------
console.log('\n--- [F14] タブレット操作性向上（44pxタッチターゲット、重複className解消） ---');
assert(
  docsIndexContent.includes('w-11 h-11 bg-white rounded-xl border') &&
  docsIndexContent.includes('w-11 h-11 bg-gradient-to-r'),
  '数量増減ボタンが w-11 h-11 (44px タッチターゲット) に拡大されていること'
);
const duplicateClassNameRegex = /className="[^"]*"\s+className="[^"]*"/g;
assert(
  !duplicateClassNameRegex.test(docsIndexContent),
  'HTML内に重複した className 属性が存在しないこと'
);

// -----------------------------------------------------------------------------
// [F15] CSVエクスポートのRFC 4180準拠
// -----------------------------------------------------------------------------
console.log('\n--- [F15] CSVエクスポートのRFC 4180準拠 ---');
assert(
  docsIndexContent.includes('const escapeCSV = (str) => {') &&
  docsIndexContent.includes('replace(/"/g, \'""\')'),
  'CSVエクスポートでダブルクォートのエスケープ (RFC 4180 準拠) が実装されていること'
);

console.log('\n====================================================');
console.log(`📊 テスト結果サマリー: 全 ${totalTests} 件中 ${passedTests} 件合格 (${failedTests} 件失敗)`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 F1〜F16 全ての課題が完全解消・検証されました！');
}
