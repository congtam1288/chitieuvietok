import React from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  Calendar,
  Home,
  Mic,
  MinusCircle,
  PieChart,
  Plus,
  PlusCircle,
  User,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    themeConfig,
    t,
    isPlusMenuOpen,
    setIsPlusMenuOpen,
    setIsAddExpenseOpen,
    setIsAddIncomeOpen,
    setIsTransferOpen,
    setIsVoiceModalOpen
  } = useApp();

  const handleAction = (action: () => void) => {
    setIsPlusMenuOpen(false);
    action();
  };

  return (
    <>
      {/* Plus Action Modal Sheet */}
      {isPlusMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 flex items-end justify-center p-4 animate-fade-in"
          onClick={() => setIsPlusMenuOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-3 mb-20 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-sm">Thao tác nhanh</span>
              <button
                onClick={() => setIsPlusMenuOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Thêm chi tiêu */}
              <button
                onClick={() => handleAction(() => setIsAddExpenseOpen(true))}
                className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 active:scale-95 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
                  <MinusCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">{t('addExpense')}</div>
                  <div className="text-[10px] text-rose-500 font-medium">Ghi nhận tiền ra</div>
                </div>
              </button>

              {/* Thêm thu nhập */}
              <button
                onClick={() => handleAction(() => setIsAddIncomeOpen(true))}
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 active:scale-95 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">{t('addIncome')}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">Ghi nhận tiền vào</div>
                </div>
              </button>

              {/* Chuyển khoản */}
              <button
                onClick={() => handleAction(() => setIsTransferOpen(true))}
                className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 active:scale-95 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">{t('transfer')}</div>
                  <div className="text-[10px] text-blue-500 font-medium">Giữa các tài khoản</div>
                </div>
              </button>

              {/* Lập ngân sách */}
              <button
                onClick={() => handleAction(() => setActiveTab('budget'))}
                className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-700 active:scale-95 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">{t('planBudget')}</div>
                  <div className="text-[10px] text-amber-600 font-medium">Kiểm soát chi tiêu</div>
                </div>
              </button>
            </div>

            {/* Nhập nhanh bằng giọng nói Super button */}
            <button
              onClick={() => handleAction(() => setIsVoiceModalOpen(true))}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl text-white font-bold text-sm shadow-md active:scale-95 transition-all"
              style={{ background: themeConfig.floatingBtnBg }}
            >
              <Mic className="w-5 h-5" />
              <span>{t('enterWithVoice')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-3 px-4 pointer-events-none">
        <nav className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100/80 px-4 py-2 flex items-center justify-between pointer-events-auto relative">
          {/* 1. Trang chủ */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'home'
                ? 'font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            style={{ color: activeTab === 'home' ? themeConfig.primary : undefined }}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                activeTab === 'home' ? 'bg-emerald-50 text-emerald-600' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'home' ? `${themeConfig.primary}15` : 'transparent',
                color: activeTab === 'home' ? themeConfig.primary : undefined
              }}
            >
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">{t('home')}</span>
          </button>

          {/* 2. Giao dịch */}
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'transactions'
                ? 'font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            style={{ color: activeTab === 'transactions' ? themeConfig.primary : undefined }}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                activeTab === 'transactions' ? 'bg-emerald-50 text-emerald-600' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'transactions' ? `${themeConfig.primary}15` : 'transparent',
                color: activeTab === 'transactions' ? themeConfig.primary : undefined
              }}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">{t('transactions')}</span>
          </button>

          {/* 3. Center Glowing Floating (+) Button */}
          <div className="relative -top-5 flex flex-col items-center">
            <button
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              aria-label="Add transaction or voice input"
              className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform duration-200"
              style={{
                background: themeConfig.floatingBtnBg,
                boxShadow: `0 10px 25px -4px ${themeConfig.primary}70`
              }}
            >
              <Plus
                className={`w-7 h-7 transition-transform duration-300 ${
                  isPlusMenuOpen ? 'rotate-45' : 'rotate-0'
                }`}
              />
            </button>
          </div>

          {/* 4. Báo cáo */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'reports'
                ? 'font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            style={{ color: activeTab === 'reports' ? themeConfig.primary : undefined }}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                activeTab === 'reports' ? 'bg-emerald-50 text-emerald-600' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'reports' ? `${themeConfig.primary}15` : 'transparent',
                color: activeTab === 'reports' ? themeConfig.primary : undefined
              }}
            >
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">{t('reports')}</span>
          </button>

          {/* 5. Tài khoản / Cài đặt */}
          <button
            onClick={() => setActiveTab('account')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'account' || activeTab === 'settings'
                ? 'font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            style={{ color: activeTab === 'account' || activeTab === 'settings' ? themeConfig.primary : undefined }}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                activeTab === 'account' || activeTab === 'settings' ? 'bg-emerald-50 text-emerald-600' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'account' || activeTab === 'settings' ? `${themeConfig.primary}15` : 'transparent',
                color: activeTab === 'account' || activeTab === 'settings' ? themeConfig.primary : undefined
              }}
            >
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">{t('account')}</span>
          </button>
        </nav>
      </div>
    </>
  );
};
