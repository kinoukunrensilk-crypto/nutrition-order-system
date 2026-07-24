/**
 * 栄養管理物品発注システム - Google Apps Script (GAS) バックエンド処理
 * 
 * 【ワンタップで20件のサンプルデータをスプレッドシートに今すぐ反映させる方法】
 * 1. Apps Script エディタの上部にある関数選択ドロップダウンで「insertSampleData20」を選択します。
 * 2. 「実行」ボタンを押します。
 * 3. スプレッドシートの2行目〜21行目に一瞬で20件のデータが書き込まれます！
 */

// スプレッドシート初期化＆20件サンプルデータ一括自動書き込み関数
function insertSampleData20() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('発注データ');
  
  if (!sheet) {
    sheet = ss.insertSheet('発注データ');
  }

  // ヘッダーがなければ追加
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['入力日時', 'ユニット名', '発注担当者', '商品名', '施設分数量', '個人分数量', 'FAX印字備考', '申送りメモ', 'ステータス']);
  }

  const sampleRows = [
    ['2026/07/24 14:15', '2W', '佐藤 健太', 'ソフティアS', 0, 1, '2W (山田 太郎様)', '【2W申送り】山田様食欲低下のためイオンサポート多めに申請します。', '申請中'],
    ['2026/07/24 14:15', '2W', '佐藤 健太', 'だしするが', 2, 0, '2W', '【2W申送り】山田様食欲低下のためイオンサポート多めに申請します。', '申請中'],
    ['2026/07/24 14:15', '2W', '佐藤 健太', 'イオンサポート桃', 3, 0, '2W', '【2W申送り】山田様食欲低下のためイオンサポート多めに申請します。', '申請中'],
    ['2026/07/24 13:50', '2E', '田中 美咲', 'つるりんこ Quickly (800g/袋)', 1, 1, '2E (佐藤 花子様)', '2Eユニットの補充用トロミ剤です。', '申請中'],
    ['2026/07/24 13:50', '2E', '田中 美咲', 'ふりかけ大袋', 2, 0, '2E', '2Eユニットの補充用トロミ剤です。', '申請中'],
    ['2026/07/24 13:42', '3W', '鈴木 大輔', 'とろみ調整 つるりんこ (3g×50本/箱)', 1, 0, '3W', '3W食堂用の醤油とゼリーです。', '申請中'],
    ['2026/07/24 13:42', '3W', '鈴木 大輔', '濃口醤油 1.8ℓ', 2, 0, '3W', '3W食堂用の醤油とゼリーです。', '申請中'],
    ['2026/07/24 13:42', '3W', '鈴木 大輔', 'イオンサポートりんご', 5, 0, '3W', '3W食堂用の醤油とゼリーです。', '申請中'],
    ['2026/07/24 13:40', '3E', '高橋 涼子', '無洗米・精米', 30, 0, '3E', '3E用無洗米30kgと薄口醤油・お味噌の追加です。', '申請中'],
    ['2026/07/24 13:40', '3E', '高橋 涼子', '薄口醤油 1.8ℓ', 1, 0, '3E', '3E用無洗米30kgと薄口醤油・お味噌の追加です。', '申請中'],
    ['2026/07/24 13:40', '3E', '高橋 涼子', 'すり味噌', 2, 0, '3E', '3E用無洗米30kgと薄口醤油・お味噌の追加です。', '申請中'],
    ['2026/07/24 12:30', '4W', '木村 次郎', '無洗米・精米', 40, 0, '4W', '4W中村様のソフティア個人分2個です。', '申請中'],
    ['2026/07/24 12:30', '4W', '木村 次郎', '濃口醤油 1.8ℓ', 2, 0, '4W', '4W中村様のソフティア個人分2個です。', '申請中'],
    ['2026/07/24 12:30', '4W', '木村 次郎', 'ソフティアS', 0, 2, '4W (中村 雅人様)', '4W中村様のソフティア個人分2個です。', '申請中'],
    ['2026/07/24 12:10', '4E', '加藤 恵', 'つるりんこ Quickly (800g/袋)', 2, 0, '4E', '小林様ご所望のふりかけ大袋個人購入です。', '申請中'],
    ['2026/07/24 12:10', '4E', '加藤 恵', 'ふりかけ大袋', 0, 1, '4E (小林 節子様)', '小林様ご所望のふりかけ大袋個人購入です。', '申請中'],
    ['2026/07/24 11:55', '5W', '渡辺 誠', 'イオンサポート桃', 4, 0, '5W', '水分補給用イオンサポート各4個。', '申請中'],
    ['2026/07/24 11:55', '5W', '渡辺 誠', 'イオンサポートりんご', 4, 0, '5W', '水分補給用イオンサポート各4個。', '申請中'],
    ['2026/07/24 11:50', '5E', '山本 愛', '無洗米・精米', 30, 0, '5E', '5Eお米と醤油です。', '申請中'],
    ['2026/07/24 11:50', '5E', '山本 愛', '濃口醤油 1.8ℓ', 1, 0, '5E', '5Eお米と醤油です。', '申請中']
  ];

  sampleRows.forEach(row => {
    sheet.appendRow(row);
  });

  return 'スプレッドシートへ20件のサンプルデータを一括入力完了しました！';
}

// GETリクエスト（データ確認API）
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ok", message: "GAS Web API 正常動作中" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// POSTリクエスト（アプリからの自動同期API）
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('発注データ');
    if (!sheet) {
      sheet = ss.insertSheet('発注データ');
      sheet.appendRow(['入力日時', 'ユニット名', '発注担当者', '商品名', '施設分数量', '個人分数量', 'FAX印字備考', '申送りメモ', 'ステータス']);
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch(err) {
      data = JSON.parse(e.parameter.data || '{}');
    }

    const nowStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');

    // bulkSubmit (一括送信)
    if (data.action === 'bulkSubmit' && data.items) {
      data.items.forEach(item => {
        sheet.appendRow([
          item.time || nowStr,
          item.unit || '',
          item.staffName || '',
          item.productName || '',
          item.facilityQty || 0,
          item.personalQty || 0,
          item.note || '',
          item.memo || '',
          '申請中'
        ]);
      });
      return responseJSON({ success: true, message: `${data.items.length}件をスプレッドシートへ追加しました！` });
    }

    // submitOrder (単発送信)
    if (data.action === 'submitOrder' && data.cart) {
      Object.entries(data.cart).forEach(([prodId, item]) => {
        sheet.appendRow([
          nowStr,
          data.unit || '',
          data.staffName || '',
          item.productName || prodId,
          item.facilityQty || 0,
          item.personalQty || 0,
          item.personalNames ? `${data.unit} (${item.personalNames})` : data.unit,
          data.memo || '',
          '申請中'
        ]);
      });
      return responseJSON({ success: true, message: 'スプレッドシートへ追加しました！' });
    }

    return responseJSON({ success: true, message: 'データを受信しました' });
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
