import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BankAccount, Category, FamilyMember, Transaction } from '../types';
import { formatVND } from './voiceParser';

export interface ReportExportData {
  month: number;
  year: number;
  transactions: Transaction[];
  categories: Category[];
  bankAccounts: BankAccount[];
  familyMembers: FamilyMember[];
  typeFilter?: 'all' | 'expense' | 'income';
  includeSummary?: boolean;
}

/**
 * Escapes a cell value for CSV format.
 */
function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports monthly financial data to CSV file with UTF-8 BOM for Excel support.
 */
export function exportMonthlyReportCSV(data: ReportExportData): { success: boolean; filename: string; count: number } {
  const { month, year, transactions, categories, bankAccounts, familyMembers, typeFilter = 'all' } = data;
  const monthStr = String(month).padStart(2, '0');
  const prefix = `${year}-${monthStr}`;

  // Filter transactions for the requested month
  const monthTransactions = transactions
    .filter((tx) => tx.date.startsWith(prefix))
    .filter((tx) => (typeFilter === 'all' ? true : tx.type === typeFilter))
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  // Compute metrics
  const totalIncome = transactions
    .filter((tx) => tx.date.startsWith(prefix) && tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.date.startsWith(prefix) && tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

  // Category breakdown
  const categoryExpenses: Record<string, number> = {};
  monthTransactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      categoryExpenses[tx.categoryId] = (categoryExpenses[tx.categoryId] || 0) + tx.amount;
    });

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const bankMap = new Map(bankAccounts.map((b) => [b.id, b.bankName]));
  const memberMap = new Map(familyMembers.map((m) => [m.id, m.name]));

  // Build CSV content
  const lines: string[] = [];

  // Header & Metadata
  lines.push('BÁO CÁO TÀI CHÍNH THÁNG - CHI TIÊU VIỆT');
  lines.push(`Thời gian báo cáo:,Tháng ${monthStr}/${year}`);
  lines.push(`Thời gian xuất:,${new Date().toLocaleString('vi-VN')}`);
  lines.push(`Bộ lọc giao dịch:,${typeFilter === 'all' ? 'Tất cả (Thu & Chi)' : typeFilter === 'expense' ? 'Chỉ Chi tiêu' : 'Chỉ Thu nhập'}`);
  lines.push('');

  // 1. Financial Summary Block
  lines.push('=== TỔNG QUAN TÀI CHÍNH ===');
  lines.push('Chỉ số,Số tiền (VNĐ),Ghi chú');
  lines.push(`Tổng thu nhập,${totalIncome},"${formatVND(totalIncome)}"`);
  lines.push(`Tổng chi tiêu,${totalExpense},"${formatVND(totalExpense)}"`);
  lines.push(`Tiết kiệm ròng,${netSavings},"${formatVND(netSavings)}"`);
  lines.push(`Tỷ lệ tiết kiệm,${savingsRate}%,Tỷ lệ tích lũy`);
  lines.push('');

  // 2. Category Breakdown Block
  lines.push('=== PHÂN BỔ CHI TIÊU THEO DANH MỤC ===');
  lines.push('Mã danh mục,Tên danh mục,Số tiền (VNĐ),Tỷ trọng (%)');
  Object.entries(categoryExpenses)
    .sort((a, b) => b[1] - a[1])
    .forEach(([catId, amount]) => {
      const catName = categoryMap.get(catId) || 'Khác';
      const pct = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0';
      lines.push(`${escapeCSV(catId)},${escapeCSV(catName)},${amount},${pct}%`);
    });
  lines.push('');

  // 3. Transactions Detail Table
  lines.push('=== BẢNG KÊ CHI TIẾT GIAO DỊCH ===');
  lines.push('STT,Mã GD,Ngày,Giờ,Phân loại,Danh mục,Tiêu đề giao dịch,Số tiền (VNĐ),Phương thức,Thành viên,Ghi chú');

  monthTransactions.forEach((tx, idx) => {
    const catName = categoryMap.get(tx.categoryId) || 'Khác';
    const bankName = tx.accountId ? bankMap.get(tx.accountId) || tx.paymentMethod || 'Tiền mặt' : tx.paymentMethod || 'Tiền mặt';
    const memberName = tx.memberId ? memberMap.get(tx.memberId) || 'Chính tôi' : 'Chính tôi';
    const typeLabel = tx.type === 'income' ? 'Thu nhập' : tx.type === 'expense' ? 'Chi tiêu' : 'Chuyển khoản';
    const signedAmount = tx.type === 'expense' ? -tx.amount : tx.amount;

    lines.push([
      idx + 1,
      escapeCSV(tx.id),
      escapeCSV(tx.date),
      escapeCSV(tx.time),
      escapeCSV(typeLabel),
      escapeCSV(catName),
      escapeCSV(tx.title),
      signedAmount,
      escapeCSV(bankName),
      escapeCSV(memberName),
      escapeCSV(tx.note || '')
    ].join(','));
  });

  // UTF-8 BOM (\uFEFF) ensures Excel handles Vietnamese accented characters properly
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `Bao_Cao_Tai_Chinh_Thang_${monthStr}_${year}.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, filename, count: monthTransactions.length };
}

/**
 * Exports a printable HTML element to PDF file with high resolution and multi-page support.
 */
export async function exportElementToPDF(
  element: HTMLElement,
  filename: string,
  onProgress?: (step: string) => void
): Promise<boolean> {
  try {
    onProgress?.('Đang kết xuất tài liệu PDF...');

    // High quality canvas render
    const canvas = await html2canvas(element, {
      scale: 2, // 2x for retina sharpness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    onProgress?.('Đang tạo các trang văn bản...');

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2; // 190mm
    const contentHeight = pageHeight - margin * 2; // 277mm

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Height of the content when scaled to contentWidth
    const scaledContentHeight = (canvasHeight * contentWidth) / canvasWidth;

    let heightLeft = scaledContentHeight;
    let position = margin; // mm

    // Add first page
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, scaledContentHeight);
    heightLeft -= contentHeight;

    // Add subsequent pages if content exceeds one A4 page
    while (heightLeft > 0) {
      position = position - contentHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, scaledContentHeight);
      heightLeft -= contentHeight;
    }

    onProgress?.('Đang hoàn tất tệp tải xuống...');
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Lỗi khi xuất PDF:', error);
    return false;
  }
}
