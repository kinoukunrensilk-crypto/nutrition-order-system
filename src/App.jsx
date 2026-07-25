import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  UserCheck, 
  Settings, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  Send, 
  Printer, 
  Plus, 
  Minus, 
  Search, 
  Sparkles, 
  Check, 
  X, 
  FileSpreadsheet, 
  Database, 
  ClipboardList,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Award,
  Users,
  User,
  FileText,
  MessageSquare,
  EyeOff,
  Edit2,
  Calendar,
  ExternalLink,
  Link,
  Copy,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  History,
  Download,
  Lock,
  KeyRound
} from 'lucide-react';

// ===== JST日時ヘルパー =====
const getNowJST = () => {
  return new Date().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

const getTodayJST = () => {
  const now = new Date();
  const m = now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric' });
  const d = now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', day: 'numeric' });
  return `${m}月${d}日`;
};

export default function App() {
  const [role, setRole] = useState('staff');
  const [settingStep, setSettingStep] = useState(1);

  const REAL_UNITS = ['2W', '2E', '3W', '3E', '4W', '4E', '5W', '5E', 'その他'];

  const REAL_VENDORS = [
    { id: 1, name: 'アサヒ物産株式会社', fax: '099-245-6556', contact: '担当様' },
    { id: 2, name: '藤安醸造株式会社', fax: '099-262-1357', contact: '担当様' },
    { id: 3, name: '有限会社 山口米店', fax: '0995-43-1789', contact: '担当様' }
  ];

  const REAL_PRODUCTS = [
    { id: 101, name: 'ソフティアS', unit: '個', vendorId: 1, isToromi: true, allowPersonal: true, allowFacility: true },
    { id: 102, name: 'つるりんこ Quickly (800g/袋)', unit: '袋', vendorId: 1, isToromi: true, allowPersonal: true, allowFacility: true },
    { id: 103, name: 'とろみ調整 つるりんこ (3g×50本/箱)', unit: '箱', vendorId: 1, isToromi: true, allowPersonal: true, allowFacility: true },
    { id: 201, name: 'だしするが', unit: '個', vendorId: 1, isToromi: false, allowPersonal: false, allowFacility: true },
    { id: 202, name: 'ふりかけ大袋', unit: '袋', vendorId: 1, isToromi: false, allowPersonal: true, allowFacility: true },
    { id: 203, name: 'イオンサポート桃', unit: '個', vendorId: 1, isToromi: false, allowPersonal: true, allowFacility: true },
    { id: 204, name: 'イオンサポートりんご', unit: '個', vendorId: 1, isToromi: false, allowPersonal: true, allowFacility: true },
    { id: 301, name: '濃口醤油 1.8ℓ', unit: '本', vendorId: 2, isToromi: false, allowPersonal: false, allowFacility: true },
    { id: 302, name: '薄口醤油 1.8ℓ', unit: '本', vendorId: 2, isToromi: false, allowPersonal: false, allowFacility: true },
    { id: 303, name: 'すり味噌', unit: '個', vendorId: 2, isToromi: false, allowPersonal: false, allowFacility: true },
    { id: 401, name: '無洗米・精米', unit: 'kg', vendorId: 3, isToromi: false, allowPersonal: false, allowFacility: true }
  ];

  const [systemSettings, setSystemSettings] = useState({
    nutritionists: ['野元 史彦', '管理栄養士2'],
    deadlineTime: '14:00',
    orderDaysList: { '月': true, '火': true, '水': true, '木': true, '金': true, '土': true, '日': false },
    units: REAL_UNITS,
    vendors: REAL_VENDORS,
    products: REAL_PRODUCTS
  });

  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbzBGq2YJLKiA5xBQh6eR26RmVmr32mgFVcSmdoq8ApclICp-dqPwxS4llehwvw20XIUSg/exec';

  const [gasUrl, setGasUrl] = useState(
    localStorage.getItem('NUTRITION_GAS_URL') || DEFAULT_GAS_URL
  );
  const [isSavingGasUrl, setIsSavingGasUrl] = useState(false);
  const [isSendingToSheet, setIsSendingToSheet] = useState(false);

  const [newNutritionist, setNewNutritionist] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newVendor, setNewVendor] = useState({ name: '', fax: '', contact: '' });
  const [newProduct, setNewProduct] = useState({ 
    name: '', unit: '個', vendorId: 1, isToromi: false, allowPersonal: true, allowFacility: true 
  });

  const [currentUnit, setCurrentUnit] = useState('2W');
  const [selectedApprover, setSelectedApprover] = useState('野元 史彦');

  // サンプルデータ（デモ用）
  const [unitData, setUnitData] = useState({
    '2W': {
      cart: {
        101: { facilityQty: 0, personalQty: 1, personalNames: '山田 太郎様' },
        201: { facilityQty: 2, personalQty: 0, personalNames: '' },
        203: { facilityQty: 3, personalQty: 0, personalNames: '' }
      },
      memo: '【2W申送り】山田様食欲低下のためイオンサポート多めに申請します。',
      staffName: '佐藤 健太',
      submittedAt: ''
    },
    '2E': {
      cart: {
        102: { facilityQty: 1, personalQty: 1, personalNames: '佐藤 花子様' },
        202: { facilityQty: 2, personalQty: 0, personalNames: '' }
      },
      memo: '2Eユニットの補充用トロミ剤です。',
      staffName: '田中 美咲',
      submittedAt: ''
    },
    '3W': {
      cart: {
        103: { facilityQty: 1, personalQty: 0, personalNames: '' },
        301: { facilityQty: 2, personalQty: 0, personalNames: '' },
        204: { facilityQty: 5, personalQty: 0, personalNames: '' }
      },
      memo: '3W食堂用の醤油とゼリーです。',
      staffName: '鈴木 大輔',
      submittedAt: ''
    },
    '3E': {
      cart: {
        401: { facilityQty: 30, personalQty: 0, personalNames: '' },
        302: { facilityQty: 1, personalQty: 0, personalNames: '' },
        303: { facilityQty: 2, personalQty: 0, personalNames: '' }
      },
      memo: '3E用無洗米30kgと薄口醤油・お味噌の追加です。',
      staffName: '高橋 涼子',
      submittedAt: ''
    },
    '4W': {
      cart: {
        401: { facilityQty: 40, personalQty: 0, personalNames: '' },
        301: { facilityQty: 2, personalQty: 0, personalNames: '' },
        101: { facilityQty: 0, personalQty: 2, personalNames: '中村 雅人様' }
      },
      memo: '4W中村様のソフティア個人分2個です。',
      staffName: '木村 次郎',
      submittedAt: ''
    },
    '4E': {
      cart: {
        102: { facilityQty: 2, personalQty: 0, personalNames: '' },
        202: { facilityQty: 0, personalQty: 1, personalNames: '小林 節子様' }
      },
      memo: '小林様ご所望のふりかけ大袋個人購入です。',
      staffName: '加藤 恵',
      submittedAt: ''
    },
    '5W': {
      cart: {
        203: { facilityQty: 4, personalQty: 0, personalNames: '' },
        204: { facilityQty: 4, personalQty: 0, personalNames: '' }
      },
      memo: '水分補給用イオンサポート各4個。',
      staffName: '渡辺 誠',
      submittedAt: ''
    },
    '5E': {
      cart: {
        401: { facilityQty: 30, personalQty: 0, personalNames: '' },
        301: { facilityQty: 1, personalQty: 0, personalNames: '' }
      },
      memo: '5Eお米と醤油です。',
      staffName: '山本 愛',
      submittedAt: ''
    }
  });

  // 発注履歴（localStorage永続化）
  const [orderHistory, setOrderHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('NUTRITION_ORDER_HISTORY') || '[]');
    } catch { return []; }
  });
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  // 設定画面のパスワード保護用state (暗証番号: eiyou0729)
  const [isSettingsAuth, setIsSettingsAuth] = useState(false);
  const [settingsPasswordInput, setSettingsPasswordInput] = useState('');
  const [settingsAuthError, setSettingsAuthError] = useState('');

  const handleSettingsAuthSubmit = (e) => {
    if (e) e.preventDefault();
    if (settingsPasswordInput === 'eiyou0729') {
      setIsSettingsAuth(true);
      setSettingsAuthError('');
      showToast('🔓 設定画面のロックを解除しました');
    } else {
      setSettingsAuthError('パスワードが正しくありません');
    }
  };

  // ===== トースト通知（タイマー衝突修正済み）=====
  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 4000);
  };

  // ===== GAS URL保存 =====
  const handleSaveGasUrl = () => {
    setIsSavingGasUrl(true);
    localStorage.setItem('NUTRITION_GAS_URL', gasUrl);
    setTimeout(() => {
      setIsSavingGasUrl(false);
      showToast('✅ Google Apps Script Web App URL を保存しました！');
    }, 500);
  };

  // ===== GASへ送信ヘルパー（ハイブリッド100%書き込み仕様） =====
  const sendToGAS = async (items) => {
    if (!gasUrl) return;
    const payloadStr = JSON.stringify({ action: 'bulkSubmit', items });

    // 1. POST 送信
    try {
      await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payloadStr,
        mode: 'no-cors'
      });
    } catch (e) { console.log('POST error', e); }

    // 2. GET フォールバック（CORSを完全に回避する確実なバックアップ送信）
    try {
      const getUrl = `${gasUrl}?payload=${encodeURIComponent(payloadStr)}`;
      const img = new Image();
      img.src = getUrl;
    } catch (e) { console.log('GET fallback error', e); }
  };

  // ===== 全データをスプレッドシートへ一括送信 =====
  const handleBulkSendToSheet = async () => {
    setIsSendingToSheet(true);
    const allFlatItems = [];
    Object.entries(unitData).forEach(([uKey, uVal]) => {
      Object.entries(uVal.cart || {}).forEach(([pId, item]) => {
        const p = systemSettings.products.find(prod => prod.id === parseInt(pId));
        if (p) {
          if (item.facilityQty > 0) {
            allFlatItems.push({
              time: uVal.submittedAt || getNowJST(), unit: uKey, staffName: uVal.staffName,
              productName: p.name, facilityQty: item.facilityQty, personalQty: 0,
              note: uKey, memo: uVal.memo
            });
          }
          if (item.personalQty > 0) {
            allFlatItems.push({
              time: uVal.submittedAt || getNowJST(), unit: uKey, staffName: uVal.staffName,
              productName: p.name, facilityQty: 0, personalQty: item.personalQty,
              note: `${uKey} (${item.personalNames || '個人購入'})`, memo: uVal.memo
            });
          }
        }
      });
    });

    // 履歴データも含める
    orderHistory.forEach(entry => {
      (entry.items || []).forEach(item => {
        allFlatItems.push(item);
      });
    });

    await sendToGAS(allFlatItems);
    showToast(`✅ 全${allFlatItems.length}件をGoogleスプレッドシートへ送信しました！`);
    setIsSendingToSheet(false);
  };

  // ===== カート操作関数群 =====
  const currentUnitState = unitData[currentUnit] || { cart: {}, memo: '', staffName: '', submittedAt: '' };

  const updateItemQty = (productId, field, delta) => {
    setUnitData(prev => {
      const unitInfo = prev[currentUnit] || { cart: {}, memo: '', staffName: '' };
      const currentItem = unitInfo.cart[productId] || { facilityQty: 0, personalQty: 0, personalNames: '' };
      const nextQty = Math.max(0, currentItem[field] + delta);
      const updatedItem = { ...currentItem, [field]: nextQty };
      const newCart = { ...unitInfo.cart };
      if (updatedItem.facilityQty === 0 && updatedItem.personalQty === 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = updatedItem;
      }
      return { ...prev, [currentUnit]: { ...unitInfo, cart: newCart } };
    });
  };

  const updatePersonalNames = (productId, text) => {
    setUnitData(prev => {
      const unitInfo = prev[currentUnit] || { cart: {}, memo: '', staffName: '' };
      const currentItem = unitInfo.cart[productId] || { facilityQty: 0, personalQty: 0, personalNames: '' };
      return {
        ...prev,
        [currentUnit]: {
          ...unitInfo,
          cart: { ...unitInfo.cart, [productId]: { ...currentItem, personalNames: text } }
        }
      };
    });
  };

  const updateUnitMemo = (text) => {
    setUnitData(prev => ({
      ...prev,
      [currentUnit]: { ...(prev[currentUnit] || { cart: {}, staffName: '' }), memo: text }
    }));
  };

  const updateUnitStaffName = (text) => {
    setUnitData(prev => ({
      ...prev,
      [currentUnit]: { ...(prev[currentUnit] || { cart: {}, memo: '' }), staffName: text }
    }));
  };

  // ===== 設定画面ハンドラー群 =====
  const handleAddNutritionist = () => {
    if (!newNutritionist) return;
    setSystemSettings(prev => ({ ...prev, nutritionists: [...prev.nutritionists, newNutritionist] }));
    setNewNutritionist('');
    showToast('管理栄養士様を追加しました！');
  };

  const handleDeleteNutritionist = (idx) => {
    setSystemSettings(prev => ({ ...prev, nutritionists: prev.nutritionists.filter((_, i) => i !== idx) }));
    showToast('管理栄養士様を削除しました。');
  };

  const toggleDay = (day) => {
    setSystemSettings(prev => ({
      ...prev,
      orderDaysList: { ...prev.orderDaysList, [day]: !prev.orderDaysList[day] }
    }));
    showToast(`${day}曜日の設定を変更しました。`);
  };

  const handleAddUnit = () => {
    if (!newUnitName) return;
    setSystemSettings(prev => ({ ...prev, units: [...prev.units, newUnitName] }));
    setNewUnitName('');
    showToast('ユニットを追加しました！');
  };

  const handleDeleteUnit = (idx) => {
    setSystemSettings(prev => ({ ...prev, units: prev.units.filter((_, i) => i !== idx) }));
    showToast('ユニットを削除しました。');
  };

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.fax) {
      alert('業者名とFAX番号を入力してください。');
      return;
    }
    const created = { id: Date.now(), ...newVendor };
    setSystemSettings(prev => ({ ...prev, vendors: [...prev.vendors, created] }));
    setNewVendor({ name: '', fax: '', contact: '' });
    showToast('新しい発注先業者を追加しました！');
  };

  const handleDeleteVendor = (vendorId) => {
    setSystemSettings(prev => ({ ...prev, vendors: prev.vendors.filter(v => v.id !== vendorId) }));
    showToast('業者を削除しました。');
  };

  const toggleProductPermission = (productId, field) => {
    setSystemSettings(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === productId ? { ...p, [field]: !p[field] } : p)
    }));
    showToast('購入区分の設定を更新しました。');
  };

  const handleDeleteProduct = (productId) => {
    if (confirm('この商品をリストから削除しますか？')) {
      setSystemSettings(prev => ({ ...prev, products: prev.products.filter(p => p.id !== productId) }));
      showToast('商品を削除しました。');
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name) {
      alert('商品名を入力してください。');
      return;
    }
    const isToromiName = newProduct.name.includes('とろみ') || newProduct.name.includes('トロミ') || newProduct.name.includes('ソフティア');
    const created = { id: Date.now(), ...newProduct, isToromi: isToromiName || newProduct.isToromi };
    setSystemSettings(prev => {
      let updatedList = [...prev.products];
      if (created.isToromi) { updatedList.unshift(created); } else { updatedList.push(created); }
      return { ...prev, products: updatedList };
    });
    setNewProduct({ name: '', unit: '個', vendorId: systemSettings.vendors[0]?.id || 1, isToromi: false, allowPersonal: true, allowFacility: true });
    showToast('新規商品を追加しました！');
  };

  // ===== 発注送信（実動作）=====
  const handleSubmitOrder = async () => {
    const cart = unitData[currentUnit]?.cart || {};
    const items = Object.entries(cart).filter(([_, item]) => item.facilityQty + item.personalQty > 0);
    if (items.length === 0) {
      showToast('⚠️ カートに商品がありません。商品を追加してください。');
      return;
    }

    const now = getNowJST();
    const staffName = unitData[currentUnit]?.staffName || '';
    const memo = unitData[currentUnit]?.memo || '';

    if (!staffName.trim()) {
      showToast('⚠️ 発注担当者名を入力してください。');
      return;
    }

    // フラットデータ生成
    const flatItems = [];
    items.forEach(([pId, item]) => {
      const p = systemSettings.products.find(prod => prod.id === parseInt(pId));
      if (!p) return;
      if (item.facilityQty > 0) {
        flatItems.push({
          time: now, unit: currentUnit, staffName, productName: p.name,
          productUnit: p.unit,
          facilityQty: item.facilityQty, personalQty: 0,
          note: currentUnit, memo
        });
      }
      if (item.personalQty > 0) {
        flatItems.push({
          time: now, unit: currentUnit, staffName, productName: p.name,
          productUnit: p.unit,
          facilityQty: 0, personalQty: item.personalQty,
          note: `${currentUnit} (${item.personalNames || '個人購入'})`, memo
        });
      }
    });

    // 履歴へ追加
    const newEntry = {
      id: Date.now(),
      submittedAt: now,
      unit: currentUnit,
      staffName,
      memo,
      items: flatItems,
      status: '申請中'
    };
    const updatedHistory = [newEntry, ...orderHistory];
    setOrderHistory(updatedHistory);
    localStorage.setItem('NUTRITION_ORDER_HISTORY', JSON.stringify(updatedHistory));

    // GASへ送信
    await sendToGAS(flatItems);

    // カートクリア
    setUnitData(prev => ({
      ...prev,
      [currentUnit]: { cart: {}, memo: '', staffName: '', submittedAt: '' }
    }));

    showToast(`✅ ${currentUnit}ユニットの発注（${flatItems.length}件）を送信しました！`);
  };

  // ===== 履歴クリア =====
  const handleClearHistory = () => {
    if (confirm('発注履歴をすべてクリアしますか？この操作は元に戻せません。')) {
      setOrderHistory([]);
      localStorage.removeItem('NUTRITION_ORDER_HISTORY');
      showToast('発注履歴をクリアしました。');
    }
  };

  // ===== FAX関連 =====
  const getOrdersForVendor = (vendorId) => {
    const list = [];
    // unitDataから取得（現在のカート）
    Object.entries(unitData).forEach(([uKey, uVal]) => {
      Object.entries(uVal.cart || {}).forEach(([pId, item]) => {
        const p = systemSettings.products.find(prod => prod.id === parseInt(pId));
        if (p && p.vendorId === vendorId) {
          if (item.facilityQty > 0) {
            list.push({ name: p.name, qty: item.facilityQty, unit: p.unit, note: `${uKey}`, unitName: uKey });
          }
          if (item.personalQty > 0) {
            const pNote = item.personalNames || '個人購入';
            list.push({ name: p.name, qty: item.personalQty, unit: p.unit, note: `${uKey} (${pNote})`, unitName: uKey });
          }
        }
      });
    });
    // 履歴の申請中データからも取得
    orderHistory.filter(h => h.status === '申請中').forEach(entry => {
      (entry.items || []).forEach(item => {
        const p = systemSettings.products.find(prod => prod.name === item.productName);
        if (p && p.vendorId === vendorId) {
          if (item.facilityQty > 0) {
            list.push({ name: item.productName, qty: item.facilityQty, unit: p.unit, note: item.note || item.unit, unitName: item.unit });
          }
          if (item.personalQty > 0) {
            list.push({ name: item.productName, qty: item.personalQty, unit: p.unit, note: item.note || item.unit, unitName: item.unit });
          }
        }
      });
    });
    return list;
  };

  const currentFaxVendor = systemSettings.vendors.find(v => v.id === selectedFaxVendorId) || systemSettings.vendors[0];
  const currentFaxOrders = getOrdersForVendor(selectedFaxVendorId);
  const totalFaxQuantity = currentFaxOrders.reduce((sum, ord) => sum + ord.qty, 0);
  const mainUnitLabel = currentFaxOrders.length > 0 ? currentFaxOrders[0].unit : '個';
  const showTotalRow = currentFaxVendor.name.includes('山口米店') || currentFaxVendor.name.includes('藤安醸造');

  // PDF印刷
  const handlePrintFax = () => {
    window.print();
  };

  // ===== スプレッドシート表示用データ =====
  const allFlatSheetRows = [];
  Object.entries(unitData).forEach(([uKey, uVal]) => {
    Object.entries(uVal.cart || {}).forEach(([pId, item]) => {
      const p = systemSettings.products.find(prod => prod.id === parseInt(pId));
      if (p) {
        if (item.facilityQty > 0) {
          allFlatSheetRows.push({
            time: uVal.submittedAt || '(未送信)', unit: uKey, staff: uVal.staffName,
            productName: p.name, facilityQty: `${item.facilityQty} ${p.unit}`,
            personalQty: '0', note: uKey, memo: uVal.memo
          });
        }
        if (item.personalQty > 0) {
          allFlatSheetRows.push({
            time: uVal.submittedAt || '(未送信)', unit: uKey, staff: uVal.staffName,
            productName: p.name, facilityQty: '0',
            personalQty: `${item.personalQty} ${p.unit}`,
            note: `${uKey} (${item.personalNames || '個人購入'})`, memo: uVal.memo
          });
        }
      }
    });
  });
  // 履歴データも追加
  orderHistory.forEach(entry => {
    (entry.items || []).forEach(item => {
      allFlatSheetRows.push({
        time: item.time, unit: item.unit, staff: item.staffName,
        productName: item.productName,
        facilityQty: item.facilityQty > 0 ? `${item.facilityQty} ${item.productUnit || ''}` : '0',
        personalQty: item.personalQty > 0 ? `${item.personalQty} ${item.productUnit || ''}` : '0',
        note: item.note, memo: item.memo
      });
    });
  });

  // ===== JSX レンダリング =====
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-bounce no-print">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">栄養管理物品発注システム</h1>
                <p className="text-xs text-slate-400">特別養護老人ホーム シルクロード七福神</p>
              </div>
            </div>

            {/* Navigation Tabs - 5つ */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 space-x-1">
              {[
                { key: 'staff', icon: <Building2 className="w-4 h-4" />, label: '🏢 ユニット発注' },
                { key: 'nutritionist', icon: <UserCheck className="w-4 h-4" />, label: '👩‍⚕️ 承認 & PDF' },
                { key: 'history', icon: <History className="w-4 h-4" />, label: '📋 発注履歴' },
                { key: 'sheet', icon: <FileSpreadsheet className="w-4 h-4" />, label: '📊 スプレッドシート' },
                { key: 'settings', icon: <Settings className="w-4 h-4" />, label: '⚙️ 設定' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setRole(tab.key)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    role === tab.key ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}>
                  {tab.icon}<span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">

        {/* ========== MODE: ユニット発注入力 ========== */}
        {role === 'staff' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Building2 className="w-4 h-4 text-sky-600" /><span>発注入力中ユニット:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {systemSettings.units.map(u => (
                    <button key={u} onClick={() => setCurrentUnit(u)} className={`px-3 py-1 rounded-xl text-xs font-bold ${currentUnit === u ? 'bg-sky-600 text-white shadow' : 'bg-slate-100 text-slate-600'}`}>{u}</button>
                  ))}
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">【{currentUnit}】専用発注画面</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 商品リスト */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">[{currentUnit} ユニット] 発注商品リスト</h3>
                {systemSettings.products.map(product => {
                  const currentCart = currentUnitState.cart || {};
                  const item = currentCart[product.id] || { facilityQty: 0, personalQty: 0, personalNames: '' };
                  const totalQty = item.facilityQty + item.personalQty;
                  return (
                    <div key={product.id} className={`bg-white rounded-2xl p-4 border ${totalQty > 0 ? 'border-sky-500 shadow-md' : 'border-slate-200'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{product.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">発注先: {systemSettings.vendors.find(v => v.id === product.vendorId)?.name || '未設定'}</p>
                        </div>
                        {totalQty > 0 && <span className="px-3 py-1 text-xs font-bold bg-sky-600 text-white rounded-full">合計 {totalQty} {product.unit}</span>}
                      </div>
                      <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-4">
                        {product.allowFacility ? (
                          <div className="bg-sky-50 rounded-xl p-3 border flex justify-between items-center">
                            <span className="text-xs font-bold text-sky-900">施設分</span>
                            <div className="flex items-center space-x-2">
                              <button onClick={() => updateItemQty(product.id, 'facilityQty', -1)} className="w-7 h-7 bg-white rounded border font-bold">-</button>
                              <span className="w-8 text-center text-xs font-bold">{item.facilityQty}</span>
                              <button onClick={() => updateItemQty(product.id, 'facilityQty', 1)} className="w-7 h-7 bg-sky-600 text-white rounded font-bold">+</button>
                            </div>
                          </div>
                        ) : <div className="bg-slate-50 p-3 rounded text-center text-xs text-slate-400 font-bold">施設分不可</div>}
                        {product.allowPersonal ? (
                          <div className="bg-amber-50 rounded-xl p-3 border flex justify-between items-center">
                            <span className="text-xs font-bold text-amber-900">個人分</span>
                            <div className="flex items-center space-x-2">
                              <button onClick={() => updateItemQty(product.id, 'personalQty', -1)} className="w-7 h-7 bg-white rounded border font-bold">-</button>
                              <span className="w-8 text-center text-xs font-bold">{item.personalQty}</span>
                              <button onClick={() => updateItemQty(product.id, 'personalQty', 1)} className="w-7 h-7 bg-amber-500 text-white rounded font-bold">+</button>
                            </div>
                          </div>
                        ) : <div className="bg-slate-50 p-3 rounded text-center text-xs text-slate-400 font-bold">個人分不可</div>}
                      </div>
                      {/* 個人購入者名入力 */}
                      {item.personalQty > 0 && (
                        <div className="mt-3">
                          <label className="text-xs font-bold text-amber-800 block mb-1">個人購入者名（FAX備考欄に印字）</label>
                          <input type="text" value={item.personalNames} onChange={(e) => updatePersonalNames(product.id, e.target.value)}
                            placeholder="例：山田 太郎様" className="w-full p-2.5 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 右サイドバー：担当者名・メモ・送信 */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4 sticky top-20">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-3">発注申請 ({currentUnit})</h3>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">発注担当者名 <span className="text-red-500">*</span></label>
                    <input type="text" value={currentUnitState.staffName || ''} onChange={(e) => updateUnitStaffName(e.target.value)}
                      placeholder="例：佐藤 健太" className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">申送りメモ（栄養士への連絡事項）</label>
                    <textarea value={currentUnitState.memo || ''} onChange={(e) => updateUnitMemo(e.target.value)}
                      placeholder="例：山田様食欲低下のためイオンサポート多めに…" rows={3}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border">
                    <h4 className="text-xs font-bold text-slate-600 mb-2">カート内容</h4>
                    {Object.entries(currentUnitState.cart || {}).filter(([_, it]) => it.facilityQty + it.personalQty > 0).length === 0 ? (
                      <p className="text-xs text-slate-400">商品が追加されていません</p>
                    ) : (
                      <ul className="space-y-1">
                        {Object.entries(currentUnitState.cart || {}).filter(([_, it]) => it.facilityQty + it.personalQty > 0).map(([pId, it]) => {
                          const p = systemSettings.products.find(pr => pr.id === parseInt(pId));
                          return p ? (
                            <li key={pId} className="text-xs text-slate-700 flex justify-between">
                              <span className="truncate">{p.name}</span>
                              <span className="font-bold whitespace-nowrap ml-2">{it.facilityQty + it.personalQty} {p.unit}</span>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    )}
                  </div>

                  <button onClick={handleSubmitOrder}
                    className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all">
                    <Send className="w-4 h-4" />
                    <span>[{currentUnit}] の発注を送信する</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">送信後、カートはクリアされます。履歴は「📋 発注履歴」タブで確認できます。</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== MODE: 管理栄養士承認 & PDF ========== */}
        {role === 'nutritionist' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span>管理栄養士 ダッシュボード・申請承認 & PDF出力</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">全ユニットから届いた申請明細です。</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-600">承認者:</label>
                    <select value={selectedApprover} onChange={(e) => setSelectedApprover(e.target.value)}
                      className="p-1.5 text-xs rounded-lg border border-slate-300 font-bold">
                      {systemSettings.nutritionists.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <button onClick={() => { setShowFaxModal(true); setFaxStatus('preview'); }}
                    className="px-6 py-3 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 rounded-xl shadow-lg flex items-center space-x-2">
                    <Printer className="w-4 h-4" /><span>FAX注文票 PDF出力画面を開く</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>本日届いている全ユニットからの申請一覧</span>
              </h3>
              <div className="space-y-4">
                {Object.entries(unitData).map(([unitKey, uData]) => {
                  const cartItems = Object.entries(uData.cart || {}).filter(([_, item]) => (item.facilityQty + item.personalQty) > 0);
                  if (cartItems.length === 0) return null;
                  return (
                    <div key={unitKey} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-xl">{unitKey} ユニット</span>
                          <span className="text-xs font-bold text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-lg">発注担当: {uData.staffName || '(未入力)'}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">ステータス: 未送信（カート内）</span>
                      </div>
                      <table className="w-full text-left text-xs bg-white rounded-xl border">
                        <thead>
                          <tr className="bg-slate-100 font-bold text-slate-700 border-b">
                            <th className="p-2.5">申請商品名</th>
                            <th className="p-2.5 text-center">施設分</th>
                            <th className="p-2.5 text-center">個人分</th>
                            <th className="p-2.5 text-center">合計</th>
                            <th className="p-2.5">個人購入名メモ</th>
                            <th className="p-2.5">振分先業者</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {cartItems.map(([prodId, item]) => {
                            const p = systemSettings.products.find(prod => prod.id === parseInt(prodId));
                            if (!p) return null;
                            const v = systemSettings.vendors.find(ven => ven.id === p.vendorId);
                            return (
                              <tr key={prodId} className="hover:bg-slate-50">
                                <td className="p-2.5 font-bold text-slate-800">{p.name}</td>
                                <td className="p-2.5 text-center font-bold text-sky-700">{item.facilityQty > 0 ? `${item.facilityQty} ${p.unit}` : '-'}</td>
                                <td className="p-2.5 text-center font-bold text-amber-700">{item.personalQty > 0 ? `${item.personalQty} ${p.unit}` : '-'}</td>
                                <td className="p-2.5 text-center font-bold bg-slate-100">{item.facilityQty + item.personalQty} {p.unit}</td>
                                <td className="p-2.5">{item.personalNames ? <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border rounded font-bold text-[11px]">{item.personalNames}</span> : '-'}</td>
                                <td className="p-2.5 text-slate-600 font-medium">{v ? v.name : '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {uData.memo && (
                        <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                          <span className="font-bold">📝 申送りメモ: </span>{uData.memo}
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* 履歴から申請中のものも表示 */}
                {orderHistory.filter(h => h.status === '申請中').map(entry => (
                  <div key={entry.id} className="border border-emerald-300 rounded-2xl p-4 bg-emerald-50/50 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-emerald-800 text-white font-bold text-xs rounded-xl">{entry.unit} ユニット</span>
                        <span className="text-xs font-bold text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-lg">発注担当: {entry.staffName}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">送信済み: {entry.submittedAt}</span>
                    </div>
                    <table className="w-full text-left text-xs bg-white rounded-xl border">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-700 border-b">
                          <th className="p-2.5">商品名</th>
                          <th className="p-2.5 text-center">施設分</th>
                          <th className="p-2.5 text-center">個人分</th>
                          <th className="p-2.5">備考</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(entry.items || []).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-800">{item.productName}</td>
                            <td className="p-2.5 text-center font-bold text-sky-700">{item.facilityQty > 0 ? item.facilityQty : '-'}</td>
                            <td className="p-2.5 text-center font-bold text-amber-700">{item.personalQty > 0 ? item.personalQty : '-'}</td>
                            <td className="p-2.5 text-slate-600">{item.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== MODE: 発注履歴 ========== */}
        {role === 'history' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <History className="w-6 h-6 text-indigo-200" />
                  <h2 className="text-lg font-bold">発注履歴（全{orderHistory.length}件）</h2>
                </div>
                <p className="text-xs text-indigo-100">送信済みの発注がすべて時系列で表示されます。ブラウザを閉じても保存されます。</p>
              </div>
              {orderHistory.length > 0 && (
                <button onClick={handleClearHistory}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all">
                  <Trash2 className="w-4 h-4" /><span>履歴をクリア</span>
                </button>
              )}
            </div>

            {orderHistory.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border text-center space-y-4">
                <History className="w-16 h-16 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-600">発注履歴はまだありません</h3>
                <p className="text-sm text-slate-400">「🏢 ユニット発注」タブから発注を送信すると、ここに履歴が表示されます。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderHistory.map(entry => (
                  <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <button onClick={() => setExpandedHistoryId(expandedHistoryId === entry.id ? null : entry.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-all text-left">
                      <div className="flex items-center space-x-4">
                        <span className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl">{entry.unit}</span>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{entry.staffName}　<span className="text-xs text-slate-400 font-normal">({entry.items?.length || 0}品目)</span></p>
                          <p className="text-xs text-slate-500">{entry.submittedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          entry.status === '申請中' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          entry.status === '承認済' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}>{entry.status}</span>
                        {expandedHistoryId === entry.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </button>
                    {expandedHistoryId === entry.id && (
                      <div className="border-t p-4 bg-slate-50/50 space-y-3">
                        {entry.memo && (
                          <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                            <span className="font-bold">📝 申送りメモ: </span>{entry.memo}
                          </div>
                        )}
                        <table className="w-full text-left text-xs bg-white rounded-xl border">
                          <thead>
                            <tr className="bg-slate-100 font-bold text-slate-700 border-b">
                              <th className="p-2.5">商品名</th>
                              <th className="p-2.5 text-center">施設分</th>
                              <th className="p-2.5 text-center">個人分</th>
                              <th className="p-2.5">FAX備考</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(entry.items || []).map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2.5 font-bold text-slate-800">{item.productName}</td>
                                <td className="p-2.5 text-center font-bold text-sky-700">{item.facilityQty > 0 ? item.facilityQty : '-'}</td>
                                <td className="p-2.5 text-center font-bold text-amber-700">{item.personalQty > 0 ? item.personalQty : '-'}</td>
                                <td className="p-2.5 text-slate-600">{item.note}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== MODE: スプレッドシート ========== */}
        {role === 'sheet' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
                  <h2 className="text-lg font-bold">Googleスプレッドシートデータ連携 (全{allFlatSheetRows.length}件)</h2>
                </div>
                <p className="text-xs text-emerald-100">発注データがGoogleスプレッドシートに同期・記録されます。</p>
              </div>
              <button onClick={handleBulkSendToSheet} disabled={isSendingToSheet}
                className="px-6 py-3.5 bg-white hover:bg-slate-100 text-emerald-900 font-bold text-xs rounded-2xl shadow-lg flex items-center space-x-2 transition-all transform hover:scale-105">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                <span>全{allFlatSheetRows.length}件をGoogleスプレッドシートへ同期送信</span>
              </button>
            </div>

            {/* GAS URL 設定 */}
            <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-emerald-500 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold"><Link className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Google Apps Script (GAS) Webアプリ URL 設定</h3>
                  <p className="text-xs text-slate-500">URLを入力すると、発注送信時に自動でスプレッドシートへ書き込まれます。</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="text" value={gasUrl} onChange={(e) => setGasUrl(e.target.value)}
                  placeholder="例: https://script.google.com/macros/s/AKfycbx.../exec"
                  className="flex-1 p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium" />
                <button onClick={handleSaveGasUrl} disabled={isSavingGasUrl}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1">
                  <Check className="w-4 h-4" /><span>URLを保存</span>
                </button>
              </div>
            </div>

            {/* データ一覧表 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-600" /><span>発注データ一覧</span>
                </h3>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                  全 {allFlatSheetRows.length} 行
                </span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-emerald-800 text-white font-bold border-b border-emerald-900">
                      <th className="p-3">入力日時</th>
                      <th className="p-3">ユニット</th>
                      <th className="p-3">発注担当者</th>
                      <th className="p-3">商品名</th>
                      <th className="p-3 text-center">施設分</th>
                      <th className="p-3 text-center">個人分</th>
                      <th className="p-3">FAX印字備考 (納品先)</th>
                      <th className="p-3 text-amber-200">申送りメモ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {allFlatSheetRows.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white hover:bg-emerald-50/50' : 'bg-slate-50/70 hover:bg-emerald-50/50'}>
                        <td className="p-3 font-bold text-emerald-900">{row.time}</td>
                        <td className="p-3 font-bold text-slate-800"><span className="px-2 py-0.5 bg-slate-900 text-white rounded">{row.unit}</span></td>
                        <td className="p-3 font-bold text-sky-900">{row.staff}</td>
                        <td className="p-3 font-bold text-slate-900">{row.productName}</td>
                        <td className="p-3 text-center font-bold text-sky-700">{row.facilityQty}</td>
                        <td className="p-3 text-center font-bold text-amber-700">{row.personalQty}</td>
                        <td className="p-3 font-bold text-slate-900">
                          {row.note && row.note.includes('(') ? <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold">{row.note}</span> : row.note}
                        </td>
                        <td className="p-3 text-amber-900 text-[11px] max-w-xs truncate">{row.memo || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========== MODE: 設定画面 ステップ1〜4 ========== */}
        {role === 'settings' && (
          !isSettingsAuth ? (
            <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">⚙️ 設定画面の認証保護</h3>
                <p className="text-xs text-slate-500">管理者・管理栄養士専用エリアです。パスワードを入力してください。</p>
              </div>
              <form onSubmit={handleSettingsAuthSubmit} className="space-y-4">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 font-bold" />
                  <input
                    type="password"
                    value={settingsPasswordInput}
                    onChange={(e) => setSettingsPasswordInput(e.target.value)}
                    placeholder="パスワードを入力 (例: eiyou0729)"
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
                {settingsAuthError && (
                  <p className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-200">{settingsAuthError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  🔓 ロック解除
                </button>
              </form>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-3xl p-6 shadow-lg flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">⚙️ 管理栄養士・管理者用 設定画面</h2>
                  <p className="text-xs text-amber-100 mt-1">業者・商品・ユニット・曜日ルールの追加・編集・削除ができます。</p>
                </div>
                <button
                  onClick={() => setIsSettingsAuth(false)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition-all"
                >
                  🔒 ログアウト
                </button>
              </div>

            {/* ステップ切替ナビ */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl shadow-sm border">
              {[
                { step: 1, label: 'ステップ1: 栄養士・曜日ルール' },
                { step: 2, label: 'ステップ2: ユニット管理' },
                { step: 3, label: 'ステップ3: 発注先業者' },
                { step: 4, label: 'ステップ4: 商品・購入区分' }
              ].map(s => (
                <button key={s.step} onClick={() => setSettingStep(s.step)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${settingStep === s.step ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* ===== ステップ1: 栄養士・曜日ルール ===== */}
            {settingStep === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-6">
                <h3 className="text-base font-bold text-slate-800 border-b pb-3">👩‍⚕️ 管理栄養士リスト</h3>
                <div className="space-y-2">
                  {systemSettings.nutritionists.map((n, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
                      <span className="text-sm font-bold text-slate-800">{n}</span>
                      <button onClick={() => handleDeleteNutritionist(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input type="text" value={newNutritionist} onChange={(e) => setNewNutritionist(e.target.value)}
                    placeholder="新しい管理栄養士名を入力" className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <button onClick={handleAddNutritionist} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1">
                    <Plus className="w-4 h-4" /><span>追加</span>
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-800 border-b pb-3 pt-4">📅 発注受付曜日ルール</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(systemSettings.orderDaysList).map(([day, enabled]) => (
                    <button key={day} onClick={() => toggleDay(day)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${enabled ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-400 border-slate-300'}`}>
                      {day}曜日
                    </button>
                  ))}
                </div>

                <h3 className="text-base font-bold text-slate-800 border-b pb-3 pt-4">⏰ 申請締切時刻</h3>
                <input type="time" value={systemSettings.deadlineTime}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, deadlineTime: e.target.value }))}
                  className="p-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
              </div>
            )}

            {/* ===== ステップ2: ユニット管理 ===== */}
            {settingStep === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-6">
                <h3 className="text-base font-bold text-slate-800 border-b pb-3">🏢 ユニット一覧</h3>
                <div className="grid grid-cols-3 gap-3">
                  {systemSettings.units.map((u, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
                      <span className="text-sm font-bold text-slate-800">{u}</span>
                      <button onClick={() => handleDeleteUnit(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input type="text" value={newUnitName} onChange={(e) => setNewUnitName(e.target.value)}
                    placeholder="新しいユニット名を入力（例：6W）" className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <button onClick={handleAddUnit} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1">
                    <Plus className="w-4 h-4" /><span>追加</span>
                  </button>
                </div>
              </div>
            )}

            {/* ===== ステップ3: 発注先業者管理 ===== */}
            {settingStep === 3 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-6">
                <h3 className="text-base font-bold text-slate-800 border-b pb-3">🚚 発注先業者リスト</h3>
                <div className="space-y-3">
                  {systemSettings.vendors.map(v => (
                    <div key={v.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{v.name}</p>
                        <p className="text-xs text-slate-500">FAX: {v.fax}　|　担当: {v.contact}</p>
                      </div>
                      <button onClick={() => handleDeleteVendor(v.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-amber-800">新規業者を追加</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" value={newVendor.name} onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="業者名" className="p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <input type="text" value={newVendor.fax} onChange={(e) => setNewVendor(prev => ({ ...prev, fax: e.target.value }))}
                      placeholder="FAX番号" className="p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <input type="text" value={newVendor.contact} onChange={(e) => setNewVendor(prev => ({ ...prev, contact: e.target.value }))}
                      placeholder="担当者名" className="p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <button onClick={handleAddVendor} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1">
                    <Plus className="w-4 h-4" /><span>業者を追加</span>
                  </button>
                </div>
              </div>
            )}

            {/* ===== ステップ4: 商品・購入区分管理 ===== */}
            {settingStep === 4 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-6">
                <h3 className="text-base font-bold text-slate-800 border-b pb-3">📦 商品・購入区分一覧</h3>
                <div className="space-y-2">
                  {systemSettings.products.map(p => {
                    const vendor = systemSettings.vendors.find(v => v.id === p.vendorId);
                    return (
                      <div key={p.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800">{p.name} <span className="text-xs text-slate-400 font-normal">({p.unit})</span></p>
                          <p className="text-[11px] text-slate-500">{vendor ? vendor.name : '未割当'}{p.isToromi ? ' | 🟢 とろみ剤' : ''}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => toggleProductPermission(p.id, 'allowFacility')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${p.allowFacility ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-400 border-slate-300'}`}>
                            施設購入{p.allowFacility ? ' ✓' : ' ✗'}
                          </button>
                          <button onClick={() => toggleProductPermission(p.id, 'allowPersonal')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${p.allowPersonal ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-400 border-slate-300'}`}>
                            個人購入{p.allowPersonal ? ' ✓' : ' ✗'}
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-amber-800">新規商品を追加</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={newProduct.name} onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="商品名" className="p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <div className="flex items-center space-x-2">
                      <select value={newProduct.unit} onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                        className="p-2.5 text-xs rounded-xl border border-slate-300 font-bold">
                        <option value="個">個</option><option value="袋">袋</option><option value="箱">箱</option>
                        <option value="本">本</option><option value="kg">kg</option><option value="ℓ">ℓ</option>
                      </select>
                      <select value={newProduct.vendorId} onChange={(e) => setNewProduct(prev => ({ ...prev, vendorId: parseInt(e.target.value) }))}
                        className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 font-bold">
                        {systemSettings.vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                      <input type="checkbox" checked={newProduct.allowFacility} onChange={(e) => setNewProduct(prev => ({ ...prev, allowFacility: e.target.checked }))} className="rounded" />
                      <span>施設購入可</span>
                    </label>
                    <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                      <input type="checkbox" checked={newProduct.allowPersonal} onChange={(e) => setNewProduct(prev => ({ ...prev, allowPersonal: e.target.checked }))} className="rounded" />
                      <span>個人購入可</span>
                    </label>
                  </div>
                  <button onClick={handleAddProduct} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1">
                    <Plus className="w-4 h-4" /><span>商品を追加</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}
      </main>

      {/* ========== FAX PDF出力モーダル ========== */}
      {showFaxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 my-8 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-4 no-print">
              <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <span>FAX注文票 PDF出力プレビュー</span>
              </h3>
              <button onClick={() => setShowFaxModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl no-print">
              <span className="text-xs font-bold text-slate-600 px-2">送信先業者切替:</span>
              {systemSettings.vendors.map(v => (
                <button key={v.id} onClick={() => setSelectedFaxVendorId(v.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${selectedFaxVendorId === v.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>{v.name}</button>
              ))}
            </div>

            {faxStatus === 'preview' ? (
              <div className="space-y-4">
                {/* ===== FAX印刷エリア ===== */}
                <div className="bg-slate-200 p-6 rounded-2xl shadow-inner overflow-x-auto">
                  <div id="fax-print-area" className="max-w-xl mx-auto bg-white p-8 border border-slate-400 shadow-md text-slate-900 font-serif space-y-4 text-xs">
                    <div className="flex items-start justify-between">
                      <div className="w-1/3"></div>
                      <h2 className="text-2xl font-bold tracking-widest text-center border-b-2 border-slate-900 pb-1">FAX 注文票</h2>
                      <p className="text-right text-xs font-mono w-1/3 pt-2">{getTodayJST()}</p>
                    </div>

                    <div className="space-y-1 pt-2">
                      <div className="text-base font-bold border-b border-slate-900 pb-0.5 inline-block pr-16">{currentFaxVendor.name}　様</div>
                      <p className="font-mono text-xs font-bold text-slate-700">FAX：{currentFaxVendor.fax}</p>
                    </div>

                    <div className="text-xs space-y-1 font-sans pt-1">
                      <p>いつもお世話になっております。　注文を宜しくお願いします。</p>
                      <p className="font-bold border-l-2 border-slate-800 pl-2">※個人購入分は納品書・請求書を分けて頂くようよろしくお願いします。</p>
                    </div>

                    <table className="w-full border-collapse border border-slate-900 text-left text-xs font-sans mt-3">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-50 font-bold">
                          <th className="border-r border-slate-900 p-2.5 w-1/2">商品名</th>
                          <th className="border-r border-slate-900 p-2.5 text-center w-1/6">数量</th>
                          <th className="p-2.5 w-1/3">備考 (納品先ユニット名)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentFaxOrders.length === 0 ? (
                          <tr><td colSpan={3} className="p-4 text-center text-slate-400">本日の発注商品は登録されていません</td></tr>
                        ) : (
                          <>
                            {currentFaxOrders.map((ord, idx) => (
                              <tr key={idx} className="border-b border-slate-900">
                                <td className="border-r border-slate-900 p-2.5 font-bold">{ord.name}</td>
                                <td className="border-r border-slate-900 p-2.5 text-center font-bold">{ord.qty} {ord.unit}</td>
                                <td className="p-2.5 font-bold text-slate-900">{ord.note}</td>
                              </tr>
                            ))}
                            {showTotalRow && (
                              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                                <td className="border-r border-slate-900 p-2.5 text-right font-black">合計発注数</td>
                                <td className="border-r border-slate-900 p-2.5 text-center font-black text-sm text-slate-900">{totalFaxQuantity} {mainUnitLabel}</td>
                                <td className="p-2.5 font-black text-slate-600">全ユニット集計済</td>
                              </tr>
                            )}
                          </>
                        )}
                      </tbody>
                    </table>

                    <div className="pt-6 text-right space-y-0.5 font-sans leading-snug">
                      <p className="font-bold text-xs">特別養護老人ホーム</p>
                      <p className="font-bold text-sm">　　　　　シルクロード七福神</p>
                      <p className="text-xs font-bold text-emerald-800 pt-0.5">担当：{selectedApprover} (栄養士)</p>
                      <p className="text-[11px] text-slate-600">〒890-0082 鹿児島県鹿児島市紫原5丁目13-18</p>
                      <p className="text-[11px] text-slate-600 font-mono">TEL:099-256-2729 / FAX:099-256-3729</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 no-print">
                  <span className="text-xs text-slate-500 font-bold">※備考欄にユニット名が自動印字されます</span>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setShowFaxModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">キャンセル</button>
                    <button onClick={handlePrintFax}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2">
                      <Download className="w-4 h-4" /><span>📄 PDF出力（印刷）</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-4 no-print">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-800 text-lg">PDF出力が完了しました！</h4>
                <p className="text-xs text-slate-500">印刷ダイアログで「PDFとして保存」を選択するか、そのまま印刷してください。</p>
                <button onClick={() => setShowFaxModal(false)} className="px-8 py-3 bg-slate-900 text-white font-bold text-xs rounded-xl">閉じる</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto text-center text-xs text-slate-400 no-print">
        栄養関連物品発注システム | 特別養護老人ホーム シルクロード七福神
      </footer>
    </div>
  );
}
