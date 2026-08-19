import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove unwanted subtitle entirely
html = html.replace(/特別養護老人ホーム シルクロード七福神（.*?）/g, '特別養護老人ホーム シルクロード七福神');

// 2. Warm background
html = html.replace(/class="bg-slate-100 min-h-screen"/g, 'class="bg-[#FBF8F3] min-h-screen text-stone-800"');

// 3. Header warm styling
html = html.replace(/<header className="bg-slate-900 text-white sticky top-0 shadow-lg no-print" style={{zIndex:60}}>/g,
  '<header className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 text-white sticky top-0 shadow-md no-print" style={{zIndex:60}}>');

// 4. Header icon
html = html.replace(/style={{background:'linear-gradient\(135deg,#10b981,#0d9488\)'}}>📋<\/div>/g,
  'className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner text-2xl border border-white/30">🍲</div>');

// 5. Nav tabs container
html = html.replace(/className="flex flex-wrap items-center gap-1\.5 bg-slate-800 p-1\.5 rounded-xl border border-slate-700"/g,
  'className="flex flex-wrap items-center gap-1.5 bg-amber-950/20 backdrop-blur-md p-1.5 rounded-2xl border border-amber-300/20"');

// 6. Nav tabs buttons
html = html.replace(/role === tab\.key \? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700 hover:text-white'/g,
  "role === tab.key ? 'bg-white text-orange-950 shadow-md font-black' : 'text-amber-100 hover:text-white hover:bg-white/10 font-bold'");

// 7. Unit selector
html = html.replace(/currentUnit === u\.name \? 'bg-sky-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'/g,
  "currentUnit === u.name ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md font-black' : 'bg-amber-50/80 text-stone-700 border border-amber-200/70 hover:bg-amber-100/90 font-bold'");

// 8. Unit banner
html = html.replace(/className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4"/g,
  'className="bg-white rounded-3xl p-5 shadow-sm border border-amber-200/70 flex flex-wrap items-center justify-between gap-4"');

// 9. Recall button
html = html.replace(/className="px-3\.5 py-1\.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"/g,
  'className="px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-950 border border-amber-300/80 font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-sm transition-all"');

// 10. Product card styling
html = html.replace(/className={`bg-white rounded-2xl p-5 border transition-all \${totalQty > 0 \? \(isLargeQty \? 'border-amber-500 shadow-lg ring-2 ring-amber-400' : 'border-sky-500 shadow-md'\) : 'border-slate-200'}`}/g,
  "className={`bg-white rounded-3xl p-5 border transition-all ${totalQty > 0 ? (isLargeQty ? 'border-amber-500 shadow-lg ring-2 ring-amber-400 bg-amber-50/30' : 'border-orange-400 shadow-md ring-2 ring-orange-200/50 bg-orange-50/20') : 'border-amber-100/80 hover:border-amber-300 shadow-sm'}`}");

// 11. Steppers (+/-)
html = html.replace(/className="w-8 h-8 bg-sky-600 text-white rounded font-bold hover:bg-sky-700 text-sm"/g,
  'className="w-9 h-9 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-black hover:opacity-90 active:scale-95 shadow-sm text-sm"');
html = html.replace(/className="w-8 h-8 bg-amber-500 text-white rounded font-bold hover:bg-amber-600 text-sm"/g,
  'className="w-9 h-9 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-black hover:opacity-90 active:scale-95 shadow-sm text-sm"');
html = html.replace(/className="w-8 h-8 bg-white rounded border font-bold text-slate-700 hover:bg-slate-100 text-sm"/g,
  'className="w-9 h-9 bg-white rounded-xl border border-stone-200 font-black text-stone-700 hover:bg-stone-50 active:scale-95 shadow-sm text-sm"');

// 12. Submit sidebar
html = html.replace(/className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-5 sticky top-24"/g,
  'className="bg-white rounded-3xl p-6 shadow-md border border-amber-200/80 space-y-5 sticky top-24"');

// 13. Submit button
html = html.replace(/style={{background:'linear-gradient\(90deg,#0284c7,#075985\)'}}/g,
  'className="w-full py-4 text-white font-black text-base rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600"');

// 14. History header banner
html = html.replace(/style={{background:'linear-gradient\(135deg,#4f46e5,#7e22ce\)'}}/g,
  'className="text-white rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800"');

fs.writeFileSync('index.html', html, 'utf8');
fs.writeFileSync('standalone.html', html, 'utf8');
console.log('Warm theme applied successfully!');
