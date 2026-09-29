import { Category, TransactionType } from '../types';

export interface ParsedVoiceResult {
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  rawText: string;
  confidence: number;
}

// Map Vietnamese spoken words to numbers
const VIETNAMESE_NUMBERS: Record<string, number> = {
  'không': 0,
  'một': 1,
  'mốt': 1,
  'hai': 2,
  'ba': 3,
  'bốn': 4,
  'tư': 4,
  'năm': 5,
  'lăm': 5,
  'sáu': 6,
  'bảy': 7,
  'bẩy': 7,
  'tám': 8,
  'chín': 9,
  'mười': 10,
  'trăm': 100,
  'nghìn': 1000,
  'ngàn': 1000,
  'vạn': 10000,
  'triệu': 1000000,
  'tỷ': 1000000000,
  'rưỡi': 0.5
};

export function parseVietnameseAmount(text: string): number | null {
  const clean = text.toLowerCase().trim();

  // Pattern: "1 triệu 500", "1tr5", "1.5 triệu", "1,5tr", "1 triệu rưỡi"
  const rưỡiMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|tr)\s*(?:rưỡi|nửa)/i);
  if (rưỡiMatch) {
    const base = parseFloat(rưỡiMatch[1].replace(',', '.'));
    return Math.round((base + 0.5) * 1000000);
  }

  const trWithKMatch = clean.match(/(\d+)\s*(?:triệu|tr)\s*(\d{1,3})(?:\s*k|\s*nghìn|\s*ngàn)?(?!\d)/i);
  if (trWithKMatch) {
    const million = parseInt(trWithKMatch[1], 10);
    let thousand = parseInt(trWithKMatch[2], 10);
    if (thousand < 10) thousand *= 100;
    else if (thousand < 100) thousand *= 10;
    return million * 1000000 + thousand * 1000;
  }

  // Pattern: "10k", "20.5k", "500k", "1000k"
  const kMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*k(?:\b|[^\w])/i);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(',', '.'));
    return Math.round(num * 1000);
  }

  // Pattern: "20 nghìn", "50 ngàn", "100 ngàn", "200 nghìn"
  const thousandMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:nghìn|ngàn|ng|k)/i);
  if (thousandMatch) {
    const num = parseFloat(thousandMatch[1].replace(',', '.'));
    return Math.round(num * 1000);
  }

  // Pattern: "1 triệu", "35 triệu", "2.5 triệu"
  const millionMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|củ)/i);
  if (millionMatch) {
    const num = parseFloat(millionMatch[1].replace(',', '.'));
    return Math.round(num * 1000000);
  }

  // Pattern: "1 tỷ", "2.5 tỷ"
  const billionMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:tỷ|ty)/i);
  if (billionMatch) {
    const num = parseFloat(billionMatch[1].replace(',', '.'));
    return Math.round(num * 1000000000);
  }

  // Pattern: Direct currency with "đ" or "vnd" or plain formatted digits e.g. "10.000đ", "50000"
  const rawNumMatch = clean.match(/(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(?:đ|vnd|đồng)?/i);
  if (rawNumMatch) {
    const rawVal = rawNumMatch[1].replace(/[.,]/g, '');
    const num = parseInt(rawVal, 10);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }

  // Spoken text parser: e.g. "hai trăm nghìn", "một triệu hai"
  if (clean.includes('triệu') || clean.includes('nghìn') || clean.includes('ngàn') || clean.includes('trăm')) {
    let calculated = 0;
    if (clean.includes('hai trăm nghìn') || clean.includes('hai trăm ngàn')) return 200000;
    if (clean.includes('một trăm nghìn') || clean.includes('một trăm ngàn')) return 100000;
    if (clean.includes('ba trăm nghìn') || clean.includes('ba trăm ngàn')) return 300000;
    if (clean.includes('năm mươi nghìn') || clean.includes('năm mươi ngàn')) return 50000;
    if (clean.includes('hai mươi nghìn') || clean.includes('hai mươi ngàn')) return 20000;
    if (clean.includes('mười nghìn') || clean.includes('mười ngàn')) return 10000;
    if (clean.includes('một triệu')) return 1000000;
    if (clean.includes('hai triệu')) return 2000000;
    if (clean.includes('năm triệu')) return 5000000;
    if (clean.includes('mười triệu')) return 10000000;
  }

  return null;
}

