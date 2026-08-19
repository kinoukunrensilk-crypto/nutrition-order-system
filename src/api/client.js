// ==========================================================
// Cloudflare API クライアント (src/api/client.js)
// ==========================================================

const API_BASE = '/api';

/**
 * 初期データ・マスタ・直近履歴の一括取得
 */
export async function fetchInitialData() {
  try {
    const res = await fetch(`${API_BASE}/init`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      return { 
        isForbidden: true, 
        clientIp: data.clientIp || '不明',
        message: data.message || '施設のWi-Fi環境からのみアクセスが許可されています。'
      };
    }

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.warn('[API] /api/init 接続失敗 (オフライン/フォールバック):', err);
    return null;
  }
}

/**
 * ユニットからの発注データ送信 (D1保存)
 */
export async function submitOrderToD1(orderPayload) {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(orderPayload)
    });

    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      return { 
        success: false, 
        isForbidden: true, 
        error: '施設Wi-Fi未接続のため送信できませんでした。' 
      };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[API] /api/orders POST error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 発注ステータスの更新 (承認 / FAX送信済み / メモ更新)
 */
export async function updateOrderStatus(orderIds, status, payload = {}) {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        orderIds: Array.isArray(orderIds) ? orderIds : [orderIds],
        status,
        ...payload
      })
    });
    return await res.json();
  } catch (err) {
    console.error('[API] /api/orders PUT error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 発注履歴の取得
 */
export async function fetchOrdersFromD1(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.unit) params.append('unit', filters.unit);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/orders${queryStr}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.orders || [];
  } catch (err) {
    console.error('[API] /api/orders GET error:', err);
    return [];
  }
}

/**
 * 発注の削除
 */
export async function deleteOrderFromD1(orderId) {
  try {
    const res = await fetch(`${API_BASE}/orders?id=${orderId}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    console.error('[API] /api/orders DELETE error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 設定・マスタ・施設IPの保存
 */
export async function saveSettingsToD1(payload) {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error('[API] /api/settings error:', err);
    return { success: false, error: err.message };
  }
}
