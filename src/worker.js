import { onRequestGet as getInit } from '../functions/api/init.js';
import { 
  onRequestGet as getOrders, 
  onRequestPost as postOrders, 
  onRequestPut as putOrders, 
  onRequestDelete as deleteOrders 
} from '../functions/api/orders.js';
import { 
  onRequestGet as getSettings, 
  onRequestPost as postSettings 
} from '../functions/api/settings.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API エンドポイントルーティング
    if (url.pathname === '/api/init') {
      if (request.method === 'GET') {
        return getInit({ request, env, ctx });
      }
    }

    if (url.pathname === '/api/orders') {
      if (request.method === 'GET') return getOrders({ request, env, ctx });
      if (request.method === 'POST') return postOrders({ request, env, ctx });
      if (request.method === 'PUT' || request.method === 'PATCH') return putOrders({ request, env, ctx });
      if (request.method === 'DELETE') return deleteOrders({ request, env, ctx });
    }

    if (url.pathname === '/api/settings') {
      if (request.method === 'GET') return getSettings({ request, env, ctx });
      if (request.method === 'POST') return postSettings({ request, env, ctx });
    }

    // 静的ファイル (SPA HTML/CSS/JS) 配信
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
