import React, { useState } from 'react';
import { Check, DollarSign, Palmtree, Plus, Target, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../services/voiceParser';
import { Goal } from '../../types';

export const GoalModal: React.FC = () => {
  const {
    isGoalModalOpen,
    setIsGoalModalOpen,
    goals,
    addGoal,
    depositToGoal,
    themeConfig,
    t
  } = useApp();

  const [mode, setMode] = useState<'create' | 'deposit'>('create');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id || '');
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('2024-12-31');
  const [depositAmount, setDepositAmount] = useState('');

  if (!isGoalModalOpen) return null;

  const handleClose = () => {
    setIsGoalModalOpen(false);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setDepositAmount('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount.replace(/[.,]/g, ''));
    const initial = parseFloat(currentAmount.replace(/[.,]/g, '')) || 0;
    if (!title || !target) return;

    addGoal({
      title,
      targetAmount: target,
      currentAmount: initial,
      deadline,
      icon: 'Target',
      color: '#10B981',
      category: 'Mục tiêu'
    });
    handleClose();
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount.replace(/[.,]/g, ''));
    if (!amount || !selectedGoalId) return;

    depositToGoal(selectedGoalId, amount);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-sm"
              style={{ background: themeConfig.cardGradient }}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Mục tiêu tài chính</h3>
              <p className="text-[11px] text-slate-400">Tích lũy cho các dự định tương lai</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Tạo mới vs Tích lũy thêm */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl my-4">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'create' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
            }`}
          >
            Tạo mục tiêu mới
          </button>
          <button
            onClick={() => setMode('deposit')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'deposit' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
            }`}
          >
            Nạp tiền vào mục tiêu
          </button>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên mục tiêu</label>
              <input
                type="text"
                required
                placeholder="VD: Mua ô tô, Đám cưới, Mua nhà..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mục tiêu (₫)</label>
                <input
                  type="number"
                  required
                  placeholder="30000000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Đã có sẵn (₫)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Hạn hoàn thành</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md active:scale-95 transition-all mt-2"
              style={{ background: themeConfig.cardGradient }}
            >
              Lưu mục tiêu mới
            </button>
          </form>
        ) : (
          <form onSubmit={handleDeposit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Chọn mục tiêu</label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
              >
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({formatVND(g.currentAmount)} / {formatVND(g.targetAmount)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số tiền nạp thêm (₫)</label>
              <input
                type="number"
                required
                placeholder="1000000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md active:scale-95 transition-all mt-2"
              style={{ background: themeConfig.cardGradient }}
            >
              Xác nhận nạp tiền
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
