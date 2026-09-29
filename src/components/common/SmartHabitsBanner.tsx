import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  Flame,
  Info,
  RefreshCw,
  Repeat,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../services/voiceParser';
import { RecurringSpendingHabit, SpendingHabitInsight } from '../../types';

interface SmartHabitsBannerProps {
  onOpenSettings?: () => void;
  className?: string;
}

export const SmartHabitsBanner: React.FC<SmartHabitsBannerProps> = ({
  onOpenSettings,
  className = ''
}) => {
  const {
    recurringHabits,
    spendingHabitInsights,
    triggerSmartHabitScan,
    setIsNotificationOpen,
    setActiveTab,
    themeConfig,
    settings
  } = useApp();

  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [activeTab, setActiveTabFilter] = useState<'insights' | 'recurring'>('insights');

  const handleScanNow = () => {
    setIsScanning(true);
    setScanMessage(null);

    setTimeout(() => {
      const result = triggerSmartHabitScan(true);
      setIsScanning(false);
      setScanMessage(
        `Đã phân tích lịch sử giao dịch: Tìm thấy ${spendingHabitInsights.length} thói quen & ${recurringHabits.length} khoản định kỳ!`
      );
      setTimeout(() => setScanMessage(null), 4500);
    }, 600);
  };

  const getInsightIcon = (type: SpendingHabitInsight['type']) => {
    switch (type) {
      case 'recurring_bill':
        return <Repeat className="w-4 h-4 text-amber-500" />;
      case 'weekend_surge':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'coffee_dining_habit':
        return <Coffee className="w-4 h-4 text-emerald-500" />;
      case 'velocity_burn':
        return <Zap className="w-4 h-4 text-rose-500" />;
      case 'anomaly_spike':
        return <AlertOctagon className="w-4 h-4 text-red-500" />;
      case 'duplicate_charge':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'payday_saving':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 relative overflow-hidden transition-all ${className}`}
    >
      {/* Background soft ambient glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm tracking-tight">
                Thông báo thông minh & Thói quen
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
              Tự động học thói quen chi tiêu & Hóa đơn lặp lại
            </p>
          </div>
        </div>

        {/* Scan Button & Notification shortcut */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleScanNow}
            disabled={isScanning}
            className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95 shadow-2xs ${
              isScanning
                ? 'bg-slate-100 text-slate-400'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
            }`}
            title="Quét phân tích thói quen ngay lập tức"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isScanning ? 'Đang quét...' : 'Quét thói quen'}</span>
          </button>

          <button
            onClick={() => setIsNotificationOpen(true)}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors active:scale-95"
            title="Xem tất cả thông báo"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success feedback toast */}
      {scanMessage && (
        <div className="my-2.5 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 mt-3 p-1 rounded-2xl bg-slate-100 text-xs font-bold">
        <button
          onClick={() => setActiveTabFilter('insights')}
          className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] ${
            activeTab === 'insights'
              ? 'bg-white text-slate-800 shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-3 h-3 text-indigo-600" />
          <span>Thói quen ({spendingHabitInsights.length})</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('recurring')}
          className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] ${
            activeTab === 'recurring'
              ? 'bg-white text-slate-800 shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Repeat className="w-3 h-3 text-amber-600" />
          <span>Định kỳ & Hóa đơn ({recurringHabits.length})</span>
        </button>
      </div>

      {/* Content View 1: Insights & Habits */}
      {activeTab === 'insights' && (
        <div className="mt-3 space-y-2">
          {spendingHabitInsights.length > 0 ? (
            spendingHabitInsights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100/90 hover:bg-slate-100/70 transition-all flex items-start gap-2.5 text-xs group cursor-pointer"
                onClick={() => setIsNotificationOpen(true)}
              >
                <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-100 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {getInsightIcon(insight.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-slate-800 text-[11px] truncate">
                      {insight.title}
                    </span>
                    {insight.priority === 'high' && (
                      <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 text-[9px] font-black shrink-0">
                        Ưu tiên
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                    {insight.message}
                  </p>
                  {insight.suggestedAction && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-indigo-600 group-hover:text-indigo-700">
                      <span>{insight.suggestedAction}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-indigo-400 opacity-60" />
              <span>Chưa phát hiện thói quen bất thường nào. Hệ thống đang tiếp tục học từ các giao dịch tiếp theo của bạn!</span>
            </div>
          )}
        </div>
      )}

      {/* Content View 2: Recurring Bills & Subscriptions */}
      {activeTab === 'recurring' && (
        <div className="mt-3 space-y-2">
          {recurringHabits.length > 0 ? (
            recurringHabits.map((bill) => {
              const isOverdue = bill.status === 'overdue';
              const isDueSoon = bill.status === 'due_soon';
              const isPaid = bill.status === 'paid_this_cycle';

              return (
                <div
                  key={bill.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 text-xs ${
                    isOverdue
                      ? 'bg-rose-50/60 border-rose-200'
                      : isDueSoon
                      ? 'bg-amber-50/60 border-amber-200'
                      : isPaid
                      ? 'bg-emerald-50/50 border-emerald-100 opacity-85'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                      style={{ backgroundColor: bill.categoryColor }}
                    >
                      {bill.categoryName.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-800 text-[11px] truncate">
                          {bill.title}
                        </span>
                        {isOverdue ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-rose-600 text-white text-[9px] font-black shrink-0">
                            Chưa thanh toán
                          </span>
                        ) : isDueSoon ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[9px] font-black shrink-0">
                            Sắp đến hạn
                          </span>
                        ) : isPaid ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[9px] font-black shrink-0">
                            Đã chi
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        Thường thanh toán ngày {bill.typicalDayOfMonth} hàng tháng • Lần cuối: {bill.lastTransactionDate || 'Chưa rõ'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-slate-900 text-xs block">
                      ~{formatVND(bill.estimatedAmount)}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 block">
                      Độ tin cậy: {bill.confidence}%
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              Chưa ghi nhận hóa đơn hoặc khoản chi định kỳ lặp lại
            </div>
          )}
        </div>
      )}

      {/* Footer shortcut */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-medium">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>
            Thông báo đẩy thiết bị:{' '}
            <strong className={settings.smartPushSettings.browserPushEnabled ? 'text-emerald-600' : 'text-slate-400'}>
              {settings.smartPushSettings.browserPushEnabled ? 'Đang bật' : 'Chưa kích hoạt'}
            </strong>
          </span>
        </span>

        <button
          onClick={() => {
            if (onOpenSettings) onOpenSettings();
            else setActiveTab('account');
          }}
          className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 active:scale-95"
        >
          <span>Tùy chỉnh</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
