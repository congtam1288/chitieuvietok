import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeftRight,
  Award,
  Bell,
  BrainCircuit,
  Building2,
  Check,
  CheckCheck,
  ChevronRight,
  Code2,
  Coffee,
  Copy,
  CreditCard,
  Database,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileDown,
  Fingerprint,
  Flame,
  Globe,
  History,
  Info,
  Key,
  Layers,
  Lock,
  LogOut,
  Moon,
  Sun,
  Palette,
  Plus,
  QrCode,
  RefreshCw,
  Repeat,
  RotateCcw,
  Send,
  Server,
  Share2,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Terminal,
  Trash2,
  TrendingUp,
  Type,
  Upload,
  User,
  UserCheck,
  Users,
  Wallet,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../services/voiceParser';
import { THEME_CONFIGS } from '../../theme/themes';
import { BankAccount, FontType, LanguageType, ThemeType } from '../../types';
import { AppIcon } from '../common/AppIcon';
import { BankLinkModal } from '../banks/BankLinkModal';
import { BankLogo } from '../banks/BankLogo';
import { VietQRModal } from '../banks/VietQRModal';
import { WalletActionModal } from '../banks/WalletActionModal';
import { VIETNAM_BANKS_CATALOG } from '../../data/vietnamBanks';

export const AccountScreen: React.FC = () => {
  const {
    t,
    settings,
    updateSettings,
    themeConfig,
    setTheme,
    setLanguage,
    setFont,
    bankAccounts,
    toggleLinkBank,
    addBankAccount,
    deleteBankAccount,
    updateBankAccount,
    familyMembers,
    addFamilyMember,
    resetDemoData,
    clearAllData,
    exportDataJSON,
    importDataJSON,
    totalBalance,
    totalIncome,
    totalExpense,
    savingsRate,
    toggleHideBalance,
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    setIsAddExpenseOpen,
    setIsAddIncomeOpen,
    setIsTransferOpen,
    authState,
    trialDaysLeft,
    expireTrialForTesting,
    resetTrialForTesting,
    logout,
    setIsExportModalOpen,
    recurringHabits,
    spendingHabitInsights,
    triggerSmartHabitScan,
    updateSmartPushSettings,
    requestDevicePushPermission
  } = useApp();

  const [activeAccountTab, setActiveAccountTab] = useState<'profile3d' | 'banks' | 'appearance' | 'family' | 'details'>('profile3d');
  const [copiedPackageId, setCopiedPackageId] = useState(false);
  const [copiedBankAccId, setCopiedBankAccId] = useState<string | null>(null);
  const [isBankLinkModalOpen, setIsBankLinkModalOpen] = useState(false);
  const [selectedQRBank, setSelectedQRBank] = useState<BankAccount | null>(null);
  const [activeWalletAction, setActiveWalletAction] = useState<{
    bank: BankAccount;
    mode: 'adjust' | 'transfer' | 'history';
  } | null>(null);
  const [bankTypeFilter, setBankTypeFilter] = useState<'all' | 'bank' | 'wallet' | 'card' | 'cash'>('all');
  const [geminiKeyInput, setGeminiKeyInput] = useState(settings.geminiApiKey || '');
  const [isGeminiSaved, setIsGeminiSaved] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'viewer'>('member');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [testPushFeedback, setTestPushFeedback] = useState<string | null>(null);

  // New Bank Modal State
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newBankBalance, setNewBankBalance] = useState('');

  const THEMES_LIST: Array<{ id: ThemeType; name: string; desc: string; color: string }> = [
    { id: 'blue', name: '1. Xanh 3D Pro', desc: 'Đổ màu 3D chuẩn Chi Tiêu Việt (Mặc định)', color: '#2563EB' },
    { id: 'green', name: '2. Xanh lá', desc: 'Tươi mát, tài lộc', color: '#10B981' },
    { id: 'red', name: '3. Đỏ', desc: 'Năng động, nổi bật', color: '#EF4444' },
    { id: 'purple', name: '4. Tím', desc: 'Sang trọng, tinh tế', color: '#8B5CF6' },
    { id: 'orange', name: '5. Cam', desc: 'Ấm áp, thân thiện', color: '#F97316' },
    { id: 'dark', name: '6. Đen Dark Mode', desc: 'Hiện đại, mạnh mẽ', color: '#0F172A' }
  ];

  const LANGUAGES_LIST: Array<{ id: LanguageType; name: string; flag: string }> = [
    { id: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { id: 'en', name: 'English', flag: '🇬🇧' },
    { id: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
    { id: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
    { id: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
    { id: 'fr', name: 'Français (French)', flag: '🇫🇷' }
  ];

  const FONTS_LIST: FontType[] = ['Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins', 'Nunito'];

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ geminiApiKey: geminiKeyInput.trim() });
    setIsGeminiSaved(true);
    setTimeout(() => setIsGeminiSaved(false), 2000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    addFamilyMember({
      name: newMemberName.trim(),
      role: newMemberRole,
      avatar: newMemberRole === 'member' ? '👩‍💼' : '👦',
      relation: newMemberRole === 'member' ? 'Thành viên gia đình' : 'Người theo dõi',
      totalExpense: 0,
      totalIncome: 0
    });
    setNewMemberName('');
    setIsAddingMember(false);
  };

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim()) return;

    addBankAccount({
      bankName: newBankName.trim(),
      bankCode: 'BANK',
      accountHolder: 'NGUYỄN CÔNG TÂM',
      accountNumber: newAccNumber.trim() || '•••• 9999',
      balance: parseFloat(newBankBalance) || 1000000,
      isLinked: true,
      isDemo: false,
      type: 'bank',
      logo: '🏦'
    });
    setNewBankName('');
    setNewAccNumber('');
    setNewBankBalance('');
    setIsAddingBank(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content && importDataJSON(content)) {
          alert('Đã khôi phục dữ liệu sao lưu thành công!');
        } else {
          alert('Tệp dữ liệu không hợp lệ!');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 pb-24 animate-fade-in w-full">
      {/* Top Segmented Tabs Navigation for Account Screen */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-sm border border-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveAccountTab('profile3d')}
          className={`flex-1 min-w-[110px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeAccountTab === 'profile3d'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          style={{
            background: activeAccountTab === 'profile3d' ? themeConfig.cardGradient : undefined
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hồ sơ 3D VIP</span>
        </button>

        <button
          onClick={() => setActiveAccountTab('banks')}
          className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeAccountTab === 'banks'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          style={{
            background: activeAccountTab === 'banks' ? themeConfig.cardGradient : undefined
          }}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Ví & Thẻ</span>
        </button>

        <button
          onClick={() => setActiveAccountTab('appearance')}
          className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeAccountTab === 'appearance'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          style={{
            background: activeAccountTab === 'appearance' ? themeConfig.cardGradient : undefined
          }}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Giao diện</span>
        </button>

        <button
          onClick={() => setActiveAccountTab('family')}
          className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeAccountTab === 'family'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          style={{
            background: activeAccountTab === 'family' ? themeConfig.cardGradient : undefined
          }}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Gia đình</span>
        </button>

        <button
          onClick={() => setActiveAccountTab('details')}
          className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeAccountTab === 'details'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          style={{
            background: activeAccountTab === 'details' ? themeConfig.cardGradient : undefined
          }}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Chi tiết</span>
        </button>
      </div>

      {/* VIEW 1: Giao diện Hồ sơ & Thẻ VIP 3D (Đồng bộ bố cục và phong cách đổ màu như ảnh) */}
      {activeAccountTab === 'profile3d' && (
        <div className="flex flex-col gap-3.5 sm:gap-4 animate-fade-in w-full">
          {/* Trial Mode Alert Banner if in Trial */}
          {authState.isTrialActive && (
            <div className="p-3.5 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black">
                  ⏳
                </div>
                <div>
                  <div className="text-xs font-black">Chế độ Dùng thử: Còn {trialDaysLeft} ngày</div>
                  <div className="text-[10px] text-white/90">Trải nghiệm Full 100% tính năng VIP</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={expireTrialForTesting}
                  title="Mô phỏng hết hạn 7 ngày để kiểm tra tự động khóa app"
                  className="px-2 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white transition-all active:scale-95"
                >
                  Thử hết hạn
                </button>
                <button
                  onClick={logout}
                  className="px-2.5 py-1 rounded-xl bg-white text-orange-700 font-extrabold text-[10px] shadow-xs hover:bg-slate-50 transition-all active:scale-95"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          )}

          {/* 1. Master 3D VIP Member Card */}
          <div
            className="w-full rounded-3xl p-5 text-white shadow-xl relative overflow-hidden transition-all"
            style={{
              background: themeConfig.balanceCardBg,
              boxShadow: `0 14px 30px -8px ${themeConfig.primary}60`
            }}
          >
            {/* Ambient 3D Blobs */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/20 rounded-full blur-xl pointer-events-none" />

            {/* 3D Chip & Wave Top Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-7 rounded-lg bg-amber-400/90 border border-amber-300 flex items-center justify-center shadow-xs">
                  <div className="w-6 h-4 border border-amber-600/40 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                    <div className="bg-amber-500/50 rounded-2xs" />
                    <div className="bg-amber-500/50 rounded-2xs" />
                  </div>
                </div>
                <Zap className="w-4 h-4 text-cyan-200" />
                <span className="text-[11px] font-black uppercase tracking-wider text-white/90">
                  CHI TIÊU VIỆT • VIP PRO
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold text-white border border-white/20">
                  <Award className="w-3 h-3 text-amber-300" />
                  <span>{authState.isTrialActive ? `DÙNG THỬ (${trialDaysLeft}N)` : 'HẠNG KIM CƯƠNG'}</span>
                </div>
                <button
                  onClick={logout}
                  title="Đăng xuất / Chuyển tài khoản"
                  className="px-2 py-0.5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white text-[10px] font-bold transition-all active:scale-95 flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" /> Đăng xuất
                </button>
              </div>
            </div>

            {/* User Profile Avatar & Name */}
            <div className="mt-4 mb-3 flex items-center gap-3.5 relative z-10">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-200 p-0.5 shadow-md shrink-0">
                <div className="w-full h-full rounded-2xl bg-slate-900/40 flex items-center justify-center text-white text-xl font-black backdrop-blur-xs">
                  {authState.currentUser?.name ? authState.currentUser.name.charAt(0).toUpperCase() : 'C'}
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 truncate">
                  {authState.currentUser?.name || 'NGUYỄN CÔNG TÂM'}
                  <ShieldCheck className="w-4 h-4 text-cyan-300 shrink-0" />
                </h2>
                <p className="text-[11px] text-white/80 font-mono tracking-wider">
                  {authState.currentUser?.email || '•••• •••• •••• 8868 • HSD: 12/28'}
                </p>
              </div>
            </div>

            {/* Total Balance Preview on Card */}
            <div className="mt-1 relative z-10">
              <div className="flex items-center justify-between text-white/80 text-xs">
                <span>Số dư khả dụng</span>
                <button
                  onClick={toggleHideBalance}
                  className="p-1 rounded-full hover:bg-white/10 text-white"
                >
                  {settings.hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                {settings.hideBalance ? '•••••••• ₫' : formatVND(totalBalance)}
              </div>
            </div>

            {/* Two Split White Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-3.5 pt-3 border-t border-white/15 relative z-10">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2 text-slate-800 shadow-sm">
                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-500 font-medium block truncate">Tích lũy tháng</span>
                  <span className="text-xs font-black text-emerald-600 tracking-tight block truncate">
                    +{formatVND(Math.max(0, totalIncome - totalExpense))}
                  </span>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2 text-slate-800 shadow-sm">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Star className="w-3.5 h-3.5 fill-white" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-500 font-medium block truncate">Điểm VietPoint</span>
                  <span className="text-xs font-black text-amber-600 tracking-tight block truncate">
                    3.450 PTS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Financial Health Score & Limit Overview Card (Bố cục đồng bộ như ảnh) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100/90">
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Sức khỏe tài chính cá nhân
                </h3>
                <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" /> Trạng thái: An toàn & Ổn định
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black">
                92 / 100 ĐIỂM
              </div>
            </div>

            {/* Health Meter & Insights */}
            <div className="my-3 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100/60 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800">Đánh giá kỷ luật chi tiêu</div>
                <div className="text-[11px] text-slate-500 leading-snug">
                  Tỷ lệ tiết kiệm tháng đạt <strong className="text-emerald-600">{savingsRate}%</strong>. Bạn đang kiểm soát chi tiêu rất tốt!
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-emerald-200 flex items-center justify-center font-black text-emerald-600 text-xs shrink-0 bg-white shadow-xs">
                {savingsRate}%
              </div>
            </div>

            {/* Spending Limit Progress */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Hạn mức chi tiêu tháng</span>
                <span className="font-bold text-slate-800">{formatVND(totalExpense)} / {formatVND(20000000)} (51%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700"
                  style={{ width: '51%' }}
                />
              </div>
            </div>
          </div>

          {/* 3. The 5 Quick Action Buttons for Account */}
          <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-100/90">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              <button
                onClick={() => setIsAddIncomeOpen(true)}
                className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl hover:bg-emerald-50/50 active:scale-90 transition-all group"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-100 group-hover:scale-105 transition-transform">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                  Nạp ví
                </span>
              </button>

              <button
                onClick={() => setIsTransferOpen(true)}
                className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl hover:bg-blue-50/50 active:scale-90 transition-all group"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs border border-blue-100 group-hover:scale-105 transition-transform">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                  Chuyển tiền
                </span>
              </button>

              <button
                onClick={() => setActiveAccountTab('appearance')}
                className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl hover:bg-amber-50/50 active:scale-90 transition-all group"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs border border-amber-100 group-hover:scale-105 transition-transform">
                  <Lock className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                  Mã PIN
                </span>
              </button>

              <button
                onClick={() => setActiveAccountTab('banks')}
                className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl hover:bg-purple-50/50 active:scale-90 transition-all group"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs border border-purple-100 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                  Quản lý thẻ
                </span>
              </button>

              <button
                onClick={exportDataJSON}
                className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl hover:bg-pink-50/50 active:scale-90 transition-all group"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shadow-xs border border-pink-100 group-hover:scale-105 transition-transform">
                  <Share2 className="w-5 h-5 text-pink-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                  Chia sẻ
                </span>
              </button>
            </div>
          </div>

          {/* 4. Linked Banks & Wallets Preview (3D Cards) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100/90">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Ví & Ngân hàng liên kết thực tế</h3>
                <p className="text-[10px] text-slate-400">Hơn 40 ngân hàng, ví MoMo, ZaloPay & Thẻ quốc tế</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsBankLinkModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-all"
                  style={{ color: themeConfig.primary, backgroundColor: `${themeConfig.primary}15` }}
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm mới
                </button>
                <button
                  onClick={() => setActiveAccountTab('banks')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
                >
                  Tất cả <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {bankAccounts.map((bank) => (
                <div
                  key={bank.id}
                  className="p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/20 hover:bg-slate-100/70 border border-slate-100 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BankLogo code={bank.bankCode} name={bank.bankName} size={40} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                        <span className="truncate">{bank.bankName}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">({bank.accountNumber})</span>
                      </div>
                      <div className="text-xs font-black text-blue-600" style={{ color: themeConfig.primary }}>
                        {formatVND(bank.balance)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {bank.type !== 'cash' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQRBank(bank);
                        }}
                        className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 active:scale-90 transition-all"
                        title="Tạo mã VietQR nhận tiền"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                    <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold ${
                      bank.isLinked ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {bank.isLinked ? 'Đã liên kết' : 'Chưa liên kết'}
                    </span>
                  </div>
                </div>
              ))}

              {bankAccounts.length === 0 && (
                <div className="py-6 text-center text-slate-400">
                  <CreditCard className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
                  <p className="text-xs font-bold">Chưa có tài khoản nào được liên kết</p>
                  <button
                    onClick={() => setIsBankLinkModalOpen(true)}
                    className="mt-2 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs"
                    style={{ background: themeConfig.cardGradient }}
                  >
                    + Liên kết ngân hàng / ví ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Quản lý Ví & Ngân hàng liên kết */}
      {activeAccountTab === 'banks' && (
        <div className="flex flex-col gap-3.5 sm:gap-4 animate-fade-in w-full">
          {/* Master 3D Bank Balance Card */}
          <div
            className="w-full rounded-3xl p-5 text-white shadow-xl relative overflow-hidden transition-all"
            style={{
              background: themeConfig.balanceCardBg,
              boxShadow: `0 14px 30px -8px ${themeConfig.primary}60`
            }}
          >
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-black/25 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-cyan-200" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block">
                    TỔNG SỐ DƯ TÀI KHOẢN & VÍ
                  </span>
                  <h3 className="text-xs font-bold text-white">Quản lý Ngân hàng Thực tế</h3>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold text-white border border-white/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-300" /> Chuẩn Ngân hàng
              </span>
            </div>

            <div className="mt-4 relative z-10 flex items-baseline justify-between">
              <div>
                <div className="text-[10px] text-white/70 font-semibold mb-0.5">Số dư khả dụng:</div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                  {formatVND(bankAccounts.filter(b => b.isLinked).reduce((sum, b) => sum + (b.balance || 0), 0))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/70 font-semibold mb-0.5">Tài khoản kết nối:</div>
                <div className="text-sm font-black text-cyan-200">
                  {bankAccounts.filter(b => b.isLinked).length} / {bankAccounts.length} Hoạt động
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/15 relative z-10">
              <button
                onClick={() => setIsBankLinkModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 active:scale-[0.98] transition-all font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>+ Thêm & Liên kết Ngân hàng / Ví / Thẻ (40+ đơn vị)</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto">
            {(
              [
                { id: 'all', label: `Tất cả (${bankAccounts.length})` },
                { id: 'bank', label: `Ngân hàng (${bankAccounts.filter((b) => b.type === 'bank').length})` },
                { id: 'wallet', label: `Ví điện tử (${bankAccounts.filter((b) => b.type === 'wallet').length})` },
                { id: 'card', label: `Thẻ (${bankAccounts.filter((b) => b.type === 'card').length})` },
                { id: 'cash', label: `Tiền mặt (${bankAccounts.filter((b) => b.type === 'cash').length})` }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBankTypeFilter(tab.id)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  bankTypeFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Danh Sách Tài Khoản & Ví Đã Liên Kết */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Danh sách Ví & Thẻ đang quản lý</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {bankAccounts.filter((b) => bankTypeFilter === 'all' || b.type === bankTypeFilter).length} tài khoản
              </span>
            </div>

            <div className="space-y-3.5">
              {bankAccounts
                .filter((b) => bankTypeFilter === 'all' || b.type === bankTypeFilter)
                .map((bank) => (
                  <div
                    key={bank.id}
                    className="p-4 sm:p-5 rounded-3xl shadow-lg relative overflow-hidden transition-all text-white border border-white/10"
                    style={{
                      background: bank.cardGradient || 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                      boxShadow: `0 12px 24px -8px ${bank.cardColor || '#1e293b'}70`
                    }}
                  >
                    {/* Glossy ambient overlay */}
                    <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/15 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-black/25 rounded-full blur-xl pointer-events-none" />

                    {/* Top Row: Brand Logo, Name & Quick Actions */}
                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <div className="flex items-center gap-3 min-w-0">
                        <BankLogo code={bank.bankCode} name={bank.bankName} size={44} className="shadow-md shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-black tracking-tight truncate">
                              {bank.bankName}
                            </h4>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-mono font-bold">
                              {bank.bankCode}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-400/30 text-emerald-200 border border-emerald-300/30 font-semibold">
                              {bank.type === 'wallet'
                                ? 'Ví điện tử'
                                : bank.type === 'card'
                                ? 'Thẻ tín dụng'
                                : bank.type === 'cash'
                                ? 'Tiền mặt'
                                : 'Tài khoản thanh toán'}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/80 font-medium truncate mt-0.5">
                            {bank.fullName || bank.branch || bank.accountHolder}
                          </p>
                        </div>
                      </div>

                      {/* Top Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(bank.accountNumber);
                            setCopiedBankAccId(bank.id);
                            setTimeout(() => setCopiedBankAccId(null), 2000);
                          }}
                          title="Sao chép số tài khoản"
                          className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-[11px] font-bold text-white flex items-center gap-1"
                        >
                          {copiedBankAccId === bank.id ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedBankAccId === bank.id ? 'Đã sao chép' : 'Sao chép'}</span>
                        </button>

                        {bank.type !== 'cash' && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn hủy liên kết tài khoản ${bank.bankName}?`)) {
                                deleteBankAccount(bank.id);
                              }
                            }}
                            title="Hủy liên kết"
                            className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white active:scale-95 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Account Number & Balance */}
                    <div className="mt-4 pt-3 border-t border-white/15 flex items-end justify-between relative z-10">
                      <div>
                        <div className="text-[10px] text-white/70 uppercase font-semibold">
                          {bank.type === 'wallet'
                            ? 'Số điện thoại ví'
                            : bank.type === 'card'
                            ? 'Số thẻ thanh toán'
                            : 'Số tài khoản'}
                        </div>
                        <div className="text-sm sm:text-base font-black font-mono tracking-wider text-white">
                          {bank.accountNumber}
                        </div>
                        <div className="text-[10px] text-white/75 mt-0.5">
                          Chủ tài khoản: <strong className="uppercase">{bank.accountHolder}</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-white/70 uppercase font-semibold">Số dư khả dụng</div>
                        <div className="text-lg sm:text-xl font-black font-mono tracking-tight text-amber-200">
                          {formatVND(bank.balance)}
                        </div>
                      </div>
                    </div>

                    {/* 4 Real Functional Actions Bar (Chức năng thật dùng thật) */}
                    <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-4 gap-1.5 relative z-10">
                      {/* 1. Mã VietQR */}
                      <button
                        onClick={() => setSelectedQRBank(bank)}
                        className="py-2 px-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-xs"
                        title="Tạo mã VietQR nhận tiền chuyển khoản thật"
                      >
                        <QrCode className="w-4 h-4 text-cyan-200" />
                        <span className="truncate">Mã VietQR</span>
                      </button>

                      {/* 2. Khớp số dư thực tế */}
                      <button
                        onClick={() => setActiveWalletAction({ bank, mode: 'adjust' })}
                        className="py-2 px-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-xs"
                        title="Nhập số dư thực tế từ ngân hàng để khớp sổ"
                      >
                        <Edit3 className="w-4 h-4 text-amber-200" />
                        <span className="truncate">Khớp số dư</span>
                      </button>

                      {/* 3. Nạp / Chuyển tiền nội bộ */}
                      <button
                        onClick={() => setActiveWalletAction({ bank, mode: 'transfer' })}
                        className="py-2 px-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-xs"
                        title="Nạp tiền hoặc chuyển tiền giữa các tài khoản"
                      >
                        <ArrowLeftRight className="w-4 h-4 text-emerald-200" />
                        <span className="truncate">Nạp/Chuyển</span>
                      </button>

                      {/* 4. Lịch sử sao kê */}
                      <button
                        onClick={() => setActiveWalletAction({ bank, mode: 'history' })}
                        className="py-2 px-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-xs"
                        title="Xem lịch sử các giao dịch của riêng thẻ này"
                      >
                        <History className="w-4 h-4 text-purple-200" />
                        <span className="truncate">Sao kê</span>
                      </button>
                    </div>
                  </div>
                ))}

              {bankAccounts.filter((b) => bankTypeFilter === 'all' || b.type === bankTypeFilter).length === 0 && (
                <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">Chưa có tài khoản nào thuộc danh mục này</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                    Nhấn nút bên dưới để liên kết ngay
                  </p>
                  <button
                    onClick={() => setIsBankLinkModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-sm"
                    style={{ background: themeConfig.cardGradient }}
                  >
                    + Thêm tài khoản mới
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Showcase Danh Mục Hơn 40 Ngân Hàng, Ví & Thẻ Hỗ Trợ */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Hơn 40 Ngân hàng & Ví hỗ trợ tại Việt Nam</h3>
              </div>
              <button
                onClick={() => setIsBankLinkModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                style={{ color: themeConfig.primary }}
              >
                Mở bảng chọn <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Chạm vào bất kỳ logo nào để liên kết nhanh với tài khoản thật của bạn:
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {VIETNAM_BANKS_CATALOG.slice(0, 18).map((b) => (
                <button
                  key={b.id}
                  onClick={() => setIsBankLinkModalOpen(true)}
                  className="p-2.5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 hover:border-blue-200 flex flex-col items-center justify-center text-center gap-1.5 transition-all group active:scale-95"
                >
                  <BankLogo code={b.code} name={b.shortName} size={36} />
                  <span className="text-[10px] font-black text-slate-700 group-hover:text-blue-600 truncate max-w-full">
                    {b.code}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsBankLinkModalOpen(true)}
              className="w-full mt-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Xem đầy đủ 40+ Ngân hàng, Ví MoMo, ZaloPay, Thẻ Visa & Mastercard</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: Giao diện & Cài đặt hệ thống (Themes, Languages, Fonts, Auth) */}
      {activeAccountTab === 'appearance' && (
        <div className="flex flex-col gap-3.5 sm:gap-4 animate-fade-in w-full">
          {/* 0. Chế độ Ban Đêm (Dark Mode) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-sm transition-all ${
                  isDarkMode ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' : 'bg-gradient-to-tr from-amber-500 to-orange-500'
                }`}>
                  {isDarkMode ? <Moon className="w-5 h-5 text-amber-300" /> : <Sun className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Chế độ giao diện (Dark Mode)</h3>
                  <p className="text-[11px] text-slate-400">
                    {isDarkMode ? 'Đang bật chế độ ban đêm bảo vệ mắt' : 'Đang bật chế độ sáng ban ngày tiêu chuẩn'}
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isDarkMode}
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Quick Mode Selector Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mt-3.5">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  !isDarkMode
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-400'
                    : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Chế độ Sáng</div>
                    <div className="text-[10px] text-slate-400">Tươi sáng, rõ nét ban ngày</div>
                  </div>
                </div>
                {!isDarkMode && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => setDarkMode(true)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isDarkMode
                    ? 'border-indigo-500 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-400'
                    : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-900 text-amber-300 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Chế độ Tối</div>
                    <div className="text-[10px] text-slate-400">Dịu mắt ban đêm, tiết kiệm pin</div>
                  </div>
                </div>
                {isDarkMode && <Check className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>

            {/* Note banner */}
            <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                Mẹo: Bạn có thể chuyển nhanh chế độ Sáng / Tối bất cứ lúc nào qua biểu tượng Mặt trăng / Mặt trời ở góc trên màn hình.
              </span>
            </div>
          </div>

          {/* 1. Giao diện tổng thể (6 Themes) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">{t('themeSetting')}</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{t('themeSettingDesc')}</p>

            <div className="grid grid-cols-2 gap-2.5">
              {THEMES_LIST.map((th) => {
                const isSelected = settings.theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-400'
                        : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-5 h-5 rounded-full shadow-2xs border border-white"
                        style={{ backgroundColor: th.color }}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{th.name}</div>
                        <div className="text-[9px] text-slate-400">{th.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Ngôn ngữ (6 Languages) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">{t('languageSetting')}</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{t('languageSettingDesc')}</p>

            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES_LIST.map((lang) => {
                const isSelected = settings.language === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-400'
                        : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span className="text-xs font-bold text-slate-800">{lang.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Phông chữ (6 Fonts) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Type className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-800 text-sm">{t('fontSetting')}</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{t('fontSettingDesc')}</p>

            <div className="grid grid-cols-3 gap-2">
              {FONTS_LIST.map((fontName) => {
                const isSelected = settings.font === fontName;
                return (
                  <button
                    key={fontName}
                    onClick={() => setFont(fontName)}
                    style={{ fontFamily: `"${fontName}", sans-serif` }}
                    className={`py-2 px-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs">{fontName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Phương thức đăng nhập */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-800 text-sm">{t('loginSetting')}</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{t('loginSettingDesc')}</p>

            <div className="space-y-2 text-xs">
              {[
                { id: 'password', name: 'Email / Mật khẩu bảo mật', icon: '🔑' },
                { id: 'google', name: 'Google Account (GSI SSO)', icon: '🌐' },
                { id: 'phone', name: 'Số điện thoại qua mã OTP', icon: '📱' },
                { id: 'apple', name: 'Apple ID Sign-in', icon: '🍎' }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => updateSettings({ loginMethod: item.id as any })}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    settings.loginMethod === item.id
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-400 font-bold'
                      : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{item.icon}</span>
                    <span className="text-slate-800">{item.name}</span>
                  </div>
                  {settings.loginMethod === item.id && <Check className="w-4 h-4 text-amber-600" />}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Sinh trắc học & Gemini */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">{t('biometricSetting')}</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.biometricEnabled}
                  onChange={(e) => updateSettings({ biometricEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>
            <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100/60 text-xs">
              <div className="font-bold text-emerald-900">{t('biometricFeature')}</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">{t('biometricDetail')}</div>
            </div>
          </div>

          {/* Gemini AI Key */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">{t('geminiSetting')}</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{t('geminiSettingDesc')}</p>

            <form onSubmit={handleSaveGeminiKey} className="space-y-2.5">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:bg-white focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                style={{ background: themeConfig.cardGradient }}
              >
                {isGeminiSaved ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                <span>{isGeminiSaved ? 'Đã lưu API Key thành công!' : 'Lưu khóa Gemini API'}</span>
              </button>
            </form>
          </div>

          {/* 6. Cài đặt Thông báo Đẩy Thông minh (Smart Push Notifications & Spending Habits) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-800 text-sm">Thông báo Đẩy Thông minh</h3>
                    <span className="px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700 text-[9px] font-black">
                      AI & Thói quen
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Phân tích lịch sử giao dịch & thói quen chi tiêu lặp lại
                  </p>
                </div>
              </div>

              {/* Master toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>

            {/* Native Browser Push Permission Card */}
            <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-blue-50/60 border border-indigo-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-950">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>Thông báo đẩy trên thiết bị (Native Push)</span>
                </div>
                <p className="text-[11px] text-indigo-800/80 mt-0.5">
                  Nhận tin thông báo ngay trên màn hình điện thoại hoặc trình duyệt khi có cảnh báo thói quen chi tiêu
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const res = await requestDevicePushPermission();
                  if (res === 'granted') {
                    setTestPushFeedback('✅ Đã cấp quyền thông báo thiết bị thành công!');
                  } else {
                    setTestPushFeedback('⚠️ Trình duyệt chưa cấp quyền thông báo hoặc bị từ chối.');
                  }
                  setTimeout(() => setTestPushFeedback(null), 4000);
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 shrink-0 flex items-center justify-center gap-1.5 shadow-2xs ${
                  settings.smartPushSettings.browserPushEnabled
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {settings.smartPushSettings.browserPushEnabled ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Đã bật thông báo thiết bị</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Bật thông báo đẩy</span>
                  </>
                )}
              </button>
            </div>

            {/* Specific Habit Alert Toggles */}
            <div className="mt-4 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Cấu hình loại cảnh báo theo thói quen:
              </span>

              {[
                {
                  key: 'recurringBillsAlert',
                  title: 'Nhắc nhở hóa đơn & khoản chi định kỳ',
                  desc: 'Tự động nhắc trước 1-3 ngày cho tiền điện EVN, nước, internet, tiền nhà, bảo hiểm...',
                  icon: <Repeat className="w-4 h-4 text-amber-500" />,
                  checked: settings.smartPushSettings.recurringBillsAlert
                },
                {
                  key: 'weekendSurgeAlert',
                  title: 'Cảnh báo thói quen chi tiêu cuối tuần',
                  desc: 'Phát hiện khi chi tiêu Thứ Bảy & Chủ Nhật cao vượt trội so với ngày thường',
                  icon: <Flame className="w-4 h-4 text-orange-500" />,
                  checked: settings.smartPushSettings.weekendSurgeAlert
                },
                {
                  key: 'coffeeDiningHabitAlert',
                  title: 'Thói quen cà phê, đồ uống & ăn ngoài',
                  desc: 'Theo dõi tần suất mua đồ uống trong tuần và cảnh báo khi tần suất tăng vọt',
                  icon: <Coffee className="w-4 h-4 text-emerald-500" />,
                  checked: settings.smartPushSettings.coffeeDiningHabitAlert
                },
                {
                  key: 'spendingVelocityAlert',
                  title: 'Dự báo tốc độ tiêu tiền (Velocity Burnout)',
                  desc: 'Dự đoán ngày cạn ngân sách dựa trên nhịp chi tiêu bình quân thực tế',
                  icon: <Zap className="w-4 h-4 text-rose-500" />,
                  checked: settings.smartPushSettings.spendingVelocityAlert
                },
                {
                  key: 'habitSpikeAlert',
                  title: 'Phát hiện giao dịch đột biến (Outlier Spike)',
                  desc: 'Cảnh báo ngay khi có giao dịch cao gấp 2.5x mức bình quân thông thường',
                  icon: <AlertOctagon className="w-4 h-4 text-red-500" />,
                  checked: settings.smartPushSettings.habitSpikeAlert
                },
                {
                  key: 'duplicateChargeAlert',
                  title: 'Nghi vấn trừ tiền trùng lặp (Double Charge)',
                  desc: 'Phát hiện 2 giao dịch giống hệt nhau trong cùng ngày để tránh bị trừ kép',
                  icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
                  checked: settings.smartPushSettings.duplicateChargeAlert
                },
                {
                  key: 'soundEnabled',
                  title: 'Âm thanh cảnh báo (Audio Chime)',
                  desc: 'Phát âm thanh chuông sinh động khi có thông báo tài chính gửi đến',
                  icon: <Bell className="w-4 h-4 text-indigo-500" />,
                  checked: settings.smartPushSettings.soundEnabled
                }
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100/90 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-xl bg-white shadow-2xs border border-slate-100 mt-0.5 shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800">{item.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => updateSmartPushSettings({ [item.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>
              ))}
            </div>

            {/* Test Push Dispatch Button */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <button
                type="button"
                disabled={isTestingPush}
                onClick={() => {
                  setIsTestingPush(true);
                  setTestPushFeedback(null);
                  setTimeout(() => {
                    const res = triggerSmartHabitScan(true);
                    setIsTestingPush(false);
                    setTestPushFeedback(
                      `🚀 Đã quét lịch sử giao dịch: Gửi thành công ${res.dispatchedCount} thông báo thông minh!`
                    );
                    setTimeout(() => setTestPushFeedback(null), 5000);
                  }, 600);
                }}
                className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isTestingPush ? 'animate-spin' : ''}`} />
                <span>{isTestingPush ? 'Đang phân tích thói quen...' : 'Phân tích thói quen & Gửi thông báo thử nghiệm'}</span>
              </button>

              {testPushFeedback && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold text-center animate-fade-in">
                  {testPushFeedback}
                </div>
              )}
            </div>

            {/* Discovered Recurring Habits Summary */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5 text-amber-500" />
                  <span>Khoản chi định kỳ đã tự động nhận diện ({recurringHabits.length})</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Học từ lịch sử giao dịch</span>
              </div>

              <div className="space-y-1.5">
                {recurringHabits.length > 0 ? (
                  recurringHabits.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.categoryColor }}
                        />
                        <span className="font-bold text-slate-800 truncate text-[11px]">{item.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          (Ngày {item.typicalDayOfMonth})
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-900 text-xs shrink-0">
                        ~{formatVND(item.estimatedAmount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-center text-[11px] text-slate-400">
                    Chưa phát hiện khoản chi định kỳ nào trong lịch sử
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Gia đình & Sao lưu dữ liệu */}
      {activeAccountTab === 'family' && (
        <div className="flex flex-col gap-3.5 sm:gap-4 animate-fade-in w-full">
          {/* Gia đình & Thành viên chia sẻ */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">{t('familyManagement')}</h3>
              </div>
              <button
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="text-xs font-bold text-blue-600 flex items-center gap-1"
                style={{ color: themeConfig.primary }}
              >
                <Plus className="w-3.5 h-3.5" /> {t('addMember')}
              </button>
            </div>

            {isAddingMember && (
              <form onSubmit={handleAddMember} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-3 space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Tên thành viên (VD: Con gái, Mẹ...)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 outline-none"
                />
                <div className="flex gap-2">
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="text-xs bg-white border border-slate-200 rounded-xl p-2 outline-none flex-1"
                  >
                    <option value="member">Thành viên (Nhập & Xem)</option>
                    <option value="viewer">Chỉ xem (Viewer)</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                    style={{ background: themeConfig.cardGradient }}
                  >
                    Thêm
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {familyMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{m.avatar}</span>
                    <div>
                      <div className="font-bold text-slate-800">{m.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Vai trò: {m.role === 'owner' ? t('roleOwner') : m.role === 'member' ? t('roleMember') : t('roleViewer')}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600">
                    {m.relation}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quản lý dữ liệu, Sao lưu & Khôi phục */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-800 text-sm">{t('backupSetting')}</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{t('backupSettingDesc')}</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="col-span-2 p-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/70 hover:to-indigo-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-2xs"
              >
                <FileDown className="w-4 h-4 text-blue-600" />
                <span>Xuất Báo Cáo Tài Chính Tháng (PDF / CSV)</span>
              </button>

              <button
                onClick={exportDataJSON}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('exportData')}</span>
              </button>

              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{t('importData')}</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={() => {
                  if (confirm('Khôi phục dữ liệu mẫu ban đầu?')) resetDemoData();
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục mẫu</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa hết dữ liệu và bắt đầu từ đầu?')) clearAllData();
                }}
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('clearDemoData')}</span>
              </button>
            </div>
          </div>

          {/* Phiên đăng nhập & Đăng xuất */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-700">
                {authState.currentUser?.provider === 'google' ? 'G' : authState.currentUser?.provider === 'phone' ? '📱' : '👤'}
              </div>
              <div>
                <div className="text-xs font-black text-slate-800">
                  {authState.currentUser?.name || 'Nguyễn Công Tâm'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {authState.isTrialActive ? `Chế độ dùng thử (còn ${trialDaysLeft} ngày)` : 'Tài khoản chính thức'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm('Bạn có muốn đăng xuất và trở về màn hình chào mừng / đăng nhập?')) {
                  logout();
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold active:scale-95 transition-all"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}

      {/* VIEW 5: Mục Chi Tiết Ứng Dụng & Tên Định Danh Firebase vn.studio.chitieuviet */}
      {activeAccountTab === 'details' && (
        <div className="flex flex-col gap-3.5 sm:gap-4 animate-fade-in w-full">
          {/* 1. Master 3D Card: Tên Định Danh Firebase & Package ID */}
          <div
            className="w-full rounded-3xl p-5 text-white shadow-xl relative overflow-hidden transition-all"
            style={{
              background: themeConfig.balanceCardBg,
              boxShadow: `0 14px 30px -8px ${themeConfig.primary}60`
            }}
          >
            {/* Ambient Blobs */}
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-black/25 rounded-full blur-xl pointer-events-none" />

            {/* Header with Chip */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Database className="w-4 h-4 text-cyan-200" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block">
                    ĐỊNH DANH HỆ THỐNG & ĐỒNG BỘ
                  </span>
                  <h3 className="text-xs font-bold text-white">Firebase Cloud & App ID</h3>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold text-white border border-white/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-300" /> Chuẩn Android & Web
              </span>
            </div>

            {/* Package Identifier Box */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-white/15 relative z-10">
              <div className="text-[10px] text-white/70 font-semibold mb-1 flex items-center justify-between">
                <span>Tên định danh ứng dụng (Package ID / App Identifier):</span>
                <span className="text-[9px] text-emerald-300 font-mono">ID DUY NHẤT</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm sm:text-base font-black font-mono tracking-wide text-cyan-300 select-all">
                  vn.studio.chitieuviet
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('vn.studio.chitieuviet');
                    setCopiedPackageId(true);
                    setTimeout(() => setCopiedPackageId(false), 2500);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  {copiedPackageId ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                      <span className="text-emerald-300 text-[11px]">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Sao chép ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Status Pills */}
            <div className="grid grid-cols-2 gap-2 mt-3 relative z-10">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-300 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] text-white/70">Firestore Database</div>
                  <div className="text-[10px] font-bold text-white truncate">Sẵn sàng kết nối</div>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] text-white/70">Firebase Auth</div>
                  <div className="text-[10px] font-bold text-white truncate">Google / SĐT / Email</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Thẻ Thông Tin & Phiên Bản Ứng Dụng */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white border border-emerald-100">
              <AppIcon size="xl" withGlow className="shrink-0" />
              <div>
                <h4 className="font-black text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                  CHI TIÊU VIỆT <span className="text-xs">🇻🇳</span>
                </h4>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  Biểu tượng chính thức • Chuẩn tỷ lệ không tràn viền
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                    PWA & Android Ready
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-bold">
                    Vector HD
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Info className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">Thông tin & Phiên bản ứng dụng</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Tên ứng dụng:</span>
                <span className="font-black text-slate-800 flex items-center gap-1">
                  CHI TIÊU VIỆT 🇻🇳
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Khẩu hiệu (Slogan):</span>
                <span className="font-bold text-blue-600" style={{ color: themeConfig.primary }}>
                  "Quản lý chi tiêu thông minh"
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Phiên bản (Version):</span>
                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  v2.4.0 (Build 2026.09.22)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Định danh gói (Package ID):</span>
                <span className="font-mono font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-lg">
                  vn.studio.chitieuviet
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Động cơ Voice AI:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                  Gemini 2.5 Flash Speech Engine
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Nền tảng phát triển:</span>
                <span className="font-medium text-slate-700">
                  Android Native & Web PWA Hybrid
                </span>
              </div>
            </div>
          </div>

          {/* 3. Thẻ Mô Tả Chi Tiết Ứng Dụng */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Mô tả chi tiết ứng dụng</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-normal mb-3">
              <strong className="text-slate-900 font-bold">Chi Tiêu Việt</strong> là ứng dụng quản lý tài chính cá nhân và gia đình chuyên nghiệp, cao cấp, được thiết kế riêng cho người dùng và thói quen tiêu dùng tại Việt Nam. Ứng dụng cung cấp giải pháp toàn diện giúp kiểm soát thu chi chính xác, nuôi dưỡng thói quen tiết kiệm và gia tăng tài sản bền vững.
            </p>

            <div className="space-y-2">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="text-base">🎙️</span>
                <div>
                  <div className="text-xs font-bold text-slate-800">Nhập giọng nói AI tiếng Việt siêu tốc</div>
                  <div className="text-[11px] text-slate-500">
                    Bóc tách số tiền và danh mục tự động từ lời nói tự nhiên trong 0.5s.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="text-base">📊</span>
                <div>
                  <div className="text-xs font-bold text-slate-800">Báo cáo & Phân tích chuyên sâu</div>
                  <div className="text-[11px] text-slate-500">
                    Biểu đồ 3D nhóm chi tiêu, phân tích xu hướng thu chi và dự báo số dư tương lai.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="text-base">🏦</span>
                <div>
                  <div className="text-xs font-bold text-slate-800">Quản lý đa tài khoản & Ví điện tử</div>
                  <div className="text-[11px] text-slate-500">
                    Hỗ trợ đầy đủ các ngân hàng Việt Nam (VCB, TCB, MB, BIDV, ACB...) và ví MoMo, ZaloPay.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="text-base">👨‍👩‍👧‍👦</span>
                <div>
                  <div className="text-xs font-bold text-slate-800">Đồng bộ & Quản lý gia đình</div>
                  <div className="text-[11px] text-slate-500">
                    Phân quyền vai trò chủ tài khoản, thành viên chi tiêu và người theo dõi báo cáo.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="text-base">🛡️</span>
                <div>
                  <div className="text-xs font-bold text-slate-800">Bảo mật chuẩn quốc tế</div>
                  <div className="text-[11px] text-slate-500">
                    Bảo vệ sinh trắc học vân tay, mã PIN, sao lưu dự phòng JSON và đồng bộ đám mây an toàn.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Thẻ Hướng Dẫn & Cấu Hình Firebase Đồng Bộ */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-orange-600" />
                <h3 className="font-bold text-slate-800 text-sm">Cấu hình kết nối Firebase & Android Gradle</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Đã kết nối
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Dự án đã được tích hợp đầy đủ file <strong>google-services.json</strong>, Google Services Gradle Plugin <strong>4.5.0</strong> và Firebase BoM <strong>34.19.0</strong>:
            </p>

            {/* Android / Gradle Config Code Box */}
            <div className="p-3.5 bg-slate-950 text-cyan-300 rounded-2xl font-mono text-[11px] space-y-1.5 overflow-x-auto shadow-inner border border-slate-800">
              <div className="text-slate-400">// Project Info & Android Package</div>
              <div>project_id: <span className="text-amber-300">"chitieuviet-c38e6"</span></div>
              <div>project_number: <span className="text-amber-300">"80126442021"</span></div>
              <div>package_name: <span className="text-amber-300">"vn.studio.chitieuviet"</span></div>
              <div>storage_bucket: <span className="text-emerald-300">"chitieuviet-c38e6.firebasestorage.app"</span></div>
              <div className="pt-1 text-slate-400">// Gradle Plugins & Dependencies</div>
              <div className="text-pink-300">id("com.google.gms.google-services") version "4.5.0" apply false</div>
              <div className="text-pink-300">id("com.android.application")</div>
              <div className="text-pink-300">id("com.google.gms.google-services")</div>
              <div className="text-emerald-300">implementation(platform("com.google.firebase:firebase-bom:34.19.0"))</div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const googleServicesJson = JSON.stringify({
                    "project_info": {
                      "project_number": "80126442021",
                      "project_id": "chitieuviet-c38e6",
                      "storage_bucket": "chitieuviet-c38e6.firebasestorage.app"
                    },
                    "client": [
                      {
                        "client_info": {
                          "mobilesdk_app_id": "1:80126442021:android:0de3f9dfb8e6a277a25dcc",
                          "android_client_info": {
                            "package_name": "vn.studio.chitieuviet"
                          }
                        },
                        "oauth_client": [],
                        "api_key": [
                          {
                            "current_key": "AIzaSyBV4xRQW9SrkjeKremQQPO6a8erGgnjYWw"
                          }
                        ],
                        "services": {
                          "appinvite_service": {
                            "other_platform_oauth_client": []
                          }
                        }
                      }
                    ],
                    "configuration_version": "1"
                  }, null, 2);
                  navigator.clipboard.writeText(googleServicesJson);
                  alert('Đã sao chép nội dung google-services.json vào bộ nhớ tạm!');
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-blue-600" />
                <span>Sao chép google-services.json</span>
              </button>

              <button
                onClick={() => {
                  const gradleCode = `// Top-level build.gradle.kts
plugins {
    id("com.android.application") version "8.3.0" apply false
    id("com.google.gms.google-services") version "4.5.0" apply false
}

// app/build.gradle.kts
plugins {
    id("com.android.application")
    id("com.google.gms.google-services")
}

dependencies {
    implementation(platform("com.google.firebase:firebase-bom:34.19.0"))
    implementation("com.google.firebase:firebase-analytics")
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
}`;
                  navigator.clipboard.writeText(gradleCode);
                  alert('Đã sao chép cấu hình Gradle & BoM 34.19.0!');
                }}
                className="py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                style={{ background: themeConfig.cardGradient }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Sao chép mã Gradle Kotlin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Link Modal */}
      <BankLinkModal
        isOpen={isBankLinkModalOpen}
        onClose={() => setIsBankLinkModalOpen(false)}
      />

      {/* VietQR Modal */}
      <VietQRModal
        bank={selectedQRBank}
        isOpen={!!selectedQRBank}
        onClose={() => setSelectedQRBank(null)}
      />

      {/* Wallet Action Modal (Adjust Balance, Transfer, History) */}
      <WalletActionModal
        bank={activeWalletAction?.bank || null}
        isOpen={!!activeWalletAction}
        initialMode={activeWalletAction?.mode || 'adjust'}
        onClose={() => setActiveWalletAction(null)}
      />
    </div>
  );
};
