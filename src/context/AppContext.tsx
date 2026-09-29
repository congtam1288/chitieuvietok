import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_BANKS,
  INITIAL_CATEGORIES,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_GOALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TRANSACTIONS
} from '../data/initialData';
import { translations, TranslationKey } from '../i18n/translations';
import { THEME_CONFIGS } from '../theme/themes';
import { auth, googleProvider, signInWithPopup, signOut } from '../services/firebase';
import {
  AppSettings,
  AuthState,
  BankAccount,
  Budget,
  Category,
  FamilyMember,
  FontType,
  Goal,
  LanguageType,
  NotificationItem,
  RecurringSpendingHabit,
  SmartPushSettings,
  SpendingHabitInsight,
  ThemeConfig,
  ThemeType,
  Transaction,
  UserProfile
} from '../types';
import {
  DEFAULT_SMART_PUSH_SETTINGS,
  detectRecurringBills,
  analyzeSpendingHabits,
  evaluateAndDispatchSmartPushNotifications,
  requestBrowserPushPermission
} from '../services/smartPushService';

interface AppContextType {
  // Authentication & Onboarding
  authState: AuthState;
  trialDaysLeft: number;
  startFreeTrial: () => void;
  loginWithGoogle: (email?: string, name?: string) => void;
  loginWithEmail: (email: string, pass: string, name?: string) => void;
  registerWithEmail: (email: string, pass: string, name: string) => void;
  loginWithPhone: (phone: string, otp: string, name?: string) => void;
  logout: () => void;
  expireTrialForTesting: () => void;
  resetTrialForTesting: () => void;
  setHasSeenOnboarding: (seen: boolean) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentMonthYear: { month: number; year: number };
  setCurrentMonthYear: React.Dispatch<React.SetStateAction<{ month: number; year: number }>>;

  // Settings & Appearance
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeType) => void;
  setLanguage: (lang: LanguageType) => void;
  setFont: (font: FontType) => void;
  toggleHideBalance: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  t: (key: TranslationKey) => string;

  // Transactions CRUD
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (cat: Category) => void;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  depositToGoal: (id: string, amount: number) => void;

  // Budget
  budget: Budget;
  updateBudget: (updates: Partial<Budget>) => void;

  // Family & Accounts
  familyMembers: FamilyMember[];
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  bankAccounts: BankAccount[];
  toggleLinkBank: (id: string) => void;
  addBankAccount: (bank: Omit<BankAccount, 'id'>) => void;
  deleteBankAccount: (id: string) => void;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;

  // Notifications & Smart Push
  notifications: NotificationItem[];
  unreadNotifCount: number;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'date' | 'time' | 'isRead'>) => void;
  recurringHabits: RecurringSpendingHabit[];
  spendingHabitInsights: SpendingHabitInsight[];
  triggerSmartHabitScan: (forceDispatch?: boolean) => { dispatchedCount: number; newlyDispatched: SpendingHabitInsight[] };
  updateSmartPushSettings: (updates: Partial<SmartPushSettings>) => void;
  requestDevicePushPermission: () => Promise<NotificationPermission | 'unsupported'>;

  // Computed Financial Metrics
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  savingsRate: number;
  categoryExpenses: Array<{ category: Category; amount: number; percentage: number }>;
  spendingTrendData: Array<{ day: string; amount: number; date: string }>;
  peakSpendDay: { day: string; amount: number };

  // Modals & Floating Action States
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (open: boolean) => void;
  isAddIncomeOpen: boolean;
  setIsAddIncomeOpen: (open: boolean) => void;
  isTransferOpen: boolean;
  setIsTransferOpen: (open: boolean) => void;
  isGoalModalOpen: boolean;
  setIsGoalModalOpen: (open: boolean) => void;
  isSmartSearchOpen: boolean;
  setIsSmartSearchOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (tx: Transaction | null) => void;
  isPlusMenuOpen: boolean;
  setIsPlusMenuOpen: (open: boolean) => void;

  // Utilities
  resetDemoData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonStr: string) => boolean;
}

const DEFAULT_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  isTrialActive: false,
  trialExpired: false,
  hasSeenOnboarding: false,
  currentUser: null
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'blue',
  language: 'vi',
  font: 'Roboto',
  loginMethod: 'password',
  biometricEnabled: false,
  hideBalance: false,
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  notificationsEnabled: true,
  budgetAlertThreshold: 80,
  offlineMode: false,
  syncStatus: 'synced',
  lastSyncTime: new Date().toISOString(),
  darkMode: false,
  smartPushSettings: DEFAULT_SMART_PUSH_SETTINGS
};

