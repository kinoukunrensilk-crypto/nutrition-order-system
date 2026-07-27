/**
 * 栄養管理物品発注システム - Google Apps Script (GAS) バックエンド処理（完全マスター管理版）
 * 
 * 【初回セットアップ手順】
 * 1. Googleスプレッドシートの「拡張機能」>「Apps Script」にこのコードをすべて貼り付けて保存します。
 * 2. エディタ上部の関数選択ドロップダウンで「setupSystem」を選択し、「▶ 実行」をクリックします。
 *    （必要な全シート、ヘッダー、初期マスターデータが自動作成されます）
 * 3. 「デプロイ」>「新しいデプロイ」> 種類「ウェブアプリ」
 *    - 次のユーザーとして実行: 「自分」
 *    - アクセスできるユーザー: 「全員」
 *    を設定してデプロイし、発行された Web App URL をコピーしてください。
 */

// ===== ワンクリック完全初期化関数 =====
function setupSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 商品マスター
  let productSheet = ss.getSheetByName('商品マスター');
  if (!productSheet) productSheet = ss.insertSheet('商品マスター');
  if (productSheet.getLastRow() === 0) {
    productSheet.appendRow(['商品ID', '商品名', '規格', '単位', '業者ID', 'とろみ関連', '施設購入可', '個人購入可', '表示順', '有効フラグ']);
    const initProducts = [
      [101, 'ソフティアS', '500g/袋', '個', 1, true, true, true, 1, true],
      [102, 'つるりんこ Quickly (800g/袋)', '800g/袋', '袋', 1, true, true, true, 2, true],
      [103, 'とろみ調整 つるりんこ (3g×50本/箱)', '3g×50本', '箱', 1, true, true, true, 3, true],
      [201, 'だしするが', '1kg/パック', '個', 1, false, true, false, 4, true],
      [202, 'ふりかけ大袋', '500g/袋', '袋', 1, false, true, true, 5, true],
      [203, 'イオンサポート桃', '1kg/箱', '個', 1, false, true, true, 6, true],
      [204, 'イオンサポートりんご', '1kg/箱', '個', 1, false, true, true, 7, true],
      [301, '濃口醤油 1.8ℓ', '1.8L/本', '本', 2, false, true, false, 8, true],
      [302, '薄口醤油 1.8ℓ', '1.8L/本', '本', 2, false, true, false, 9, true],
      [303, 'すり味噌', '1kg/個', '個', 2, false, true, false, 10, true],
      [401, '無洗米・精米', '5kg/袋', 'kg', 3, false, true, false, 11, true]
    ];
    initProducts.forEach(r => productSheet.appendRow(r));
  }

  // 2. 業者マスター
  let vendorSheet = ss.getSheetByName('業者マスター');
  if (!vendorSheet) vendorSheet = ss.insertSheet('業者マスター');
  if (vendorSheet.getLastRow() === 0) {
    vendorSheet.appendRow(['業者ID', '業者名', 'FAX番号', '担当者', 'FAX様式', 'メールアドレス', '有効フラグ']);
    const initVendors = [
      [1, 'アサヒ物産株式会社', '099-245-6556', '担当様', 'A', '', true],
      [2, '藤安醸造株式会社',   '099-262-1357', '担当様', 'B', '', true],
      [3, '有限会社 山口米店',   '0995-43-1789', '担当様', 'B', '', true]
    ];
    initVendors.forEach(r => vendorSheet.appendRow(r));
  }

  // 3. ユニットマスター
  let unitSheet = ss.getSheetByName('ユニットマスター');
  if (!unitSheet) unitSheet = ss.insertSheet('ユニットマスター');
  if (unitSheet.getLastRow() === 0) {
    unitSheet.appendRow(['ユニットID', 'ユニット名', '表示順', '有効フラグ']);
    const initUnits = ['2W','2E','3W','3E','4W','4E','5W','5E','その他'];
    initUnits.forEach((u, i) => unitSheet.appendRow([i + 1, u, i + 1, true]));
  }

  // 4. 管理栄養士マスター
  let nutritionistSheet = ss.getSheetByName('管理栄養士マスター');
  if (!nutritionistSheet) nutritionistSheet = ss.insertSheet('管理栄養士マスター');
  if (nutritionistSheet.getLastRow() === 0) {
    nutritionistSheet.appendRow(['職員ID', '氏名', '権限', '有効フラグ']);
    nutritionistSheet.appendRow([1, '野元 史彦', '管理者', true]);
    nutritionistSheet.appendRow([2, '管理栄養士2', '一般', true]);
  }

  // 5. 発注データ
  let orderSheet = ss.getSheetByName('発注データ');
  if (!orderSheet) orderSheet = ss.insertSheet('発注データ');
  if (orderSheet.getLastRow() === 0) {
    orderSheet.appendRow([
      '発注ID', '発注日時', 'ユニットID', 'ユニット名', '発注担当者', 
      '商品ID', '商品名', '規格', '単位', '業者ID', '業者名', 
      '施設分数量', '個人分数量', '個人購入者名', 'FAX印字備考', '申送りメモ', 
      'ステータス', '承認者', '承認日時', 'FAX送信日時', 'FAX送信者', 'requestId'
    ]);
  }

  // 6. システム設定
  let settingSheet = ss.getSheetByName('システム設定');
  if (!settingSheet) settingSheet = ss.insertSheet('システム設定');
  if (settingSheet.getLastRow() === 0) {
    settingSheet.appendRow(['設定項目', '設定値', '説明']);
    settingSheet.appendRow(['deadlineTime', '14:00', '発注締切時刻']);
    settingSheet.appendRow(['orderDaysList', JSON.stringify({ '月': true, '火': true, '水': true, '木': true, '金': true, '土': true, '日': false }), '発注受付曜日']);
  }

  return '✅ 栄養管理物品発注システムのマスター構造および初期データの作成が正常に完了しました！';
}

