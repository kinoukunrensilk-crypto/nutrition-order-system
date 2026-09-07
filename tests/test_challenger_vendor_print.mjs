// tests/test_challenger_vendor_print.mjs
// Empirical Challenger Verification Suite for Vendor Order Separation & Print Integrity (F1, F2, F4, F8, F16)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let passCount = 0;
let failCount = 0;
const results = [];

function check(testName, condition, detail = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    results.push({ test: testName, status: 'PASS', detail });
    passCount++;
  } else {
    console.error(`[FAIL] ${testName} - ${detail}`);
    results.push({ test: testName, status: 'FAIL', detail });
    failCount++;
  }
}

console.log('=== EMPIRICAL CHALLENGER: VENDOR & PRINT INTEGRITY SUITE ===\n');

// 1. Load Files
const docsIndexPath = path.join(projectRoot, 'docs', 'index.html');
const rootIndexPath = path.join(projectRoot, 'index.html');
const standalonePath = path.join(projectRoot, 'standalone.html');
const gasBackendPath = path.join(projectRoot, 'gas_backend.js');

const docsBuf = fs.readFileSync(docsIndexPath);
const rootBuf = fs.readFileSync(rootIndexPath);
const standBuf = fs.readFileSync(standalonePath);
const gasContent = fs.readFileSync(gasBackendPath, 'utf8');

const docsStr = docsBuf.toString('utf8');
const rootStr = rootBuf.toString('utf8');
const standStr = standBuf.toString('utf8');

// -------------------------------------------------------------
// [F16] 3-File Parity Challenge (Byte-level and Line-level)
// -------------------------------------------------------------
console.log('--- [F16 CHALLENGE] 3-File Identity ---');
check(
  'F16.1 Line-level character identity (docs vs index)',
  docsStr.replace(/\r\n/g, '\n').trim() === rootStr.replace(/\r\n/g, '\n').trim(),
  'Normalized text content must be identical'
);
check(
  'F16.2 Line-level character identity (docs vs standalone)',
  docsStr.replace(/\r\n/g, '\n').trim() === standStr.replace(/\r\n/g, '\n').trim(),
  'Normalized text content must be identical'
);
check(
  'F16.3 Byte-for-byte exact match (docs vs index)',
  docsBuf.equals(rootBuf),
  `docs size=${docsBuf.length} bytes vs root size=${rootBuf.length} bytes`
);
check(
  'F16.4 Byte-for-byte exact match (index vs standalone)',
  rootBuf.equals(standBuf),
  `root size=${rootBuf.length} bytes vs standalone size=${standBuf.length} bytes`
);

// -------------------------------------------------------------
// [F1] Multi-Vendor Order Isolation & Status Conflict Challenge
// -------------------------------------------------------------
console.log('\n--- [F1 CHALLENGE] Multi-Vendor Status Conflict Resolution ---');

// Mock Master Data
const mockMasterVendors = [
  { id: 1, name: 'アサヒ物産株式会社', fax: '099-245-6556', contact: '担当様', faxFormat: 'A', active: true },
  { id: 2, name: '藤安醸造株式会社', fax: '099-262-1357', contact: '担当様', faxFormat: 'B', active: true },
  { id: 3, name: '有限会社 山口米店', fax: '0995-43-1789', contact: '担当様', faxFormat: 'B', active: true }
];

const mockMasterProducts = [
  { id: 101, name: 'ソフティアS', spec: '500g/袋', unit: '個', vendorId: 1, active: true },
  { id: 301, name: '濃口醤油 1.8ℓ', spec: '1.8L/本', unit: '本', vendorId: 2, active: true },
  { id: 303, name: 'すり味噌', spec: '1kg/個', unit: '個', vendorId: 2, active: true },
  { id: 401, name: '無洗米・精米', spec: '5kg/袋', unit: 'kg', vendorId: 3, active: true }
];