const DEFAULT_BUDGET: Budget = {
  id: 'budget-2024-05',
  month: 5,
  year: 2024,
  totalBudget: 20000000,
  categories: [
    { categoryId: 'food', allocatedAmount: 6000000, percentage: 30 },
    { categoryId: 'transport', allocatedAmount: 4000000, percentage: 20 },
    { categoryId: 'shopping', allocatedAmount: 3000000, percentage: 15 },
    { categoryId: 'bills', allocatedAmount: 2000000, percentage: 10 },
    { categoryId: 'entertainment', allocatedAmount: 2000000, percentage: 10 },
    { categoryId: 'other', allocatedAmount: 3000000, percentage: 15 }
  ],
  notes: 'Chi tiêu hợp lý, tích lũy cho những điều tốt đẹp hơn!',
  updatedAt: new Date().toISOString()
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentMonthYear, setCurrentMonthYear] = useState({ month: 5, year: 2024 });

  // Authentication State
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('chitieuviet_auth');
    if (saved) {
      try {
        const parsed: AuthState = JSON.parse(saved);
        // Check if trial is expired
        if (parsed.isTrialActive && parsed.currentUser?.trialStartDate) {
          const start = new Date(parsed.currentUser.trialStartDate).getTime();
          const daysElapsed = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
          if (daysElapsed >= 7) {
            return {
              ...parsed,
              isAuthenticated: false,
              isTrialActive: false,
              trialExpired: true
            };
          }
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved auth state', e);
      }
    }
    return DEFAULT_AUTH_STATE;
  });

  // Calculate remaining trial days
  const trialDaysLeft = useMemo(() => {
    if (!authState.isTrialActive || !authState.currentUser?.trialStartDate) {
      return 0;
    }
    const start = new Date(authState.currentUser.trialStartDate).getTime();
    const daysElapsed = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysElapsed);
  }, [authState.isTrialActive, authState.currentUser?.trialStartDate]);

  // Sync auth state to local storage and check trial validity
  useEffect(() => {
    localStorage.setItem('chitieuviet_auth', JSON.stringify(authState));
  }, [authState]);

  // Auth Handlers
  const startFreeTrial = () => {
    const user: UserProfile = {
      id: 'usr-trial-' + Date.now(),
      name: 'Khách Trải Nghiệm',
      avatar: '🌟',
      provider: 'trial',
      isVip: true,
      isTrial: true,
      trialStartDate: new Date().toISOString(),
      trialDaysLeft: 7,
      registeredAt: new Date().toISOString()
    };

    setAuthState({
      isAuthenticated: true,
      isTrialActive: true,
      trialExpired: false,
      hasSeenOnboarding: true,
      currentUser: user
    });
  };

  const loginWithGoogle = async (email?: string, name?: string) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        const u = result.user;
        const userProfile: UserProfile = {
          id: u.uid,
          name: u.displayName || name || 'Nguyễn Công Tâm',
          email: u.email || email || 'congtam1288@gmail.com',
          avatar: u.photoURL || 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          provider: 'google',
          isVip: true,
          isTrial: false,
          registeredAt: new Date().toISOString()
        };
        setAuthState({
          isAuthenticated: true,
          isTrialActive: false,
          trialExpired: false,
          hasSeenOnboarding: true,
          currentUser: userProfile
        });
        return;
      }
    } catch (err) {
      console.warn('Firebase popup sign in skipped/fallback', err);
    }

    // Fallback seamless login
    const user: UserProfile = {
      id: 'usr-google-' + Date.now(),
      name: name || 'Nguyễn Công Tâm',
      email: email || 'congtam1288@gmail.com',
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      provider: 'google',
      isVip: true,
      isTrial: false,
      registeredAt: new Date().toISOString()
    };

    setAuthState({
      isAuthenticated: true,
      isTrialActive: false,
      trialExpired: false,
      hasSeenOnboarding: true,
      currentUser: user
    });
  };

  const loginWithEmail = (email: string, pass: string, name?: string) => {
    const user: UserProfile = {
      id: 'usr-email-' + Date.now(),
      name: name || email.split('@')[0] || 'Chủ Tài Khoản',
      email,
      avatar: '👤',
      provider: 'email',
      isVip: true,
      isTrial: false,
      registeredAt: new Date().toISOString()
    };

    setAuthState({
      isAuthenticated: true,
      isTrialActive: false,
      trialExpired: false,
      hasSeenOnboarding: true,
      currentUser: user
    });
  };

  const registerWithEmail = (email: string, pass: string, name: string) => {
    const user: UserProfile = {
      id: 'usr-reg-' + Date.now(),
      name: name.trim() || 'Người Dùng Mới',
      email,
      avatar: '✨',
      provider: 'email',
      isVip: true,
      isTrial: false,
      registeredAt: new Date().toISOString()
    };

    setAuthState({
      isAuthenticated: true,
      isTrialActive: false,
      trialExpired: false,
      hasSeenOnboarding: true,
      currentUser: user
    });
  };

  const loginWithPhone = (phone: string, otp: string, name?: string) => {
    const user: UserProfile = {
      id: 'usr-phone-' + Date.now(),
      name: name || `Người dùng (+84) ${phone.slice(-4)}`,
      phone,
      avatar: '📱',
      provider: 'phone',
      isVip: true,
      isTrial: false,
      registeredAt: new Date().toISOString()
    };

    setAuthState({
      isAuthenticated: true,
      isTrialActive: false,
      trialExpired: false,
      hasSeenOnboarding: true,
      currentUser: user
    });
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error', e);
    }
    setAuthState({
      isAuthenticated: false,
      isTrialActive: false,
      trialExpired: false,
      hasSeenOnboarding: true,
      currentUser: null
    });
  };

  const expireTrialForTesting = () => {
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: false,
      isTrialActive: false,
      trialExpired: true
    }));
  };

  const resetTrialForTesting = () => {
    startFreeTrial();
  };

  const setHasSeenOnboarding = (seen: boolean) => {
    setAuthState((prev) => ({ ...prev, hasSeenOnboarding: seen }));
  };

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('chitieuviet_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          darkMode: parsed.darkMode ?? (parsed.theme === 'dark'),
          smartPushSettings: {
            ...DEFAULT_SMART_PUSH_SETTINGS,
            ...(parsed.smartPushSettings || {})
          }
        };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return { ...DEFAULT_SETTINGS, darkMode: Boolean(prefersDark) };
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('chitieuviet_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('chitieuviet_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Goals
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('chitieuviet_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  // Budget
  const [budget, setBudget] = useState<Budget>(() => {
    const saved = localStorage.getItem('chitieuviet_budget');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGET;
  });

  // Family Members
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('chitieuviet_family');
    return saved ? JSON.parse(saved) : INITIAL_FAMILY_MEMBERS;
  });

  // Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('chitieuviet_banks');
    if (saved) {
      try {
        const parsed: BankAccount[] = JSON.parse(saved);
        // Filter out legacy demo/virtual banks that had isDemo === true
        const realAccounts = parsed.filter((b) => !b.isDemo);
        if (realAccounts.length > 0) return realAccounts;
      } catch (e) {
        console.error('Failed to parse saved banks', e);
      }
    }
    return INITIAL_BANKS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('chitieuviet_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState<boolean>(false);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [isSmartSearchOpen, setIsSmartSearchOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('chitieuviet_settings', JSON.stringify(settings));
    document.body.style.fontFamily = `"${settings.font}", sans-serif`;
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('chitieuviet_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('chitieuviet_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('chitieuviet_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('chitieuviet_budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('chitieuviet_banks', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('chitieuviet_family', JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem('chitieuviet_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Computed Dark Mode state
  const isDarkMode = Boolean(settings.darkMode || settings.theme === 'dark');

  // Synchronize 'dark' class with <html> and <body>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Current theme object with Dark Mode support
  const themeConfig = useMemo(() => {
    const base = THEME_CONFIGS[settings.theme] || THEME_CONFIGS.blue;
    if (isDarkMode) {
      return {
        ...base,
        isDark: true,
        bgGradient: 'linear-gradient(180deg, #0F172A 0%, #0B0F19 50%, #020617 100%)',
        bgColor: '#0B0F19',
        surfaceColor: '#1E293B',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
        cardGradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        balanceCardBg: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
      };
    }
    return base;
  }, [settings.theme, isDarkMode]);

  // Translation helper
  const t = (key: TranslationKey): string => {
    const langDict = translations[settings.language] || translations.vi;
    return (langDict as any)[key] || (translations.vi as any)[key] || key;
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const setTheme = (theme: ThemeType) => {
    if (theme === 'dark') {
      updateSettings({ theme, darkMode: true });
    } else {
      updateSettings({ theme, darkMode: false });
    }
  };

  const setDarkMode = (enabled: boolean) => {
    updateSettings({
      darkMode: enabled,
      theme: enabled ? (settings.theme === 'dark' ? 'dark' : settings.theme) : (settings.theme === 'dark' ? 'blue' : settings.theme)
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  const setLanguage = (language: LanguageType) => {
    updateSettings({ language });
  };

  const setFont = (font: FontType) => {
    updateSettings({ font });
  };

  const toggleHideBalance = () => {
    updateSettings({ hideBalance: !settings.hideBalance });
  };

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update bank balance if applicable
    if (tx.accountId) {
      setBankAccounts((prev) =>
        prev.map((b) => {
          if (b.id === tx.accountId) {
            const diff = tx.type === 'income' ? tx.amount : -tx.amount;
            return { ...b, balance: Math.max(0, b.balance + diff) };
          }
          if (tx.type === 'transfer' && tx.toAccountId && b.id === tx.toAccountId) {
            return { ...b, balance: b.balance + tx.amount };
          }
          return b;
        })
      );
    }

    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates, updatedAt: new Date().toISOString() } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const duplicateTransaction = (id: string) => {
    const source = transactions.find((t) => t.id === id);
    if (source) {
      addTransaction({
        ...source,
        title: `${source.title} (Bản sao)`,
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const addCategory = (cat: Category) => {
    setCategories((prev) => [...prev, cat]);
  };

  // Goals
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: 'goal-' + Date.now()
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const depositToGoal = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g))
    );
  };

  // Budget
  const updateBudget = (updates: Partial<Budget>) => {
    setBudget((prev) => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
  };

  // Family
  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMem: FamilyMember = {
      ...member,
      id: 'mem-' + Date.now()
    };
    setFamilyMembers((prev) => [...prev, newMem]);
  };

  // Bank
  const toggleLinkBank = (id: string) => {
    setBankAccounts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isLinked: !b.isLinked } : b))
    );
  };

  const addBankAccount = (bank: Omit<BankAccount, 'id'>) => {
    const newBank: BankAccount = {
      ...bank,
      id: 'bank-' + Date.now()
    };
    setBankAccounts((prev) => [...prev, newBank]);
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBankAccount = (id: string, updates: Partial<BankAccount>) => {
    setBankAccounts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  // Notifications
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'date' | 'time' | 'isRead'>) => {
    const now = new Date();
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif-' + Date.now(),
      date: now.toISOString().split('T')[0],
      time: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      isRead: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const unreadNotifCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Smart Push & Habit Notifications Engine
  const recurringHabits = useMemo(() => {
    return detectRecurringBills(transactions, categories);
  }, [transactions, categories]);

  const spendingHabitInsights = useMemo(() => {
    return analyzeSpendingHabits(transactions, categories, budget, settings.smartPushSettings);
  }, [transactions, categories, budget, settings.smartPushSettings]);

  const updateSmartPushSettings = (updates: Partial<SmartPushSettings>) => {
    setSettings((prev) => {
      const nextSettings: AppSettings = {
        ...prev,
        smartPushSettings: {
          ...prev.smartPushSettings,
          ...updates
        }
      };
      localStorage.setItem('chitieuviet_settings', JSON.stringify(nextSettings));
      return nextSettings;
    });
  };

  const requestDevicePushPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
    const result = await requestBrowserPushPermission();
    if (result === 'granted') {
      updateSmartPushSettings({ browserPushEnabled: true });
    } else {
      updateSmartPushSettings({ browserPushEnabled: false });
    }
    return result;
  };

  const triggerSmartHabitScan = (forceDispatch: boolean = false) => {
    const insights = analyzeSpendingHabits(transactions, categories, budget, settings.smartPushSettings);
    return evaluateAndDispatchSmartPushNotifications(
      insights,
      settings.smartPushSettings,
      addNotification,
      forceDispatch
    );
  };

  // Automatic smart push evaluation on transactions or setting changes
  useEffect(() => {
    if (settings.notificationsEnabled && spendingHabitInsights.length > 0) {
      evaluateAndDispatchSmartPushNotifications(
        spendingHabitInsights,
        settings.smartPushSettings,
        addNotification,
        false
      );
    }
  }, [spendingHabitInsights, settings.notificationsEnabled, settings.smartPushSettings]);

  // Financial Computations for current month or all
  const filteredMonthTransactions = useMemo(() => {
    const prefix = `${currentMonthYear.year}-${String(currentMonthYear.month).padStart(2, '0')}`;
    return transactions.filter((t) => t.date.startsWith(prefix));
  }, [transactions, currentMonthYear]);

  const totalIncome = useMemo(() => {
    return filteredMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredMonthTransactions]);

  const totalExpense = useMemo(() => {
    return filteredMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredMonthTransactions]);

  const totalBalance = useMemo(() => {
    // Exact formula: Initial baseline or sum of all transactions
    const allIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const allExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return Math.max(0, allIncome - allExpense);
  }, [transactions]);

  const savingsRate = useMemo(() => {
    if (totalIncome === 0) return 0;
    const rate = ((totalIncome - totalExpense) / totalIncome) * 100;
    return parseFloat(rate.toFixed(1));
  }, [totalIncome, totalExpense]);

  // Category breakdown for donut chart
  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    filteredMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });

    const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'all');
    const result = expenseCategories
      .map((cat) => {
        const amount = map[cat.id] || 0;
        const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
        return { category: cat, amount, percentage };
      })
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return result;
  }, [filteredMonthTransactions, categories, totalExpense]);

  // Spending trend data for 30 days
  const spendingTrendData = useMemo(() => {
    const daysMap: Record<string, number> = {};
    for (let i = 1; i <= 30; i++) {
      const dayKey = String(i).padStart(2, '0');
      daysMap[dayKey] = 0;
    }

    filteredMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const day = t.date.split('-')[2];
        if (day && daysMap[day] !== undefined) {
          daysMap[day] += t.amount;
        }
      });

    return Object.entries(daysMap).map(([day, amount]) => ({
      day,
      amount,
      date: `${currentMonthYear.year}-${String(currentMonthYear.month).padStart(2, '0')}-${day}`
    }));
  }, [filteredMonthTransactions, currentMonthYear]);

  const peakSpendDay = useMemo(() => {
    let max = { day: '15/05', amount: 0 };
    filteredMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (t.amount > max.amount) {
          const parts = t.date.split('-');
          max = { day: `${parts[2]}/${parts[1]}`, amount: t.amount };
        }
      });
    return max;
  }, [filteredMonthTransactions]);

  // Utilities
  const resetDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(INITIAL_CATEGORIES);
    setGoals(INITIAL_GOALS);
    setBudget(DEFAULT_BUDGET);
    setFamilyMembers(INITIAL_FAMILY_MEMBERS);
    setBankAccounts(INITIAL_BANKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(DEFAULT_SETTINGS);
    setCurrentMonthYear({ month: 5, year: 2024 });
  };

  const clearAllData = () => {
    setTransactions([]);
    setGoals([]);
    setNotifications([]);
  };

  const exportDataJSON = () => {
    const data = {
      transactions,
      categories,
      goals,
      budget,
      familyMembers,
      bankAccounts,
      settings,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chitieuviet_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.categories) setCategories(parsed.categories);
      if (parsed.goals) setGoals(parsed.goals);
      if (parsed.budget) setBudget(parsed.budget);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        authState,
        trialDaysLeft,
        startFreeTrial,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginWithPhone,
        logout,
        expireTrialForTesting,
        resetTrialForTesting,
        setHasSeenOnboarding,
        activeTab,
        setActiveTab,
        currentMonthYear,
        setCurrentMonthYear,
        settings,
        updateSettings,
        themeConfig,
        setTheme,
        setLanguage,
        setFont,
        toggleHideBalance,
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
        t,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        duplicateTransaction,
        categories,
        addCategory,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        budget,
        updateBudget,
        familyMembers,
        addFamilyMember,
        bankAccounts,
        toggleLinkBank,
        addBankAccount,
        deleteBankAccount,
        updateBankAccount,
        notifications,
        unreadNotifCount,
        markAllNotificationsRead,
        addNotification,
        recurringHabits,
        spendingHabitInsights,
        triggerSmartHabitScan,
        updateSmartPushSettings,
        requestDevicePushPermission,
        totalBalance,
        totalIncome,
        totalExpense,
        savingsRate,
        categoryExpenses,
        spendingTrendData,
        peakSpendDay,
        isVoiceModalOpen,
        setIsVoiceModalOpen,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        isAddIncomeOpen,
        setIsAddIncomeOpen,
        isTransferOpen,
        setIsTransferOpen,
        isGoalModalOpen,
        setIsGoalModalOpen,
        isSmartSearchOpen,
        setIsSmartSearchOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        selectedTransaction,
        setSelectedTransaction,
        isPlusMenuOpen,
        setIsPlusMenuOpen,
        resetDemoData,
        clearAllData,
        exportDataJSON,
        importDataJSON
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
