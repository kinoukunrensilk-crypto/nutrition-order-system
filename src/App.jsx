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
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('settings'); // 設定画面を最初に見やすく
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

  // 設定画面の入力フォーム状態
  const [newNutritionist, setNewNutritionist] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newVendor, setNewVendor] = useState({ name: '', fax: '', contact: '' });
  const [newProduct, setNewProduct] = useState({ 
    name: '', unit: '個', vendorId: 1, isToromi: false, allowPersonal: true, allowFacility: true 
  });

  const [currentUnit, setCurrentUnit] = useState('2W');
  const [selectedApprover, setSelectedApprover] = useState('野元 史彦');

  const [unitData, setUnitData] = useState({
    '2W': {
      cart: {
        101: { facilityQty: 0, personalQty: 1, personalNames: '山田様個人購入' },
        201: { facilityQty: 1, personalQty: 0, personalNames: '' },
        203: { facilityQty: 3, personalQty: 0, personalNames: '' },
        301: { facilityQty: 2, personalQty: 0, personalNames: '' },
        401: { facilityQty: 20, personalQty: 0, personalNames: '' }
      },
      memo: '【2W申送り】山田様食欲低下のためイオンサポート多めに申請します。',
      staffName: '佐藤 健太',
      submittedAt: '7月24日 14:15'
    },
    '3E': {
      cart: {
        301: { facilityQty: 1, personalQty: 0, personalNames: '' },
        303: { facilityQty: 2, personalQty: 0, personalNames: '' },
        401: { facilityQty: 30, personalQty: 0, personalNames: '' }
      },
      memo: '3Eユニット用無洗米と味噌の追加です。',
      staffName: '高橋 涼子',
      submittedAt: '7月24日 13:40'
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

  // STEP 1 操作関数
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

  // STEP 2 操作関数
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

  // STEP 3 操作関数
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

  // STEP 4 操作関数
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

  const activeCartEntries = Object.entries(currentUnitState.cart || {}).filter(([_, item]) => (item.facilityQty + item.personalQty) > 0);

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
                    設定画面フルフォーム100%完全配置
                  </span>
                </div>
                <p className="text-xs text-slate-400">特別養護老人ホーム シルクロード七福神</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 space-x-1">
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
                onClick={() => setRole('nutritionist')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  role === 'nutritionist' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>👩‍⚕️ 管理栄養士承認 ＆ FAX</span>
              </button>

              <button
                onClick={() => setRole('settings')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  role === 'settings'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'text-amber-300 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>⚙️ 設定画面</span>
              </button>

              <button
                onClick={() => setRole('sheet')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  role === 'sheet' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>📊 スプレッドシート</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* MODE 1: 設定画面 (入力欄・編集欄・追加ボタンを省略せず100%描画) */}
        {role === 'settings' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-amber-100">
                  システム管理 ＆ フル編集コントロール
                </span>
                <h2 className="text-xl font-bold">管理栄養士・管理者用 設定画面</h2>
                <p className="text-xs text-amber-100 max-w-2xl leading-relaxed">
                  「栄養士名」「発注曜日」「締切時刻」「ユニット一覧」「業者FAX情報」「商品・購入区分」をここから自由に追加・削除・編集できます。
                </p>
              </div>
            </div>

            {/* Stepper Tabs */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
              {[
                { step: 1, label: '1. 栄養士・曜日ルール' },
                { step: 2, label: '2. ユニット一覧' },
                { step: 3, label: '3. 業者とFAX番号' },
                { step: 4, label: '4. 商品・購入区分の編集' },
                { step: 5, label: '5. 設定完了' },
              ].map(s => (
                <button
                  key={s.step}
                  onClick={() => setSettingStep(s.step)}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
                    settingStep === s.step
                      ? 'bg-slate-900 text-white shadow'
                      : settingStep > s.step
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* STEP 1: 栄養士名 ＆ 曜日ルール設定（編集欄・追加ボタン完備） */}
            {settingStep === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 animate-in fade-in">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-800">1. 管理栄養士様のお名前 ＆ 発注曜日の設定</h3>
                  <p className="text-xs text-slate-500">お名前の追加・削除や、1日の発注締切時刻、発注曜日を変更できます。</p>
                </div>

                {/* 登録中栄養士一覧 ＆ 追加フォーム */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>登録中の管理栄養士様 ({systemSettings.nutritionists.length}名)</span>
                  </label>
                  
                  <div className="flex flex-wrap gap-2">
                    {systemSettings.nutritionists.map((name, idx) => (
                      <div key={idx} className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center space-x-2 shadow-sm">
                        <span>{name} 様</span>
                        <button
                          onClick={() => handleDeleteNutritionist(idx)}
                          className="text-amber-700 hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-50"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="text"
                      placeholder="管理栄養士様のお名前を入力 (例: 鹿児島 花子)"
                      value={newNutritionist}
                      onChange={(e) => setNewNutritionist(e.target.value)}
                      className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={handleAddNutritionist}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>追加</span>
                    </button>
                  </div>
                </div>

                {/* 発注曜日選択ボタン編集欄 */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700">発注を行う曜日の選択 (タップでON/OFF切り替え)</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(systemSettings.orderDaysList).map(([day, checked]) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1.5 ${
                          checked
                            ? 'bg-slate-900 text-white border-slate-900 shadow'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center ${checked ? 'border-amber-400 bg-amber-400 text-slate-900' : 'border-slate-300'}`}>
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <span>{day}曜日</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 締切時刻選択欄 */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700">1日の発注締切時刻</label>
                  <select
                    value={systemSettings.deadlineTime}
                    onChange={(e) => setSystemSettings({ ...systemSettings, deadlineTime: e.target.value })}
                    className="w-full md:w-64 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none bg-white font-bold text-slate-800"
                  >
                    <option value="11:00">午前 11:00 まで</option>
                    <option value="12:00">正午 12:00 まで</option>
                    <option value="13:00">午後 13:00 まで</option>
                    <option value="14:00">午後 14:00 まで (推奨)</option>
                    <option value="15:00">午後 15:00 まで</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setSettingStep(2)}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all"
                  >
                    <span>次へ：ユニット一覧の編集</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ユニット一覧（編集欄・追加ボタン完備） */}
            {settingStep === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 animate-in fade-in">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-800">2. 発注対象ユニット（部署）の追加・削除</h3>
                  <p className="text-xs text-slate-500">実在する9ユニットの一覧です。削除や新しいユニットの追加が行えます。</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {systemSettings.units.map((unit, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 shadow-sm">
                      <span>{unit}</span>
                      <button
                        onClick={() => handleDeleteUnit(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    placeholder="新しいユニット名を入力 (例: ショートステイ)"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                  <button
                    onClick={handleAddUnit}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ユニットを追加</span>
                  </button>
                </div>

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setSettingStep(1)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1">
                    <ArrowLeft className="w-4 h-4" /><span>戻る</span>
                  </button>
                  <button onClick={() => setSettingStep(3)} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2">
                    <span>次へ：業者とFAXの編集</span><ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: 業者とFAX番号（編集欄・追加ボタン完備） */}
            {settingStep === 3 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 animate-in fade-in">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-800">3. 発注先業者様 ＆ FAX番号の追加・削除</h3>
                  <p className="text-xs text-slate-500">注文書を自動送信する先の業者名・FAX番号を管理できます。</p>
                </div>

                <div className="space-y-3">
                  {systemSettings.vendors.map(v => (
                    <div key={v.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{v.name}</h4>
                        <p className="text-amber-700 font-mono font-bold mt-0.5">FAX: {v.fax}</p>
                        {v.contact && <p className="text-slate-400 text-[11px] mt-0.5">{v.contact}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteVendor(v.id)}
                        className="px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-[11px] border border-rose-200 transition-all"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>

                {/* 新規業者追加フォーム */}
                <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                    <Plus className="w-4 h-4 text-amber-600" />
                    <span>新しい業者を追加登録する</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="業者名 (例: 鹿児島食品株式会社)"
                      value={newVendor.name}
                      onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                      className="p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none bg-white font-medium"
                    />
                    <input
                      type="text"
                      placeholder="FAX番号 (例: 099-123-4567)"
                      value={newVendor.fax}
                      onChange={(e) => setNewVendor({ ...newVendor, fax: e.target.value })}
                      className="p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none bg-white font-mono font-bold"
                    />
                    <input
                      type="text"
                      placeholder="担当者メモ (例: 担当：田中様)"
                      value={newVendor.contact}
                      onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })}
                      className="p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none bg-white"
                    />
                  </div>
                  <button
                    onClick={handleAddVendor}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>この業者を追加登録保存</span>
                  </button>
                </div>

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setSettingStep(2)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1">
                    <ArrowLeft className="w-4 h-4" /><span>戻る</span>
                  </button>
                  <button onClick={() => setSettingStep(4)} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2">
                    <span>次へ：商品・区分の編集</span><ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: 商品・購入区分編集（編集欄・追加ボタン完備） */}
            {settingStep === 4 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 animate-in fade-in">
                <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">4. 取扱商品 ＆ 購入区分の自由編集</h3>
                    <p className="text-xs text-slate-500">ボタンをタップして「施設購入」「個人購入」の可否をON/OFF切り替えできます。</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                        <th className="p-3">順序</th>
                        <th className="p-3">商品名</th>
                        <th className="p-3">単位</th>
                        <th className="p-3 text-center">🏢 施設購入</th>
                        <th className="p-3 text-center">👤 個人購入</th>
                        <th className="p-3">発注先業者</th>
                        <th className="p-3 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {systemSettings.products.map(p => {
                        const v = systemSettings.vendors.find(item => item.id === p.vendorId);
                        return (
                          <tr key={p.id} className={p.isToromi ? 'bg-amber-50/40 font-bold' : 'hover:bg-slate-50'}>
                            <td className="p-3">
                              {p.isToromi ? <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px]">トロミ系</span> : <span className="text-slate-400">一般</span>}
                            </td>
                            <td className="p-3 font-bold text-slate-800">{p.name}</td>
                            <td className="p-3 text-slate-600">{p.unit}</td>
                            
                            <td className="p-3 text-center">
                              <button
                                onClick={() => toggleProductPermission(p.id, 'allowFacility')}
                                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                                  p.allowFacility ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}
                              >
                                {p.allowFacility ? '○ 施設可能' : '× 不可'}
                              </button>
                            </td>

                            <td className="p-3 text-center">
                              <button
                                onClick={() => toggleProductPermission(p.id, 'allowPersonal')}
                                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                                  p.allowPersonal ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}
                              >
                                {p.allowPersonal ? '○ 個人可能' : '× 不可'}
                              </button>
                            </td>

                            <td className="p-3 text-amber-700 font-medium">{v ? v.name : '未設定'}</td>
                            
                            <td className="p-3 text-center">
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-1 text-slate-400 hover:text-rose-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 新規商品追加フォーム */}
                <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                    <Plus className="w-4 h-4 text-amber-600" /><span>新しい商品を追加登録する</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" placeholder="商品名 (例: つるりんこ Quickly 800g)" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium" />
                    <input type="text" placeholder="単位 (例: 個 / 袋 / 箱)" value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} className="p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium" />
                    <select value={newProduct.vendorId} onChange={(e) => setNewProduct({ ...newProduct, vendorId: Number(e.target.value) })} className="p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-amber-800">
                      {systemSettings.vendors.map(v => <option key={v.id} value={v.id}>発注先: {v.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center space-x-4 pt-1 text-xs font-bold text-slate-700">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="checkbox" checked={newProduct.allowFacility} onChange={(e) => setNewProduct({ ...newProduct, allowFacility: e.target.checked })} className="rounded text-sky-600" />
                      <span>施設購入を許可する</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="checkbox" checked={newProduct.allowPersonal} onChange={(e) => setNewProduct({ ...newProduct, allowPersonal: e.target.checked })} className="rounded text-amber-600" />
                      <span>個人購入を許可する</span>
                    </label>
                  </div>
                  <button onClick={handleAddProduct} className="w-full py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1">
                    <Plus className="w-4 h-4" /><span>この商品をリストに追加保存</span>
                  </button>
                </div>

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setSettingStep(3)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1">
                    <ArrowLeft className="w-4 h-4" /><span>戻る</span>
                  </button>
                  <button onClick={() => setSettingStep(5)} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2">
                    <span>次へ：設定完了</span><ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: 完了 */}
            {settingStep === 5 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center space-y-4 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">設定の保存が完了しました</h3>
                <p className="text-xs text-slate-500">変更された内容はただちにシステム全体に適用されます。</p>
                <button
                  onClick={() => setRole('staff')}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  ユニット発注画面を開く
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: ユニット職員発注画面 */}
        {role === 'staff' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>発注入力中ユニット:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {systemSettings.units.map(u => (
                    <button
                      key={u}
                      onClick={() => setCurrentUnit(u)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        currentUnit === u ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  【{currentUnit}】専用発注画面
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  [{currentUnit} ユニット] 発注商品リスト
                </h3>

                {systemSettings.products.map(product => {
                  const currentCart = currentUnitState.cart || {};
                  const item = currentCart[product.id] || { facilityQty: 0, personalQty: 0, personalNames: '' };
                  const totalQty = item.facilityQty + item.personalQty;
                  const vendor = systemSettings.vendors.find(v => v.id === product.vendorId);

                  return (
                    <div key={product.id} className={`bg-white rounded-2xl p-4 border ${totalQty > 0 ? 'border-sky-500 shadow-md ring-1 ring-sky-500/50' : 'border-slate-200'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-slate-800">{product.name}</h3>
                            {product.isToromi && <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">トロミ系</span>}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">発注先: {vendor ? vendor.name : '未設定'}</p>
                        </div>
                        {totalQty > 0 && <span className="px-3 py-1 text-xs font-bold bg-sky-600 text-white rounded-full">合計 {totalQty} {product.unit}</span>}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.allowFacility ? (
                          <div className="bg-sky-50/50 rounded-xl p-3 border border-sky-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-sky-900">施設購入分 ({product.unit})</span>
                            <div className="flex items-center space-x-2">
                              <button onClick={() => updateItemQty(product.id, 'facilityQty', -1)} disabled={item.facilityQty === 0} className="w-7 h-7 bg-white rounded border font-bold disabled:opacity-30">-</button>
                              <span className="w-8 text-center text-xs font-bold">{item.facilityQty}</span>
                              <button onClick={() => updateItemQty(product.id, 'facilityQty', 1)} className="w-7 h-7 bg-sky-600 text-white rounded font-bold">+</button>
                            </div>
                          </div>
                        ) : <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-400 text-center font-bold">施設購入不可</div>}

                        {product.allowPersonal ? (
                          <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900">個人購入分 ({product.unit})</span>
                            <div className="flex items-center space-x-2">
                              <button onClick={() => updateItemQty(product.id, 'personalQty', -1)} disabled={item.personalQty === 0} className="w-7 h-7 bg-white rounded border font-bold disabled:opacity-30">-</button>
                              <span className="w-8 text-center text-xs font-bold">{item.personalQty}</span>
                              <button onClick={() => updateItemQty(product.id, 'personalQty', 1)} className="w-7 h-7 bg-amber-500 text-white rounded font-bold">+</button>
                            </div>
                          </div>
                        ) : <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-400 text-center font-bold">個人購入不可</div>}
                      </div>

                      {item.personalQty > 0 && (
                        <div className="mt-3 pt-2 bg-amber-50 rounded-xl p-3 border border-amber-200 space-y-1">
                          <label className="text-[11px] font-bold text-amber-900">個人購入者お名前メモ (FAX備考印字用):</label>
                          <input type="text" value={item.personalNames} onChange={(e) => updatePersonalNames(product.id, e.target.value)} placeholder="例: 山田様個人購入" className="w-full p-2 text-xs rounded-lg border border-amber-300 bg-white font-medium" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Cart Summary */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4 sticky top-20">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-3 flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4 text-sky-600" />
                    <span>発注申請 ({currentUnit} ユニット)</span>
                  </h3>

                  {activeCartEntries.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-xs">数量を指定してください</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                        {activeCartEntries.map(([id, item]) => {
                          const p = systemSettings.products.find(prod => prod.id === parseInt(id));
                          if (!p) return null;
                          return (
                            <div key={id} className="py-2 text-xs flex justify-between font-bold">
                              <span>{p.name}</span><span>計 {item.facilityQty + item.personalQty} {p.unit}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 space-y-1">
                        <label className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" /><span>管理栄養士への申送り・メモ (FAX非印字)</span>
                        </label>
                        <textarea rows={2} value={currentUnitState.memo || ''} onChange={(e) => updateUnitMemo(e.target.value)} placeholder="申送り事項を入力..." className="w-full p-2 text-xs rounded-xl border border-amber-300 bg-white resize-none" />
                      </div>

                      <div className="bg-sky-50 rounded-2xl p-3 border border-sky-200 space-y-1">
                        <label className="text-xs font-bold text-sky-900 flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-sky-600" /><span>発注担当職員のお名前 (FAX非印字)</span>
                        </label>
                        <input type="text" value={currentUnitState.staffName || ''} onChange={(e) => updateUnitStaffName(e.target.value)} placeholder="例: 佐藤 健太" className="w-full p-2 text-xs rounded-xl border border-sky-300 bg-white font-bold" />
                      </div>

                      <button
                        onClick={() => {
                          const nowStr = `7月24日 ${new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
                          setUnitData(prev => ({ ...prev, [currentUnit]: { ...prev[currentUnit], submittedAt: nowStr } }));
                          showToast(`📊 [${currentUnit}] の発注申請を管理栄養士へ送信しました！`);
                        }}
                        className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2"
                      >
                        <Send className="w-4 h-4" /><span>[{currentUnit}] の申請を管理栄養士へ送信</span>
                      </button>
                    </div>
                  )}
                </div>
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
                    <span>管理栄養士 ダッシュボード・FAX注文票プレビュー ＆ 送信</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">届いている各ユニットの申請を確認し、実際のFAX注文票画面を開いて送信します。</p>
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

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3 text-xs">
                <span className="font-bold text-slate-700 flex items-center space-x-1">
                  <Users className="w-4 h-4 text-emerald-600" /><span>本日の承認担当者:</span>
                </span>
                <div className="flex items-center space-x-2">
                  {systemSettings.nutritionists.map((name, i) => (
                    <button key={i} onClick={() => setSelectedApprover(name)} className={`px-3 py-1 rounded-lg font-bold border ${selectedApprover === name ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}>{name} 様</button>
                  ))}
                </div>
              </div>
            </div>

            {/* 本日届いているユニット別申請一覧 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" /><span>本日届いているユニット別申請一覧</span>
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
                          <span className="text-xs font-bold text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-lg flex items-center space-x-1">
                            <User className="w-3.5 h-3.5 text-sky-600" /><span>発注担当: {uData.staffName || '未記入'} 様</span>
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-500 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" /><span>入力日時: {uData.submittedAt || '7月24日 14:00'}</span>
                        </div>
                      </div>

                      {uData.memo && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                          <p className="font-bold flex items-center space-x-1"><MessageSquare className="w-3.5 h-3.5 text-amber-600" /><span>【{unitKey} 申送りメモ】 (FAX非印字):</span></p>
                          <p className="font-medium bg-white p-2 rounded border border-amber-200">{uData.memo}</p>
                        </div>
                      )}

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
                                <td className="p-2.5 text-center font-bold text-sky-700">{item.facilityQty} {p.unit}</td>
                                <td className="p-2.5 text-center font-bold text-amber-700">{item.personalQty} {p.unit}</td>
                                <td className="p-2.5 text-center font-bold bg-slate-100">{item.facilityQty + item.personalQty} {p.unit}</td>
                                <td className="p-2.5">{item.personalNames ? <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border rounded font-bold text-[11px]">{item.personalNames}</span> : '-'}</td>
                                <td className="p-2.5 text-slate-600">{v ? v.name : '-'}</td>
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

        {/* MODE 4: スプレッドシート */}
        {role === 'sheet' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-lg space-y-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
                <h2 className="text-lg font-bold">Googleスプレッドシート連携 設定手順ガイド ($0運用)</h2>
              </div>
              <p className="text-xs text-emerald-100">管理栄養士様のGoogleアカウントに全自動保存させる簡単な設定手順です。</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 overflow-x-auto">
              <h3 className="text-xs font-bold text-slate-600 mb-3 uppercase">自動記録されるスプレッドシートデータ構造</h3>
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-900 font-bold border-b border-emerald-200">
                    <th className="p-3">入力日時</th>
                    <th className="p-3">ユニット</th>
                    <th className="p-3">発注担当者</th>
                    <th className="p-3">商品名</th>
                    <th className="p-3 text-center">施設分</th>
                    <th className="p-3 text-center">個人分</th>
                    <th className="p-3">FAX印字備考</th>
                    <th className="p-3 text-amber-900">申送りメモ (FAX非印字)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-amber-50/60 font-semibold">
                    <td className="p-3 font-bold text-emerald-800">7/24 14:15</td>
                    <td className="p-3 font-bold">2W</td>
                    <td className="p-3 font-bold text-sky-900">佐藤 健太</td>
                    <td className="p-3">ソフティアS</td>
                    <td className="p-3 text-center text-sky-800">0 個</td>
                    <td className="p-3 text-center text-amber-800">1 個</td>
                    <td className="p-3 font-bold text-slate-900">2W (山田様個人購入)</td>
                    <td className="p-3 text-amber-900">山田様食欲低下のため...</td>
                  </tr>
                </tbody>
              </table>
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
                  <span className="text-xs text-slate-500 font-bold">※備考欄にユニット名が印字されています（職員名・申送りメモは非印字）</span>
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
