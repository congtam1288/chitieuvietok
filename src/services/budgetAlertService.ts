import { Budget, Category, Transaction } from '../types';

export type BudgetAlertLevel = 'safe' | 'warning_80' | 'danger_100';

export interface CategoryBudgetStatus {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentSpent: number;
  alertLevel: BudgetAlertLevel;
  exceededAmount: number;
  transactionsCount: number;
}

export interface BudgetOverallStatus {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercent: number;
  hasAlerts: boolean;
  warning80Count: number;
  danger100Count: number;
  categoriesStatus: CategoryBudgetStatus[];
  alertedCategories: CategoryBudgetStatus[];
}

/**
 * Calculates real-time budget spending & alert status for all categories in a given month.
 */
export function calculateBudgetAlerts(
  budget: Budget,
  categories: Category[],
  transactions: Transaction[],
  month: number,
  year: number
): BudgetOverallStatus {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  // Filter transactions for active month that are expenses
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(monthPrefix)
  );

  const categoriesStatus: CategoryBudgetStatus[] = budget.categories.map((budgetCat) => {
    const cat = categories.find((c) => c.id === budgetCat.categoryId);
    const categoryName = cat ? cat.name : 'Khác';
    const categoryIcon = cat ? cat.icon : 'Tag';
    const categoryColor = cat ? cat.color : '#94A3B8';

    // Transactions for this specific category
    const catTransactions = monthExpenses.filter((t) => t.categoryId === budgetCat.categoryId);
    const spentAmount = catTransactions.reduce((sum, t) => sum + t.amount, 0);
    const allocatedAmount = Math.max(1, budgetCat.allocatedAmount);
    const percentSpent = Math.round((spentAmount / allocatedAmount) * 100);
    const remainingAmount = Math.max(0, allocatedAmount - spentAmount);
    const exceededAmount = Math.max(0, spentAmount - allocatedAmount);

    let alertLevel: BudgetAlertLevel = 'safe';
    if (percentSpent >= 100) {
      alertLevel = 'danger_100';
    } else if (percentSpent >= 80) {
      alertLevel = 'warning_80';
    }

    return {
      categoryId: budgetCat.categoryId,
      categoryName,
      categoryIcon,
      categoryColor,
      allocatedAmount,
      spentAmount,
      remainingAmount,
      percentSpent,
      alertLevel,
      exceededAmount,
      transactionsCount: catTransactions.length
    };
  });

  // Sort alerted categories first (100% critical first, then 80% warning)
  const alertedCategories = categoriesStatus
    .filter((c) => c.alertLevel !== 'safe')
    .sort((a, b) => b.percentSpent - a.percentSpent);

  const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalRemaining = Math.max(0, budget.totalBudget - totalSpent);
  const overallPercent = Math.min(100, Math.round((totalSpent / Math.max(1, budget.totalBudget)) * 100));

  const warning80Count = categoriesStatus.filter((c) => c.alertLevel === 'warning_80').length;
  const danger100Count = categoriesStatus.filter((c) => c.alertLevel === 'danger_100').length;

  return {
    totalBudget: budget.totalBudget,
    totalSpent,
    totalRemaining,
    overallPercent,
    hasAlerts: alertedCategories.length > 0,
    warning80Count,
    danger100Count,
    categoriesStatus,
    alertedCategories
  };
}

/**
 * Check and dispatch system notifications if threshold (80% or 100%) was crossed.
 * Uses localStorage to deduplicate notifications per month and threshold.
 */
export function checkAndDispatchBudgetNotifications(
  alerts: BudgetOverallStatus,
  month: number,
  year: number,
  addNotification: (notif: { title: string; message: string; type: 'alert' | 'budget' }) => void
): { newlyTriggered: CategoryBudgetStatus[] } {
  const newlyTriggered: CategoryBudgetStatus[] = [];

  alerts.categoriesStatus.forEach((cat) => {
    if (cat.alertLevel === 'safe') return;

    const storageKey80 = `chitieuviet_alert_sent_${year}_${month}_${cat.categoryId}_80`;
    const storageKey100 = `chitieuviet_alert_sent_${year}_${month}_${cat.categoryId}_100`;

    // 100% threshold alert
    if (cat.alertLevel === 'danger_100') {
      const alreadySent100 = localStorage.getItem(storageKey100);
      if (!alreadySent100) {
        addNotification({
          title: `🚨 VƯỢT TRẦN 100%: ${cat.categoryName}`,
          message: `Danh mục "${cat.categoryName}" đã vượt 100% hạn mức tháng ${month}/${year}! Đã chi ${cat.spentAmount.toLocaleString('vi-VN')}₫ / ${cat.allocatedAmount.toLocaleString('vi-VN')}₫ (${cat.percentSpent}%). Vui lòng kiểm soát chi tiêu!`,
          type: 'alert'
        });
        localStorage.setItem(storageKey100, 'true');
        newlyTriggered.push(cat);
      }
    }

    // 80% threshold alert
    if (cat.alertLevel === 'warning_80' || cat.alertLevel === 'danger_100') {
      const alreadySent80 = localStorage.getItem(storageKey80);
      if (!alreadySent80) {
        addNotification({
          title: `⚠️ Cảnh báo ngân sách 80%: ${cat.categoryName}`,
          message: `Danh mục "${cat.categoryName}" đã chạm ngưỡng 80% hạn mức tháng ${month}/${year}! Đã chi ${cat.spentAmount.toLocaleString('vi-VN')}₫ / ${cat.allocatedAmount.toLocaleString('vi-VN')}₫ (${cat.percentSpent}%).`,
          type: 'budget'
        });
        localStorage.setItem(storageKey80, 'true');
        if (cat.alertLevel === 'warning_80') {
          newlyTriggered.push(cat);
        }
      }
    }
  });

  return { newlyTriggered };
}

/**
 * Play a short sound cue for notifications (pure Web Audio API, safe and dependency-free).
 */
export function playAlertChime(level: BudgetAlertLevel) {
  if (level === 'safe') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (level === 'danger_100') {
      // Urgent double beep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(740, ctx.currentTime + 0.18);
      gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc2.start(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.35);
    } else {
      // Pleasant rising warning chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Gracefully ignore audio errors (e.g. autoplay policies)
  }
}
