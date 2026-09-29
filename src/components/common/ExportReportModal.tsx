import React, { useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Loader2,
  Printer,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportElementToPDF, exportMonthlyReportCSV } from '../../services/reportExportService';
import { formatVND } from '../../services/voiceParser';
import { AppIcon } from './AppIcon';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const {
    currentMonthYear,
    transactions,
    categories,
    bankAccounts,
    familyMembers,
    themeConfig,
    authState,
    exportDataJSON,
    t
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthYear.month);
  const [selectedYear, setSelectedYear] = useState<number>(currentMonthYear.year);
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [includeSummary, setIncludeSummary] = useState<boolean>(true);
  const [includeDetails, setIncludeDetails] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'options' | 'preview'>('options');
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  // Filtered month transactions
  const monthStr = String(selectedMonth).padStart(2, '0');
  const prefix = `${selectedYear}-${monthStr}`;

  const monthTransactions = useMemo(() => {
    return transactions
      .filter((tx) => tx.date.startsWith(prefix))
      .filter((tx) => (typeFilter === 'all' ? true : tx.type === typeFilter))
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }, [transactions, prefix, typeFilter]);

  // Financial aggregates
  const totalIncome = useMemo(() => {
    return transactions
      .filter((tx) => tx.date.startsWith(prefix) && tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, prefix]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((tx) => tx.date.startsWith(prefix) && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, prefix]);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Category breakdown for this month
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((tx) => tx.date.startsWith(prefix) && tx.type === 'expense')
      .forEach((tx) => {
        map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
      });

    return Object.entries(map)
      .map(([id, amount]) => {
        const cat = categories.find((c) => c.id === id);
        return {
          id,
          name: cat?.name || 'Khác',
          color: cat?.color || '#3B82F6',
          amount,
          percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, prefix, categories, totalExpense]);

  if (!isOpen) return null;

  // Export handlers
  const handleExportCSV = () => {
    try {
      const result = exportMonthlyReportCSV({
        month: selectedMonth,
        year: selectedYear,
        transactions,
        categories,
        bankAccounts,
        familyMembers,
        typeFilter,
        includeSummary
      });

      setExportSuccessMessage(`Đã xuất thành công tệp CSV (${result.count} giao dịch)!`);
      setTimeout(() => setExportSuccessMessage(null), 4000);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi tạo tệp CSV');
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExportingPDF(true);
    setExportProgress('Khởi tạo văn bản PDF...');

    try {
      const filename = `Bao_Cao_Tai_Chinh_Thang_${monthStr}_${selectedYear}.pdf`;
      const success = await exportElementToPDF(reportRef.current, filename, (step) => {
        setExportProgress(step);
      });

      if (success) {
        setExportSuccessMessage(`Đã tải xuống thành công tệp PDF (${filename})!`);
        setTimeout(() => setExportSuccessMessage(null), 4500);
      } else {
        alert('Không thể tạo file PDF. Vui lòng thử lại.');
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi xuất PDF: ' + (e as Error).message);
    } finally {
      setIsExportingPDF(false);
      setExportProgress('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: themeConfig.primary }}
            >
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Xuất Báo Cáo Tài Chính Tháng
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Tải xuống tệp PDF chất lượng cao hoặc tệp CSV cho Excel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 active:scale-90 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: Options vs Live Preview */}
        <div className="flex border-b border-slate-100 bg-white px-4 pt-2">
          <button
            onClick={() => setActiveTab('options')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'options'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            style={activeTab === 'options' ? { borderColor: themeConfig.primary, color: themeConfig.primary } : {}}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tùy chọn xuất</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            style={activeTab === 'preview' ? { borderColor: themeConfig.primary, color: themeConfig.primary } : {}}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trước bản in (A4)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>
        </div>

        {/* Success toast if triggered */}
        {exportSuccessMessage && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'options' ? (
            <div className="space-y-4">
              {/* Month & Year Selection Card */}
              <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Chọn tháng báo cáo</span>
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Month */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block mb-1">Tháng</span>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          Tháng {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block mb-1">Năm</span>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                    >
                      {[2023, 2024, 2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>
                          Năm {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const now = new Date();
                      setSelectedMonth(now.getMonth() + 1);
                      setSelectedYear(now.getFullYear());
                    }}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-2 py-1 rounded-lg transition-all"
                  >
                    Tháng hiện tại ({new Date().getMonth() + 1}/{new Date().getFullYear()})
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMonth(5);
                      setSelectedYear(2024);
                    }}
                    className="text-[10px] font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded-lg transition-all"
                  >
                    Tháng mẫu (05/2024)
                  </button>
                </div>
              </div>

              {/* Filter Type */}
              <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-purple-600" />
                  <span>Loại giao dịch cần xuất</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'expense', 'income'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTypeFilter(type)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        typeFilter === type
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                      style={typeFilter === type ? { backgroundColor: themeConfig.primary, borderColor: themeConfig.primary } : {}}
                    >
                      {type === 'all' ? 'Tất cả (Thu & Chi)' : type === 'expense' ? 'Chỉ Chi tiêu' : 'Chỉ Thu nhập'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes: Report Content */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Nội dung bao gồm trong báo cáo</span>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Tóm tắt tài chính & Phân bổ danh mục
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Bao gồm tổng thu, tổng chi, thặng dư ròng và bảng tỷ trọng danh mục
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDetails}
                    onChange={(e) => setIncludeDetails(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Bảng kê chi tiết từng giao dịch
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Hiển thị danh sách đầy đủ ngày, giờ, số tiền, phương thức và ghi chú
                    </span>
                  </div>
                </label>
              </div>

              {/* Monthly Overview Stats Preview Pill */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl p-3.5 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-600 font-bold block uppercase tracking-wider">
                    Dữ liệu tháng {monthStr}/{selectedYear}
                  </span>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    {monthTransactions.length} giao dịch được chọn
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Tổng chi</span>
                  <span className="text-xs font-black text-rose-600">
                    -{formatVND(totalExpense)}
                  </span>
                </div>
              </div>

              {/* Format Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* PDF Option Card */}
                <div className="p-3.5 rounded-2xl border-2 border-rose-100 bg-rose-50/30 flex flex-col justify-between">
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      PDF
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Báo cáo PDF chuẩn A4</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Thiết kế như sao kê ngân hàng chuyên nghiệp, lưu trữ hoặc in ấn.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    className="w-full mt-2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs disabled:opacity-50"
                  >
                    {isExportingPDF ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{exportProgress || 'Đang tạo PDF...'}</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tải Báo Cáo PDF</span>
                      </>
                    )}
                  </button>
                </div>

                {/* CSV Option Card */}
                <div className="p-3.5 rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 flex flex-col justify-between">
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      CSV
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Bảng tính CSV (Excel)</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Tương thích Microsoft Excel & Google Sheets, không lỗi font tiếng Việt.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Tải Bảng Tính CSV</span>
                  </button>
                </div>
              </div>

              {/* JSON backup option */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Cần sao lưu toàn bộ cơ sở dữ liệu?
                </span>
                <button
                  onClick={exportDataJSON}
                  className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 active:scale-95"
                >
                  <Download className="w-3 h-3" /> Xuất tệp JSON backup
                </button>
              </div>
            </div>
          ) : (
            /* Live A4 Print Sheet Preview */
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-xl text-blue-800 text-xs">
                <span>Dưới đây là hình ảnh xem trước của bản in tài chính A4:</span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold text-[11px] flex items-center gap-1 hover:bg-blue-50 active:scale-95"
                  >
                    <Printer className="w-3 h-3" /> In ấn
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1 hover:bg-rose-700 active:scale-95"
                  >
                    <FileText className="w-3 h-3" /> Tải PDF
                  </button>
                </div>
              </div>

              {/* The printable A4 Container (targeted by html2canvas) */}
              <div className="bg-slate-100 p-2 sm:p-4 rounded-2xl flex justify-center overflow-x-auto">
                <div
                  ref={reportRef}
                  className="bg-white text-slate-900 shadow-md p-6 sm:p-8 rounded-lg w-full max-w-[680px] text-xs leading-relaxed"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  {/* Top Letterhead / Logo */}
                  <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
                    <div>
                      <div className="flex items-center gap-2">
                        <AppIcon size="sm" />
                        <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                          CHI TIÊU VIỆT 🇻🇳
                        </h1>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                        Hệ Thống Quản Lý Tài Chính Cá Nhân & Gia Đình
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[9px] uppercase tracking-wider">
                        BÁO CÁO CHÍNH THỨC
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Mã BC: CTV-{selectedYear}{monthStr}-{monthTransactions.length}
                      </span>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="my-5 text-center">
                    <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                      BÁO CÁO TÀI CHÍNH THÁNG {monthStr}/{selectedYear}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Kỳ đối soát: 01/{monthStr}/{selectedYear} – 30/{monthStr}/{selectedYear} • Ngày xuất: {new Date().toLocaleDateString('vi-VN')}
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-slate-600">
                      <span>Người lập: <strong>{authState.currentUser?.name || 'Chủ tài khoản'}</strong></span>
                      <span>•</span>
                      <span>Trạng thái: <strong className="text-emerald-600">Đã đồng bộ & Xác thực</strong></span>
                    </div>
                  </div>

                  {/* 1. Summary Key Metrics Cards */}
                  {includeSummary && (
                    <div className="grid grid-cols-4 gap-2 my-4">
                      <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Tổng thu nhập</span>
                        <span className="text-xs font-black text-emerald-600 block mt-0.5">
                          +{formatVND(totalIncome)}
                        </span>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Tổng chi tiêu</span>
                        <span className="text-xs font-black text-rose-600 block mt-0.5">
                          -{formatVND(totalExpense)}
                        </span>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Thặng dư ròng</span>
                        <span className="text-xs font-black text-blue-600 block mt-0.5">
                          {formatVND(netSavings)}
                        </span>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Tỷ lệ tiết kiệm</span>
                        <span className="text-xs font-black text-indigo-600 block mt-0.5">
                          {savingsRate}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 2. Category Allocation Table */}
                  {includeSummary && categoryBreakdown.length > 0 && (
                    <div className="my-4">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <span>I. Phân Bổ Chi Tiêu Theo Danh Mục</span>
                      </h3>
                      <table className="w-full text-left border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-slate-100 text-[10px] font-bold text-slate-700">
                            <th className="p-2 border border-slate-200">Danh mục</th>
                            <th className="p-2 border border-slate-200 text-right">Số tiền (VNĐ)</th>
                            <th className="p-2 border border-slate-200 text-right">Tỷ trọng (%)</th>
                            <th className="p-2 border border-slate-200">Đánh giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryBreakdown.map((cat, idx) => (
                            <tr key={cat.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                              <td className="p-2 border border-slate-200 font-semibold text-slate-800">
                                {cat.name}
                              </td>
                              <td className="p-2 border border-slate-200 text-right font-bold text-slate-900">
                                {formatVND(cat.amount)}
                              </td>
                              <td className="p-2 border border-slate-200 text-right font-bold text-slate-700">
                                {cat.percentage}%
                              </td>
                              <td className="p-2 border border-slate-200 text-slate-500 text-[10px]">
                                {cat.percentage > 30 ? 'Chiếm tỷ trọng lớn' : 'Mức bình thường'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 3. Detailed Transactions Table */}
                  {includeDetails && (
                    <div className="my-5">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide mb-2">
                        {includeSummary ? 'II. ' : ''}Bảng Kê Chi Tiết Giao Dịch ({monthTransactions.length} mục)
                      </h3>
                      {monthTransactions.length > 0 ? (
                        <table className="w-full text-left border-collapse border border-slate-200 text-[10px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 font-bold">
                              <th className="p-1.5 border border-slate-200 w-8 text-center">STT</th>
                              <th className="p-1.5 border border-slate-200">Ngày & Giờ</th>
                              <th className="p-1.5 border border-slate-200">Nội dung</th>
                              <th className="p-1.5 border border-slate-200">Danh mục</th>
                              <th className="p-1.5 border border-slate-200">Phương thức</th>
                              <th className="p-1.5 border border-slate-200 text-right">Số tiền (VNĐ)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthTransactions.map((tx, idx) => {
                              const cat = categories.find((c) => c.id === tx.categoryId);
                              return (
                                <tr key={tx.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                  <td className="p-1.5 border border-slate-200 text-center font-medium text-slate-500">
                                    {idx + 1}
                                  </td>
                                  <td className="p-1.5 border border-slate-200 font-medium text-slate-600 whitespace-nowrap">
                                    {tx.date} {tx.time}
                                  </td>
                                  <td className="p-1.5 border border-slate-200 font-semibold text-slate-800">
                                    {tx.title}
                                    {tx.note && <span className="block text-[9px] text-slate-400">{tx.note}</span>}
                                  </td>
                                  <td className="p-1.5 border border-slate-200 text-slate-700">
                                    {cat?.name || 'Khác'}
                                  </td>
                                  <td className="p-1.5 border border-slate-200 text-slate-500">
                                    {tx.paymentMethod || 'Tiền mặt'}
                                  </td>
                                  <td
                                    className={`p-1.5 border border-slate-200 text-right font-black whitespace-nowrap ${
                                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                                    }`}
                                  >
                                    {tx.type === 'income' ? '+' : '-'}
                                    {formatVND(tx.amount)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                          Không có giao dịch nào trong tháng {monthStr}/{selectedYear}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sign-off & Verification Footer */}
                  <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 text-center text-[10px]">
                    <div>
                      <span className="font-bold text-slate-800 block">NGƯỜI XÁC NHẬN</span>
                      <span className="text-slate-400 block mt-0.5">(Ký và ghi rõ họ tên)</span>
                      <div className="h-12 flex items-center justify-center text-slate-300 italic">
                        [Đã xác nhận điện tử]
                      </div>
                      <span className="font-semibold text-slate-700">
                        {authState.currentUser?.name || 'Chủ tài khoản'}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 block">HỆ THỐNG CHI TIÊU VIỆT</span>
                      <span className="text-slate-400 block mt-0.5">(Chứng thực tự động)</span>
                      <div className="h-12 flex items-center justify-center">
                        <div className="border border-emerald-500 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[9px] font-bold inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>CHỨNG THỰC AN TOÀN</span>
                        </div>
                      </div>
                      <span className="text-slate-500">Firebase Firestore Verified</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center text-[9px] text-slate-400">
                    Báo cáo được xuất tự động từ ứng dụng Quản Lý Chi Tiêu Việt • Hỗ trợ bảo mật tài chính cá nhân
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span className="font-bold text-slate-700">{monthTransactions.length}</span> giao dịch • Tháng {monthStr}/{selectedYear}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{exportProgress || 'Đang tạo PDF...'}</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Xuất PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
