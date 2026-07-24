/**
 * 栄養管理物品発注システム - Google Apps Script (GAS) バックエンド処理
 * 
 * 【使い方】
 * 1. Googleスプレッドシートを新規作成します。
 * 2. 以下の5つのシートを作成します：
 *    - 「商品マスタ」
 *    - 「ユニットマスタ」
 *    - 「発注データ」
 *    - 「発注明細」
 *    - 「業者マスタ」
 * 3. スプレッドシートのメニュー [拡張機能] ＞ [Apps Script] を開き、このコードを貼り付けます。
 * 4. [デプロイ] ＞ [新しいデプロイ] ＞ [ウェブアプリ] として公開（アクセス権: 全員）します。
 * 5. 発行されたウェブアプリURLを、フロントエンド画面の設定に入力します。
 */

// スプレッドシート初期化処理
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 商品マスタ
  let sheet = ss.getSheetByName('商品マスタ');
  if (!sheet) {
    sheet = ss.insertSheet('商品マスタ');
    sheet.appendRow(['商品ID', '商品名', 'カテゴリ', '発注単位', '単価', '振分先業者名', 'FAX番号', '有効フラグ']);
    sheet.appendRow([101, 'つるりんこ Quickly (800g/袋)', 'トロミ剤', '袋', 2850, '株式会社ヘルシーケア', '03-1234-5678', 1]);
    sheet.appendRow([102, 'とろみ調整 つるりんこ (3g×50本/箱)', 'トロミ剤', '箱', 1420, '株式会社ヘルシーケア', '03-1234-5678', 1]);
    sheet.appendRow([103, 'アイソカルゼリー ハイカロリー (66g×24個)', '高カロリーゼリー', '箱', 3600, 'メディカルメイト九州', '092-987-6543', 1]);
    sheet.appendRow([104, 'メイバランス2.0 (1000mL/パック)', '経管栄養剤', 'パック', 920, '株式会社ヘルシーケア', '03-1234-5678', 1]);
    sheet.appendRow([105, 'OS-1ゼリー (200g/個)', '水分補給', '個', 210, 'メディカルメイト九州', '092-987-6543', 1]);
  }
  
  // 2. 発注データ（ヘッダ）
  sheet = ss.getSheetByName('発注データ');
  if (!sheet) {
    sheet = ss.insertSheet('発注データ');
    sheet.appendRow(['発注ID', '発注日時', 'ユニット名', '入力者', 'ステータス', '合計金額', '備考', '承認者', '承認日時']);
  }
  
  // 3. 発注明細
  sheet = ss.getSheetByName('発注明細');
  if (!sheet) {
    sheet = ss.insertSheet('発注明細');
    sheet.appendRow(['明細ID', '発注ID', '商品ID', '商品名', '数量', '単位', '単価', '小計', '振分先業者']);
  }

  // 4. ユニットマスタ
  sheet = ss.getSheetByName('ユニットマスタ');
  if (!sheet) {
    sheet = ss.insertSheet('ユニットマスタ');
    sheet.appendRow(['ユニットID', 'ユニット名', '階数']);
    const units = [
      [1, 'ひまわり', '1F'], [2, 'すずらん', '1F'], [3, 'たんぽぽ', '1F'],
      [4, 'さくら', '2F'], [5, 'あじさい', '2F'], [6, 'コスモス', '2F'],
      [7, 'もみじ', '3F'], [8, 'いちょう', '3F'], [9, 'つばき', '3F']
    ];
    units.forEach(u => sheet.appendRow(u));
  }

  return '初期セットアップが完了しました！';
}

// GETリクエスト（データ取得API）
function doGet(e) {
  const action = e.parameter.action || 'get_all';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let result = {};
  
  if (action === 'get_all') {
    result = {
      products: getSheetData(ss, '商品マスタ'),
      units: getSheetData(ss, 'ユニットマスタ'),
      orders: getSheetData(ss, '発注データ'),
      items: getSheetData(ss, '発注明細')
    };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// POSTリクエスト（データ登録・承認API）
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.action === 'submit_order') {
      // 発注登録処理
      const orderSheet = ss.getSheetByName('発注データ');
      const itemSheet = ss.getSheetByName('発注明細');
      
      const orderId = 'ORD-' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd-HHmmss');
      const nowStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
      
      // 発注ヘッダ書き込み
      orderSheet.appendRow([
        orderId, nowStr, data.unitName, data.staffName, '承認待ち', data.totalAmount, data.remarks, '', ''
      ]);
      
      // 発注明細書き込み
      data.items.forEach((item, idx) => {
        itemSheet.appendRow([
          orderId + '-' + (idx + 1), orderId, item.productId, item.productName,
          item.quantity, item.unit, item.price, item.subtotal, item.vendor
        ]);
      });
      
      return responseJSON({ success: true, orderId: orderId, message: 'スプレッドシートへ登録完了！' });
    }
    
    if (data.action === 'approve_orders') {
      // 承認処理 ＆ PDF作成
      const orderSheet = ss.getSheetByName('発注データ');
      const rows = orderSheet.getDataRange().getValues();
      const nowStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][4] === '承認待ち') {
          orderSheet.getRange(i + 1, 5).setValue('承認完了・FAX送信済');
          orderSheet.getRange(i + 1, 8).setValue(data.approverName || '管理栄養士');
          orderSheet.getRange(i + 1, 9).setValue(nowStr);
        }
      }
      
      return responseJSON({ success: true, message: 'スプレッドシートのデータを一括承認しました！' });
    }
    
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}
