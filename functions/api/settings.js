// ==========================================================
// API: /api/settings (設定・商品・業者・施設IP管理)
// ==========================================================

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return new Response(JSON.stringify({ error: 'DB_ERROR' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });

  try {
    const settingsRows = await env.DB.prepare("SELECT key, value FROM settings").all();
    const settings = {};
    for (const r of settingsRows.results || []) {
      try { settings[r.key] = JSON.parse(r.value); } catch(e) { settings[r.key] = r.value; }
    }

    const vendors = await env.DB.prepare("SELECT * FROM vendors WHERE is_active = 1 ORDER BY sort_order ASC, id ASC").all();
    const products = await env.DB.prepare("SELECT * FROM products WHERE is_active = 1 ORDER BY sort_order ASC, id ASC").all();

    return new Response(JSON.stringify({
      success: true,
      settings,
      vendors: vendors.results || [],
      products: (products.results || []).map(p => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
        vendorId: p.vendor_id,
        isToromi: Boolean(p.is_toromi),
        allowPersonal: Boolean(p.allow_personal),
        allowFacility: Boolean(p.allow_facility),
        sort_order: p.sort_order
      }))
    }), { headers: { 'Content-Type': 'application/json;charset=utf-8' } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const clientIp = request.headers.get('cf-connecting-ip') || '127.0.0.1';

  if (!env.DB) return new Response(JSON.stringify({ error: 'DB_ERROR' }), { status: 500 });

  try {
    const body = await request.json();
    const { action, key, value, allowedIps, products, vendors, settings } = body;

    const stmts = [];

    // 施設許可IPの更新
    if (action === 'update_allowed_ips' || allowedIps !== undefined) {
      const ips = Array.isArray(allowedIps) ? allowedIps : [];
      stmts.push(
        env.DB.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('allowed_ips', ?, datetime('now', '+9 hours'))")
          .bind(JSON.stringify(ips))
      );
    }

    // 単一設定の更新
    if (key && value !== undefined) {
      stmts.push(
        env.DB.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now', '+9 hours'))")
          .bind(key, JSON.stringify(value))
      );
    }

    // 設定一括更新
    if (settings && typeof settings === 'object') {
      for (const [k, v] of Object.entries(settings)) {
        stmts.push(
          env.DB.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now', '+9 hours'))")
            .bind(k, JSON.stringify(v))
        );
      }
    }

    // 業者マスタの同期・更新
    if (Array.isArray(vendors)) {
      for (const v of vendors) {
        if (v.id) {
          const isActive = v.isActive !== undefined ? (v.isActive ? 1 : 0) : 1;
          stmts.push(
            env.DB.prepare("INSERT OR REPLACE INTO vendors (id, name, fax, contact, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)")
              .bind(v.id, v.name, v.fax, v.contact || '担当様', v.sort_order || 0, isActive)
          );
        }
      }
    }

    // 商品マスタの同期・更新
    if (Array.isArray(products)) {
      for (const p of products) {
        if (p.id) {
          const isActive = p.isActive !== undefined ? (p.isActive ? 1 : 0) : 1;
          stmts.push(
            env.DB.prepare("INSERT OR REPLACE INTO products (id, name, unit, vendor_id, is_toromi, allow_personal, allow_facility, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
              .bind(
                p.id,
                p.name,
                p.unit,
                p.vendorId || p.vendor_id || 1,
                p.isToromi ? 1 : 0,
                p.allowPersonal ? 1 : 0,
                p.allowFacility ? 1 : 0,
                p.sort_order || 0,
                isActive
              )
          );
        }
      }
    }

    if (stmts.length > 0) {
      await env.DB.batch(stmts);
    }

    // 監査ログ
    await env.DB.prepare(
      "INSERT INTO audit_logs (ip_address, user_agent, action, details) VALUES (?, ?, 'SETTINGS_UPDATED', ?)"
    ).bind(
      clientIp,
      request.headers.get('user-agent') || 'Unknown',
      `Settings updated (${stmts.length} operations)`
    ).run();

    return new Response(JSON.stringify({ success: true, message: '設定をCloudflare D1に保存しました。' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });

  } catch (e) {
    console.error('API /api/settings error:', e);
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
  }
}
