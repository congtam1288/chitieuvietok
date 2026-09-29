import React, { useState, useEffect } from 'react';
import {
  Mic,
  PieChart,
  Target,
  Users,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Mail,
  Phone,
  Lock,
  User,
  ArrowRight,
  Clock,
  AlertTriangle,
  Flame,
  Smartphone,
  Check,
  CreditCard,
  KeyRound,
  Eye,
  EyeOff,
  HelpCircle,
  X,
  RefreshCw,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppIcon } from '../common/AppIcon';

export const AuthOnboardingScreen: React.FC = () => {
  const {
    authState,
    startFreeTrial,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginWithPhone,
    resetTrialForTesting,
    themeConfig
  } = useApp();

  // Mode: 'login' | 'register' | 'tour'
  const [activeMode, setActiveMode] = useState<'login' | 'register' | 'tour'>('login');
  // Sub-tab: 'google' | 'email' | 'phone'
  const [authMethod, setAuthMethod] = useState<'google' | 'email' | 'phone'>('google');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Tour carousel
  const [tourStep, setTourStep] = useState(0);

  // Password strength calculation
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score === 2) return { score: 2, label: 'Trung bình', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score >= 3) return { score: 3, label: 'Mạnh & An toàn', color: 'bg-emerald-500', text: 'text-emerald-600' };
    return { score: 0, label: '', color: 'bg-slate-200', text: 'text-slate-500' };
  };

  const passStrength = calculatePasswordStrength(password);

  // Auto slide carousel when in tour mode
  useEffect(() => {
    if (activeMode !== 'tour') return;
    const timer = setInterval(() => {
      setTourStep((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeMode]);

  // OTP Countdown
  useEffect(() => {
    let interval: any;
    if (isOtpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, otpTimer]);

  const tourCards = [
    {
      id: 0,
      icon: <Mic className="w-8 h-8 text-white" />,
      badge: 'Trí tuệ nhân tạo Gemini',
      title: 'Nhập giọng nói tiếng Việt siêu tốc & Quét hóa đơn',
      desc: 'Nói tự nhiên: "Sáng nay ăn phở 45k, uống cà phê 25k". AI tự động nhận diện số tiền, hạng mục và trừ ví chính xác trong 0.5 giây.',
      gradient: 'from-blue-600 to-indigo-700'
    },
    {
      id: 1,
      icon: <PieChart className="w-8 h-8 text-white" />,
      badge: 'Báo cáo thông minh',
      title: 'Biểu đồ trực quan & Phân tích thu chi 3D',
      desc: 'Theo dõi chi tiết dòng tiền ra vào, tỷ lệ tiết kiệm, biểu đồ nhóm chi tiêu và dự báo số dư tương lai chính xác từng ngày.',
      gradient: 'from-emerald-600 to-teal-700'
    },
    {
      id: 2,
      icon: <Target className="w-8 h-8 text-white" />,
      badge: 'Kế hoạch tài chính',
      title: 'Hạn mức ngân sách & Nuôi heo đất tích lũy',
      desc: 'Đặt giới hạn chi tiêu từng hạng mục, nuôi heo đất tích lũy mua nhà, mua xe hay du lịch kèm cảnh báo thông minh khi sắp chạm trần.',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      id: 3,
      icon: <Building2 className="w-8 h-8 text-white" />,
      badge: 'Đa ví & Ngân hàng',
      title: 'Liên kết hơn 40 ngân hàng & Ví điện tử Việt Nam',
      desc: 'Hỗ trợ Vietcombank, Techcombank, MB Bank, MoMo, ZaloPay, Thẻ Visa/Mastercard cùng tính năng quản lý chi tiêu gia đình tiện lợi.',
      gradient: 'from-purple-600 to-pink-600'
    }
  ];

  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9-10 chữ số)');
      return;
    }
    setErrorMsg('');
    setIsOtpSent(true);
    setOtpTimer(60);
    // Auto fill sample OTP for ease of test
    setTimeout(() => {
      setOtpCode('886888');
    }, 1200);
  };

  const handleGoogleAuth = async (userEmail?: string, userName?: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle(userEmail || 'congtam1288@gmail.com', userName || 'Nguyễn Công Tâm');
    } catch (err: any) {
      setErrorMsg('Đăng nhập Google thất bại: ' + (err?.message || 'Vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    if (activeMode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Vui lòng nhập họ và tên của bạn');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không khớp');
        return;
      }
      if (!agreeTerms) {
        setErrorMsg('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        registerWithEmail(email, password, fullName);
        setLoading(false);
      }, 500);
    } else {
      setLoading(true);
      setTimeout(() => {
        loginWithEmail(email, password);
        setLoading(false);
      }, 500);
    }
  };

  const handlePhoneAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!phoneNumber || phoneNumber.length < 9) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('Vui lòng nhập mã OTP gửi về tin nhắn SMS');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      loginWithPhone(phoneNumber, otpCode, fullName || undefined);
      setLoading(false);
    }, 500);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      alert('Vui lòng nhập email hợp lệ!');
      return;
    }
    setForgotSent(true);
    setTimeout(() => {
      alert(`Đã gửi liên kết khôi phục mật khẩu đến ${forgotEmail}! Vui lòng kiểm tra hộp thư đến.`);
      setIsForgotPasswordOpen(false);
      setForgotSent(false);
    }, 1200);
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center selection:bg-emerald-500 selection:text-white py-3 px-3 sm:px-4 transition-colors"
      style={{
        background: 'linear-gradient(180deg, #F0FDF4 0%, #EFF6FF 50%, #FAF5FF 100%)'
      }}
    >
      <div className="w-full max-w-md flex flex-col justify-between py-2">
        
        {/* 1. TOP BRANDING & FIREBASE STATUS */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2.5">
              <AppIcon size="lg" withGlow />
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  CHI TIÊU <span className="text-emerald-600">VIỆT</span>
                </h1>
                <p className="text-[11px] font-semibold text-slate-500">
                  Quản lý chi tiêu thông minh
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Firebase Cloud
            </span>
          </div>

          {/* EXPIRED TRIAL BANNER (If user trial ended) */}
          {authState.trialExpired && (
            <div className="mb-3.5 p-4 rounded-3xl bg-gradient-to-r from-rose-500 to-amber-600 text-white shadow-lg border border-rose-400/50 animate-bounce-short">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-yellow-200" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide">
                    HẾT HẠN DÙNG THỬ 7 NGÀY
                  </h3>
                  <p className="text-xs text-white/90 mt-0.5 leading-relaxed">
                    Thời gian trải nghiệm miễn phí đã kết thúc. Vui lòng đăng nhập hoặc đăng ký tài khoản chính thức để tiếp tục đồng bộ dữ liệu của bạn!
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => setActiveMode('login')}
                      className="px-3.5 py-1.5 rounded-xl bg-white text-rose-700 font-bold text-xs shadow-xs hover:bg-slate-50 active:scale-95 transition-all"
                    >
                      Đăng nhập ngay
                    </button>
                    <button
                      onClick={resetTrialForTesting}
                      className="px-3 py-1.5 rounded-xl bg-white/20 text-white font-semibold text-[11px] hover:bg-white/30 active:scale-95 transition-all"
                    >
                      Gia hạn 7 ngày thử nghiệm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN MODE SELECTOR (Đăng nhập / Đăng ký / Giới thiệu) */}
          <div className="p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-3 gap-1 mb-3.5">
            <button
              onClick={() => {
                setActiveMode('login');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'login'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm scale-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('register');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'register'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm scale-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng Ký</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('tour');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'tour'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm scale-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Giới Thiệu</span>
            </button>
          </div>
        </div>

        {/* 2. BODY CONTENT ACCORDING TO ACTIVE MODE */}
        
        {/* MODE A: TOUR / GIỚI THIỆU TÍNH NĂNG */}
        {activeMode === 'tour' && (
          <div className="flex-1 flex flex-col justify-center space-y-4 my-1">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-white/80 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Hướng dẫn tính năng nổi bật
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {tourCards.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setTourStep(g.id)}
                      className={`h-2 rounded-full transition-all ${
                        tourStep === g.id ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                      }`}
                      aria-label={`Slide ${g.id + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Active Card */}
              <div
                className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md bg-gradient-to-br ${tourCards[tourStep].gradient} transition-all duration-500`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                    {tourCards[tourStep].icon}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-bold text-white tracking-wide border border-white/30">
                    {tourCards[tourStep].badge}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-black leading-snug mb-1.5">
                  {tourCards[tourStep].title}
                </h2>
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  {tourCards[tourStep].desc}
                </p>

                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold">
                  <button
                    onClick={() => setTourStep((prev) => (prev > 0 ? prev - 1 : 3))}
                    className="flex items-center gap-1 hover:text-white/80 active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" /> Trước
                  </button>
                  <span className="text-[11px] text-white/70">
                    Bước {tourStep + 1} / 4
                  </span>
                  <button
                    onClick={() => setTourStep((prev) => (prev < 3 ? prev + 1 : 0))}
                    className="flex items-center gap-1 hover:text-white/80 active:scale-95"
                  >
                    Tiếp theo <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick action buttons from tour */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveMode('login')}
                className="py-3 px-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all hover:bg-slate-50"
              >
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Đăng nhập ngay</span>
              </button>

              <button
                onClick={startFreeTrial}
                className="py-3 px-4 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
              >
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span>Dùng thử 7 ngày</span>
              </button>
            </div>
          </div>
        )}

        {/* MODE B: ĐĂNG NHẬP (LOGIN) */}
        {activeMode === 'login' && (
          <div className="flex-1 flex flex-col justify-center my-1 space-y-3.5">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-white/90 space-y-4">
              
              <div className="text-center space-y-1">
                <h2 className="text-base font-black text-slate-900 flex items-center justify-center gap-2">
                  <span>Chào mừng bạn trở lại!</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Đăng nhập để đồng bộ dữ liệu tài chính an toàn trên đám mây
                </p>
              </div>

              {/* Method Switcher inside Login */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMethod('google')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                    authMethod === 'google'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                    authMethod === 'email'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                    authMethod === 'phone'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>SĐT / OTP</span>
                </button>
              </div>

              {/* Error & Success alerts */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* SUB-TAB 1: GOOGLE 1-TAP LOGIN */}
              {authMethod === 'google' && (
                <div className="space-y-3 py-1">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2.5">
                    <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Tài khoản Google liên kết thiết bị:
                    </p>
                    
                    {/* Quick Profile Pill */}
                    <div
                      onClick={() => handleGoogleAuth('congtam1288@gmail.com', 'Nguyễn Công Tâm')}
                      className="p-3 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-400 flex items-center justify-between cursor-pointer active:scale-98 transition-all shadow-xs group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform">
                          T
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800">Nguyễn Công Tâm</div>
                          <div className="text-[11px] text-slate-500 font-mono">congtam1288@gmail.com</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl">
                        Đăng nhập
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    onClick={() => handleGoogleAuth()}
                    className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm active:scale-98 transition-all"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{loading ? 'Đang xác thực...' : 'Đăng nhập với tài khoản Google khác'}</span>
                  </button>
                </div>
              )}

              {/* SUB-TAB 2: EMAIL & PASSWORD LOGIN */}
              {authMethod === 'email' && (
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                      Địa chỉ Email / Gmail
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type="email"
                        required
                        placeholder="tenban@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                    {/* Quick Gmail tag */}
                    <div className="flex gap-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setEmail((prev) => (prev.includes('@') ? prev.split('@')[0] + '@gmail.com' : prev + '@gmail.com'))}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold"
                      >
                        + @gmail.com
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Mật khẩu</label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPasswordOpen(true)}
                        className="text-[11px] font-bold text-emerald-600 hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-9 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-600 font-medium">Ghi nhớ đăng nhập</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all mt-2"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    }}
                  >
                    <span>{loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP NGAY'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* SUB-TAB 3: PHONE & OTP SMS LOGIN */}
              {authMethod === 'phone' && (
                <form onSubmit={handlePhoneAuth} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                      Số điện thoại (+84)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 flex items-center">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
                        <input
                          type="tel"
                          required
                          placeholder="0988 888 888"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isOtpSent && otpTimer > 0}
                        className="px-3.5 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 disabled:bg-slate-300 transition-all shrink-0"
                      >
                        {isOtpSent && otpTimer > 0 ? `${otpTimer}s` : 'Gửi mã OTP'}
                      </button>
                    </div>
                  </div>

                  {isOtpSent && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Mã xác thực OTP SMS (6 số)
                      </label>
                      <div className="relative flex items-center">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3" />
                        <input
                          type="text"
                          maxLength={6}
                          required
                          placeholder="886888"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full text-xs font-mono tracking-widest bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white text-center font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đã gửi mã đến {phoneNumber}. (Mã mẫu tự điền: 886888)
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isOtpSent}
                    className="w-full py-3 px-4 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all mt-2 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    }}
                  >
                    <span>{loading ? 'Đang xác thực...' : 'XÁC NHẬN & ĐĂNG NHẬP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Bottom switch to Register */}
              <div className="pt-2 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('register');
                      setErrorMsg('');
                    }}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Đăng ký miễn phí ngay
                  </button>
                </p>

                {/* Free trial shortcut */}
                <div>
                  <button
                    type="button"
                    onClick={startFreeTrial}
                    className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 border border-emerald-200"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                    Hoặc Dùng thử 7 ngày (Khách trải nghiệm)
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODE C: ĐĂNG KÝ (SIGN UP) */}
        {activeMode === 'register' && (
          <div className="flex-1 flex flex-col justify-center my-1 space-y-3.5">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-white/90 space-y-4">
              
              <div className="text-center space-y-1">
                <h2 className="text-base font-black text-slate-900 flex items-center justify-center gap-2">
                  <span>Tạo tài khoản mới</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Đăng ký nhanh chóng, bảo mật dữ liệu tuyệt đối
                </p>
              </div>

              {/* Google Fast Register Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleGoogleAuth('congtam1288@gmail.com', 'Nguyễn Công Tâm')}
                className="w-full py-2.5 px-4 rounded-2xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center gap-2.5 shadow-2xs active:scale-98 transition-all"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng ký nhanh 1 chạm bằng Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-400 uppercase">Hoặc điền thông tin</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* REGISTER FORM */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Họ và tên của bạn
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Công Tâm"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 outline-none focus:border-blue-500 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Địa chỉ Email / Gmail
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="email"
                      required
                      placeholder="tenban@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 outline-none focus:border-blue-500 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Mật khẩu khởi tạo
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-9 py-2.5 outline-none focus:border-blue-500 focus:bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden flex gap-1">
                        <div
                          className={`h-full flex-1 rounded-full ${
                            passStrength.score >= 1 ? passStrength.color : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full ${
                            passStrength.score >= 2 ? passStrength.color : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full ${
                            passStrength.score >= 3 ? passStrength.color : 'bg-slate-200'
                          }`}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${passStrength.text}`}>
                        Độ mạnh: {passStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                    Xác nhận lại mật khẩu
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập lại chính xác mật khẩu trên"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-9 py-2.5 outline-none focus:border-blue-500 focus:bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <span className="text-[11px] text-slate-600 leading-tight">
                      Tôi đồng ý với{' '}
                      <span className="font-bold text-blue-600">Điều khoản dịch vụ</span> &{' '}
                      <span className="font-bold text-blue-600">Bảo mật tài chính</span>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all mt-2"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                  }}
                >
                  <span>{loading ? 'Đang tạo tài khoản...' : 'TẠO TÀI KHOẢN & BẮT ĐẦU'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Bottom switch to Login */}
              <div className="pt-2 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('login');
                      setErrorMsg('');
                    }}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Đăng nhập tại đây
                  </button>
                </p>
              </div>

            </div>
          </div>
        )}

        {/* 3. BOTTOM FOOTER */}
        <div className="text-center pt-2 pb-1 px-4 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-3 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Mã hóa chuẩn ngân hàng
            </span>
            <span>•</span>
            <span>Không bán dữ liệu</span>
            <span>•</span>
            <span>Firebase Cloud</span>
          </div>
          <p>© 2026 Chi Tiêu Việt. Slogan: "Quản lý chi tiêu thông minh".</p>
        </div>

      </div>

      {/* MODAL FORGOT PASSWORD */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-800">Khôi phục mật khẩu</h3>
              </div>
              <button
                onClick={() => setIsForgotPasswordOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Nhập email bạn đã dùng để đăng ký tài khoản. Hệ thống sẽ gửi đường dẫn đặt lại mật khẩu an toàn đến hòm thư của bạn.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">Email của bạn</label>
                <input
                  type="email"
                  required
                  placeholder="congtam1288@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={forgotSent}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                >
                  {forgotSent ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>{forgotSent ? 'Đang gửi...' : 'Gửi liên kết'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
