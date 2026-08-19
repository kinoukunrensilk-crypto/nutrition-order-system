import React from 'react';
import { Wifi, ShieldAlert, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function AccessDenied({ clientIp, onRetry }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border-t-8 border-red-500 p-6 md:p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-500 rounded-full mb-4 ring-8 ring-red-50/50">
          <ShieldAlert className="w-9 h-9" />
        </div>
        
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          施設のWi-Fi接続が必要です
        </h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          本システムは入居者様の情報保護および安全な運用の観点から、<strong>施設内Wi-Fi（認証ネットワーク）に接続された端末からのみ</strong>ご利用いただけます。
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left text-xs text-blue-900 mb-6">
          <div className="font-bold flex items-center gap-1.5 mb-2 text-blue-950 text-sm">
            <Wifi className="w-4 h-4 text-blue-600" /> ご利用の手順
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-blue-800">
            <li>端末の設定から「Wi-Fi」を開く</li>
            <li>施設内Wi-Fiに接続する</li>
            <li>下の「再接続・更新」ボタンを押す</li>
          </ol>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 mb-6">
          現在の接続元IP: <span className="font-mono font-bold text-slate-800">{clientIp || '127.0.0.1'}</span>
        </div>

        <button
          onClick={onRetry || (() => window.location.reload())}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" /> 再接続・画面を更新する
        </button>
      </div>
    </div>
  );
}
