import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit3,
  History,
  Plus,
  RefreshCw,
  Wallet,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../services/voiceParser';
import { BankAccount } from '../../types';
import { BankLogo } from './BankLogo';

interface WalletActionModalProps {
  bank: BankAccount | null;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'adjust' | 'transfer' | 'history';
}

export const WalletActionModal: React.FC<WalletActionModalProps> = ({
  bank,
  isOpen,
  onClose,
  initialMode = 'adjust'
}) => {
  const {
    bankAccounts,
    updateBankAccount,
    addTransaction,
    transactions,
    categories,
    setSelectedTransaction,
    themeConfig
  } = useApp();

  const [mode, setMode] = useState<'adjust' | 'transfer' | 'history'>(initialMode);

  // Mode 1: Adjust balance
  const [actualBalanceInput, setActualBalanceInput] = useState<string>('');
  const [adjustNote, setAdjustNote] = useState<string>('Đối soát số dư thực tế');

  // Mode 2: Internal transfer between accounts
  const [toAccountId, setToAccountId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferNote, setTransferNote] = useState<string>('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Transactions belonging to this bank
  const accountTransactions = useMemo(() => {
    if (!bank) return [];
    return transactions.filter(
      (tx) => tx.accountId === bank.id || (tx.type === 'transfer' && tx.toAccountId === bank.id)
    );
  }, [transactions, bank]);

  const totalIn = useMemo(() => {
    return accountTransactions
      .filter((tx) => tx.type === 'income' || (tx.type === 'transfer' && tx.toAccountId === bank?.id))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [accountTransactions, bank]);

  const totalOut = useMemo(() => {
    return accountTransactions
      .filter((tx) => tx.type === 'expense' || (tx.type === 'transfer' && tx.accountId === bank?.id))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [accountTransactions, bank]);

  if (!isOpen || !bank) return null;

  // Handle Balance Adjustment
  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const newBal = parseFloat(actualBalanceInput.replace(/[.,\s]/g, ''));
    if (isNaN(newBal) || newBal < 0) {
      alert('Vui lòng nhập số dư hợp lệ');
      return;
    }

    const diff = newBal - bank.balance;
    if (diff !== 0) {
      // Create adjustment transaction
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

      addTransaction({
        userId: 'user-1',
        title: diff > 0 ? `Điều chỉnh tăng số dư ${bank.bankName}` : `Điều chỉnh giảm số dư ${bank.bankName}`,
        amount: Math.abs(diff),
        type: diff > 0 ? 'income' : 'expense',
        categoryId: 'other',
        accountId: bank.id,
        date: dateStr,
        time: timeStr,
        note: adjustNote.trim() || 'Cập nhật khớp số dư ngân hàng thật',
        paymentMethod: bank.bankName,
        syncStatus: 'synced'
      });
    }

    updateBankAccount(bank.id, { balance: newBal });
    setSuccessMsg(`Đã cập nhật số dư ${bank.bankName} thành ${formatVND(newBal)}!`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1500);
  };

  // Handle Internal Transfer
  const handleInternalTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAccount = bankAccounts.find((b) => b.id === toAccountId);
    if (!targetAccount) {
      alert('Vui lòng chọn tài khoản đích');
      return;
    }

    const numAmount = parseFloat(transferAmount.replace(/[.,\s]/g, ''));
    if (!numAmount || numAmount <= 0) {
      alert('Vui lòng nhập số tiền chuyển hợp lệ');
      return;
    }

    if (numAmount > bank.balance && bank.type !== 'card') {
      alert('Số dư tài khoản không đủ để thực hiện chuyển khoản');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    // Create Transfer Transaction
    addTransaction({
      userId: 'user-1',
      title: `Chuyển tiền: ${bank.bankName} ➔ ${targetAccount.bankName}`,
      amount: numAmount,
      type: 'transfer',
      categoryId: 'other',
      accountId: bank.id,
      toAccountId: targetAccount.id,
      date: dateStr,
      time: timeStr,
      note: transferNote.trim() || `Chuyển tiền nội bộ từ ${bank.bankName} sang ${targetAccount.bankName}`,
      paymentMethod: bank.bankName,
      syncStatus: 'synced'
    });

    setSuccessMsg(`Đã chuyển thành công ${formatVND(numAmount)} sang ${targetAccount.bankName}!`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in text-slate-800"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 flex flex-col max-h-[92vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <BankLogo code={bank.bankCode} name={bank.bankName} size={40} />
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">{bank.bankName}</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {bank.accountNumber} • {formatVND(bank.balance)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl mt-3">
          <button
            type="button"
            onClick={() => setMode('adjust')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mode === 'adjust' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Khớp số dư</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('transfer')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mode === 'transfer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Nạp/Chuyển</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('history')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mode === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử ({accountTransactions.length})</span>
          </button>
        </div>

        {successMsg && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Content Mode 1: Adjust Balance */}
        {mode === 'adjust' && (
          <form onSubmit={handleSaveAdjust} className="mt-4 space-y-3">
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">Khớp số dư tài khoản thật:</span> Mở app ngân hàng ({bank.bankName}) và nhập chính xác số tiền hiện tại. Ứng dụng sẽ tự động ghi nhận giao dịch chênh lệch để số liệu luôn chính xác 100%.
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1">
                Số dư hiện tại trên ứng dụng:
              </span>
              <div className="text-base font-black text-slate-800 font-mono">
                {formatVND(bank.balance)}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Số dư thực tế trên ngân hàng (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ví dụ: 12.500.000"
                value={actualBalanceInput}
                onChange={(e) => setActualBalanceInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Ghi chú điều chỉnh
              </label>
              <input
                type="text"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl text-white font-bold text-xs shadow-xs active:scale-95 transition-all mt-2"
              style={{ background: themeConfig.cardGradient }}
            >
              Lưu & Cập nhật số dư thực tế
            </button>
          </form>
        )}

        {/* Content Mode 2: Transfer / Deposit */}
        {mode === 'transfer' && (
          <form onSubmit={handleInternalTransfer} className="mt-4 space-y-3">
            <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs text-purple-900 leading-relaxed">
              <span className="font-bold">Chuyển tiền nội bộ:</span> Chuyển từ {bank.bankName} sang ví điện tử hoặc tài khoản ngân hàng khác của bạn.
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Tài khoản nguồn
              </label>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{bank.bankName}</span>
                <span className="text-slate-500 font-mono">{formatVND(bank.balance)}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Chuyển đến tài khoản / ví đích <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
              >
                <option value="">-- Chọn tài khoản nhận tiền --</option>
                {bankAccounts
                  .filter((b) => b.id !== bank.id)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({b.accountNumber}) – Số dư: {formatVND(b.balance)}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Số tiền chuyển (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 500.000"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Ghi chú chuyển khoản
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Nạp ví MoMo, Chuyển tiền ăn uống..."
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all mt-2"
            >
              Xác nhận Chuyển tiền ngay
            </button>
          </form>
        )}

        {/* Content Mode 3: Transaction History */}
        {mode === 'history' && (
          <div className="mt-4 space-y-3">
            {/* Summary In / Out */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] text-emerald-700 font-bold block">Tổng tiền vào</span>
                <span className="text-xs font-black text-emerald-800">+{formatVND(totalIn)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                <span className="text-[10px] text-rose-700 font-bold block">Tổng tiền ra</span>
                <span className="text-xs font-black text-rose-800">-{formatVND(totalOut)}</span>
              </div>
            </div>

            {/* List */}
            {accountTransactions.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                {accountTransactions.map((tx) => {
                  const isIncome = tx.type === 'income' || (tx.type === 'transfer' && tx.toAccountId === bank.id);
                  return (
                    <div
                      key={tx.id}
                      onClick={() => {
                        setSelectedTransaction(tx);
                        onClose();
                      }}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow-2xs shrink-0 ${
                            isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        >
                          {isIncome ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {tx.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {tx.date} • {tx.time}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-black tracking-tight shrink-0 ml-2 ${
                          isIncome ? 'text-emerald-600' : 'text-slate-800'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatVND(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Chưa có giao dịch nào được ghi nhận qua tài khoản này.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