export function parseVoiceInput(
  rawTranscript: string,
  categories: Category[]
): ParsedVoiceResult {
  const text = rawTranscript.trim();
  const lower = text.toLowerCase();

  // 1. Detect Type (Income vs Expense)
  const isIncome =
    lower.includes('lương') ||
    lower.includes('thưởng') ||
    lower.includes('thu nhập') ||
    lower.includes('tiền về') ||
    lower.includes('được cho') ||
    lower.includes('bán được') ||
    lower.includes('doanh thu') ||
    lower.includes('cổ tức') ||
    lower.includes('lãi');

  const type: TransactionType = isIncome ? 'income' : 'expense';

  // 2. Extract Amount
  const extractedAmount = parseVietnameseAmount(text) || 10000;

  // 3. Detect Category
  let categoryId = type === 'income' ? 'salary' : 'food';

  if (isIncome) {
    if (lower.includes('lương')) categoryId = 'salary';
    else if (lower.includes('kinh doanh') || lower.includes('bán') || lower.includes('doanh thu')) categoryId = 'business';
    else if (lower.includes('thưởng') || lower.includes('hoa hồng')) categoryId = 'bonus';
    else if (lower.includes('đầu tư') || lower.includes('chứng khoán') || lower.includes('cổ tức')) categoryId = 'investment';
    else if (lower.includes('lãi') || lower.includes('tiết kiệm')) categoryId = 'saving_interest';
    else categoryId = 'other_income';
  } else {
    if (
      lower.includes('rau') ||
      lower.includes('thịt') ||
      lower.includes('cơm') ||
      lower.includes('phở') ||
      lower.includes('ăn') ||
      lower.includes('uống') ||
      lower.includes('cà phê') ||
      lower.includes('coffee') ||
      lower.includes('trà sữa') ||
      lower.includes('bánh mì') ||
      lower.includes('chợ') ||
      lower.includes('nhà hàng')
    ) {
      categoryId = 'food';
    } else if (
      lower.includes('grab') ||
      lower.includes('be') ||
      lower.includes('taxi') ||
      lower.includes('xăng') ||
      lower.includes('xe') ||
      lower.includes('vé máy bay') ||
      lower.includes('gửi xe') ||
      lower.includes('di chuyển')
    ) {
      categoryId = 'transport';
    } else if (
      lower.includes('siêu thị') ||
      lower.includes('winmart') ||
      lower.includes('mua sắm') ||
      lower.includes('shopee') ||
      lower.includes('lazada') ||
      lower.includes('quần áo') ||
      lower.includes('giày') ||
      lower.includes('túi')
    ) {
      categoryId = 'shopping';
    } else if (
      lower.includes('điện') ||
      lower.includes('nước') ||
      lower.includes('hóa đơn') ||
      lower.includes('internet') ||
      lower.includes('wifi') ||
      lower.includes('tiền nhà') ||
      lower.includes('phí quản lý')
    ) {
      categoryId = 'bills';
    } else if (
      lower.includes('phim') ||
      lower.includes('game') ||
      lower.includes('quà') ||
      lower.includes('sinh nhật') ||
      lower.includes('karaoke') ||
      lower.includes('giải trí')
    ) {
      categoryId = 'entertainment';
    } else if (
      lower.includes('thuốc') ||
      lower.includes('bệnh viện') ||
      lower.includes('khám') ||
      lower.includes('bác sĩ') ||
      lower.includes('sức khỏe')
    ) {
      categoryId = 'health';
    } else if (
      lower.includes('học') ||
      lower.includes('sách') ||
      lower.includes('khóa học') ||
      lower.includes('trường')
    ) {
      categoryId = 'education';
    } else if (
      lower.includes('du lịch') ||
      lower.includes('khách sạn') ||
      lower.includes('phú quốc') ||
      lower.includes('đà lạt')
    ) {
      categoryId = 'travel';
    } else if (
      lower.includes('nhà') ||
      lower.includes('sửa nhà') ||
      lower.includes('gia đình') ||
      lower.includes('nội thất')
    ) {
      categoryId = 'family';
    } else {
      categoryId = 'other';
    }
  }

  const categoryObj = categories.find((c) => c.id === categoryId);
  const categoryName = categoryObj ? categoryObj.name : 'Khác';

  // 4. Extract cleaned Title
  let title = text
    .replace(/\b(?:hết|khoảng|tầm|giá|mất|chi|thu|nhận)\b/gi, '')
    .replace(/\b(?:\d+(?:[.,]\d+)?\s*(?:k|nghìn|ngàn|triệu|tr|tỷ|củ|vnd|đồng|đ))\b/gi, '')
    .replace(/\b(?:hôm nay|hôm qua|sáng nay|chiều nay|tối nay|ngày mai)\b/gi, '')
    .replace(/[«"”„]/g, '')
    .trim();

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  } else {
    title = categoryName;
  }

  // 5. Date & Time
  const now = new Date();
  if (lower.includes('hôm qua')) {
    now.setDate(now.getDate() - 1);
  }

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hh}:${min}`;

  return {
    title,
    amount: extractedAmount,
    type,
    categoryId,
    categoryName,
    date: dateStr,
    time: timeStr,
    rawText: text,
    confidence: 0.95
  };
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}
