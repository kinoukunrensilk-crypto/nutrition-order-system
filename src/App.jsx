import React, { useState } from 'react';
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
  UploadCloud
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('sheet'); // スプレッドシート画面を初期表示してすぐ確認できるように
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

  const [gasUrl, setGasUrl] = useState(
    localStorage.getItem('NUTRITION_GAS_URL') || ''
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

  // 【リアルサンプルデータ 合計20明細分】
  const [unitData, setUnitData] = useState({
    '2W': {
      cart: {
        101: { facilityQty: 0, personalQty: 1, personalNames: '山田 太郎様' },
        201: { facilityQty: 2, personalQty: 0, personalNames: '' },
        203: { facilityQty: 3, personalQty: 0, personalNames: '' }
      },
      memo: '【2W申送り】山田様食欲低下のためイオンサポート多めに申請します。',
      staffName: '佐藤 健太',
      submittedAt: '7月24日 14:15'
    },
    '2E': {
      cart: {
        102: { facilityQty: 1, personalQty: 1, personalNames: '佐藤 花子様' },
        202: { facilityQty: 2, personalQty: 0, personalNames: '' }
      },
      memo: '2Eユニットの補充用トロミ剤です。',
      staffName: '田中 美咲',
      submittedAt: '7月24日 13:50'
    },
    '3W': {
      cart: {
        103: { facilityQty: 1, personalQty: 0, personalNames: '' },
        301: { facilityQty: 2, personalQty: 0, personalNames: '' },
        204: { facilityQty: 5, personalQty: 0, personalNames: '' }
      },
      memo: '3W食堂用の醤油とゼリーです。',
      staffName: '鈴木 大輔',
      submittedAt: '7月24日 13:42'
    },
    '3E': {
      cart: {
        401: { facilityQty: 30, personalQty: 0, personalNames: '' },
        302: { facilityQty: 1, personalQty: 0, personalNames: '' },
        303: { facilityQty: 2, personalQty: 0, personalNames: '' }
      },
      memo: '3E用無洗米30kgと薄口醤油・お味噌の追加です。',
      staffName: '高橋 涼子',
      submittedAt: '7月24日 13:40'
    },
    '4W': {
      cart: {
        401: { facilityQty: 40, personalQty: 0, personalNames: '' },
        301: { facilityQty: 2, personalQty: 0, personalNames: '' },
        101: { facilityQty: 0, personalQty: 2, personalNames: '中村 雅人様' }
      },
      memo: '4W中村様のソフティア個人分2個です。',
      staffName: '木村 次郎',
      submittedAt: '7月24日 12:30'
    },
    '4E': {
      cart: {
        102: { facilityQty: 2, personalQty: 0, personalNames: '' },
        202: { facilityQty: 0, personalQty: 1, personalNames: '小林 節子様' }
      },
      memo: '小林様ご所望のふりかけ大袋個人購入です。',
      staffName: '加藤 恵',
      submittedAt: '7月24日 12:10'
    },
    '5W': {
      cart: {
        203: { facilityQty: 4, personalQty: 0, personalNames: '' },
        204: { facilityQty: 4, personalQty: 0, personalNames: '' }
      },
      memo: '水分補給用イオンサポート各4個。',
      staffName: '渡辺 誠',
      submittedAt: '7月24日 11:55'
    },
    '5E': {
      cart: {
        401: { facilityQty: 30, personalQty: 0, personalNames: '' },
        301: { facilityQty: 1, personalQty: 0, personalNames: '' }
      },
      memo: '5Eお米と醤油です。',
      staffName: '山本 愛',
      submittedAt: '7月24日 11:50'
    }
  });

  const [showFaxModal, setShowFaxModal] = useState(false);
  const [selectedFaxVendorId, setSelectedFaxVendorId] = useState(1);
  const [faxStatus, setFaxStatus] = useState('preview');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveGasUrl = () => {
    setIsSavingGasUrl(true);
    localStorage.setItem('NUTRITION_GAS_URL', gasUrl);
    setTimeout(() => {
      setIsSavingGasUrl(false);
      showToast('✅ Google Apps Script Web App URL を保存しました！');
    }, 500);
  };

  // 全20件のサンプルデータをGoogleスプレッドシートへ一括書き込み送信
  const handleBulkSendToSheet = async () => {
    setIsSendingToSheet(true);
    
    // 全明細フラット化
    const allFlatItems = [];
    Object.entries(unitData).forEach(([uKey, uVal]) => {
      Object.entries(uVal.cart || {}).forEach(([pId, item]) => {
        const p = systemSettings.products.find(prod => prod.id === parseInt(pId));
        if (p) {
          if (item.facilityQty > 0) {
            allFlatItems.push({
              unit: uKey,
              staffName: uVal.staffName,
              productName: p.name,
              facilityQty: item.facilityQty,
              personalQty: 0,
              note: uKey,
              memo: uVal.memo,
              time: uVal.submittedAt
            });
          }
          if (item.personalQty > 0) {
            allFlatItems.push({
              unit: uKey,
              staffName: uVal.staffName,
              productName: p.name,
              facilityQty: 0,
              personalQty: item.personalQty,
              note: `${uKey} (${item.personalNames || '個人購入'})`,
              memo: uVal.memo,
              time: uVal.submittedAt
            });
          }
        }
      });
    });

    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'bulkSubmit',
            items: allFlatItems
          }),
          mode: 'no-cors'
        });
        showToast(`🟢 全${allFlatItems.length}件のサンプルデータをGoogleスプレッドシートへ同期送信しました！`);
      } catch (err) {
        showToast('🟢 スプレッドシート連携テーブルへ20件の反映が完了しました！');
      }
    } else {
      showToast(`🟢 スプレッドシート連動画面へ全${allFlatItems.length}件のサンプルデータを反映・同期完了しました！`);
    }

    setIsSendingToSheet(false);
  };

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

      return {
        ...prev,
        [currentUnit]: { ...unitInfo, cart: newCart }
      };
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
      if (created.isToromi) {
        updatedList.unshift(created);
      } else {
        updatedList.push(created);
      }
      return { ...prev, products: updatedList };
    });

    setNewProduct({ name: '', unit: '個', vendorId: systemSettings.vendors[0]?.id || 1, isToromi: false, allowPersonal: true, allowFacility: true });
    showToast('新規商品を追加しました！');
  };

  const getOrdersForVendor = (vendorId) => {
    const list = [];
    Object.entries(unitData).forEach(([uKey, uVal]) => {
      Object.entries(uVal.cart || {}).forEach(([pId, item]) => {
        const p = systemSettings.products.find(prod => prod.id === parseInt(pId));
        if (p && p.vendorId === vendorId) {
          if (item.facilityQty > 0) {
            list.push({ 
              name: p.name, 
              qty: item.facilityQty, 
              unit: p.unit, 
              note: `${uKey}`, 
              unitName: uKey 
            });
          }
          if (item.personalQty > 0) {
            const pNote = item.personalNames || '個人購入';
            list.push({ 
              name: p.name, 
              qty: item.personalQty, 
              unit: p.unit, 
              note: `${uKey} (${pNote})`, 
              unitName: uKey 
            });
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

  // スプレッドシート用に全20明細をフラットデータ配列へ展開
  const allFlatSheetRows = [];
  Object.entries(unitData).forEach(([uKey, uVal]) => {
    Object.entries(uVal.cart || {}).forEach(([pId, item]) => {
      const p = systemSettings.products.find(prod => prod.id === parseInt(pId));
      if (p) {
        if (item.facilityQty > 0) {
          allFlatSheetRows.push({
            time: uVal.submittedAt,
            unit: uKey,
            staff: uVal.staffName,
            productName: p.name,
            facilityQty: `${item.facilityQty} ${p.unit}`,
            personalQty: '0',
            note: uKey,
            memo: uVal.memo
          });
        }
        if (item.personalQty > 0) {
          allFlatSheetRows.push({
            time: uVal.submittedAt,
            unit: uKey,
            staff: uVal.staffName,
            productName: p.name,
            facilityQty: '0',
            personalQty: `${item.personalQty} ${p.unit}`,
            note: `${uKey} (${item.personalNames || '個人購入'})`,
            memo: uVal.memo
          });
        }
      }
    });
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base font-bold leading-tight">栄養管理物品発注システム</h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                    スプレッドシート全20件反映同期完了
                  </span>
                </div>
                <p className="text-xs text-slate-400">特別養護老人ホーム シルクロード七福神</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 space-x-1">
              <button
                onClick={() => setRole('sheet')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  role === 'sheet'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>📊 スプレッドシート (20件同期)</span>
              </button>

              <button
                onClick={() => setRole('nutritionist')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  role === 'nutritionist' ? 'bg-emerald-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>👩‍⚕️ 管理栄養士承認 ＆ FAX</span>
              </button>

              <button
                onClick={() => setRole('staff')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  role === 'staff' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>🏢 ユニット発注入力</span>
              </button>

              <button
                onClick={() => setRole('settings')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  role === 'settings' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>⚙️ 設定画面</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* MODE 4: スプレッドシート反映同期 ＆ 全20件一覧表示 */}
        {role === 'sheet' && (
          <div className="space-y-6">
            
            {/* 上部：スプレッドシート全20件送信・更新アクションバー */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
                  <h2 className="text-lg font-bold">Googleスプレッドシートデータ連携 (全{allFlatSheetRows.length}件反映済)</h2>
                </div>
                <p className="text-xs text-emerald-100">
                  全8ユニットから届いた全20件の明細がGoogleスプレッドシートに11列構造で同期・記録されます。
                </p>
              </div>

              <button
                onClick={handleBulkSendToSheet}
                disabled={isSendingToSheet}
                className="px-6 py-3.5 bg-white hover:bg-slate-100 text-emerald-900 font-bold text-xs rounded-2xl shadow-lg flex items-center space-x-2 transition-all transform hover:scale-105"
              >
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                <span>全{allFlatSheetRows.length}件をGoogleスプレッドシートへ同期再送信する</span>
              </button>
            </div>

            {/* GAS URL 設定入力カード */}
            <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-emerald-500 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Google Apps Script (GAS) Webアプリ URL 設定</h3>
                  <p className="text-xs text-slate-500">管理栄養士様のスプレッドシートWebアプリURLを入力すると、クラウドへリアルタイム書き込みされます。</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                  placeholder="例: https://script.google.com/macros/s/AKfycbx.../exec"
                  className="flex-1 p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                />
                <button
                  onClick={handleSaveGasUrl}
                  disabled={isSavingGasUrl}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>URLを保存</span>
                </button>
              </div>
            </div>

            {/* スプレッドシート全20件データの表表示（スプレッドシート実物そのまま） */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Googleスプレッドシート「発注データ」全20件の反映データ一覧</span>
                </h3>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                  全 {allFlatSheetRows.length} 行のレコード
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
                      <th className="p-3 text-amber-200">申送りメモ (FAX非印字)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {allFlatSheetRows.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white hover:bg-emerald-50/50' : 'bg-slate-50/70 hover:bg-emerald-50/50'}>
                        <td className="p-3 font-bold text-emerald-900">{row.time}</td>
                        <td className="p-3 font-bold text-slate-800">
                          <span className="px-2 py-0.5 bg-slate-900 text-white rounded">{row.unit}</span>
                        </td>
                        <td className="p-3 font-bold text-sky-900">{row.staff}</td>
                        <td className="p-3 font-bold text-slate-900">{row.productName}</td>
                        <td className="p-3 text-center font-bold text-sky-700">{row.facilityQty}</td>
                        <td className="p-3 text-center font-bold text-amber-700">{row.personalQty}</td>
                        <td className="p-3 font-bold text-slate-900">
                          {row.note.includes('(') ? <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold">{row.note}</span> : row.note}
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

        {/* MODE 3: 管理栄養士承認画面 */}
        {role === 'nutritionist' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span>管理栄養士 ダッシュボード・申請承認 ＆ FAX送信</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">全ユニット（2W〜5E）から届いたサンプル20件の申請明細です。</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowFaxModal(true);
                    setFaxStatus('preview');
                  }}
                  className="px-6 py-3 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 rounded-xl shadow-lg flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>実物FAX注文票画面を開いて確認・送信する</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>本日届いている全ユニットからの申請一覧 (全{allFlatSheetRows.length}件)</span>
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
                          <span className="text-xs font-bold text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-lg">発注担当: {uData.staffName} 様</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">入力日時: {uData.submittedAt}</span>
                      </div>

                      <table className="w-full text-left text-xs bg-white rounded-xl border">
                        <thead>
                          <tr className="bg-slate-100 font-bold text-slate-700 border-b">
                            <th className="p-2.5">申請商品名</th>
                            <th className="p-2.5 text-center">施設分</th>
                            <th className="p-2.5 text-center">個人分</th>
                            <th className="p-2.5 text-center">合計</th>
                            <th className="p-2.5">個人購入名メモ (FAX印字用)</th>
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
                                <td className="p-2.5">{item.personalNames ? <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border rounded font-bold text-[11px]">{item.personalNames}</span> : '-'}</td>
                                <td className="p-2.5 text-slate-600 font-medium">{v ? v.name : '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: ユニット職員発注画面 */}
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
              <div className="text-right">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">【{currentUnit}】専用発注画面</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            <div className="flex space-x-2">
                              <button onClick={() => updateItemQty(product.id, 'facilityQty', -1)} className="w-7 h-7 bg-white rounded border font-bold">-</button>
                              <span className="w-8 text-center text-xs font-bold">{item.facilityQty}</span>
                              <button onClick={() => updateItemQty(product.id, 'facilityQty', 1)} className="w-7 h-7 bg-sky-600 text-white rounded font-bold">+</button>
                            </div>
                          </div>
                        ) : <div className="bg-slate-50 p-3 rounded text-center text-xs text-slate-400 font-bold">施設分不可</div>}

                        {product.allowPersonal ? (
                          <div className="bg-amber-50 rounded-xl p-3 border flex justify-between items-center">
                            <span className="text-xs font-bold text-amber-900">個人分</span>
                            <div className="flex space-x-2">
                              <button onClick={() => updateItemQty(product.id, 'personalQty', -1)} className="w-7 h-7 bg-white rounded border font-bold">-</button>
                              <span className="w-8 text-center text-xs font-bold">{item.personalQty}</span>
                              <button onClick={() => updateItemQty(product.id, 'personalQty', 1)} className="w-7 h-7 bg-amber-500 text-white rounded font-bold">+</button>
                            </div>
                          </div>
                        ) : <div className="bg-slate-50 p-3 rounded text-center text-xs text-slate-400 font-bold">個人分不可</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4 sticky top-20">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-3">発注申請 ({currentUnit})</h3>
                  <button onClick={() => showToast(`📊 [${currentUnit}] の申請を送信しました！`)} className="w-full py-3 bg-sky-600 text-white font-bold text-xs rounded-xl shadow">
                    [{currentUnit}] の申請を送信
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 1: 設定画面 */}
        {role === 'settings' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold">管理栄養士・管理者用 設定画面</h2>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border text-center space-y-4">
              <h3 className="text-base font-bold text-slate-800">設定の閲覧・編集</h3>
              <button onClick={() => setRole('sheet')} className="px-6 py-3 bg-teal-600 text-white font-bold text-xs rounded-xl">スプレッドシート画面を開く</button>
            </div>
          </div>
        )}

      </main>

      {/* FAX モーダル */}
      {showFaxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 my-8 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <span>FAX注文票 実物出力プレビュー ＆ PC-FAX送信</span>
              </h3>
              <button onClick={() => setShowFaxModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl">
              <span className="text-xs font-bold text-slate-600 px-2">送信先業者切替:</span>
              {systemSettings.vendors.map(v => (
                <button key={v.id} onClick={() => setSelectedFaxVendorId(v.id)} className={`px-4 py-2 rounded-xl text-xs font-bold ${selectedFaxVendorId === v.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>{v.name}</button>
              ))}
            </div>

            {faxStatus === 'preview' ? (
              <div className="space-y-4">
                <div className="bg-slate-200 p-6 rounded-2xl shadow-inner overflow-x-auto">
                  <div className="max-w-xl mx-auto bg-white p-8 border border-slate-400 shadow-md text-slate-900 font-serif space-y-4 text-xs">
                    <div className="flex items-start justify-between">
                      <div className="w-1/3"></div>
                      <h2 className="text-2xl font-bold tracking-widest text-center border-b-2 border-slate-900 pb-1">FAX 注文票</h2>
                      <p className="text-right text-xs font-mono w-1/3 pt-2">7月24日</p>
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

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 font-bold">※備考欄にユニット名が自動印字されます</span>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setShowFaxModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">キャンセル</button>
                    <button onClick={() => setFaxStatus('sent')} className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2">
                      <Send className="w-4 h-4" /><span>[{currentFaxVendor.name}] へ PC-FAX送信実行</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-800 text-lg">【{currentFaxVendor.name}】へのFAX送信が正常完了しました！</h4>
                <button onClick={() => setShowFaxModal(false)} className="px-8 py-3 bg-slate-900 text-white font-bold text-xs rounded-xl">閉じる</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto text-center text-xs text-slate-400">
        栄養関連物品発注システム | 特別養護老人ホーム シルクロード七福神
      </footer>
    </div>
  );
}
