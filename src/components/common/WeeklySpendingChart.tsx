import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Plus,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../services/voiceParser';
import { Transaction } from '../../types';

interface DayData {
  dayLabel: string; // T2, T3...
  fullDayLabel: string; // Thứ Hai, Thứ Ba...
  dateStr: string; // YYYY-MM-DD
  displayDate: string; // 13/05
  amount: number;
  transactions: Transaction[];
  isToday: boolean;
  isPeak: boolean;
}

// Format short amounts for bar tops (e.g. 1.2tr, 450k, 0đ)
function formatShortAmount(amount: number): string {
  if (amount <= 0) return '0đ';
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return millions % 1 === 0 ? `${millions}tr` : `${millions.toFixed(1)}tr`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1000)}k`;
  }
  return `${amount}đ`;
}

// Get Monday of a given date (assuming Monday is start of week)
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DAY_NAMES_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const FULL_DAY_NAMES_VI = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật'
];

export const WeeklySpendingChart: React.FC = () => {
  const {
    transactions,
    categories,
    themeConfig,
    setSelectedTransaction,
    setIsAddExpenseOpen,
    t
  } = useApp();

  // Smart initial anchor date:
  // If there are transactions in current calendar week, anchor to today.
  // Otherwise, anchor to the week of the latest expense transaction so demo data immediately shines!
  const initialAnchorDate = useMemo(() => {
    const today = new Date();
    const todayMonday = getMonday(today);
    const todaySunday = new Date(todayMonday);
    todaySunday.setDate(todayMonday.getDate() + 6);
    const todayMondayStr = formatDateISO(todayMonday);
    const todaySundayStr = formatDateISO(todaySunday);

    const hasCurrentWeekExpense = transactions.some(
      (tx) => tx.type === 'expense' && tx.date >= todayMondayStr && tx.date <= todaySundayStr
    );

    if (hasCurrentWeekExpense) {
      return today;
    }

    // Find latest expense transaction
    const expenseTxs = transactions.filter((tx) => tx.type === 'expense');
    if (expenseTxs.length > 0) {
      const sorted = [...expenseTxs].sort((a, b) => b.date.localeCompare(a.date));
      const [year, month, day] = sorted[0].date.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    return today;
  }, [transactions]);

  // weekOffset relative to initialAnchorDate (0 = anchor week, -1 = previous week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Compute the Monday of the currently selected week
  const currentWeekMonday = useMemo(() => {
    const baseMonday = getMonday(initialAnchorDate);
    const monday = new Date(baseMonday);
    monday.setDate(baseMonday.getDate() + weekOffset * 7);
    return monday;
  }, [initialAnchorDate, weekOffset]);

  // Today ISO string for highlighting
  const todayISO = useMemo(() => formatDateISO(new Date()), []);

  // Compute 7 days of the week
  const weekDaysData = useMemo(() => {
    const days: DayData[] = [];
    const expenseTxs = transactions.filter((tx) => tx.type === 'expense');

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekMonday);
      date.setDate(currentWeekMonday.getDate() + i);
      const dateStr = formatDateISO(date);
      const isToday = dateStr === todayISO;

      const dayTxs = expenseTxs.filter((tx) => tx.date === dateStr);
      const totalAmount = dayTxs.reduce((sum, tx) => sum + tx.amount, 0);

      days.push({
        dayLabel: DAY_NAMES_VI[i],
        fullDayLabel: FULL_DAY_NAMES_VI[i],
        dateStr,
        displayDate: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
        amount: totalAmount,
        transactions: dayTxs,
        isToday,
        isPeak: false
      });
    }

    // Mark peak day if amount > 0
    let maxAmount = 0;
    days.forEach((d) => {
      if (d.amount > maxAmount) maxAmount = d.amount;
    });
    if (maxAmount > 0) {
      days.forEach((d) => {
        if (d.amount === maxAmount) d.isPeak = true;
      });
    }

    return days;
  }, [currentWeekMonday, transactions, todayISO]);

  // Weekly total & metrics
  const totalWeeklyExpense = useMemo(() => {
    return weekDaysData.reduce((sum, d) => sum + d.amount, 0);
  }, [weekDaysData]);

  const dailyAverage = useMemo(() => {
    return Math.round(totalWeeklyExpense / 7);
  }, [totalWeeklyExpense]);

  const peakDay = useMemo(() => {
    const sorted = [...weekDaysData].sort((a, b) => b.amount - a.amount);
    return sorted[0] && sorted[0].amount > 0 ? sorted[0] : null;
  }, [weekDaysData]);

  // Previous week comparison
  const previousWeekExpense = useMemo(() => {
    const prevMonday = new Date(currentWeekMonday);
    prevMonday.setDate(currentWeekMonday.getDate() - 7);
    const prevSunday = new Date(prevMonday);
    prevSunday.setDate(prevMonday.getDate() + 6);

    const prevMonStr = formatDateISO(prevMonday);
    const prevSunStr = formatDateISO(prevSunday);

    return transactions
      .filter((tx) => tx.type === 'expense' && tx.date >= prevMonStr && tx.date <= prevSunStr)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [currentWeekMonday, transactions]);

  const spendingDiff = useMemo(() => {
    if (previousWeekExpense === 0) return null;
    const diff = totalWeeklyExpense - previousWeekExpense;
    const percent = Math.round((diff / previousWeekExpense) * 100);
    return { diff, percent };
  }, [totalWeeklyExpense, previousWeekExpense]);

  // Week range label (e.g. "13/05 – 19/05/2024")
  const weekRangeLabel = useMemo(() => {
    const sunday = new Date(currentWeekMonday);
    sunday.setDate(currentWeekMonday.getDate() + 6);

    const d1 = String(currentWeekMonday.getDate()).padStart(2, '0');
    const m1 = String(currentWeekMonday.getMonth() + 1).padStart(2, '0');
    const d2 = String(sunday.getDate()).padStart(2, '0');
    const m2 = String(sunday.getMonth() + 1).padStart(2, '0');
    const y2 = sunday.getFullYear();

    return `${d1}/${m1} – ${d2}/${m2}/${y2}`;
  }, [currentWeekMonday]);

  // Top 3 categories in this week
  const topWeeklyCategories = useMemo(() => {
    const catMap: Record<string, number> = {};
    weekDaysData.forEach((day) => {
      day.transactions.forEach((tx) => {
        catMap[tx.categoryId] = (catMap[tx.categoryId] || 0) + tx.amount;
      });
    });

    return Object.entries(catMap)
      .map(([id, amount]) => {
        const cat = categories.find((c) => c.id === id);
        return {
          id,
          name: cat?.name || 'Khác',
          color: cat?.color || '#3B82F6',
          amount,
          percentage: totalWeeklyExpense > 0 ? Math.round((amount / totalWeeklyExpense) * 100) : 0
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [weekDaysData, categories, totalWeeklyExpense]);

  // Bar height calculation (max 100%, min 8% for 0 so bar is visible)
  const maxBarAmount = useMemo(() => {
    const max = Math.max(...weekDaysData.map((d) => d.amount));
    return max > 0 ? max : 500000;
  }, [weekDaysData]);

  // Selected day object
  const activeDay = selectedDayIndex !== null ? weekDaysData[selectedDayIndex] : null;

  // Check if viewing current real calendar week
  const isCurrentCalendarWeek = useMemo(() => {
    const realMonday = getMonday(new Date());
    return formatDateISO(currentWeekMonday) === formatDateISO(realMonday);
  }, [currentWeekMonday]);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100/90 transition-all">
      {/* 1. Header with Title & Week Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: themeConfig.primary }}
          >
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                {t('weeklySpending')}
              </h3>
              {isCurrentCalendarWeek && (
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100">
                  {t('thisWeek')}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">
              {weekRangeLabel}
            </span>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1">
          {!isCurrentCalendarWeek && (
            <button
              onClick={() => {
                const realMonday = getMonday(new Date());
                const baseMonday = getMonday(initialAnchorDate);
                const diffDays = Math.round((realMonday.getTime() - baseMonday.getTime()) / (1000 * 60 * 60 * 24));
                setWeekOffset(Math.round(diffDays / 7));
                setSelectedDayIndex(null);
              }}
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 px-2 py-1 rounded-lg flex items-center gap-1 active:scale-95 transition-all mr-1"
              title={t('backToCurrentWeek')}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{t('thisWeek')}</span>
            </button>
          )}

          <button
            onClick={() => {
              setWeekOffset((prev) => prev - 1);
              setSelectedDayIndex(null);
            }}
            className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center active:scale-90 transition-all"
            title="Tuần trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setWeekOffset((prev) => prev + 1);
              setSelectedDayIndex(null);
            }}
            className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center active:scale-90 transition-all"
            title="Tuần sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-50">
        {/* Metric 1: Tổng chi */}
        <div className="bg-slate-50/80 rounded-2xl p-2.5 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-medium block truncate">
            {t('totalExpense')}
          </span>
          <span className="text-xs sm:text-sm font-black text-rose-600 tracking-tight mt-0.5 truncate">
            {formatVND(totalWeeklyExpense)}
          </span>
          {spendingDiff ? (
            <span
              className={`text-[9px] font-bold flex items-center gap-0.5 mt-1 truncate ${
                spendingDiff.percent <= 0 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {spendingDiff.percent <= 0 ? (
                <>
                  <TrendingDown className="w-2.5 h-2.5 inline shrink-0" />
                  {Math.abs(spendingDiff.percent)}% {t('comparedToLastWeek')}
                </>
              ) : (
                <>
                  <TrendingUp className="w-2.5 h-2.5 inline shrink-0" />
                  +{spendingDiff.percent}% {t('comparedToLastWeek')}
                </>
              )}
            </span>
          ) : (
            <span className="text-[9px] text-slate-400 font-medium mt-1 truncate">
              {t('weekOverview')}
            </span>
          )}
        </div>

        {/* Metric 2: Trung bình/ngày */}
        <div className="bg-slate-50/80 rounded-2xl p-2.5 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-medium block truncate">
            {t('dailyAverage')}
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight mt-0.5 truncate">
            {formatVND(dailyAverage)}
          </span>
          <span className="text-[9px] text-slate-400 font-medium mt-1 truncate">
            7 ngày trong tuần
          </span>
        </div>

        {/* Metric 3: Chi nhiều nhất */}
        <div className="bg-slate-50/80 rounded-2xl p-2.5 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-medium block truncate">
            {t('peakSpending')}
          </span>
          <span className="text-xs sm:text-sm font-black text-amber-600 tracking-tight mt-0.5 truncate flex items-center gap-1">
            {peakDay ? `${peakDay.dayLabel} • ${formatShortAmount(peakDay.amount)}` : '0 ₫'}
          </span>
          <span className="text-[9px] text-slate-400 font-medium mt-1 truncate">
            {peakDay ? peakDay.displayDate : 'Không phát sinh'}
          </span>
        </div>
      </div>

      {/* 3. Interactive Bar Chart */}
      <div className="mt-3 relative">
        {/* Average Line Indicator */}
        {dailyAverage > 0 && maxBarAmount > 0 && (
          <div
            className="absolute left-0 right-0 z-0 pointer-events-none flex items-center"
            style={{
              bottom: `${Math.min(90, Math.max(15, (dailyAverage / maxBarAmount) * 110 + 36))}px`
            }}
          >
            <div className="w-full border-b border-dashed border-slate-300 relative">
              <span className="absolute right-1 -top-4 text-[9px] font-semibold text-slate-400 bg-white/90 px-1 rounded shadow-2xs">
                {t('avgLine')}: {formatShortAmount(dailyAverage)}
              </span>
            </div>
          </div>
        )}

        {/* 7 Columns Container */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 items-end h-44 pt-6 pb-2 px-1 relative z-10">
          {weekDaysData.map((day, idx) => {
            const heightPercent =
              maxBarAmount > 0 && day.amount > 0
                ? Math.min(100, Math.max(14, Math.round((day.amount / maxBarAmount) * 95)))
                : 7;

            const isSelected = selectedDayIndex === idx;

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedDayIndex(isSelected ? null : idx)}
                className={`flex flex-col items-center justify-end h-full group focus:outline-none transition-all rounded-xl p-1 relative ${
                  isSelected ? 'bg-slate-100/90 ring-2 ring-blue-500/40 shadow-xs' : 'hover:bg-slate-50'
                }`}
              >
                {/* Crown badge for Peak day */}
                {day.isPeak && day.amount > 0 && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center justify-center animate-bounce">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs">
                      <Crown className="w-2.5 h-2.5 fill-amber-950" />
                    </span>
                  </div>
                )}

                {/* Amount label on top of bar */}
                <span
                  className={`text-[9px] font-bold mb-1 tracking-tight transition-colors truncate max-w-full ${
                    isSelected
                      ? 'text-blue-700 font-extrabold scale-105'
                      : day.isPeak
                      ? 'text-amber-600'
                      : day.amount > 0
                      ? 'text-slate-600'
                      : 'text-slate-300'
                  }`}
                >
                  {formatShortAmount(day.amount)}
                </span>

                {/* Vertical Bar Cylinder */}
                <div className="w-full max-w-[28px] sm:max-w-[34px] h-28 bg-slate-100 rounded-xl relative flex items-end overflow-hidden p-0.5">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 relative ${
                      day.amount > 0
                        ? isSelected
                          ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-sm'
                          : day.isPeak
                          ? 'bg-gradient-to-t from-amber-500 to-rose-400 shadow-xs'
                          : 'bg-gradient-to-t from-sky-500 to-blue-400 hover:from-sky-600 hover:to-blue-500'
                        : 'bg-slate-200/50'
                    }`}
                    style={{
                      height: `${heightPercent}%`,
                      minHeight: '6px'
                    }}
                  >
                    {/* Top glossy shimmer highlight */}
                    {day.amount > 0 && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-lg" />
                    )}
                  </div>
                </div>

                {/* Day Labels (T2, T3...) */}
                <div className="flex flex-col items-center mt-1.5">
                  <span
                    className={`text-[11px] font-bold leading-tight ${
                      day.isToday
                        ? 'text-blue-600 font-black'
                        : isSelected
                        ? 'text-slate-900 font-extrabold'
                        : 'text-slate-700'
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                  <span
                    className={`text-[8.5px] leading-tight mt-0.5 ${
                      day.isToday ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {day.displayDate}
                  </span>

                  {/* Dot indicator for Today */}
                  {day.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Selected Day Detail Panel / Drawer */}
      {activeDay && (
        <div className="mt-3 p-3 sm:p-3.5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-blue-100/80 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">
                {activeDay.fullDayLabel}, {activeDay.displayDate}
              </span>
              {activeDay.isToday && (
                <span className="px-1.5 py-0.2 rounded-md bg-blue-600 text-white text-[9px] font-bold">
                  {t('today')}
                </span>
              )}
            </div>
            <span className="text-xs font-black text-rose-600">
              {formatVND(activeDay.amount)}
            </span>
          </div>

          {/* Transactions list on selected day */}
          {activeDay.transactions.length > 0 ? (
            <div className="divide-y divide-slate-100 mt-1 max-h-48 overflow-y-auto">
              {activeDay.transactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTransaction(tx)}
                    className="py-2 flex items-center justify-between hover:bg-white/80 px-2 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-2xs shrink-0 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: cat?.color || '#3B82F6' }}
                      >
                        -
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {tx.title}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{tx.time}</span>
                          <span>•</span>
                          <span className="truncate">{cat?.name || 'Chi tiêu'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-rose-600 tracking-tight shrink-0 ml-2">
                      -{formatVND(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-3 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-500 font-medium">
                {t('noExpenseThisWeek')} trong ngày này ✨
              </span>
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-blue-100 flex items-center gap-1 active:scale-95 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>{t('addExpense')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Top Categories of this Week Breakdown */}
      {topWeeklyCategories.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Danh mục chi nhiều nhất tuần</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {topWeeklyCategories.length} danh mục
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {topWeeklyCategories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-slate-50/90 rounded-xl px-2.5 py-1.5"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 truncate">
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900 shrink-0 ml-1">
                  <span>{formatShortAmount(c.amount)}</span>
                  <span className="text-[9px] text-slate-400 font-normal">
                    ({c.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
