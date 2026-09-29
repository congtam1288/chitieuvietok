import React from 'react';
import { Calendar, DollarSign, Receipt, Tag, TrendingDown, X } from 'lucide-react';
import { Transaction } from '../../types';
import { formatVND } from '../../services/voiceParser';
import { CategoryBudgetStatus } from '../../services/budgetAlertService';

interface CategoryTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryStatus: CategoryBudgetStatus | null;
  transactions: Transaction[];
  month: number;
  year: number;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const CategoryTransactionsModal: React.FC<CategoryTransactionsModalProps> = ({
  isOpen,
  onClose,
  categoryStatus,
  transactions,
  month,
  year,
  onSelectTransaction
}) => {
  if (!isOpen || !categoryStatus) return null;

  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const categoryTxs = transactions
    .filter((t) => t.type === 'expense' && t.categoryId === categoryStatus.categoryId && t.date.startsWith(monthPrefix))
    .sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00')).getTime() - new Date(a.date + ' ' + (a.time || '00:00')).getTime());

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 p-5 flex flex-col max-h-[85vh] animate-slide-up"
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
              <h3 className="font-bold text-slate-800 text-sm">Khoản chi: {categoryStatus.categoryName}</h3>
              <p className="text-[11px] text-slate-500">
                Tháng {month}/{year} • {categoryTxs.length} giao dịch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Spend Summary */}
        <div className="my-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Tổng chi đã ghi nhận:</span>
            <span className="text-base font-black text-slate-900">{formatVND(categoryStatus.spentAmount)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[11px]">Hạn mức tháng:</span>
            <span className="text-xs font-bold text-slate-700">{formatVND(categoryStatus.allocatedAmount)}</span>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-50 pr-0.5">
          {categoryTxs.length > 0 ? (
            categoryTxs.map((tx) => (
              <div
                key={tx.id}
                onClick={() => {
                  if (onSelectTransaction) {
                    onSelectTransaction(tx);
                    onClose();
                  }
                }}
                className="pt-2 flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-600 transition-colors">
                      {tx.title}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {tx.date} {tx.time ? `• ${tx.time}` : ''} {tx.paymentMethod ? `• ${tx.paymentMethod}` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-rose-600 block">
                    -{formatVND(tx.amount)}
                  </span>
                  {tx.note && (
                    <span className="text-[10px] text-slate-400 block max-w-[120px] truncate">
                      {tx.note}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Chưa có giao dịch chi tiêu nào trong tháng {month}/{year}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
