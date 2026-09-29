import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Check, DollarSign, Sparkles, TrendingUp, X } from 'lucide-react';
import { Budget, Category } from '../../types';
import { formatVND } from '../../services/voiceParser';
import { CategoryBudgetStatus } from '../../services/budgetAlertService';

interface CategoryBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryStatus: CategoryBudgetStatus | null;
  budget: Budget;
  categories: Category[];
  onUpdateBudget: (updates: Partial<Budget>) => void;
}

export const CategoryBudgetModal: React.FC<CategoryBudgetModalProps> = ({
  isOpen,
  onClose,
  categoryStatus,
  budget,
  categories,
  onUpdateBudget
}) => {
  if (!isOpen || !categoryStatus) return null;

  const [allocatedInput, setAllocatedInput] = useState<number>(categoryStatus.allocatedAmount);
  const [selectedQuickAdd, setSelectedQuickAdd] = useState<number | null>(null);

  const spentAmount = categoryStatus.spentAmount;
  const newPercent = allocatedInput > 0 ? Math.round((spentAmount / allocatedInput) * 100) : 0;
  const newRemaining = Math.max(0, allocatedInput - spentAmount);
  const isOver = spentAmount > allocatedInput;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (allocatedInput <= 0) return;

    // Update the categories array in budget
    const updatedCategories = budget.categories.map((cat) => {
      if (cat.categoryId === categoryStatus.categoryId) {
        return {
          ...cat,
          allocatedAmount: allocatedInput,
          percentage: budget.totalBudget > 0 ? Math.round((allocatedInput / budget.totalBudget) * 100) : cat.percentage
        };
      }
      return cat;
    });

    onUpdateBudget({
      categories: updatedCategories,
      updatedAt: new Date().toISOString()
    });

    // Clear alert flag so newly adjusted budget gets re-evaluated
    const keys = Object.keys(localStorage).filter((k) =>
      k.includes(`_alert_sent_`) && k.includes(categoryStatus.categoryId)
    );
    keys.forEach((k) => localStorage.removeItem(k));

    onClose();
  };

  const quickPresets = [
    { label: '+500.000₫', amount: 500000 },
    { label: '+1.000.000₫', amount: 1000000 },
    { label: '+2.000.000₫', amount: 2000000 },
    { label: '= Vừa đủ mức chi', amount: spentAmount - allocatedInput }
  ];

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 p-5 flex flex-col max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-base shadow-sm font-bold"
              style={{ backgroundColor: categoryStatus.categoryColor }}
            >
              {categoryStatus.categoryName.charAt(0)}
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Hạn mức danh mục</h3>
              <p className="text-[11px] text-slate-500">{categoryStatus.categoryName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Overview */}
        <div className="my-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Đã chi trong tháng:</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatVND(spentAmount)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Tỷ lệ sau điều chỉnh:</span>
            <span
              className={`font-black px-2 py-0.5 rounded-lg text-xs ${
                newPercent >= 100
                  ? 'bg-rose-100 text-rose-700'
                  : newPercent >= 80
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {newPercent}% {newPercent >= 100 ? '• Vượt trần' : newPercent >= 80 ? '• Cảnh báo 80%' : '• An toàn'}
            </span>
          </div>

          {/* Progress bar preview */}
          <div className="relative w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                newPercent >= 100
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : newPercent >= 80
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
              style={{ width: `${Math.min(100, newPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>{isOver ? 'Vượt quá hạn mức:' : 'Dự kiến còn lại:'}</span>
            <span className={`font-bold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
              {isOver ? `-${formatVND(spentAmount - allocatedInput)}` : formatVND(newRemaining)}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Hạn mức ngân sách mới (₫)
            </label>
            <div className="relative">
              <input
                type="number"
                step="50000"
                min="100000"
                value={allocatedInput}
                onChange={(e) => setAllocatedInput(Number(e.target.value))}
                className="w-full text-lg font-black text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl p-3 pr-12 outline-none focus:bg-white focus:border-emerald-500 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                VNĐ
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Điều chỉnh nhanh hạn mức:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAllocatedInput((prev) => Math.max(100000, prev + preset.amount));
                    setSelectedQuickAdd(preset.amount);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1"
                >
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Threshold Explanation Note */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Cơ chế cảnh báo thời gian thực:</strong>
              <p className="mt-0.5 text-amber-800">
                Hệ thống sẽ tự động phát chuông và gửi thông báo khi chi tiêu danh mục này chạm <strong>80%</strong> và <strong>100%</strong> hạn mức đã đặt.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Lưu hạn mức</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
