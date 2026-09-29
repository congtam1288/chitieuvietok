import React from 'react';
import { Bell, Search, Clock, Sparkles, Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppIcon } from './AppIcon';

export const AppHeader: React.FC = () => {
  const {
    t,
    themeConfig,
    unreadNotifCount,
    setIsSmartSearchOpen,
    setIsNotificationOpen,
    setActiveTab,
    authState,
    trialDaysLeft,
    isDarkMode,
    toggleDarkMode
  } = useApp();

  const userInitial = authState.currentUser?.name
    ? authState.currentUser.name.trim().charAt(0).toUpperCase()
    : 'T';

  return (
    <header className="w-full flex items-center justify-between px-2 sm:px-4 pt-3 pb-2.5 transition-all">
      {/* Brand Logo & Name */}
      <div
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => setActiveTab('home')}
      >
        <AppIcon
          size="md"
          withGlow
          className="transition-transform active:scale-95 group-hover:scale-105"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-800 flex items-center gap-1">
              CHI TIÊU <span style={{ color: themeConfig.primary }}>VIỆT</span>
              <span className="text-xs">🇻🇳</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">
              {t('appSlogan')}
            </span>
            {/* Trial badge tag */}
            {authState.isTrialActive ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('account');
                }}
                className="px-1.5 py-0.2 rounded-md bg-amber-100 border border-amber-300 text-amber-800 text-[9px] font-extrabold flex items-center gap-0.5 hover:bg-amber-200 transition-colors"
              >
                <Clock className="w-2.5 h-2.5 text-amber-600" />
                Dùng thử: {trialDaysLeft} ngày
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-extrabold flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> VIP
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          title={isDarkMode ? 'Đang bật Chế độ ban đêm • Nhấn để chuyển sang chế độ sáng' : 'Đang bật Chế độ ban ngày • Nhấn để bật chế độ tối'}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all ${
            isDarkMode
              ? 'bg-slate-800 border border-slate-700 text-amber-400 hover:bg-slate-700 ring-1 ring-amber-400/20'
              : 'bg-white/90 backdrop-blur-sm border border-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20 animate-spin-slow" />
          ) : (
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 transition-transform -rotate-12" />
          )}
        </button>

        {/* Search button */}
        <button
          onClick={() => setIsSmartSearchOpen(true)}
          aria-label="Search"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50 active:scale-90 transition-all"
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Notification button with Badge */}
        <button
          onClick={() => setIsNotificationOpen(true)}
          aria-label="Notifications"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50 active:scale-90 transition-all relative"
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {unreadNotifCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm animate-pulse"
            >
              {unreadNotifCount}
            </span>
          )}
        </button>

        {/* Avatar profile button */}
        <button
          onClick={() => setActiveTab('account')}
          aria-label="User Profile"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm active:scale-90 transition-all ring-2 ring-white"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
          }}
        >
          {userInitial}
        </button>
      </div>
    </header>
  );
};
