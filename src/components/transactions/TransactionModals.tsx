import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Calendar,
  Check,
  Clock,
  FileText,
  MinusCircle,
  PlusCircle,
  Wallet,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../services/voiceParser';
import { TransactionType } from '../../types';

export const TransactionModals: React.FC = () => {
  const {
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    isAddIncomeOpen,
    setIsAddIncomeOpen,
    isTransferOpen,
    setIsTransferOpen,
    categories,
    bankAccounts,
    familyMembers,
    addTransaction,
    themeConfig,
    t
  } = useApp();

  const activeModalType: TransactionType | null = isAddExpenseOpen
    ? 'expense'
    : isAddIncomeOpen
    ? 'income'
    : isTransferOpen
    ? 'transfer'
    : null;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('food');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(bankAccounts[0]?.id || 'cash-1');
  const [toAccountId, setToAccountId] = useState<string>(bankAccounts[1]?.id || bankAccounts[0]?.id || 'cash-1');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(familyMembers[0]?.id || 'mem-1');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    String(new Date().getHours()).padStart(2, '0') + ':' + String(new Date().getMinutes()).padStart(2, '0')
  );
  const [note, setNote] = useState('');

  if (!activeModalType) return null;

  const handleClose = () => {
    setIsAddExpenseOpen(false);
    setIsAddIncomeOpen(false);
    setIsTransferOpen(false);
    setTitle('');
    setAmount('');
    setNote('');
  };

  const relevantCategories = categories.filter((c) =>
    activeModalType === 'expense'
      ? c.type === 'expense' || c.type === 'all'
      : c.type === 'income' || c.type === 'all'
  );

  const quickAmounts = activeModalType === 'expense'
    ? [20000, 50000, 100000, 200000, 500000, 1000000]
    : [500000, 1000000, 2000000, 5000000, 10000000, 20000000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[.,]/g, ''));
    if (!numAmount || numAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    const cat = categories.find((c) => c.id === selectedCategoryId);
    const finalTitle = title.trim() || (cat ? cat.name : activeModalType === 'income' ? 'Thu nhập' : 'Chi tiêu');

    addTransaction({
      userId: 'user-1',
      title: activeModalType === 'transfer' ? `Chuyển khoản: ${finalTitle}` : finalTitle,
      amount: numAmount,
      type: activeModalType,
      categoryId: activeModalType === 'transfer' ? 'other' : selectedCategoryId,
      accountId: selectedAccountId,
      toAccountId: activeModalType === 'transfer' ? toAccountId : undefined,
      memberId: selectedMemberId,
      date,
      time,
      note: note.trim() || undefined,
      paymentMethod: bankAccounts.find((b) => b.id === selectedAccountId)?.bankName || 'Tiền mặt',
      syncStatus: 'synced'
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col max-h-[92vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                activeModalType === 'expense'
                  ? 'bg-rose-500'
                  : activeModalType === 'income'
                  ? 'bg-emerald-500'
                  : 'bg-blue-500'
              }`}
            >
              {activeModalType === 'expense' ? (
                <MinusCircle className="w-5 h-5" />
              ) : activeModalType === 'income' ? (
                <PlusCircle className="w-5 h-5" />
              ) : (
                <ArrowLeftRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {activeModalType === 'expense'
                  ? t('addExpense')
                  : activeModalType === 'income'
                  ? t('addIncome')
                  : t('makeTransfer')}
              </h3>
              <p className="text-[11px] text-slate-400">Điền thông tin giao dịch vào biểu mẫu</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Amount Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t('amount')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-2xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none tracking-tight"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ₫
              </span>
            </div>

            {/* Quick Pick Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmount(String(q))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold active:scale-95 transition-all"
                >
                  {formatVND(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {activeModalType === 'transfer' ? 'Nội dung chuyển khoản' : 'Tên giao dịch'}
            </label>
            <input
              type="text"
              placeholder={activeModalType === 'expense' ? 'VD: Ăn sáng, Mua sắm quần áo...' : 'VD: Lương công ty, Tiền thưởng...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Category Selector (For Expense / Income) */}
          {activeModalType !== 'transfer' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                {t('category')}
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
                {relevantCategories.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                      selectedCategoryId === cat.id
                        ? 'bg-white shadow-sm ring-2 ring-emerald-500 font-bold'
                        : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white mb-1 text-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      •
                    </div>
                    <span className="text-[10px] leading-tight truncate w-full">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transfer Accounts */}
          {activeModalType === 'transfer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Từ tài khoản</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({formatVND(b.balance)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Đến tài khoản</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({formatVND(b.balance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Account / Bank Selector */
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('paymentMethod')}
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} – {formatVND(b.balance)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Thành viên
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                >
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relation})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t('time')}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t('note')}
            </label>
            <input
              type="text"
              placeholder="Ghi chú thêm (tùy chọn)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
              style={{
                background:
                  activeModalType === 'expense'
                    ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                    : activeModalType === 'income'
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
              }}
            >
              <Check className="w-4 h-4" />
              <span>
                {activeModalType === 'expense'
                  ? t('saveExpense')
                  : activeModalType === 'income'
                  ? t('saveIncome')
                  : 'Xác nhận chuyển'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