// 別名互換用
function initializeMasterData() {
  return setupSystem();
}

// ===== GETリクエスト (全マスターおよび発注履歴の一括取得API) =====
function doGet(e) {
  try {
    const callback = e && e.parameter ? e.parameter.callback : null;
    const action = e && e.parameter ? e.parameter.action : 'getInitialData';

    if (e && e.parameter && e.parameter.payload) {
      const data = JSON.parse(e.parameter.payload);
      return processData(data, callback);
    }

    if (action === 'getInitialData' || action === 'getMasters' || !action) {
      const allData = getAllSystemData();
      return responseJSON(allData, callback);
    }

    return responseJSON({ status: "ok", message: "栄養管理物品発注システム API 稼働中" }, callback);
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() }, e && e.parameter ? e.parameter.callback : null);
  }
}

// ===== POSTリクエスト (発注登録・ステータス更新・マスター操作) =====
function doPost(e) {
  let callback = null;
  try {
    let data;
    if (e && e.parameter && e.parameter.callback) callback = e.parameter.callback;

    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = JSON.parse(e.parameter.payload || e.parameter.data || '{}');
      }
    } else if (e && e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    }

    return processData(data, callback);
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() }, callback);
  }
}

// ===== 全システムデータ取得処理 =====
function getAllSystemData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 商品マスター
  const productSheet = ss.getSheetByName('商品マスター');
  const products = [];
  if (productSheet && productSheet.getLastRow() > 1) {
    const rows = productSheet.getRange(2, 1, productSheet.getLastRow() - 1, 10).getValues();
    rows.forEach(r => {
      products.push({
        id: Number(r[0]),
        name: String(r[1]),
        spec: String(r[2] || ''),
        unit: String(r[3] || '個'),
        vendorId: Number(r[4]),
        isToromi: Boolean(r[5]),
        allowFacility: Boolean(r[6]),
        allowPersonal: Boolean(r[7]),
        sortOrder: Number(r[8] || 0),
        active: Boolean(r[9])
      });
    });
  }

  // 業者マスター
  const vendorSheet = ss.getSheetByName('業者マスター');
  const vendors = [];
  if (vendorSheet && vendorSheet.getLastRow() > 1) {
    const rows = vendorSheet.getRange(2, 1, vendorSheet.getLastRow() - 1, 7).getValues();
    rows.forEach(r => {
      vendors.push({
        id: Number(r[0]),
        name: String(r[1]),
        fax: String(r[2]),
        contact: String(r[3] || '担当様'),
        faxFormat: String(r[4] || 'A'),
        email: String(r[5] || ''),
        active: Boolean(r[6])
      });
    });
  }

  // ユニットマスター
  const unitSheet = ss.getSheetByName('ユニットマスター');
  const units = [];
  if (unitSheet && unitSheet.getLastRow() > 1) {
    const rows = unitSheet.getRange(2, 1, unitSheet.getLastRow() - 1, 4).getValues();
    rows.forEach(r => {
      if (r[3]) units.push({ id: Number(r[0]), name: String(r[1]), sortOrder: Number(r[2]), active: Boolean(r[3]) });
    });
  }

  // 管理栄養士マスター
  const nutritionistSheet = ss.getSheetByName('管理栄養士マスター');
  const nutritionists = [];
  if (nutritionistSheet && nutritionistSheet.getLastRow() > 1) {
    const rows = nutritionistSheet.getRange(2, 1, nutritionistSheet.getLastRow() - 1, 4).getValues();
    rows.forEach(r => {
      if (r[3]) nutritionists.push({ id: Number(r[0]), name: String(r[1]), role: String(r[2]), active: Boolean(r[3]) });
    });
  }

  // システム設定
  const settingSheet = ss.getSheetByName('システム設定');
  const settings = { deadlineTime: '14:00', orderDaysList: { '月': true, '火': true, '水': true, '木': true, '金': true, '土': true, '日': false } };
  if (settingSheet && settingSheet.getLastRow() > 1) {
    const rows = settingSheet.getRange(2, 1, settingSheet.getLastRow() - 1, 3).getValues();
    rows.forEach(r => {
      const key = String(r[0]);
      let val = r[1];
      if (key === 'orderDaysList' && typeof val === 'string') {
        try { val = JSON.parse(val); } catch (e) {}
      }
      settings[key] = val;
    });
  }

  // 発注データ (履歴グループ構造へ変換)
  const orderSheet = ss.getSheetByName('発注データ');
  const orderHistory = [];
  if (orderSheet && orderSheet.getLastRow() > 1) {
    const rows = orderSheet.getRange(2, 1, orderSheet.getLastRow() - 1, 22).getValues();
    
    // 発注IDごとにグループ化
    const groupMap = {};
    rows.forEach(r => {
      const orderId = String(r[0] || ('ORD-' + Date.now()));
      if (!groupMap[orderId]) {
        groupMap[orderId] = {
          id: orderId,
          submittedAt: String(r[1]),
          unitId: r[2],
          unit: String(r[3]),
          staffName: String(r[4]),
          memo: String(r[15] || ''),
          status: String(r[16] || '申請中'),
          approver: String(r[17] || ''),
          approvedAt: String(r[18] || ''),
          faxSentAt: String(r[19] || ''),
          faxSender: String(r[20] || ''),
          items: []
        };
      }
      groupMap[orderId].items.push({
        productId: Number(r[5]),
        productName: String(r[6]),
        spec: String(r[7] || ''),
        productUnit: String(r[8] || '個'),
        vendorId: Number(r[9]),
        vendorName: String(r[10]),
        facilityQty: Number(r[11] || 0),
        personalQty: Number(r[12] || 0),
        personalNames: String(r[13] || ''),
        note: String(r[14] || r[3]),
        time: String(r[1])
      });
    });

    Object.values(groupMap).forEach(entry => orderHistory.push(entry));
    orderHistory.reverse(); // 最新順
  }

  return {
    success: true,
    products,
    vendors,
    units,
    nutritionists,
    settings,
    orderHistory
  };
}

