import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  CreditCard,
  Building2,
  Smartphone,
  Sparkles,
  Check,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Wallet,
  Zap,
  Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VIETNAM_BANKS_CATALOG, VietnamBankItem } from '../../data/vietnamBanks';
import { formatVND } from '../../services/voiceParser';
import { BankAccount } from '../../types';
import { BankLogo } from './BankLogo';

interface BankLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (account: BankAccount) => void;
}

export const BankLinkModal: React.FC<BankLinkModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { addBankAccount, themeConfig, authState } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'popular' | 'state' | 'commercial' | 'wallet' | 'card' | 'digital'>('all');
  const [selectedBank, setSelectedBank] = useState<VietnamBankItem | null>(null);

  // Form Fields
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState(authState.currentUser?.name?.toUpperCase() || 'NGUYEN CONG TAM');
  const [initialBalance, setInitialBalance] = useState('');
  const [branch, setBranch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter list
  const filteredBanks = useMemo(() => {
    return VIETNAM_BANKS_CATALOG.filter((item) => {
      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.shortName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q);

      // Category matching
      if (!matchSearch) return false;
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'popular') return !!item.popular;
      if (selectedFilter === 'state') return item.category === 'state';
      if (selectedFilter === 'commercial') return item.category === 'commercial';
      if (selectedFilter === 'wallet') return item.category === 'wallet';
      if (selectedFilter === 'card') return item.category === 'card';
      if (selectedFilter === 'digital') return item.category === 'digital' || item.category === 'foreign';
      return true;
    });
  }, [searchQuery, selectedFilter]);

  if (!isOpen) return null;

  const handleSelectBank = (bank: VietnamBankItem) => {
    setSelectedBank(bank);
  };

  const handleBackToCatalog = () => {
    setSelectedBank(null);
  };

  const handleSubmitLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) return;

    if (!accountNumber.trim()) {
      alert('Vui lòng nhập Số tài khoản hoặc Số thẻ');
      return;
    }

    if (!accountHolder.trim()) {
      alert('Vui lòng nhập Tên chủ tài khoản');
      return;
    }

    setIsSubmitting(true);

    const balanceNum = parseFloat(initialBalance.replace(/[.,\s]/g, '')) || 0;

    const newAccountData: Omit<BankAccount, 'id'> = {
      bankName: selectedBank.shortName,
      bankCode: selectedBank.code,
      fullName: selectedBank.fullName,
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim().toUpperCase(),
      balance: balanceNum,
      logo: selectedBank.code,
      bin: selectedBank.bin,
      isLinked: true,
      isDemo: false,
      type: selectedBank.type,
      cardColor: selectedBank.color,
      cardGradient: selectedBank.gradient,
      branch: branch.trim() || undefined
    };

    setTimeout(() => {
      addBankAccount(newAccountData);
      setIsSubmitting(false);
      // Reset form
      setSelectedBank(null);
      setAccountNumber('');
      setInitialBalance('');
      setBranch('');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100">
        {/* Header */}
        <div
          className="p-4 sm:p-5 text-white flex items-center justify-between relative"
          style={{ background: themeConfig.cardGradient }}
        >
          <div className="flex items-center gap-2.5">
            {selectedBank ? (
              <button
                onClick={handleBackToCatalog}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight">
                {selectedBank ? `Liên kết ${selectedBank.shortName}` : 'Liên kết Ngân hàng & Ví'}
              </h2>
              <p className="text-[11px] text-white/80">
                {selectedBank
                  ? selectedBank.fullName
                  : 'Hơn 40 Ngân hàng VN, Ví MoMo, ZaloPay & Thẻ Quốc tế'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: Bank & Wallet Catalog Search & Grid */}
        {!selectedBank ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm ngân hàng, ví (VD: VCB, MoMo, Techcombank, Visa...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Tất cả (40+)' },
                { id: 'popular', label: '⭐ Phổ biến' },
                { id: 'state', label: '🏛️ Big 4' },
                { id: 'commercial', label: '🏦 TMCP' },
                { id: 'wallet', label: '📱 Ví điện tử' },
                { id: 'card', label: '💳 Thẻ Quốc tế' },
                { id: 'digital', label: '⚡ Số & Ngoại' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Bank Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {filteredBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleSelectBank(bank)}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <BankLogo code={bank.code} name={bank.shortName} size={36} />

                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {bank.code}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {bank.shortName}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {bank.categoryLabel}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {filteredBanks.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">Không tìm thấy ngân hàng phù hợp</p>
                <p className="text-[11px] mt-0.5">Hãy thử tìm theo mã viết tắt như VCB, TCB, MoMo...</p>
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: Input Details for Selected Bank */
          <form onSubmit={handleSubmitLink} className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            {/* 3D Bank Card Preview */}
            <div
              className="w-full rounded-3xl p-5 text-white shadow-xl relative overflow-hidden transition-all"
              style={{
                background: selectedBank.gradient,
                boxShadow: `0 12px 24px -6px ${selectedBank.color}60`
              }}
            >
              {/* Background ambient shapes */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/15 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/20 rounded-full blur-lg pointer-events-none" />

              {/* Top Row: Chip & Bank Name */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 rounded-md bg-amber-400/90 border border-amber-300 shadow-xs flex items-center justify-center">
                    <div className="w-5 h-3 border border-amber-600/40 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                      <div className="bg-amber-500/50 rounded-2xs" />
                      <div className="bg-amber-500/50 rounded-2xs" />
                    </div>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-white">
                    {selectedBank.shortName}
                  </span>
                </div>

                <BankLogo code={selectedBank.code} name={selectedBank.shortName} size={32} />
              </div>

              {/* Middle Row: Card / Account Number */}
              <div className="mt-4 mb-2 relative z-10">
                <div className="text-[10px] text-white/70 font-semibold mb-0.5">
                  {selectedBank.type === 'card' ? 'SỐ THẺ QUỐC TẾ' : selectedBank.type === 'wallet' ? 'SỐ ĐIỆN THOẠI VÍ' : 'SỐ TÀI KHOẢN'}
                </div>
                <div className="text-base sm:text-lg font-black font-mono tracking-wider text-white">
                  {accountNumber ? accountNumber : '•••• •••• •••• 8888'}
                </div>
              </div>

              {/* Bottom Row: Holder & Balance */}
              <div className="flex items-end justify-between pt-2 border-t border-white/15 relative z-10">
                <div>
                  <div className="text-[9px] text-white/70 uppercase font-semibold">Chủ tài khoản</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white truncate max-w-[180px]">
                    {accountHolder || 'NGUYEN VAN A'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[9px] text-white/70 uppercase font-semibold">Số dư ban đầu</div>
                  <div className="text-xs sm:text-sm font-black text-amber-200">
                    {initialBalance ? formatVND(parseFloat(initialBalance.replace(/[.,\s]/g, '')) || 0) : '0 ₫'}
                  </div>
                </div>
              </div>
            </div>

            {/* Input Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {selectedBank.type === 'card'
                    ? 'Số thẻ (16 số trên mặt thẻ) *'
                    : selectedBank.type === 'wallet'
                    ? 'Số điện thoại đăng ký ví *'
                    : 'Số tài khoản ngân hàng *'}
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedBank.type === 'card'
                        ? 'VD: 4123 4567 8901 2345'
                        : selectedBank.type === 'wallet'
                        ? 'VD: 0912 345 678'
                        : 'VD: 1029384756'
                    }
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tên chủ tài khoản (In hoa không dấu) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: NGUYEN VAN A"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none uppercase transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Số dư hiện tại (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 5000000"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Chi nhánh / Biệt danh
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Sở giao dịch / Thẻ chính"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Security guarantee note */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5 text-emerald-800 text-[11px]">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Bảo mật cấp độ ngân hàng: Dữ liệu được mã hóa an toàn trên thiết bị và đồng bộ đám mây Firebase.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 mt-auto">
              <button
                type="button"
                onClick={handleBackToCatalog}
                className="flex-1 py-3 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95"
              >
                Chọn ngân hàng khác
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-3 rounded-2xl text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                style={{ background: selectedBank.gradient }}
              >
                {isSubmitting ? (
                  <span>Đang kết nối...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Xác nhận liên kết {selectedBank.shortName}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
