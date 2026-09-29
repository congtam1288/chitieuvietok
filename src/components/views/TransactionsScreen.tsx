import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Filter,
  Plus,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../services/voiceParser';
import { TransactionType } from '../../types';

export const TransactionsScreen: React.FC = () => {
  const {
    transactions,
    categories,
    setSelectedTransaction,
    setIsAddExpenseOpen,
    setIsAddIncomeOpen,
    themeConfig,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchType = activeTab === 'all' || tx.type === activeTab;
      const matchCat = selectedCategory === 'all' || tx.categoryId === selectedCategory;
      const matchSearch =
        tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(tx.amount).includes(searchQuery);

      return matchType && matchCat && matchSearch;
    });
  }, [transactions, activeTab, selectedCategory, searchQuery]);

  // Group by Date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    filtered.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });
    return groups;
  }, [filtered]);

  const totalIn = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col gap-4 pb-24 animate-fade-in">
      {/* Top Header Card */}
      <div
        className="rounded-3xl p-5 text-white shadow-lg relative overflow-hidden"
        style={{ background: themeConfig.cardGradient }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <span className="text-xs font-semibold text-white/80">Lịch sử giao dịch</span>
          <span className="text-xs font-bold text-white">{filtered.length} giao dịch</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <span className="text-[10px] text-white/80 block">Tổng thu vào</span>
            <span className="text-base font-extrabold tracking-tight">+{formatVND(totalIn)}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/80 block">Tổng chi ra</span>
            <span className="text-base font-extrabold tracking-tight">-{formatVND(totalOut)}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
        {/* Type Toggle Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {(['all', 'expense', 'income'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === type ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {type === 'all' ? t('all') : type === 'expense' ? t('expense') : t('income')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchTransactions')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả danh mục
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Transactions List */}
      <div className="space-y-4">
        {Object.keys(groupedByDate).length > 0 ? (
          Object.entries(groupedByDate).map(([dateStr, items]) => {
            const daySumIn = items.filter((i) => i.type === 'income').reduce((s, i) => s + i.amount, 0);
            const daySumOut = items.filter((i) => i.type === 'expense').reduce((s, i) => s + i.amount, 0);

            return (
              <div key={dateStr} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                {/* Date Group Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {dateStr}
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    {daySumIn > 0 && <span className="text-emerald-600">+{formatVND(daySumIn)}</span>}
                    {daySumOut > 0 && <span className="text-rose-600">-{formatVND(daySumOut)}</span>}
                  </div>
                </div>

                {/* Items in Date Group */}
                <div className="divide-y divide-slate-50">
                  {items.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTransaction(tx)}
                        className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 px-2 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-2xs"
                            style={{ backgroundColor: cat?.color || '#10B981' }}
                          >
                            {tx.type === 'income' ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{tx.title}</div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {tx.time} • {cat?.name} {tx.note ? `• ${tx.note}` : ''}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`text-xs font-extrabold tracking-tight ${
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
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100">
            <p className="text-sm font-bold text-slate-700">{t('noTransactions')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('noTransactionsDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