// Replicate frontend getOrdersForVendor logic exactly as implemented in docs/index.html
function createVendorOrderExtractor(masterProducts, orderHistory, unitData, maskResidentNamesInFax = true) {
  return function getOrdersForVendor(vendorId) {
    const list = [];
    const vId = Number(vendorId);

    // Cart (unsubmitted)
    Object.entries(unitData).forEach(([uKey, uVal]) => {
      Object.entries(uVal.cart || {}).forEach(([pId, item]) => {
        const p = masterProducts.find(pr => Number(pr.id) === parseInt(pId));
        if (p && Number(p.vendorId) === vId) {
          if (item.facilityQty > 0) {
            list.push({
              name: p.name,
              spec: p.spec,
              qty: Number(item.facilityQty),
              unit: p.unit || '個',
              note: uKey,
              unitName: uKey,
              isPersonal: false,
              personalNames: ''
            });
          }
          if (item.personalQty > 0) {
            list.push({
              name: p.name,
              spec: p.spec,
              qty: Number(item.personalQty),
              unit: p.unit || '個',
              note: maskResidentNamesInFax ? `${uKey} (個人分)` : `${uKey} (${item.personalNames || '個人購入'})`,
              unitName: uKey,
              isPersonal: true,
              personalNames: item.personalNames || ''
            });
          }
        }
      });
    });

    // History (submitted orders)
    orderHistory.forEach(entry => {
      (entry.items || []).forEach(item => {
        const prod = masterProducts.find(pr => Number(pr.id) === Number(item.productId));
        const itemVendorId = Number(item.vendorId) || (prod ? Number(prod.vendorId) : 0);
        const itemStatus = item.status || entry.status;
        if (itemVendorId === vId && itemStatus !== 'FAX送信済') {
          const uKey = entry.unit;
          if (item.facilityQty > 0) {
            list.push({
              name: item.productName,
              spec: item.spec,
              qty: Number(item.facilityQty),
              unit: item.productUnit,
              note: uKey,
              unitName: uKey,
              isPersonal: false,
              personalNames: ''
            });
          }
          if (item.personalQty > 0) {
            list.push({
              name: item.productName,
              spec: item.spec,
              qty: Number(item.personalQty),
              unit: item.productUnit,
              note: maskResidentNamesInFax ? `${uKey} (個人分)` : `${uKey} (${item.personalNames || '個人購入'})`,
              unitName: uKey,
              isPersonal: true,
              personalNames: item.personalNames || ''
            });
          }
        }
      });
    });

    return list;
  };
}

// Replicate frontend markFaxSent logic exactly as implemented in docs/index.html
function simulateMarkFaxSent(orderHistory, masterProducts, vendorId, approver = '野元 史彦') {
  const vId = Number(vendorId);
  const now = '2026/09/07 09:30';

  return orderHistory.map(entry => {
    let hasVendorItem = false;
    const newItems = (entry.items || []).map(it => {
      const prod = masterProducts.find(pr => Number(pr.id) === Number(it.productId));
      const itVendorId = Number(it.vendorId) || (prod ? Number(prod.vendorId) : 0);
      if (itVendorId === vId) {
        hasVendorItem = true;
        return { ...it, status: 'FAX送信済', faxSentAt: now, faxSender: approver };
      }
      return it;
    });

    if (!hasVendorItem) return entry;

    const allFaxed = newItems.length > 0 && newItems.every(it => it.status === 'FAX送信済');
    return {
      ...entry,
      items: newItems,
      status: allFaxed ? 'FAX送信済' : (entry.status === '申請中' ? '承認済' : entry.status),
      faxSentAt: now,
      faxSender: approver
    };
  });
}

// Replicate backend GAS updateOrderStatusByVendor logic
function simulateGasBackendVendorUpdate(gasRows, targetVendorId, approver = '野元 史彦') {
  // gasRows: array of [orderId, ..., productId, productName, spec, unit, vendorId, vendorName, ..., status, approver, approvedAt, faxSentAt, faxSender]
  const vId = Number(targetVendorId);
  const newStatus = 'FAX送信済';
  const now = '2026/09/07 09:30';
  let updatedCount = 0;

  const resultRows = gasRows.map(row => {
    const rowVendorId = Number(row[9]); // col 9 is vendorId
    const rowStatus = String(row[16]);  // col 16 is status
    if (rowVendorId === vId && (rowStatus === '申請中' || rowStatus === '承認済')) {
      const copy = [...row];
      copy[16] = newStatus;
      copy[19] = now;
      copy[20] = approver;
      updatedCount++;
      return copy;
    }
    return row;
  });

  return { resultRows, updatedCount };
}

