import React, { useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Edit3,
  ExternalLink,
  Flame,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Volume2,
  VolumeX,
  X,
  Zap
} from 'lucide-react';
import { BudgetAlertLevel, CategoryBudgetStatus, playAlertChime } from '../../services/budgetAlertService';
import { formatVND } from '../../services/voiceParser';

interface BudgetAlertHubProps {
  categoriesStatus: CategoryBudgetStatus[];
  alertedCategories: CategoryBudgetStatus[];
  onOpenCategoryModal: (cat: CategoryBudgetStatus) => void;
  onOpenTransactionsModal: (cat: CategoryBudgetStatus) => void;
  onSimulateExpense: (categoryName: string, amount: number, title: string) => void;
  onResetSimulation: () => void;
  isSimulated: boolean;
}

export const BudgetAlertHub: React.FC<BudgetAlertHubProps> = ({
  categoriesStatus,
  alertedCategories,
  onOpenCategoryModal,
  onOpenTransactionsModal,
  onSimulateExpense,
  onResetSimulation,
  isSimulated
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'danger_100' | 'warning_80'>('all');
  const [isTestExpanded, setIsTestExpanded] = useState(false);

  const dangerList = alertedCategories.filter((c) => c.alertLevel === 'danger_100');
  const warningList = alertedCategories.filter((c) => c.alertLevel === 'warning_80');

  const displayedList =
    filterMode === 'danger_100'
      ? dangerList
      : filterMode === 'warning_80'
      ? warningList
      : alertedCategories;

  const handleTestChime = (level: BudgetAlertLevel, e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) {
      playAlertChime(level);
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. Real-time Monitoring Status Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 relative overflow-hidden">
        {/* Glow backdrop */}
        <div
          className={`absolute -right-12 -top-12 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 ${
            dangerList.length > 0 ? 'bg-rose-400' : warningList.length > 0 ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
        />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-sm transition-all ${
                dangerList.length > 0
                  ? 'bg-gradient-to-tr from-rose-600 to-red-500 animate-pulse'
                  : warningList.length > 0
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
              }`}
            >
              {dangerList.length > 0 ? (
                <AlertOctagon className="w-5 h-5 text-white" />
              ) : warningList.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-white" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-white" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                  Cảnh báo chi tiêu thời gian thực
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Tự động phát hiện khi chạm ngưỡng 80% & 100%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Đang bật chuông cảnh báo' : 'Đã tắt chuông cảnh báo'}
              className={`p-2 rounded-xl border text-xs font-bold transition-all active:scale-90 flex items-center gap-1 ${
                soundEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Status Count Pills */}
        <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-100">
          <div
            onClick={() => setFilterMode(filterMode === 'danger_100' ? 'all' : 'danger_100')}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
              dangerList.length > 0
                ? 'bg-rose-50/80 border-rose-200 hover:bg-rose-100/60'
                : 'bg-slate-50/80 border-slate-100 opacity-60'
            } ${filterMode === 'danger_100' ? 'ring-2 ring-rose-500' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                <AlertOctagon className="w-3 h-3 text-rose-600" /> Vượt 100%
              </span>
              <span
                className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                  dangerList.length > 0 ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {dangerList.length}
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-700 mt-1 block">
              {dangerList.length > 0
                ? `${dangerList.map((d) => d.categoryName).join(', ')}`
                : 'Không có danh mục nào'}
            </span>
          </div>

          <div
            onClick={() => setFilterMode(filterMode === 'warning_80' ? 'all' : 'warning_80')}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
              warningList.length > 0
                ? 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/60'
                : 'bg-slate-50/80 border-slate-100 opacity-60'
            } ${filterMode === 'warning_80' ? 'ring-2 ring-amber-500' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" /> Chạm 80%
              </span>
              <span
                className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                  warningList.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {warningList.length}
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-700 mt-1 block truncate">
              {warningList.length > 0
                ? `${warningList.map((w) => w.categoryName).join(', ')}`
                : 'Không có danh mục nào'}
            </span>
          </div>
        </div>

        {/* 2. Active Alert Cards List */}
        {displayedList.length > 0 ? (
          <div className="mt-3.5 space-y-2.5">
            {displayedList.map((item) => {
              const isDanger = item.alertLevel === 'danger_100';

              return (
                <div
                  key={item.categoryId}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isDanger
                      ? 'bg-gradient-to-br from-rose-50/90 to-red-50/40 border-rose-200 shadow-sm'
                      : 'bg-gradient-to-br from-amber-50/90 to-orange-50/40 border-amber-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0"
                        style={{ backgroundColor: item.categoryColor }}
                      >
                        {item.categoryName.charAt(0)}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-slate-900 text-xs">
                            {item.categoryName}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-tight flex items-center gap-0.5 ${
                              isDanger
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {isDanger ? (
                              <>
                                <AlertOctagon className="w-2.5 h-2.5" />
                                VƯỢT {item.percentSpent}%
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-2.5 h-2.5" />
                                ĐẠT {item.percentSpent}%
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          {isDanger
                            ? `Đã vượt quá hạn mức: +${formatVND(item.exceededAmount)}`
                            : `Còn lại an toàn: ${formatVND(item.remainingAmount)}`}
                        </p>
                      </div>
                    </div>

                    {/* Sound trigger button */}
                    <button
                      onClick={(e) => handleTestChime(item.alertLevel, e)}
                      title="Phát lại chuông cảnh báo"
                      className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 shadow-2xs text-[10px] font-bold flex items-center gap-0.5"
                    >
                      <Bell className="w-3 h-3 text-amber-600" />
                    </button>
                  </div>

                  {/* Progress bar with 80% and 100% threshold markers */}
                  <div className="mt-3 relative">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                      <span>Đã chi: {formatVND(item.spentAmount)}</span>
                      <span>Hạn mức: {formatVND(item.allocatedAmount)}</span>
                    </div>

                    <div className="relative w-full bg-slate-200/90 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDanger
                            ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600'
                            : 'bg-gradient-to-r from-emerald-500 via-yellow-500 to-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, item.percentSpent)}%` }}
                      />
                    </div>

                    {/* Visual Threshold Ticks */}
                    <div className="relative w-full h-3">
                      <div
                        className="absolute -top-2.5 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                        style={{ left: '80%' }}
                      >
                        <div className="w-0.5 h-3 bg-amber-600" />
                        <span className="text-[8px] font-black text-amber-700">80%</span>
                      </div>
                      <div
                        className="absolute -top-2.5 -translate-x-full flex flex-col items-end pointer-events-none"
                        style={{ left: '100%' }}
                      >
                        <div className="w-0.5 h-3 bg-rose-600" />
                        <span className="text-[8px] font-black text-rose-700">100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => onOpenCategoryModal(item)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold border border-slate-200 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <Edit3 className="w-3 h-3 text-emerald-600" />
                      <span>Sửa hạn mức</span>
                    </button>

                    <button
                      onClick={() => onOpenTransactionsModal(item)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold border border-slate-200 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <TrendingDown className="w-3 h-3 text-rose-600" />
                      <span>Xem chi tiêu ({item.transactionsCount})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold text-emerald-900 block">
                Ngân sách an toàn trong ngưỡng kiểm soát
              </span>
              <span className="text-[11px] text-emerald-700">
                Chưa có danh mục nào vượt qua mốc cảnh báo 80% trong tháng này.
              </span>
            </div>
          </div>
        )}

        {/* 3. Interactive Test & Real-time Simulation Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setIsTestExpanded(!isTestExpanded)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Thử nghiệm kích hoạt cảnh báo Real-Time</span>
              {isSimulated && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black">
                  Đang giả lập
                </span>
              )}
            </span>
            <ChevronRight
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                isTestExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>

          {isTestExpanded && (
            <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 animate-fade-in text-xs">
              <p className="text-[11px] text-slate-500 font-medium">
                Nhấn vào các nút bên dưới để tạo khoản chi nhanh và kiểm tra hệ thống thông báo tức thì:
              </p>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    onSimulateExpense('Hóa đơn & Tiện ích', 1800000, 'Thanh toán tiền điện & nước (Chạm 80%)');
                    if (soundEnabled) playAlertChime('warning_80');
                  }}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-[11px] text-left transition-all active:scale-95 flex items-center justify-between"
                >
                  <span>⚡ Kích hoạt 80% (Hóa đơn)</span>
                  <ArrowRight className="w-3 h-3 text-amber-600" />
                </button>

                <button
                  onClick={() => {
                    onSimulateExpense('Mua sắm', 3500000, 'Mua điện thoại mới tại Di Động Việt (Vượt 100%)');
                    if (soundEnabled) playAlertChime('danger_100');
                  }}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 font-bold text-[11px] text-left transition-all active:scale-95 flex items-center justify-between"
                >
                  <span>🚨 Kích hoạt 100% (Mua sắm)</span>
                  <ArrowRight className="w-3 h-3 text-rose-600" />
                </button>
              </div>

              {isSimulated && (
                <button
                  onClick={onResetSimulation}
                  className="w-full py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition-all flex items-center justify-center gap-1 active:scale-95 mt-1"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Xóa dữ liệu thử nghiệm & Đặt lại</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
