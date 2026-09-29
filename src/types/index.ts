export type ThemeType = 'green' | 'blue' | 'red' | 'purple' | 'orange' | 'dark';

export type LanguageType = 'vi' | 'en' | 'zh' | 'ja' | 'ko' | 'fr';

export type FontType = 'Roboto' | 'Open Sans' | 'Montserrat' | 'Lato' | 'Poppins' | 'Nunito';

export type LoginMethod = 'password' | 'phone' | 'email' | 'google' | 'facebook' | 'apple';

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'all';
}

export interface Transaction {
  id: string;
  userId: string;
  familyId?: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  title: string;
  note?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  accountId?: string;
  toAccountId?: string; // For transfers
  memberId?: string;
  paymentMethod?: string;
  fee?: number;
  syncStatus?: 'synced' | 'syncing' | 'offline';
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  categoryId: string;
  allocatedAmount: number;
  percentage: number;
}

export interface Budget {
  id: string;
  month: number;
  year: number;
  totalBudget: number;
  categories: BudgetCategory[];
  notes?: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  category: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'owner' | 'member' | 'viewer';
  avatar: string;
  relation: string;
  totalExpense?: number;
  totalIncome?: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  fullName?: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  logo: string;
  isLinked: boolean;
  isDemo: boolean;
  type: 'bank' | 'wallet' | 'card' | 'cash';
  cardColor?: string;
  cardGradient?: string;
  branch?: string;
  bin?: string;
  isDefault?: boolean;
  creditLimit?: number;
  statementDate?: number;
  dueDate?: number;
  note?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar: string;
  provider: 'google' | 'email' | 'phone' | 'trial';
  isVip: boolean;
  isTrial: boolean;
  trialStartDate?: string;
  trialDaysLeft?: number;
  registeredAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isTrialActive: boolean;
  trialExpired: boolean;
  hasSeenOnboarding: boolean;
  currentUser: UserProfile | null;
}

export type NotificationType =
  | 'alert'
  | 'budget'
  | 'income'
  | 'goal'
  | 'system'
  | 'smart_habit'
  | 'recurring_bill'
  | 'anomaly'
  | 'velocity';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  date: string;
  isRead: boolean;
  category?: string;
  amount?: number;
  actionLabel?: string;
  actionUrl?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface SmartPushSettings {
  browserPushEnabled: boolean;
  recurringBillsAlert: boolean;
  spendingVelocityAlert: boolean;
  habitSpikeAlert: boolean;
  weekendSurgeAlert: boolean;
  coffeeDiningHabitAlert: boolean;
  duplicateChargeAlert: boolean;
  soundEnabled: boolean;
}

export interface RecurringSpendingHabit {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  estimatedAmount: number;
  frequency: 'monthly' | 'weekly' | 'biweekly';
  typicalDayOfMonth?: number;
  lastTransactionDate?: string;
  nextExpectedDate: string;
  status: 'due_soon' | 'overdue' | 'paid_this_cycle' | 'upcoming';
  confidence: number; // 0 - 100%
  sampleCount: number;
  isAutoDetected: boolean;
}

export interface SpendingHabitInsight {
  id: string;
  type:
    | 'recurring_bill'
    | 'weekend_surge'
    | 'coffee_dining_habit'
    | 'velocity_burn'
    | 'anomaly_spike'
    | 'duplicate_charge'
    | 'payday_saving';
  title: string;
  message: string;
  detail?: string;
  suggestedAction?: string;
  priority: 'high' | 'medium' | 'low';
  detectedAt: string;
  metric?: {
    current: number | string;
    baseline?: number | string;
    diffPercentage?: number;
  };
}

export interface AppSettings {
  theme: ThemeType;
  language: LanguageType;
  font: FontType;
  loginMethod: LoginMethod;
  biometricEnabled: boolean;
  hideBalance: boolean;
  geminiApiKey: string;
  geminiModel: string;
  notificationsEnabled: boolean;
  budgetAlertThreshold: number; // e.g. 80 (%)
  offlineMode: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncTime?: string;
  darkMode: boolean;
  smartPushSettings: SmartPushSettings;
}

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  subname: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  headerGradient: string;
  cardGradient: string;
  balanceCardBg: string;
  floatingBtnBg: string;
  bgGradient: string;
  bgColor: string;
  surfaceColor: string;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
}

export const APP_METADATA = {
  name: 'CHI TIÊU VIỆT',
  slogan: 'Quản lý chi tiêu thông minh',
  packageId: 'vn.studio.chitieuviet',
  appId: 'vn.studio.chitieuviet',
  version: '2.4.0',
  build: '2026.09.22.8868',
  releaseDate: '2026-09-22',
  engine: 'Gemini 2.5 Flash Voice Engine',
  platform: 'Android & Web PWA Hybrid',
  description: 'Ứng dụng quản lý tài chính cá nhân và gia đình thông minh với công nghệ nhận diện giọng nói AI tiếng Việt siêu tốc, bóc tách hóa đơn, báo cáo 3D trực quan và đồng bộ Firebase Cloud an toàn.'
} as const;
