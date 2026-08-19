// ==========================================================
// Cloudflare Pages Functions - セキュリティ & 施設IP制限ミドルウェア
// ==========================================================

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // クライアントのグローバルIPアドレスを取得 (Cloudflare専用ヘッダー)
  const clientIp = request.headers.get('cf-connecting-ip') || 
                   request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   '127.0.0.1';

  // 1. IP制限チェック
  // D1データベースまたは環境変数から許可IPリストを取得
  let allowedIps = [];
  try {
    if (env.DB) {
      const setting = await env.DB.prepare("SELECT value FROM settings WHERE key = 'allowed_ips'").first();
      if (setting && setting.value) {
        allowedIps = JSON.parse(setting.value);
      }
    }
  } catch (err) {
    console.warn('[Middleware] DB allowed_ips fetch error:', err);
  }

  // 環境変数 ALLOWED_IPS があれば追加
  if (env.ALLOWED_IPS) {
    const envIps = env.ALLOWED_IPS.split(',').map(s => s.trim()).filter(Boolean);
    allowedIps = [...new Set([...allowedIps, ...envIps])];
  }

  // 許可IPリストが空の場合は「開発/設定中モード」として全アクセス許可
  const isIpRestricted = Array.isArray(allowedIps) && allowedIps.length > 0;
  const isIpAllowed = !isIpRestricted || allowedIps.includes(clientIp) || clientIp === '127.0.0.1';

  // 施設Wi-Fi外からのアクセス拒否処理
  if (!isIpAllowed) {
    // 監査ログに不正アクセス試行を記録
    try {
      if (env.DB) {
        await env.DB.prepare(
          "INSERT INTO audit_logs (ip_address, user_agent, action, details) VALUES (?, ?, ?, ?)"
        ).bind(
          clientIp,
          request.headers.get('user-agent') || 'Unknown',
          'ACCESS_DENIED_IP',
          `Unauthorized access attempt to ${url.pathname}`
        ).run();
      }
    } catch (e) {
      console.error('[Audit Log Error]', e);
    }

    // APIリクエストの場合はJSONで403を返す
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({
        error: 'FORBIDDEN_IP',
        message: '施設のWi-Fi（ネットワーク）からのみアクセスが許可されています。',
        clientIp: clientIp
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      });
    }

    // Web画面アクセスの場合は親切なアクセス制限画面HTMLを返す
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>施設Wi-Fi接続が必要です - 栄養管理物品発注システム</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans JP', sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); max-width: 480px; width: 100%; padding: 32px; text-align: center; border-top: 5px solid #ef4444; }
    .icon { font-size: 52px; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 20px 0; }
    .ip-box { background: #f1f5f9; border-radius: 8px; padding: 12px; font-size: 13px; color: #475569; margin-bottom: 24px; word-break: break-all; }
    .instructions { text-align: left; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; font-size: 13px; color: #1e40af; margin-bottom: 24px; }
    .instructions ol { margin: 8px 0 0 0; padding-left: 20px; }
    .instructions li { margin-bottom: 6px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; padding: 10px 20px; border-radius: 8px; font-size: 14px; transition: background 0.2s; cursor: pointer; border: none; }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">📶🛡️</div>
    <h1>施設のWi-Fi接続が必要です</h1>
    <p>当システムは個人情報保護およびセキュリティのため、<strong>施設内Wi-Fiに接続された端末からのみ</strong>ご利用いただけます。</p>
    
    <div class="instructions">
      <strong>📱 ご利用手順:</strong>
      <ol>
        <li>端末のWi-Fi設定を開く</li>
        <li>施設内のWi-Fiネットワークに接続する</li>
        <li>下の「再読み込み」ボタンを押す</li>
      </ol>
    </div>

    <div class="ip-box">
      現在の接続IP: <strong>${clientIp}</strong><br>
      <span style="font-size:11px;color:#94a3b8">※施設内Wi-Fiに接続してもこの画面が出る場合は、管理者へこのIPをお知らせください。</span>
    </div>

    <button onclick="location.reload()" class="btn">🔄 再読み込み</button>
  </div>
</body>
</html>`;
    return new Response(html, {
      status: 403,
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
  }

  // 2. セキュリティヘッダーの付与
  const response = await next();
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return newResponse;
}
