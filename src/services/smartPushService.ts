import { Category, NotificationItem, RecurringSpendingHabit, SpendingHabitInsight, Transaction, Budget, SmartPushSettings } from '../types';
import { formatVND } from './voiceParser';
import { playAlertChime } from './budgetAlertService';

export const DEFAULT_SMART_PUSH_SETTINGS: SmartPushSettings = {
  browserPushEnabled: false,
  recurringBillsAlert: true,
  spendingVelocityAlert: true,
  habitSpikeAlert: true,
  weekendSurgeAlert: true,
  coffeeDiningHabitAlert: true,
  duplicateChargeAlert: true,
  soundEnabled: true
};

/**
 * Check if the browser supports standard Web Push Notifications
 */
export function isBrowserPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission status
 */
export function getBrowserPushPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request browser push notification permission
 */
export async function requestBrowserPushPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isBrowserPushSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

/**
 * Send real native browser push notification if permitted
 */
export function sendBrowserPushNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    tag?: string;
    badge?: string;
    data?: unknown;
  }
): boolean {
  if (!isBrowserPushSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    new Notification(title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag || 'chitieuviet_smart_push',
      badge: options.badge || '/favicon.ico'
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Known Vietnamese recurring expense patterns (EVN, nước, internet, dịch vụ giải trí, tiền nhà...)
 */
const KNOWN_RECURRING_KEYWORDS = [
  { match: /điện|evn/i, title: 'Hóa đơn Điện EVN', categoryId: 'bills', defaultDay: 10 },
  { match: /nước|sawaco/i, title: 'Hóa đơn Nước sinh hoạt', categoryId: 'bills', defaultDay: 12 },
  { match: /internet|fpt|viettel|vnpt/i, title: 'Cước Internet cáp quang', categoryId: 'bills', defaultDay: 15 },
  { match: /netflix|spotify|youtube|icloud|google one/i, title: 'Gói xem phim & Nhạc số', categoryId: 'entertainment', defaultDay: 20 },
  { match: /gym|thể hình|fitness/i, title: 'Hội viên Gym & Thể thao', categoryId: 'health', defaultDay: 5 },
  { match: /tiền nhà|thuê nhà|trọ/i, title: 'Tiền thuê nhà / Chung cư', categoryId: 'family', defaultDay: 5 },
  { match: /bảo hiểm|manulife|prudential|dai-ichi|bảo việt/i, title: 'Bảo hiểm định kỳ', categoryId: 'family', defaultDay: 15 },
  { match: /gửi xe|giữ xe/i, title: 'Vé tháng gửi xe', categoryId: 'transport', defaultDay: 1 },
  { match: /winmart|coopmart|bách hóa xanh|siêu thị/i, title: 'Đi siêu thị tích trữ', categoryId: 'shopping', defaultDay: 14 }
];

/**
 * Helper to normalize string for fuzzy matching
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[-_.,]/g, ' ');
}

/**
 * 1. Intelligent Recurring Expense & Subscription Detection
 */
export function detectRecurringBills(
  transactions: Transaction[],
  categories: Category[],
  referenceDate: Date = new Date()
): RecurringSpendingHabit[] {
  const expenseTxs = transactions.filter((t) => t.type === 'expense');
  const results: RecurringSpendingHabit[] = [];

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  const currentDay = referenceDate.getDate();
  const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  // 1a. Rule-based pattern matching on known recurring types
  KNOWN_RECURRING_KEYWORDS.forEach((pattern, idx) => {
    const matchedTxs = expenseTxs.filter(
      (t) => pattern.match.test(t.title) || pattern.match.test(t.note || '')
    );

    if (matchedTxs.length > 0) {
      // Find average amount
      const avgAmount = Math.round(
        matchedTxs.reduce((sum, t) => sum + t.amount, 0) / matchedTxs.length
      );

      // Extract typical day of month
      const days = matchedTxs.map((t) => {
        const d = new Date(t.date);
        return isNaN(d.getDate()) ? pattern.defaultDay : d.getDate();
      });
      const typicalDay = Math.round(days.reduce((a, b) => a + b, 0) / days.length) || pattern.defaultDay;

      // Check if already paid this month
      const paidThisMonth = matchedTxs.some((t) => t.date.startsWith(currentMonthPrefix));
      const latestTx = [...matchedTxs].sort((a, b) => b.date.localeCompare(a.date))[0];

      let status: 'due_soon' | 'overdue' | 'paid_this_cycle' | 'upcoming' = 'upcoming';
      if (paidThisMonth) {
        status = 'paid_this_cycle';
      } else if (currentDay > typicalDay + 2) {
        status = 'overdue';
      } else if (Math.abs(typicalDay - currentDay) <= 3 || currentDay === typicalDay) {
        status = 'due_soon';
      }

      // Next expected date formatted YYYY-MM-DD
      const nextMonth = paidThisMonth ? currentMonth + 1 : currentMonth;
      const nextYear = nextMonth > 12 ? currentYear + 1 : currentYear;
      const adjustedMonth = nextMonth > 12 ? 1 : nextMonth;
      const nextDateStr = `${nextYear}-${String(adjustedMonth).padStart(2, '0')}-${String(Math.min(28, typicalDay)).padStart(2, '0')}`;

      const cat = categories.find((c) => c.id === pattern.categoryId) || categories[0];

      results.push({
        id: `rec-pattern-${idx}`,
        title: latestTx.title.length < 28 ? latestTx.title : pattern.title,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryColor: cat.color,
        estimatedAmount: avgAmount,
        frequency: 'monthly',
        typicalDayOfMonth: typicalDay,
        lastTransactionDate: latestTx.date,
        nextExpectedDate: nextDateStr,
        status,
        confidence: Math.min(95, 60 + matchedTxs.length * 15),
        sampleCount: matchedTxs.length,
        isAutoDetected: true
      });
    }
  });

  // 1b. Data-driven clustering for any repeated merchant/title with >= 2 occurrences
  const groupedByTitle: Record<string, Transaction[]> = {};
  expenseTxs.forEach((tx) => {
    const norm = normalizeText(tx.title);
    if (norm.length > 3) {
      if (!groupedByTitle[norm]) groupedByTitle[norm] = [];
      groupedByTitle[norm].push(tx);
    }
  });

  Object.entries(groupedByTitle).forEach(([normTitle, txList], idx) => {
    // If not already covered by known keyword patterns and has >= 2 transactions
    const alreadyFound = results.some((r) => normalizeText(r.title).includes(normTitle) || normTitle.includes(normalizeText(r.title)));
    if (!alreadyFound && txList.length >= 2) {
      const amounts = txList.map((t) => t.amount);
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      // Check amount variance: if amounts are reasonably consistent (< 35% variance)
      const variance = Math.max(...amounts) - Math.min(...amounts);
      if (variance / avg <= 0.4 || txList.length >= 3) {
        const sorted = [...txList].sort((a, b) => b.date.localeCompare(a.date));
        const latestTx = sorted[0];
        const days = txList.map((t) => new Date(t.date).getDate() || 15);
        const typicalDay = Math.round(days.reduce((a, b) => a + b, 0) / days.length);

        const paidThisMonth = txList.some((t) => t.date.startsWith(currentMonthPrefix));
        let status: 'due_soon' | 'overdue' | 'paid_this_cycle' | 'upcoming' = 'upcoming';
        if (paidThisMonth) {
          status = 'paid_this_cycle';
        } else if (currentDay > typicalDay + 2) {
          status = 'overdue';
        } else if (Math.abs(typicalDay - currentDay) <= 3) {
          status = 'due_soon';
        }

        const nextMonth = paidThisMonth ? currentMonth + 1 : currentMonth;
        const nextYear = nextMonth > 12 ? currentYear + 1 : currentYear;
        const adjustedMonth = nextMonth > 12 ? 1 : nextMonth;
        const nextDateStr = `${nextYear}-${String(adjustedMonth).padStart(2, '0')}-${String(Math.min(28, typicalDay)).padStart(2, '0')}`;

        const cat = categories.find((c) => c.id === latestTx.categoryId) || categories[0];

        results.push({
          id: `rec-cluster-${idx}`,
          title: latestTx.title,
          categoryId: cat.id,
          categoryName: cat.name,
          categoryColor: cat.color,
          estimatedAmount: Math.round(avg),
          frequency: 'monthly',
          typicalDayOfMonth: typicalDay,
          lastTransactionDate: latestTx.date,
          nextExpectedDate: nextDateStr,
          status,
          confidence: Math.min(90, 50 + txList.length * 12),
          sampleCount: txList.length,
          isAutoDetected: true
        });
      }
    }
  });

  return results;
}

/**
 * 2. Deep Spending Habit & Behavioral Pattern Analysis
 */
export function analyzeSpendingHabits(
  transactions: Transaction[],
  categories: Category[],
  budget?: Budget,
  settings: SmartPushSettings = DEFAULT_SMART_PUSH_SETTINGS,
  referenceDate: Date = new Date()
): SpendingHabitInsight[] {
  const insights: SpendingHabitInsight[] = [];
  const expenseTxs = transactions.filter((t) => t.type === 'expense');

  if (expenseTxs.length === 0) return insights;

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  const currentDay = referenceDate.getDate();
  const currentDayOfWeek = referenceDate.getDay(); // 0 is Sunday, 6 is Saturday
  const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const currentMonthExpenses = expenseTxs.filter((t) => t.date.startsWith(currentMonthPrefix));
  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  // ----------------------------------------------------
  // A. RECURRING BILLS REMINDERS (Nhắc nhở hóa đơn & khoản chi định kỳ)
  // ----------------------------------------------------
  if (settings.recurringBillsAlert) {
    const recurringHabits = detectRecurringBills(transactions, categories, referenceDate);
    recurringHabits.forEach((bill) => {
      if (bill.status === 'due_soon') {
        insights.push({
          id: `insight-rec-due-${bill.id}`,
          type: 'recurring_bill',
          title: `📅 Sắp đến hạn chi định kỳ: ${bill.title}`,
          message: `Theo thói quen tài chính, bạn thường thanh toán "${bill.title}" vào khoảng ngày ${bill.typicalDayOfMonth} hàng tháng (~${formatVND(bill.estimatedAmount)}). Đừng quên chuẩn bị số dư!`,
          detail: `Ước tính: ${formatVND(bill.estimatedAmount)} • Tần suất: Hàng tháng • Độ tin cậy: ${bill.confidence}%`,
          suggestedAction: 'Kiểm tra số dư & Thanh toán',
          priority: 'high',
          detectedAt: new Date().toISOString(),
          metric: { current: formatVND(bill.estimatedAmount) }
        });
      } else if (bill.status === 'overdue') {
        insights.push({
          id: `insight-rec-overdue-${bill.id}`,
          type: 'recurring_bill',
          title: `⚠️ Hóa đơn định kỳ chưa thanh toán: ${bill.title}`,
          message: `Hóa đơn "${bill.title}" (~${formatVND(bill.estimatedAmount)}) thường thanh toán vào ngày ${bill.typicalDayOfMonth}, nhưng chưa thấy phát sinh giao dịch trong tháng ${currentMonth}.`,
          detail: `Trễ khoảng ${Math.max(1, currentDay - (bill.typicalDayOfMonth || 15))} ngày so với thói quen hàng tháng.`,
          suggestedAction: 'Ghi nhận giao dịch đã chi',
          priority: 'high',
          detectedAt: new Date().toISOString(),
          metric: { current: formatVND(bill.estimatedAmount) }
        });
      }
    });
  }

  // ----------------------------------------------------
  // B. WEEKEND SURGE HABIT (Thói quen chi tiêu đột biến cuối tuần)
  // ----------------------------------------------------
  if (settings.weekendSurgeAlert) {
    let weekdayTotal = 0;
    let weekdayCount = 0;
    let weekendTotal = 0;
    let weekendCount = 0;

    expenseTxs.forEach((tx) => {
      const d = new Date(tx.date);
      if (!isNaN(d.getTime())) {
        const day = d.getDay();
        if (day === 0 || day === 6) {
          weekendTotal += tx.amount;
          weekendCount++;
        } else {
          weekdayTotal += tx.amount;
          weekdayCount++;
        }
      }
    });

    const avgWeekday = weekdayCount > 0 ? weekdayTotal / Math.max(1, weekdayCount) : 0;
    const avgWeekend = weekendCount > 0 ? weekendTotal / Math.max(1, weekendCount) : 0;

    if (avgWeekend > avgWeekday * 1.4 && weekendCount >= 2) {
      const ratio = (avgWeekend / Math.max(1, avgWeekday)).toFixed(1);
      const isWeekendNow = currentDayOfWeek === 0 || currentDayOfWeek === 5 || currentDayOfWeek === 6;

      insights.push({
        id: 'insight-weekend-surge',
        type: 'weekend_surge',
        title: isWeekendNow ? '☕ Cảnh giác thói quen chi tiêu cuối tuần' : '📊 Thói quen chi tiêu cuối tuần',
        message: `Dữ liệu cho thấy bạn thường chi tiêu cao gấp ${ratio} lần vào Thứ Bảy & Chủ Nhật (trung bình ${formatVND(avgWeekend)}/lần chi). ${
          isWeekendNow ? 'Hôm nay là cuối tuần, hãy cân nhắc kiểm soát các bữa tiệc & mua sắm!' : 'Hãy để dành ngân sách cho các hoạt động cuối tuần.'
        }`,
        detail: `Trung bình ngày thường: ${formatVND(avgWeekday)} vs Cuối tuần: ${formatVND(avgWeekend)}`,
        suggestedAction: 'Đặt hạn mức giải trí cuối tuần',
        priority: isWeekendNow ? 'high' : 'medium',
        detectedAt: new Date().toISOString(),
        metric: {
          current: `${ratio}x`,
          diffPercentage: Math.round(((avgWeekend - avgWeekday) / Math.max(1, avgWeekday)) * 100)
        }
      });
    }
  }

  // ----------------------------------------------------
  // C. FREQUENT COFFEE & DINING HABIT (Thói quen cà phê, đồ uống, ăn ngoài)
  // ----------------------------------------------------
  if (settings.coffeeDiningHabitAlert) {
    const coffeeDiningKeywords = /cà phê|coffee|highlands|starbucks|phúc long|trà sữa|the coffee house|milano|trung nguyên|ăn sáng|ăn vặt/i;
    const recent7Days = expenseTxs.filter((t) => {
      const diffDays = (referenceDate.getTime() - new Date(t.date).getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7 && coffeeDiningKeywords.test(t.title);
    });

    if (recent7Days.length >= 3) {
      const sum7Days = recent7Days.reduce((a, b) => a + b.amount, 0);
      insights.push({
        id: 'insight-coffee-habit',
        type: 'coffee_dining_habit',
        title: '🥤 Thói quen cà phê & đồ uống tuần này',
        message: `Bạn đã có ${recent7Days.length} lần chi tiêu cho cà phê & đồ uống trong 7 ngày qua với tổng ${formatVND(sum7Days)}. Hãy thử pha cà phê tại nhà 2 ngày/tuần để tiết kiệm thêm!`,
        detail: `Chi tiêu tích lũy đồ uống: ${formatVND(sum7Days)} (~${formatVND(Math.round(sum7Days / recent7Days.length))}/lần)`,
        suggestedAction: 'Theo dõi mục tiêu cắt giảm đồ uống',
        priority: 'medium',
        detectedAt: new Date().toISOString(),
        metric: {
          current: `${recent7Days.length} lần`,
          baseline: formatVND(sum7Days)
        }
      });
    }
  }

  // ----------------------------------------------------
  // D. SPENDING VELOCITY & RUNWAY BURN ALERT (Dự báo tốc độ tiêu tiền)
  // ----------------------------------------------------
  if (settings.spendingVelocityAlert && budget && budget.totalBudget > 0) {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const passedDays = Math.max(1, currentDay);
    const dailyBurnRate = Math.round(totalSpentThisMonth / passedDays);
    const projectedTotal = dailyBurnRate * daysInMonth;

    // Projected exhaustion day
    const daysUntilExhausted = Math.round((budget.totalBudget - totalSpentThisMonth) / Math.max(1, dailyBurnRate));
    const projectedExhaustionDay = Math.min(daysInMonth, passedDays + daysUntilExhausted);

    if (projectedTotal > budget.totalBudget * 1.15 && currentDay >= 5) {
      const overPercentage = Math.round(((projectedTotal - budget.totalBudget) / budget.totalBudget) * 100);
      insights.push({
        id: 'insight-spending-velocity',
        type: 'velocity_burn',
        title: '⚡ Cảnh báo tốc độ tiêu tiền (Velocity Alert)',
        message: `Với tốc độ tiêu trung bình ${formatVND(dailyBurnRate)}/ngày, bạn dự kiến sẽ tiêu hết hạn mức vào ngày ${projectedExhaustionDay} của tháng (vượt ${overPercentage}% so với ngân sách ${formatVND(budget.totalBudget)}).`,
        detail: `Dự báo tổng chi cả tháng: ${formatVND(projectedTotal)} • Tốc độ an toàn khuyến nghị: ${formatVND(Math.round(budget.totalBudget / daysInMonth))}/ngày`,
        suggestedAction: 'Hạ nhiệt chi tiêu không thiết yếu',
        priority: 'high',
        detectedAt: new Date().toISOString(),
        metric: {
          current: `${formatVND(dailyBurnRate)}/ngày`,
          diffPercentage: overPercentage
        }
      });
    }
  }

  // ----------------------------------------------------
  // E. ABNORMAL TRANSACTION SPIKE (Phát hiện giao dịch đột biến)
  // ----------------------------------------------------
  if (settings.habitSpikeAlert) {
    // Group by category to find average spend per transaction
    const categoryStats: Record<string, { total: number; count: number }> = {};
    expenseTxs.forEach((t) => {
      if (!categoryStats[t.categoryId]) categoryStats[t.categoryId] = { total: 0, count: 0 };
      categoryStats[t.categoryId].total += t.amount;
      categoryStats[t.categoryId].count++;
    });

    // Check recent 3 transactions
    const latest3Txs = [...expenseTxs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    latest3Txs.forEach((tx) => {
      const stat = categoryStats[tx.categoryId];
      if (stat && stat.count >= 2) {
        const avg = stat.total / stat.count;
        if (tx.amount >= avg * 2.5 && tx.amount >= 500000) {
          const cat = categories.find((c) => c.id === tx.categoryId);
          insights.push({
            id: `insight-spike-${tx.id}`,
            type: 'anomaly_spike',
            title: `🔎 Phát hiện giao dịch đột biến: ${cat?.name || 'Chi tiêu'}`,
            message: `Khoản chi "${tx.title}" trị giá ${formatVND(tx.amount)} cao gấp ${(tx.amount / avg).toFixed(1)} lần mức chi tiêu thông thường của danh mục này (${formatVND(avg)}).`,
            detail: `Giao dịch ngày: ${tx.date} • Phương thức: ${tx.paymentMethod || 'Không rõ'}`,
            suggestedAction: 'Xác nhận giao dịch',
            priority: 'high',
            detectedAt: new Date().toISOString(),
            metric: {
              current: formatVND(tx.amount),
              baseline: formatVND(avg)
            }
          });
        }
      }
    });
  }

  // ----------------------------------------------------
  // F. POTENTIAL DUPLICATE CHARGE (Cảnh báo trừ tiền trùng lặp)
  // ----------------------------------------------------
  if (settings.duplicateChargeAlert) {
    for (let i = 0; i < expenseTxs.length; i++) {
      for (let j = i + 1; j < expenseTxs.length; j++) {
        const a = expenseTxs[i];
        const b = expenseTxs[j];
        if (
          a.amount === b.amount &&
          a.date === b.date &&
          a.amount >= 50000 &&
          (a.title.toLowerCase() === b.title.toLowerCase() || a.categoryId === b.categoryId)
        ) {
          insights.push({
            id: `insight-dup-${a.id}-${b.id}`,
            type: 'duplicate_charge',
            title: `⚠️ Nghi vấn trừ tiền trùng lặp: ${a.title}`,
            message: `Hệ thống ghi nhận 2 giao dịch giống hệt nhau trị giá ${formatVND(a.amount)} cùng ngày ${a.date}. Vui lòng kiểm tra lại để tránh bị cà thẻ hoặc trừ ví hai lần!`,
            detail: `Giao dịch 1: "${a.title}" (${a.time || ''}) • Giao dịch 2: "${b.title}" (${b.time || ''})`,
            suggestedAction: 'Xem và xóa giao dịch trùng',
            priority: 'high',
            detectedAt: new Date().toISOString(),
            metric: { current: formatVND(a.amount) }
          });
          break; // Avoid spamming multiple identical pairs
        }
      }
    }
  }

  // ----------------------------------------------------
  // G. PAYDAY & SAVINGS DISCIPLINE HABIT (Thói quen nhận lương & tích lũy)
  // ----------------------------------------------------
  const salaryTxs = transactions.filter((t) => t.type === 'income' && /lương|salary/i.test(t.title));
  if (salaryTxs.length > 0) {
    const latestSalary = [...salaryTxs].sort((a, b) => b.date.localeCompare(a.date))[0];
    const diffDays = (referenceDate.getTime() - new Date(latestSalary.date).getTime()) / (1000 * 3600 * 24);

    if (diffDays >= 0 && diffDays <= 3) {
      insights.push({
        id: `insight-payday-saving-${latestSalary.id}`,
        type: 'payday_saving',
        title: '💰 Kỷ luật tài chính: Nhận lương & Tích lũy',
        message: `Lương ${formatVND(latestSalary.amount)} vừa ghi nhận! Hãy áp dụng nguyên tắc "Trả cho bản thân trước": trích ngay 15% - 20% (${formatVND(Math.round(latestSalary.amount * 0.15))}) vào hũ Tiết kiệm trước khi chi tiêu tháng mới!`,
        detail: `Ghi nhận từ giao dịch "${latestSalary.title}" ngày ${latestSalary.date}`,
        suggestedAction: 'Nạp tiền vào mục tiêu tiết kiệm',
        priority: 'medium',
        detectedAt: new Date().toISOString(),
        metric: { current: formatVND(latestSalary.amount) }
      });
    }
  }

  return insights;
}

/**
 * 3. Smart Push Dispatcher: Dispatches in-app notifications and real browser Web Push
 */
export function evaluateAndDispatchSmartPushNotifications(
  insights: SpendingHabitInsight[],
  settings: SmartPushSettings,
  addNotification: (notif: Omit<NotificationItem, 'id' | 'date' | 'time' | 'isRead'>) => void,
  forceDispatch: boolean = false
): { dispatchedCount: number; newlyDispatched: SpendingHabitInsight[] } {
  let dispatchedCount = 0;
  const newlyDispatched: SpendingHabitInsight[] = [];
  const todayKey = new Date().toISOString().split('T')[0];

  insights.forEach((insight) => {
    const storageKey = `chitieuviet_smart_notif_${insight.id}_${todayKey}`;
    const alreadySent = localStorage.getItem(storageKey);

    if (!alreadySent || forceDispatch) {
      // Map insight type to notification type
      let notifType: NotificationItem['type'] = 'smart_habit';
      if (insight.type === 'recurring_bill') notifType = 'recurring_bill';
      else if (insight.type === 'anomaly_spike' || insight.type === 'duplicate_charge') notifType = 'anomaly';
      else if (insight.type === 'velocity_burn') notifType = 'velocity';

      // 1. Add to In-app Notification Center
      addNotification({
        title: insight.title,
        message: insight.message,
        type: notifType,
        priority: insight.priority,
        actionLabel: insight.suggestedAction
      });

      // 2. Dispatch Real Native Browser Push Notification if enabled & supported
      if (settings.browserPushEnabled) {
        sendBrowserPushNotification(insight.title, {
          body: insight.message,
          icon: '/favicon.ico',
          tag: insight.id
        });
      }

      // 3. Audio cue
      if (settings.soundEnabled) {
        playAlertChime(insight.priority === 'high' ? 'danger_100' : 'warning_80');
      }

      // Mark as dispatched for today
      localStorage.setItem(storageKey, 'true');
      dispatchedCount++;
      newlyDispatched.push(insight);
    }
  });

  return { dispatchedCount, newlyDispatched };
}
