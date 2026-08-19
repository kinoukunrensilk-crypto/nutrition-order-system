// ==========================================================
// API: /api/init (マスタ・設定・直近発注データの初期取得)
// ==========================================================

export async function onRequestGet(context) {
  const { env } = context;
  
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'DATABASE_NOT_BOUND' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 1. 設定データの取得
    const settingsResults = await env.DB.prepare("SELECT key, value FROM settings").all();
    const settings = {};
    if (settingsResults.results) {
      for (const row of settingsResults.results) {
        try {
          settings[row.key] = JSON.parse(row.value);
        } catch (e) {
          settings[row.key] = row.value;
        }
      }
    }

    // 2. 業者マスタの取得
    const vendorsResult = await env.DB.prepare(
      "SELECT id, name, fax, contact, sort_order FROM vendors WHERE is_active = 1 ORDER BY sort_order ASC, id ASC"
    ).all();

    // 3. 商品マスタの取得
    const productsResult = await env.DB.prepare(
      "SELECT id, name, unit, vendor_id as vendorId, is_toromi as isToromi, allow_personal as allowPersonal, allow_facility as allowFacility, sort_order FROM products WHERE is_active = 1 ORDER BY sort_order ASC, id ASC"
    ).all();

    // 4. 直近の発注データ（最新100件）
    const ordersResult = await env.DB.prepare(
      "SELECT id, order_number, unit, nutritionist, staff_name, order_date, created_at, status, memo, approved_by, approved_at, faxed_at FROM orders ORDER BY id DESC LIMIT 100"
    ).all();

    const orders = [];
    if (ordersResult.results && ordersResult.results.length > 0) {
      const orderIds = ordersResult.results.map(o => o.id);
      const placeholders = orderIds.map(() => '?').join(',');
      const itemsResult = await env.DB.prepare(
        `SELECT id, order_id, product_id, product_name, vendor_id, vendor_name, unit, quantity, is_personal, personal_memo, is_facility FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`
      ).bind(...orderIds).all();

      const itemsByOrderId = {};
      if (itemsResult.results) {
        for (const item of itemsResult.results) {
          if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
          itemsByOrderId[item.order_id].push({
            id: item.product_id,
            name: item.product_name,
            vendorId: item.vendor_id,
            vendorName: item.vendor_name,
            unit: item.unit,
            facilityQty: item.is_facility ? item.quantity : 0,
            personalQty: item.is_personal ? item.quantity : 0,
            personalMemo: item.personal_memo || '',
            totalQty: item.quantity
          });
        }
      }

      for (const ord of ordersResult.results) {
        orders.push({
          orderId: ord.id,
          orderNumber: ord.order_number,
          unit: ord.unit,
          staffName: ord.staff_name,
          nutritionist: ord.nutritionist,
          orderDate: ord.order_date,
          createdAt: ord.created_at,
          status: ord.status,
          memo: ord.memo,
          approvedBy: ord.approved_by,
          approvedAt: ord.approved_at,
          faxedAt: ord.faxed_at,
          items: itemsByOrderId[ord.id] || []
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        settings,
        vendors: vendorsResult.results || [],
        products: (productsResult.results || []).map(p => ({
          ...p,
          isToromi: Boolean(p.isToromi),
          allowPersonal: Boolean(p.allowPersonal),
          allowFacility: Boolean(p.allowFacility)
        })),
        recentOrders: orders
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('API /api/init error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
