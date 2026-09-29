import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Eye,
  EyeOff,
  FileDown,
  Laptop,
  Palmtree,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../services/voiceParser';
import { DonutChart } from '../common/DonutChart';
import { WeeklySpendingChart } from '../common/WeeklySpendingChart';
import { SmartHabitsBanner } from '../common/SmartHabitsBanner';

export const HomeScreen: React.FC = () => {
  const {
    t,
    themeConfig,
    settings,
    toggleHideBalance,
    totalBalance,
    totalIncome,
    totalExpense,
    categoryExpenses,
    goals,
    transactions,
    categories,
    setActiveTab,
    setIsGoalModalOpen,
    setSelectedTransaction,
    currentMonthYear,
    setCurrentMonthYear,
    setIsAddExpenseOpen,
    setIsAddIncomeOpen,
    setIsTransferOpen,
    setIsExportModalOpen
  } = useApp();

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 pb-24 animate-fade-in w-full">
      {/* 1. Master Total Balance Card (Mirroring Screenshot 3D Blue Card) */}
      <div
        className="w-full rounded-3xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden transition-all"
        style={{
          background: themeConfig.balanceCardBg,
          boxShadow: `0 14px 30px -8px ${themeConfig.primary}60`
        }}
      >
        {/* Soft 3D Glossy Blobs */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-900/30 rounded-full blur-xl pointer-events-none" />

        {/* Floating 3D Wallet Graphic in top-right */}
        <div className="absolute right-3 top-3 w-20 h-20 opacity-20 sm:opacity-30 pointer-events-none flex items-center justify-center">
          <div className="relative">
            <Wallet className="w-16 h-16 text-white stroke-[1.5]" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400/80 text-amber-950 font-black text-[10px] flex items-center justify-center shadow-md">
              đ
            </div>
          </div>
        </div>

        {/* Top bar with Label & Eye */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 text-white/95">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Wallet className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold tracking-wide uppercase">{t('totalBalance')}</span>
          </div>
          <button
            onClick={toggleHideBalance}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all active:scale-90"
            title="Ẩn/hiện số dư"
          >
            {settings.hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Main Amount */}
        <div className="mt-2.5 mb-2 relative z-10">
          <div className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm">
            {settings.hideBalance ? '•••••••• ₫' : formatVND(totalBalance)}
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold text-white mt-1 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('financeBetter')}</span>
            <TrendingUp className="w-3 h-3 text-emerald-300" />
          </div>
        </div>

        {/* Income & Expense Split White Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3.5 pt-3 border-t border-white/15 relative z-10">
          {/* Thu nhập */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-2.5 text-slate-800 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium block truncate">{t('income')}</span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 tracking-tight block truncate">
                {settings.hideBalance ? '•••• ₫' : `+${formatVND(totalIncome)}`}
              </span>
            </div>
          </div>

          {/* Chi tiêu */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-2.5 text-slate-800 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium block truncate">{t('expense')}</span>
              <span className="text-xs sm:text-sm font-black text-rose-600 tracking-tight block truncate">
                {settings.hideBalance ? '•••• ₫' : `-${formatVND(totalExpense)}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Smart Spending Habits & Recurring Push Alerts Banner */}
      <SmartHabitsBanner />

      {/* 3. Month Overview Section with Donut Chart & Category Breakdown (Matching Screenshot 1) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100/90 transition-all">
        <div className="flex items-center justify-between pb-2 border-b border-slate-50">
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                {t('monthOverview')} {currentMonthYear.month}/{currentMonthYear.year}
              </h3>
              <span className="text-slate-400 text-xs">⌵</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingDown className="w-3 h-3" /> {t('comparedToLastMonth')}: -12.5%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-90 transition-all"
              title="Xuất báo cáo PDF / CSV"
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 bg-blue-50 px-2.5 py-1 rounded-xl active:scale-95 transition-all"
              style={{ color: themeConfig.primary, backgroundColor: `${themeConfig.primary}12` }}
            >
              {t('viewReport')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Donut Chart Center */}
        <div className="flex items-center justify-center my-3">
          <DonutChart
            slices={categoryExpenses.map((c) => ({
              label: c.category.name,
              value: c.amount,
              color: c.category.color,
              percentage: c.percentage
            }))}
            centerLabel={t('totalExpense')}
            centerValue={totalExpense}
            size={185}
            strokeWidth={26}
          />
        </div>

        {/* Category List Breakdown with 3D Glossy Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          {categoryExpenses.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-md inline-block shadow-2xs shrink-0"
                  style={{ backgroundColor: item.category.color }}
                />
                <span className="font-semibold text-slate-700 truncate">{item.category.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">({item.percentage}%)</span>
              </div>
              <span className="font-bold text-slate-900 tracking-tight shrink-0 ml-1">
                {formatVND(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. The 5 Quick Action Buttons Row (Exact layout from the reference image) */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-100/90">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {/* 1. Thêm chi tiêu */}
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-2xl hover:bg-rose-50/50 active:scale-90 transition-all group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-100 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
              Thêm chi tiêu
            </span>
          </button>

          {/* 2. Thêm thu nhập */}
          <button
            onClick={() => setIsAddIncomeOpen(true)}
            className="flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-2xl hover:bg-sky-50/50 active:scale-90 transition-all group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs border border-sky-100 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5 text-sky-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
              Thêm thu nhập
            </span>
          </button>

          {/* 3. Chuyển khoản */}
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-2xl hover:bg-blue-50/50 active:scale-90 transition-all group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs border border-blue-100 group-hover:scale-105 transition-transform">
              <ArrowDownRight className="w-5 h-5 text-blue-600 rotate-45" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
              Chuyển khoản
            </span>
          </button>

          {/* 4. Lập ngân sách */}
          <button
            onClick={() => setActiveTab('budget')}
            className="flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-2xl hover:bg-amber-50/50 active:scale-90 transition-all group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs border border-amber-100 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
              Lập ngân sách
            </span>
          </button>

          {/* 5. Xem báo cáo */}
          <button
            onClick={() => setActiveTab('reports')}
            className="flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-2xl hover:bg-purple-50/50 active:scale-90 transition-all group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs border border-purple-100 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
              Xem báo cáo
            </span>
          </button>
        </div>
      </div>

      {/* 4. Biểu đồ tóm tắt chi tiêu trong tuần (Weekly Spending Summary Chart) */}
      <WeeklySpendingChart />

      {/* 5. Goals Section (Matching Screenshot 1 & 6) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100/90">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">{t('yourGoals')}</h3>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            style={{ color: themeConfig.primary }}
          >
            <Plus className="w-3.5 h-3.5" /> {t('addGoal')}
          </button>
        </div>

        <div className="space-y-2.5">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            return (
              <div
                key={goal.id}
                onClick={() => setIsGoalModalOpen(true)}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/30 hover:to-blue-50 border border-slate-100 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs"
                      style={{ backgroundColor: goal.color }}
                    >
                      {goal.icon === 'Palmtree' ? <Palmtree className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm block">{goal.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Hạn chót: {goal.deadline}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-600" style={{ color: themeConfig.primary }}>{progress}%</span>
                </div>

                {/* Progress capsule bar */}
                <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden my-2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: goal.color || '#2563EB'
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span>{formatVND(goal.currentAmount)}</span>
                  <span>Mục tiêu: {formatVND(goal.targetAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Transactions Section (Matching Screenshot 1) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100/90">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">{t('recentTransactions')}</h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            style={{ color: themeConfig.primary }}
          >
            {t('viewAll')} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTransaction(tx)}
                className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 px-1 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0"
                    style={{ backgroundColor: cat?.color || '#2563EB' }}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{tx.title}</div>
                    <div className="text-[10px] text-slate-400 font-medium truncate">
                      {tx.time} • {tx.date}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-xs sm:text-sm font-black tracking-tight shrink-0 ml-2 ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatVND(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