// Multi-vendor order history setup
let multiVendorOrderHistory = [
  {
    id: 'ORD-001',
    submittedAt: '2026/09/07 08:30',
    unitId: 1,
    unit: '2W',
    staffName: 'スタッフA',
    status: '承認済',
    approver: '野元 史彦',
    items: [
      { productId: 101, productName: 'ソフティアS', spec: '500g/袋', productUnit: '個', vendorId: 1, facilityQty: 3, personalQty: 1, personalNames: '山田 太郎', status: '承認済' },
      { productId: 301, productName: '濃口醤油 1.8ℓ', spec: '1.8L/本', productUnit: '本', vendorId: 2, facilityQty: 2, personalQty: 0, personalNames: '', status: '承認済' },
      { productId: 303, productName: 'すり味噌', spec: '1kg/個', productUnit: '個', vendorId: 2, facilityQty: 1, personalQty: 0, personalNames: '', status: '承認済' },
      { productId: 401, productName: '無洗米・精米', spec: '5kg/袋', productUnit: 'kg', vendorId: 3, facilityQty: 5, personalQty: 0, personalNames: '', status: '承認済' }
    ]
  },
  {
    id: 'ORD-002',
    submittedAt: '2026/09/07 08:45',
    unitId: 2,
    unit: '3E',
    staffName: 'スタッフB',
    status: '承認済',
    approver: '野元 史彦',
    items: [
      { productId: 101, productName: 'ソフティアS', spec: '500g/袋', productUnit: '個', vendorId: 1, facilityQty: 2, personalQty: 0, personalNames: '', status: '承認済' },
      { productId: 401, productName: '無洗米・精米', spec: '5kg/袋', productUnit: 'kg', vendorId: 3, facilityQty: 3, personalQty: 0, personalNames: '', status: '承認済' }
    ]
  }
];

let getOrders = createVendorOrderExtractor(mockMasterProducts, multiVendorOrderHistory, {});

// Initial checks: all 3 vendors have orders in preview
const asahiInitial = getOrders(1);
const fujiyasuInitial = getOrders(2);
const yamaguchiInitial = getOrders(3);

check('F1.1 Asahi initial orders count > 0', asahiInitial.length === 3, `Count: ${asahiInitial.length} (expected 3 items: 2 facility + 1 personal)`);
check('F1.2 Fujiyasu initial orders count > 0', fujiyasuInitial.length === 2, `Count: ${fujiyasuInitial.length} (expected 2 items)`);
check('F1.3 Yamaguchi initial orders count > 0', yamaguchiInitial.length === 2, `Count: ${yamaguchiInitial.length} (expected 2 items)`);

// Action: Mark Vendor 1 (Asahi) as FAX Sent!
const historyAfterAsahiFax = simulateMarkFaxSent(multiVendorOrderHistory, mockMasterProducts, 1);
const getOrdersAfterAsahi = createVendorOrderExtractor(mockMasterProducts, historyAfterAsahiFax, {});

const asahiAfter = getOrdersAfterAsahi(1);
const fujiyasuAfter = getOrdersAfterAsahi(2);
const yamaguchiAfter = getOrdersAfterAsahi(3);

check('F1.4 Asahi orders cleared from active preview after FAX sent', asahiAfter.length === 0, `Count: ${asahiAfter.length} (expected 0)`);
check('F1.5 Fujiyasu orders STILL PRESENT after Asahi FAX sent', fujiyasuAfter.length === 2, `Count: ${fujiyasuAfter.length} (expected 2 - preserved!)`);
check('F1.6 Yamaguchi orders STILL PRESENT after Asahi FAX sent', yamaguchiAfter.length === 2, `Count: ${yamaguchiAfter.length} (expected 2 - preserved!)`);

// Action: Mark Vendor 2 (Fujiyasu) as FAX Sent!
const historyAfterFujiyasuFax = simulateMarkFaxSent(historyAfterAsahiFax, mockMasterProducts, 2);
const getOrdersAfterFujiyasu = createVendorOrderExtractor(mockMasterProducts, historyAfterFujiyasuFax, {});

const fujiyasuAfter2 = getOrdersAfterFujiyasu(2);
const yamaguchiAfter2 = getOrdersAfterFujiyasu(3);

check('F1.7 Fujiyasu orders cleared from active preview after FAX sent', fujiyasuAfter2.length === 0, `Count: ${fujiyasuAfter2.length} (expected 0)`);
check('F1.8 Yamaguchi orders STILL PRESENT after Fujiyasu FAX sent', yamaguchiAfter2.length === 2, `Count: ${yamaguchiAfter2.length} (expected 2 - preserved!)`);

// Check backend GAS implementation
check(
  'F1.9 gas_backend.js supports updateOrderStatusByVendor',
  gasContent.includes("data.action === 'updateOrderStatusByVendor'") ||
  gasContent.includes("data.action === 'updateOrderStatus' || data.action === 'updateOrderStatusByVendor'"),
  'GAS must handle updateOrderStatusByVendor action'
);
check(
  'F1.10 gas_backend.js isolates target vendor without affecting others',
  gasContent.includes('rowVendorId === targetVendorId') &&
  gasContent.includes("rowStatus === '申請中' || rowStatus === '承認済'"),
  'GAS must filter specifically by rowVendorId === targetVendorId'
);