// ===== メインデータ処理ディスパッチャー =====
function processData(data, callback) {
  if (!data) return responseJSON({ success: false, error: 'データが空です' }, callback);

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 重複チェック (10秒以内の二重POST防止 + requestId判定)
  try {
    const cache = CacheService.getScriptCache();
    const reqId = data.requestId || Utilities.base64Encode(JSON.stringify(data)).substring(0, 100);
    if (cache.get(reqId)) {
      return responseJSON({ success: true, message: '重複送信を自動検出してスキップしました' }, callback);
    }
    cache.put(reqId, 'true', 10);
  } catch (e) {}

  // Action 1: 初期データ取得
  if (data.action === 'getInitialData') {
    return responseJSON(getAllSystemData(), callback);
  }

  // Action 2: 一括発注登録 (bulkSubmit)
  if (data.action === 'bulkSubmit' && data.items) {
    let orderSheet = ss.getSheetByName('発注データ');
    if (!orderSheet) { setupSystem(); orderSheet = ss.getSheetByName('発注データ'); }

    const nowStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
    const orderId = data.orderId || ('ORD-' + Date.now() + '-' + Math.floor(Math.random()*1000));

    data.items.forEach(item => {
      orderSheet.appendRow([
        orderId,
        item.time || nowStr,
        item.unitId || '',
        item.unit || '',
        item.staffName || '',
        item.productId || 0,
        item.productName || '',
        item.spec || '',
        item.productUnit || '個',
        item.vendorId || 0,
        item.vendorName || '',
        item.facilityQty || 0,
        item.personalQty || 0,
        item.personalNames || '',
        item.note || item.unit || '',
        item.memo || '',
        '申請中',
        '', '', '', '',
        data.requestId || ''
      ]);
    });

    return responseJSON({ success: true, message: `${data.items.length}件の発注をスプレッドシートへ登録しました！`, orderId }, callback);
  }

  // Action 3: 発注ステータス更新 (承認・FAX送信済・確認済等)
  if (data.action === 'updateOrderStatus') {
    const orderSheet = ss.getSheetByName('発注データ');
    if (!orderSheet || orderSheet.getLastRow() <= 1) return responseJSON({ success: false, error: '発注データが存在しません' }, callback);

    const nowStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
    const targetId = String(data.orderId || '');
    const newStatus = String(data.status || '承認済');
    const sender = String(data.sender || data.approver || '管理栄養士');

    const range = orderSheet.getRange(2, 1, orderSheet.getLastRow() - 1, 22);
    const values = range.getValues();
    let updatedCount = 0;

    for (let i = 0; i < values.length; i++) {
      const rowOrderId = String(values[i][0]);
      // ID指定更新 または 全申請中を一括更新 (targetId === 'ALL_PENDING')
      if (rowOrderId === targetId || (targetId === 'ALL_PENDING' && values[i][16] === '申請中')) {
        values[i][16] = newStatus; // ステータス
        if (newStatus === '承認済') {
          values[i][17] = sender;  // 承認者
          values[i][18] = nowStr;  // 承認日時
        } else if (newStatus === 'FAX送信済') {
          values[i][19] = nowStr;  // FAX送信日時
          values[i][20] = sender;  // FAX送信者
        }
        updatedCount++;
      }
    }

    range.setValues(values);
    return responseJSON({ success: true, message: `${updatedCount}件の発注ステータスを【${newStatus}】へ更新しました！` }, callback);
  }

  // Action 4: マスター追加 / 編集 / 有効無効切り替え
  if (data.action === 'updateMaster') {
    const targetMaster = data.masterType; // 'product', 'vendor', 'unit', 'nutritionist'
    let sheetName = '';
    if (targetMaster === 'product') sheetName = '商品マスター';
    else if (targetMaster === 'vendor') sheetName = '業者マスター';
    else if (targetMaster === 'unit') sheetName = 'ユニットマスター';
    else if (targetMaster === 'nutritionist') sheetName = '管理栄養士マスター';

    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return responseJSON({ success: false, error: `シート ${sheetName} が見つかりません` }, callback);

    const item = data.item;
    const isNew = !item.id || item.isNew;
    const itemId = isNew ? Date.now() : Number(item.id);

    if (targetMaster === 'product') {
      if (isNew) {
        sheet.appendRow([itemId, item.name, item.spec||'', item.unit||'個', Number(item.vendorId||1), Boolean(item.isToromi), Boolean(item.allowFacility), Boolean(item.allowPersonal), Number(item.sortOrder||99), true]);
      } else {
        const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();
        for (let i = 0; i < rows.length; i++) {
          if (Number(rows[i][0]) === itemId) {
            sheet.getRange(i + 2, 1, 1, 10).setValues([[itemId, item.name, item.spec||'', item.unit||'個', Number(item.vendorId||1), Boolean(item.isToromi), Boolean(item.allowFacility), Boolean(item.allowPersonal), Number(item.sortOrder||0), item.active !== false]]);
            break;
          }
        }
      }
    } else if (targetMaster === 'vendor') {
      if (isNew) {
        sheet.appendRow([itemId, item.name, item.fax, item.contact||'担当様', item.faxFormat||'A', item.email||'', true]);
      } else {
        const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
        for (let i = 0; i < rows.length; i++) {
          if (Number(rows[i][0]) === itemId) {
            sheet.getRange(i + 2, 1, 1, 7).setValues([[itemId, item.name, item.fax, item.contact||'担当様', item.faxFormat||'A', item.email||'', item.active !== false]]);
            break;
          }
        }
      }
    } else if (targetMaster === 'unit') {
      if (isNew) {
        sheet.appendRow([itemId, item.name, Number(item.sortOrder||99), true]);
      } else {
        const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
        for (let i = 0; i < rows.length; i++) {
          if (Number(rows[i][0]) === itemId) {
            sheet.getRange(i + 2, 1, 1, 4).setValues([[itemId, item.name, Number(item.sortOrder||0), item.active !== false]]);
            break;
          }
        }
      }
    } else if (targetMaster === 'nutritionist') {
      if (isNew) {
        sheet.appendRow([itemId, item.name, item.role||'管理者', true]);
      } else {
        const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
        for (let i = 0; i < rows.length; i++) {
          if (Number(rows[i][0]) === itemId) {
            sheet.getRange(i + 2, 1, 1, 4).setValues([[itemId, item.name, item.role||'管理者', item.active !== false]]);
            break;
          }
        }
      }
    }

    return responseJSON({ success: true, message: `マスター情報【${item.name}】を更新しました！` }, callback);
  }

  // Action 5: システム設定更新
  if (data.action === 'updateSystemSettings') {
    const settingSheet = ss.getSheetByName('システム設定');
    if (settingSheet && data.settings) {
      Object.entries(data.settings).forEach(([key, val]) => {
        const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
        let found = false;
        if (settingSheet.getLastRow() > 1) {
          const rows = settingSheet.getRange(2, 1, settingSheet.getLastRow() - 1, 2).getValues();
          for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === key) {
              settingSheet.getRange(i + 2, 2).setValue(valStr);
              found = true;
              break;
            }
          }
        }
        if (!found) settingSheet.appendRow([key, valStr, '']);
      });
    }
    return responseJSON({ success: true, message: 'システム設定を更新しました！' }, callback);
  }

  return responseJSON({ success: true, message: 'データ処理完了' }, callback);
}

// ===== レスポンス出力ヘルパー (JSON & JSONP完全対応) =====
function responseJSON(obj, callback) {
  const jsonStr = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${jsonStr})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(jsonStr)
    .setMimeType(ContentService.MimeType.JSON);
}
