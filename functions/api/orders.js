// ==========================================================
// API: /api/orders (発注登録・履歴一覧・ステータス更新・削除)
// ==========================================================

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const targetDate = url.searchParams.get('date');
  const unitFilter = url.searchParams.get('unit');
  const statusFilter = url.searchParams.get('status');
  const limitParam = parseInt(url.searchParams.get('limit') || '100', 10);

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'DATABASE_NOT_BOUND' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let query = "SELECT id, order_number, unit, nutritionist, staff_name, order_date, created_at, status, memo, approved_by, approved_at, faxed_at FROM orders WHERE 1=1";
    const params = [];

    if (targetDate) {
      query += " AND order_date = ?";
      params.push(targetDate);
    }
    if (unitFilter && unitFilter !== 'all') {
      query += " AND unit = ?";
      params.push(unitFilter);
    }
    if (statusFilter && statusFilter !== 'all') {
      query += " AND status = ?";
      params.push(statusFilter);
    }

    query += " ORDER BY id DESC LIMIT ?";
    params.push(limitParam);

    const ordersResult = await env.DB.prepare(query).bind(...params).all();
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
      orders: orders
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });

  } catch (err) {
    console.error('API /api/orders GET error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const clientIp = request.headers.get('cf-connecting-ip') || '127.0.0.1';

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'DATABASE_NOT_BOUND' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { unit, staffName, orderDate, nutritionist, memo, items } = body;

    // バリデーション
    if (!unit) {
      return new Response(JSON.stringify({ success: false, error: 'ユニットを選択してください。' }), { status: 400 });
    }
    if (!staffName || staffName.trim() === '') {
      return new Response(JSON.stringify({ success: false, error: '発注担当者名を入力してください。' }), { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ success: false, error: '発注商品が選択されていません。' }), { status: 400 });
    }

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`;
    const nowJST = new Date(Date.now() + ((new Date().getTimezoneOffset() + 540) * 60000)).toISOString().replace('T', ' ').substring(0, 19);

    // 1. orders ヘッダー作成
    const insertOrderStmt = env.DB.prepare(
      "INSERT INTO orders (order_number, unit, nutritionist, staff_name, order_date, created_at, status, memo, ip_address) VALUES (?, ?, ?, ?, ?, ?, 'submitted', ?, ?)"
    ).bind(
      orderNumber,
      unit,
      nutritionist || null,
      staffName.trim(),
      orderDate || nowJST.substring(0, 10),
      nowJST,
      memo || null,
      clientIp
    );

    const orderResult = await insertOrderStmt.run();
    const orderId = orderResult.meta.last_row_id;

    // 2. order_items 明細一括作成
    const itemStatements = [];
    for (const item of items) {
      const facilityQty = parseInt(item.facilityQty, 10) || 0;
      const personalQty = parseInt(item.personalQty, 10) || 0;
      const totalQty = facilityQty + personalQty;

      if (totalQty > 0) {
        // 施設分レコード
        if (facilityQty > 0) {
          itemStatements.push(
            env.DB.prepare(
              "INSERT INTO order_items (order_id, product_id, product_name, vendor_id, vendor_name, unit, quantity, is_personal, personal_memo, is_facility) VALUES (?, ?, ?, ?, ?, ?, ?, 0, '', 1)"
            ).bind(
              orderId,
              item.id || item.productId,
              item.name,
              item.vendorId,
              item.vendorName || '',
              item.unit,
              facilityQty
            )
          );
        }
        // 個人分レコード
        if (personalQty > 0) {
          itemStatements.push(
            env.DB.prepare(
              "INSERT INTO order_items (order_id, product_id, product_name, vendor_id, vendor_name, unit, quantity, is_personal, personal_memo, is_facility) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 0)"
            ).bind(
              orderId,
              item.id || item.productId,
              item.name,
              item.vendorId,
              item.vendorName || '',
              item.unit,
              personalQty,
              item.personalMemo || ''
            )
          );
        }
      }
    }

    if (itemStatements.length > 0) {
      await env.DB.batch(itemStatements);
    }

    // 3. 監査ログ記録
    await env.DB.prepare(
      "INSERT INTO audit_logs (ip_address, user_agent, action, details) VALUES (?, ?, 'ORDER_SUBMITTED', ?)"
    ).bind(
      clientIp,
      request.headers.get('user-agent') || 'Unknown',
      `Order ${orderNumber} for unit ${unit} submitted (${itemStatements.length} items)`
    ).run();

    return new Response(JSON.stringify({
      success: true,
      orderId: orderId,
      orderNumber: orderNumber,
      message: `${unit}の発注データをD1データベースへ正常に保存しました。`
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });

  } catch (err) {
    console.error('API /api/orders POST error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut(context) {
  const { env, request } = context;
  const clientIp = request.headers.get('cf-connecting-ip') || '127.0.0.1';

  if (!env.DB) return new Response(JSON.stringify({ error: 'DB_ERROR' }), { status: 500 });

  try {
    const body = await request.json();
    const { orderIds, status, approvedBy, memo } = body;
    const nowJST = new Date(Date.now() + ((new Date().getTimezoneOffset() + 540) * 60000)).toISOString().replace('T', ' ').substring(0, 19);

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return new Response(JSON.stringify({ success: false, error: '対象の発注IDが指定されていません。' }), { status: 400 });
    }

    const stmts = [];
    for (const id of orderIds) {
      if (status === 'processed') {
        stmts.push(
          env.DB.prepare(
            "UPDATE orders SET status = ?, approved_by = COALESCE(?, approved_by), approved_at = ? WHERE id = ?"
          ).bind('processed', approvedBy || null, nowJST, id)
        );
      } else if (status === 'faxed') {
        stmts.push(
          env.DB.prepare(
            "UPDATE orders SET status = ?, faxed_at = ? WHERE id = ?"
          ).bind('faxed', nowJST, id)
        );
      } else if (status) {
        stmts.push(
          env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, id)
        );
      }

      if (memo !== undefined) {
        stmts.push(
          env.DB.prepare("UPDATE orders SET memo = ? WHERE id = ?").bind(memo, id)
        );
      }
    }

    if (stmts.length > 0) {
      await env.DB.batch(stmts);
    }

    // 監査ログ
    await env.DB.prepare(
      "INSERT INTO audit_logs (ip_address, user_agent, action, details) VALUES (?, ?, 'ORDER_STATUS_UPDATED', ?)"
    ).bind(
      clientIp,
      request.headers.get('user-agent') || 'Unknown',
      `Orders [${orderIds.join(',')}] updated to status: ${status}`
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'ステータスを更新しました。' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });

  } catch (err) {
    console.error('API /api/orders PUT error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const orderId = url.searchParams.get('id');

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Order ID is required' }), { status: 400 });
  }

  try {
    await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(orderId).run();
    return new Response(JSON.stringify({ success: true, message: '発注データを削除しました。' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
  }
}