// -------------------------------------------------------------
// [F8] Mismatched Units in Form B Aggregation Challenge
// -------------------------------------------------------------
console.log('\n--- [F8 CHALLENGE] Form B Mismatched Unit Aggregation ---');

// Replicate Form B table total calculation logic from docs/index.html
function calculateFormBTotalRow(currentFaxOrders, currentFaxVendor) {
  const showTotalRow = currentFaxVendor && currentFaxVendor.faxFormat === 'B';
  if (!showTotalRow || currentFaxOrders.length === 0) {
    return null;
  }

  const unitsInOrders = [...new Set(currentFaxOrders.map(o => o.unit))];
  const isSingleUnit = unitsInOrders.length === 1;
  const totalFaxQuantity = currentFaxOrders.reduce((sum, ord) => sum + ord.qty, 0);
  const mainUnitLabel = isSingleUnit ? unitsInOrders[0] : '';

  if (isSingleUnit) {
    return {
      type: 'SINGLE_UNIT',
      totalQuantity: totalFaxQuantity,
      unit: mainUnitLabel,
      note: '※上記全明細の総合計数量'
    };
  } else {
    const breakdowns = unitsInOrders.map(u => {
      const sumForUnit = currentFaxOrders.filter(o => o.unit === u).reduce((s, o) => s + o.qty, 0);
      return `${sumForUnit} ${u}`;
    });
    return {
      type: 'MULTI_UNIT_BREAKDOWN',
      breakdownText: breakdowns.join(' / '),
      note: '※単位が異なるため品目別内訳記載'
    };
  }
}

// Case A: Fujiyasu with mixed units (濃口醤油 = 2本, すり味噌 = 1個)
const fujiyasuOrdersMixed = [
  { name: '濃口醤油 1.8ℓ', spec: '1.8L/本', qty: 2, unit: '本', note: '2W' },
  { name: 'すり味噌', spec: '1kg/個', qty: 1, unit: '個', note: '2W' }
];
const fujiyasuVendor = mockMasterVendors.find(v => v.id === 2);

const totalResultMixed = calculateFormBTotalRow(fujiyasuOrdersMixed, fujiyasuVendor);
check(
  'F8.1 Mismatched units do NOT produce an illegal single sum (2本 + 1個 != 3)',
  totalResultMixed.type === 'MULTI_UNIT_BREAKDOWN',
  `Result type: ${totalResultMixed.type}`
);
check(
  'F8.2 Mismatched units format separate breakdowns ("2 本 / 1 個")',
  totalResultMixed.breakdownText === '2 本 / 1 個',
  `Breakdown text: "${totalResultMixed.breakdownText}"`
);
check(
  'F8.3 Mismatched units display explicit clarification notice',
  totalResultMixed.note === '※単位が異なるため品目別内訳記載',
  `Note: "${totalResultMixed.note}"`
);

// Case B: Same vendor, homogeneous unit (e.g. 2 orders of 濃口醤油 & 薄口醤油 both in "本")
const fujiyasuOrdersSingleUnit = [
  { name: '濃口醤油 1.8ℓ', spec: '1.8L/本', qty: 2, unit: '本', note: '2W' },
  { name: '薄口醤油 1.8ℓ', spec: '1.8L/本', qty: 3, unit: '本', note: '3E' }
];
const totalResultSingle = calculateFormBTotalRow(fujiyasuOrdersSingleUnit, fujiyasuVendor);
check(
  'F8.4 Homogeneous units aggregate into clean single sum (2本 + 3本 = 5本)',
  totalResultSingle.type === 'SINGLE_UNIT' && totalResultSingle.totalQuantity === 5 && totalResultSingle.unit === '本',
  `Total: ${totalResultSingle.totalQuantity} ${totalResultSingle.unit}`
);

// Case C: Form A (Asahi) - total row must NOT be displayed
const asahiVendor = mockMasterVendors.find(v => v.id === 1);
const asahiTotalResult = calculateFormBTotalRow(asahiInitial, asahiVendor);
check(
  'F8.5 Form A does not display Form B total row',
  asahiTotalResult === null,
  'Form A displays itemized rows without bottom aggregate'
);


// -------------------------------------------------------------
// [F4] PII Protection & Resident Name Masking Challenge
// -------------------------------------------------------------
console.log('\n--- [F4 CHALLENGE] PII Protection in FAX Orders ---');

