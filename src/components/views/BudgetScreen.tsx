import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Copy,
  Edit,
  Edit3,
  Layers,
  PieChart,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Volume2,
  VolumeX,
  X,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../services/voiceParser';
import {
  calculateBudgetAlerts,
  CategoryBudgetStatus,
  checkAndDispatchBudgetNotifications,
  playAlertChime
} from '../../services/budgetAlertService';
import { BudgetAlertHub } from '../budget/BudgetAlertHub';
import { CategoryBudgetModal } from '../budget/CategoryBudgetModal';
import { CategoryTransactionsModal } from '../budget/CategoryTransactionsModal';

export const BudgetScreen: React.FC = () => {
  const {
    t,
    themeConfig,
    budget,
    updateBudget,
    totalExpense,
    goals,
    setIsGoalModalOpen,
    categories,
    currentMonthYear,
    transactions,
    addTransaction,
    deleteTransaction,
    addNotification,
    setSelectedTransaction,
    setIsNotificationOpen
  } = useApp();

  // Budget Edit Drawer
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState<number>(budget.totalBudget);
  const [notesInput, setNotesInput] = useState<string>(budget.notes || '');

  // Category Modals
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<CategoryBudgetStatus | null>(null);
  const [selectedCategoryForTransactions, setSelectedCategoryForTransactions] = useState<CategoryBudgetStatus | null>(null);

  // Floating Real-Time Toast Alert
  const [activeToastAlert, setActiveToastAlert] = useState<CategoryBudgetStatus | null>(null);

  // Simulated Transactions Tracker for testing real-time notifications
  const [simulatedTxIds, setSimulatedTxIds] = useState<string[]>([]);

  // 1. Calculate Real-time Budget & Spending per Category
  const budgetStatus = useMemo(() => {
    return calculateBudgetAlerts(
      budget,
      categories,
      transactions,
      currentMonthYear.month,
      currentMonthYear.year
    );
  }, [budget, categories, transactions, currentMonthYear]);

  // 2. Real-time Notification Engine: Detect threshold crossing (80% or 100%) and dispatch notification
  useEffect(() => {
    const { newlyTriggered } = checkAndDispatchBudgetNotifications(
      budgetStatus,
      currentMonthYear.month,
      currentMonthYear.year,
      addNotification
    );

    if (newlyTriggered.length > 0) {
      const topAlert = newlyTriggered[0];
      setActiveToastAlert(topAlert);
      playAlertChime(topAlert.alertLevel);
    }
  }, [budgetStatus, currentMonthYear, addNotification]);

  // Handle Main Budget Update
  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudget({
      totalBudget: totalBudgetInput,
      notes: notesInput
    });
    setIsEditingBudget(false);
  };

  // Simulation Helper for Testing Real-Time Alerts
  const handleSimulateExpense = (categoryName: string, amount: number, title: string) => {
    const targetCat = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase()) || categories[0];
    const now = new Date();
    const monthStr = String(currentMonthYear.month).padStart(2, '0');
    const dateStr = `${currentMonthYear.year}-${monthStr}-15`;

    const newTx = addTransaction({
      userId: 'user-1',
      type: 'expense',
      amount,
      categoryId: targetCat.id,
      title: `[Thử nghiệm] ${title}`,
      note: 'Giao dịch thử nghiệm cảnh báo thời gian thực 80% & 100%',
      date: dateStr,
      time: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      accountId: 'vcb-1',
      paymentMethod: 'Chuyển khoản Vietcombank',
      syncStatus: 'synced'
    });

    setSimulatedTxIds((prev) => [...prev, newTx.id]);
  };

  const handleResetSimulation = () => {
    // Delete all simulated transactions
    simulatedTxIds.forEach((id) => {
      deleteTransaction(id);
    });
    setSimulatedTxIds([]);

    // Clear alert flags in localStorage so user can test again
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('chitieuviet_alert_sent_'));
    keys.forEach((k) => localStorage.removeItem(k));
    setActiveToastAlert(null);
  };

  const usedAmount = budgetStatus.totalSpent;
  const remainingAmount = budgetStatus.totalRemaining;
  const usedPercent = budgetStatus.overallPercent;
  const remainingPercent = Math.max(0, 100 - usedPercent);

  return (
    <div className="flex flex-col gap-4 pb-24 animate-fade-in relative">
      {/* Real-time Floating Toast Alert Banner */}
      {activeToastAlert && (
        <div className="sticky top-2 z-40 w-full animate-slide-down">
          <div
            className={`p-3.5 rounded-2xl shadow-xl border text-white flex items-center justify-between gap-3 ${
              activeToastAlert.alertLevel === 'danger_100'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 border-rose-400'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                {activeToastAlert.alertLevel === 'danger_100' ? (
                  <AlertOctagon className="w-4 h-4 text-white animate-pulse" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="text-xs">
                <span className="font-black block tracking-tight">
                  {activeToastAlert.alertLevel === 'danger_100'
                    ? `🚨 BÁO ĐỘNG VƯỢT TRẦN 100%: ${activeToastAlert.categoryName}`
                    : `⚠️ CẢNH BÁO CHẠM 80%: ${activeToastAlert.categoryName}`}
                </span>
                <span className="text-[11px] text-white/90">
                  Đã tiêu {formatVND(activeToastAlert.spentAmount)} / {formatVND(activeToastAlert.allocatedAmount)} ({activeToastAlert.percentSpent}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setSelectedCategoryForEdit(activeToastAlert);
                  setActiveToastAlert(null);
                }}
                className="px-2.5 py-1 rounded-xl bg-white text-slate-800 text-[10px] font-black hover:bg-slate-50 transition-colors active:scale-95 shadow-xs"
              >
                Sửa hạn mức
              </button>
              <button
                onClick={() => setActiveToastAlert(null)}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner (Total Monthly Budget) */}
      <div
        className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
        style={{ background: themeConfig.cardGradient }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              <span>Kế hoạch ngân sách</span>
              {budgetStatus.hasAlerts && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/80 text-white text-[9px] font-black animate-pulse">
                  {budgetStatus.danger100Count > 0
                    ? `${budgetStatus.danger100Count} Vượt 100%`
                    : `${budgetStatus.warning80Count} Chạm 80%`}
                </span>
              )}
            </h2>
            <p className="text-xs text-white/80">{t('budgetPlannerHeader')}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition-all active:scale-95 relative"
              title="Trung tâm thông báo"
            >
              <Bell className="w-4 h-4" />
              {budgetStatus.hasAlerts && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <button
              onClick={() => setIsEditingBudget(!isEditingBudget)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition-all active:scale-95"
              title="Sửa tổng ngân sách"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Budget Numbers */}
        <div className="mt-3">
          <span className="text-[10px] text-white/80 uppercase tracking-wider block">
            {t('totalBudgetMonth')} {currentMonthYear.month}/{currentMonthYear.year}
          </span>
          <div className="text-3xl font-black tracking-tight drop-shadow-sm mt-0.5">
            {formatVND(budget.totalBudget)}
          </div>
        </div>

        {/* Used vs Remaining Pills */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-white/15">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5">
            <span className="text-[10px] text-white/80 block">
              {t('used')} ({usedPercent}%)
            </span>
            <span className="text-sm font-bold text-white">{formatVND(usedAmount)}</span>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5">
            <span className="text-[10px] text-white/80 block">
              {t('remaining')} ({remainingPercent}%)
            </span>
            <span className="text-sm font-bold text-emerald-200">{formatVND(remainingAmount)}</span>
          </div>
        </div>
      </div>

      {/* Edit Budget Form Modal/Drawer */}
      {isEditingBudget && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-200 animate-slide-up">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Chỉnh sửa ngân sách tháng</h3>
          <form onSubmit={handleSaveBudget} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tổng ngân sách (₫)</label>
              <input
                type="number"
                value={totalBudgetInput}
                onChange={(e) => setTotalBudgetInput(Number(e.target.value))}
                className="w-full text-base font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú phương châm</label>
              <input
                type="text"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:bg-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-white font-bold text-xs shadow-sm"
                style={{ background: themeConfig.cardGradient }}
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. REAL-TIME NOTIFICATION SYSTEM & ALERT HUB */}
      <BudgetAlertHub
        categoriesStatus={budgetStatus.categoriesStatus}
        alertedCategories={budgetStatus.alertedCategories}
        onOpenCategoryModal={(cat) => setSelectedCategoryForEdit(cat)}
        onOpenTransactionsModal={(cat) => setSelectedCategoryForTransactions(cat)}
        onSimulateExpense={handleSimulateExpense}
        onResetSimulation={handleResetSimulation}
        isSimulated={simulatedTxIds.length > 0}
      />

      {/* 3. Budget Allocation by Category with Real-time Spending, 80% & 100% Thresholds */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">{t('budgetAllocation')}</h3>
            <p className="text-[11px] text-slate-500">
              Giám sát hạn mức và tiến độ thực tế theo danh mục
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-3">
          {budgetStatus.categoriesStatus.map((item) => {
            const isDanger = item.alertLevel === 'danger_100';
            const isWarning = item.alertLevel === 'warning_80';

            return (
              <div
                key={item.categoryId}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isDanger
                    ? 'bg-rose-50/50 border-rose-200'
                    : isWarning
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50'
                }`}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.categoryColor }}
                    />
                    <span className="font-bold text-slate-800">{item.categoryName}</span>

                    {/* Status Badge */}
                    {isDanger ? (
                      <span className="px-1.5 py-0.2 rounded-md bg-rose-600 text-white text-[9px] font-black flex items-center gap-0.5 animate-pulse">
                        <AlertOctagon className="w-2.5 h-2.5" /> Vượt 100%
                      </span>
                    ) : isWarning ? (
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[9px] font-black flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Chạm 80%
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        An toàn
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold text-[11px]">
                      {item.percentSpent}%
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {formatVND(item.allocatedAmount)}
                    </span>
                  </div>
                </div>

                {/* Spending Numbers breakdown */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 px-0.5">
                  <span>
                    Đã chi:{' '}
                    <strong
                      className={`font-bold ${
                        isDanger ? 'text-rose-600' : isWarning ? 'text-amber-700' : 'text-slate-700'
                      }`}
                    >
                      {formatVND(item.spentAmount)}
                    </strong>
                  </span>
                  <span>
                    {isDanger ? 'Vượt hạn mức:' : 'Còn lại:'}{' '}
                    <strong className={`font-bold ${isDanger ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isDanger ? `+${formatVND(item.exceededAmount)}` : formatVND(item.remainingAmount)}
                    </strong>
                  </span>
                </div>

                {/* Progress bar with marked 80% and 100% threshold ticks */}
                <div className="relative">
                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDanger
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, item.percentSpent)}%`
                      }}
                    />
                  </div>

                  {/* 80% and 100% tick marks */}
                  <div className="relative w-full h-2 pointer-events-none">
                    <div
                      className="absolute -top-2 w-0.5 h-2 bg-amber-400/80 -translate-x-1/2"
                      style={{ left: '80%' }}
                      title="Mốc 80%"
                    />
                    <div
                      className="absolute -top-2 w-0.5 h-2 bg-rose-400/80 -translate-x-full"
                      style={{ left: '100%' }}
                      title="Mốc 100%"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 mt-2 pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedCategoryForTransactions(item)}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-0.5"
                  >
                    <TrendingDown className="w-3 h-3 text-rose-500" />
                    <span>Xem {item.transactionsCount} giao dịch</span>
                  </button>

                  <span className="text-slate-300 text-xs">•</span>

                  <button
                    onClick={() => setSelectedCategoryForEdit(item)}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-0.5"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Sửa hạn mức</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Goals (Matching Screenshot 6) */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-sm">{t('financialGoals')}</h3>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
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
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{goal.title}</span>
                  <span className="font-bold text-emerald-600">{progress}%</span>
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden my-1">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progress}%`, backgroundColor: goal.color }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{formatVND(goal.currentAmount)}</span>
                  <span>{formatVND(goal.targetAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Notes Card (Matching Screenshot 6) */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-4">
        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
          {t('budgetNotes')}
        </span>
        <p className="text-xs text-amber-900 font-medium italic leading-relaxed">
          "{budget.notes}"
        </p>
      </div>

      {/* Budget Management Quick Actions (Screenshot 6) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setIsEditingBudget(true)}
          className="py-2.5 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>{t('editBudget')}</span>
        </button>

        <button
          onClick={() => {
            alert('Đã sao chép ngân sách sang tháng tiếp theo!');
          }}
          className="py-2.5 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{t('copyBudget')}</span>
        </button>
      </div>

      {/* Category Budget Modal (Edit limit) */}
      <CategoryBudgetModal
        isOpen={selectedCategoryForEdit !== null}
        onClose={() => setSelectedCategoryForEdit(null)}
        categoryStatus={selectedCategoryForEdit}
        budget={budget}
        categories={categories}
        onUpdateBudget={updateBudget}
      />

      {/* Category Transactions Modal */}
      <CategoryTransactionsModal
        isOpen={selectedCategoryForTransactions !== null}
        onClose={() => setSelectedCategoryForTransactions(null)}
        categoryStatus={selectedCategoryForTransactions}
        transactions={transactions}
        month={currentMonthYear.month}
        year={currentMonthYear.year}
        onSelectTransaction={(tx) => setSelectedTransaction(tx)}
      />
    </div>
  );
};
