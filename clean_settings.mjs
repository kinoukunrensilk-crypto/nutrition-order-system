import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove spreadsheet from navTabs if present
html = html.replace(/\{\s*key:\s*'sheet'[^}]*\},?/g, '');

// 2. Clean settings header and remove reload button, replace with lock button
html = html.replace(
  /<div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between">[\s\S]*?🔄 スプレッドシートからマスター再読み込み[\s\S]*?<\/button>\s*<\/div>/,
  `<div className="bg-white rounded-3xl p-4 shadow-sm border border-amber-200/70 flex items-center justify-between">
    <span className="text-sm font-bold text-amber-900 flex items-center gap-2">
      <span>🔓</span> <span>マスター管理設定中</span>
    </span>
    <button onClick={() => { setIsSettingsAuth(false); setSettingsPasswordInput(''); showToast('🔒 設定画面をロックしました'); }}
      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition-all shadow-xs">
      🔒 設定をロックして終了
    </button>
  </div>`
);

// 3. Clean setting step tabs (remove step 5)
html = html.replace(
  /\{\s*step:\s*5,\s*label:\s*'🌐 GASシステム接続設定'\s*\},?/g,
  ''
);

// 4. Clean step tab styling to warm orange
html = html.replace(
  /border-sky-600 text-sky-600/g,
  'border-orange-600 text-orange-600'
);

fs.writeFileSync('index.html', html, 'utf8');
fs.writeFileSync('standalone.html', html, 'utf8');
console.log('Cleaned settings & navTabs successfully!');