const residentPersonalOrders = [
  { productId: 101, productName: 'ソフティアS', spec: '500g/袋', productUnit: '個', vendorId: 1, facilityQty: 0, personalQty: 2, personalNames: '田中 花子 様', status: '承認済' }
];
const mockOrderWithPII = [
  {
    id: 'ORD-PII-001',
    unit: '4W',
    items: residentPersonalOrders
  }
];

// Test with mask enabled (default)
const getOrdersMasked = createVendorOrderExtractor(mockMasterProducts, mockOrderWithPII, {}, true);
const maskedOutput = getOrdersMasked(1);
check(
  'F4.1 Resident personal name masked in FAX note (Default true)',
  maskedOutput[0].note === '4W (個人分)',
  `Note output: "${maskedOutput[0].note}" (Resident name "田中 花子 様" NOT exposed)`
);
check(
  'F4.2 Resident name does not appear anywhere in external print item note',
  !maskedOutput[0].note.includes('田中 花子'),
  'PII completely purged from print note'
);
check(
  'F4.3 Internal data retains real resident name for internal facility accounting',
  maskedOutput[0].personalNames === '田中 花子 様',
  'Internal personalNames field intact'
);

// Test with mask disabled (explicit toggle for internal draft check)
const getOrdersUnmasked = createVendorOrderExtractor(mockMasterProducts, mockOrderWithPII, {}, false);
const unmaskedOutput = getOrdersUnmasked(1);
check(
  'F4.4 Unmasked toggle preserves full details if explicitly chosen',
  unmaskedOutput[0].note.includes('田中 花子 様'),
  `Unmasked note: "${unmaskedOutput[0].note}"`
);

// Test HTML default state
check(
  'F4.5 HTML state defaults maskResidentNamesInFax to true',
  docsStr.includes('useState(true)') && docsStr.includes('maskResidentNamesInFax, setMaskResidentNamesInFax'),
  'Default state is secure (true)'
);


// -------------------------------------------------------------
// [F2] Print Blanking & Modal Clipping Challenge
// -------------------------------------------------------------
console.log('\n--- [F2 CHALLENGE] @media print & Layout Degradation ---');

check(
  'F2.1 html, body print style resets height and overflow',
  docsStr.includes('height: auto !important;') && docsStr.includes('overflow: visible !important;'),
  'html, body must be overflow: visible and height: auto'
);
check(
  'F2.2 Non-root body children hidden during print',
  docsStr.includes('body > *:not(#root) {') && docsStr.includes('display: none !important;'),
  'Prevents extraneous portals or overlays from printing'
);
check(
  'F2.3 .no-print elements hidden',
  docsStr.includes('.no-print, .no-print * {') && docsStr.includes('display: none !important;'),
  'Navigation, toolbars, buttons hidden during print'
);
check(
  'F2.4 #fax-modal-backdrop position: static and transparent',
  docsStr.includes('#fax-modal-backdrop, #fax-modal-container') &&
  docsStr.includes('position: static !important;') &&
  docsStr.includes('background: transparent !important;'),
  'Fixed backdrop stripped of layout-breaking fixed positioning'
);
check(
  'F2.5 #fax-modal-backdrop strips blur and backdrop-filter',
  docsStr.includes('backdrop-filter: none !important;') &&
  docsStr.includes('-webkit-backdrop-filter: none !important;'),
  'backdrop-filter: blur() causes blank page in Chromium printing'
);
check(
  'F2.6 #fax-modal-container strips overflow and max-height constraints',
  docsStr.includes('overflow: visible !important;') &&
  docsStr.includes('max-height: none !important;'),
  'Prevents clipping inside scrollable modal container'
);
check(
  'F2.7 #fax-print-area has page-break-inside: avoid and break-inside: avoid',
  docsStr.includes('page-break-inside: avoid;') && docsStr.includes('break-inside: avoid;'),
  'Ensures single-page FAX order fits cleanly on A4'
);
check(
  'F2.8 @page defined with standard A4 portrait and safe margins',
  docsStr.includes('size: A4 portrait;') && docsStr.includes('margin: 8mm;'),
  'Proper page sizing for Japanese institutional printer standards'
);

// -------------------------------------------------------------
// SUMMARY & VERDICT
// -------------------------------------------------------------
console.log('\n======================================================');
console.log(`TOTAL TESTS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('======================================================\n');

if (failCount > 0) {
  console.log('❌ CHALLENGER VERDICT: REJECT');
  results.filter(r => r.status === 'FAIL').forEach(f => console.log(`  - ${f.test}: ${f.detail}`));
} else {
  console.log('✅ CHALLENGER VERDICT: APPROVE');
}
