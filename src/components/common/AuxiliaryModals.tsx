import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Coffee,
  Copy,
  CreditCard,
  Edit,
  Flame,
  Info,
  RefreshCw,
  Repeat,
  Search,
  Sparkles,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  X,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../services/voiceParser';
import { Transaction } from '../../types';
import { ExportReportModal } from './ExportReportModal';

export const AuxiliaryModals: React.FC = () => {
  const {
    isSmartSearchOpen,
    setIsSmartSearchOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    selectedTransaction,
    setSelectedTransaction,
    notifications,
    markAllNotificationsRead,
    transactions,
    categories,
    bankAccounts,
    familyMembers,
    deleteTransaction,
    duplicateTransaction,
    themeConfig,
    t
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [notifFilter, setNotifFilter] = useState<'all' | 'smart' | 'recurring' | 'budget'>('all');
  const [isScanningHabits, setIsScanningHabits] = useState(false);

  const { triggerSmartHabitScan } = useApp();

  const handleScanHabitsNow = () => {
    setIsScanningHabits(true);
    setTimeout(() => {
      triggerSmartHabitScan(true);
      setIsScanningHabits(false);
    }, 500);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'smart') {
      return n.type === 'smart_habit' || n.type === 'velocity' || n.type === 'anomaly';
    }
    if (notifFilter === 'recurring') {
      return n.type === 'recurring_bill';
    }
    if (notifFilter === 'budget') {
      return n.type === 'budget' || n.type === 'alert' || n.type === 'goal';
    }
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'recurring_bill':
        return <Repeat className="w-4 h-4 text-amber-500" />;
      case 'smart_habit':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case 'velocity':
        return <Zap className="w-4 h-4 text-rose-500" />;
      case 'anomaly':
        return <AlertOctagon className="w-4 h-4 text-red-500" />;
      case 'budget':
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'goal':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'income':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Filtered transactions for search
  const searchResults = transactions.filter((tx) => {
    const matchesQuery =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(tx.amount).includes(searchQuery);

    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesQuery && matchesType;
  });

  return (
    <>
      {/* 1. Smart Search Modal */}
      {isSmartSearchOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center p-4 pt-12 animate-fade-in"
          onClick={() => setIsSmartSearchOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 flex flex-col max-h-[85vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Tìm kiếm giao dịch</h3>
              </div>
              <button
                onClick={() => setIsSmartSearchOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Nhập tên, danh mục, số tiền, ghi chú..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-1.5 mt-2">
                {(['all', 'expense', 'income'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      filterType === type
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'all' ? 'Tất cả' : type === 'expense' ? 'Khoản chi' : 'Khoản thu'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 space-y-2 divide-y divide-slate-100">
              {searchResults.length > 0 ? (
                searchResults.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  return (
                    <div
                      key={tx.id}
                      onClick={() => {
                        setIsSmartSearchOpen(false);
                        setSelectedTransaction(tx);
                      }}
                      className="pt-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: cat?.color || '#94A3B8' }}
                        >
                          •
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{tx.title}</div>
                          <div className="text-[10px] text-slate-400">
                            {cat?.name} • {tx.date}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatVND(tx.amount)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Không tìm thấy giao dịch phù hợp
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Notification Center Modal */}
      {isNotificationOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center p-4 pt-10 sm:pt-14 animate-fade-in"
          onClick={() => setIsNotificationOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 sm:p-5 flex flex-col max-h-[88vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Trung tâm thông báo</h3>
                  <p className="text-[10px] text-slate-400">Cảnh báo tài chính & Nhắc nhở thói quen</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleScanHabitsNow}
                  disabled={isScanningHabits}
                  className="py-1 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                  title="Quét lại thói quen giao dịch"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isScanningHabits ? 'animate-spin' : ''}`} />
                  <span>{isScanningHabits ? 'Đang quét...' : 'Quét thói quen'}</span>
                </button>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 px-1.5 py-1"
                >
                  Đọc hết
                </button>
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 mt-2.5 p-1 rounded-2xl bg-slate-100 text-[11px] font-bold">
              <button
                onClick={() => setNotifFilter('all')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  notifFilter === 'all'
                    ? 'bg-white text-slate-800 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setNotifFilter('smart')}
                className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  notifFilter === 'smart'
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Thói quen</span>
              </button>
              <button
                onClick={() => setNotifFilter('recurring')}
                className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  notifFilter === 'recurring'
                    ? 'bg-white text-amber-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Repeat className="w-3 h-3 text-amber-500" />
                <span>Định kỳ</span>
              </button>
              <button
                onClick={() => setNotifFilter('budget')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  notifFilter === 'budget'
                    ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ngân sách
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-0.5">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      n.isRead
                        ? 'bg-slate-50/70 border-slate-100 opacity-80'
                        : n.type === 'recurring_bill'
                        ? 'bg-amber-50/50 border-amber-200/80 shadow-2xs'
                        : n.type === 'smart_habit' || n.type === 'velocity'
                        ? 'bg-indigo-50/50 border-indigo-200/80 shadow-2xs'
                        : n.type === 'anomaly'
                        ? 'bg-rose-50/50 border-rose-200/80 shadow-2xs'
                        : 'bg-amber-50/40 border-amber-100 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-xl bg-white shadow-2xs border border-slate-100 mt-0.5 shrink-0">
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 flex items-center justify-between gap-1">
                          <span className="truncate">{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal shrink-0">
                            {n.time} {n.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">{n.message}</p>
                        {n.actionLabel && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                            <span>{n.actionLabel}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <Bell className="w-6 h-6 text-slate-300" />
                  <span>Không có thông báo nào trong mục này</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Transaction Detail Modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Chi tiết giao dịch
              </span>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Highlight */}
            <div className="text-center py-5">
              <div
                className={`text-2xl font-black ${
                  selectedTransaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {selectedTransaction.type === 'income' ? '+' : '-'}
                {formatVND(selectedTransaction.amount)}
              </div>
              <h4 className="text-base font-bold text-slate-800 mt-1">{selectedTransaction.title}</h4>
            </div>

            {/* Metadata breakdown */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5" /> Danh mục:
                </span>
                <span className="font-bold text-slate-700">
                  {categories.find((c) => c.id === selectedTransaction.categoryId)?.name || 'Khác'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> Thời gian:
                </span>
                <span className="font-bold text-slate-700">
                  {selectedTransaction.date} {selectedTransaction.time}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <CreditCard className="w-3.5 h-3.5" /> Phương thức:
                </span>
                <span className="font-bold text-slate-700">
                  {selectedTransaction.paymentMethod || 'Tiền mặt'}
                </span>
              </div>

              {selectedTransaction.note && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block mb-1 font-medium">Ghi chú:</span>
                  <p className="text-slate-700 italic bg-white p-2 rounded-xl border border-slate-100">
                    "{selectedTransaction.note}"
                  </p>
                </div>
              )}
            </div>

            {/* Actions: Duplicate & Delete */}
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => {
                  duplicateTransaction(selectedTransaction.id);
                  setSelectedTransaction(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>{t('duplicate')}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa giao dịch này?')) {
                    deleteTransaction(selectedTransaction.id);
                    setSelectedTransaction(null);
                  }
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Monthly Financial Report Export Modal (PDF / CSV) */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </>
  );
};
