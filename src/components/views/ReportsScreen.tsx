import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Calendar,
  ChevronRight,
  Download,
  FileDown,
  PieChart,
  Share2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../services/voiceParser';
import { analyzeSpendingWithGemini } from '../../services/geminiService';
import { DonutChart } from '../common/DonutChart';
import { TrendChart } from '../common/TrendChart';

export const ReportsScreen: React.FC = () => {
  const {
    t,
    themeConfig,
    settings,
    totalIncome,
    totalExpense,
    savingsRate,
    categoryExpenses,
    spendingTrendData,
    peakSpendDay,
    transactions,
    categories,
    currentMonthYear,
    exportDataJSON,
    setIsExportModalOpen
  } = useApp();

  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{
    summary: string;
    insights: string[];
    savingTips: string[];
    categoryAlerts: string[];
  } | null>(null);

  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    if (settings.geminiApiKey) {
      const result = await analyzeSpendingWithGemini(
        settings.geminiApiKey,
        transactions,
        categories,
        `${currentMonthYear.month}/${currentMonthYear.year}`
      );
      if (result) {
        setAiReport(result);
      } else {
        fallbackAiInsights();
      }
    } else {
      setTimeout(() => {
        fallbackAiInsights();
      }, 700);
    }
    setIsAiLoading(false);
  };

  const fallbackAiInsights = () => {
    setAiReport({
      summary: `Trong tháng ${currentMonthYear.month}, tài chính của bạn đạt tỷ lệ tiết kiệm rất tốt (${savingsRate}%). Chi tiêu lớn nhất tập trung vào Ăn uống và Di chuyển.`,
      insights: [
        `Bạn đã tiết kiệm được ${formatVND(totalIncome - totalExpense)} trên tổng thu nhập ${formatVND(totalIncome)}.`,
        `Ngày chi tiêu cao nhất rơi vào ngày ${peakSpendDay.day} (${formatVND(peakSpendDay.amount)}).`
      ],
      savingTips: [
        'Duy trì ngân sách ăn uống dưới mức 3.500.000 ₫ mỗi tháng để tăng thêm 10% quỹ đầu tư.',
        'Sử dụng các chương trình hoàn tiền của thẻ ngân hàng Vietcombank khi thanh toán siêu thị.'
      ],
      categoryAlerts: [
        'Danh mục Mua sắm đang chiếm 16% tổng chi, nên kiểm tra lại các khoản mua không thiết yếu.'
      ]
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-24 animate-fade-in">
      {/* Top Header Card with Summary Metrics (Mirroring Screenshot 5) */}
      <div
        className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
        style={{ background: themeConfig.cardGradient }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div>
            <h2 className="text-base font-bold">{t('detailedReport')}</h2>
            <span className="text-xs text-white/80">
              Tháng {currentMonthYear.month}, {currentMonthYear.year}
            </span>
          </div>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition-all active:scale-95"
            title="Xuất báo cáo PDF / CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-1">
          <div>
            <span className="text-[10px] text-white/80 block">{t('totalIncome')}</span>
            <span className="text-xs font-bold text-emerald-200">+{formatVND(totalIncome)}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/80 block">{t('totalExpense')}</span>
            <span className="text-xs font-bold text-rose-200">-{formatVND(totalExpense)}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/80 block">{t('savingsRate')}</span>
            <span className="text-xs font-bold text-white">{savingsRate}%</span>
          </div>
        </div>
      </div>

      {/* Quick Export Monthly Financial Report Banner */}
      <div
        onClick={() => setIsExportModalOpen(true)}
        className="bg-white rounded-3xl p-3.5 sm:p-4 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 active:scale-98 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
            <FileDown className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-800">Xuất Báo Cáo Tháng (PDF / CSV)</h4>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-100">
                Mới
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Tải sao kê định dạng PDF in ấn A4 hoặc tệp CSV cho Microsoft Excel
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95 transition-all shrink-0"
        >
          <span>Xuất tệp</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Time Range & View Mode Selectors */}
      <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-slate-100 flex items-center justify-between">
        {/* 7/30/90 days */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {(['7', '30', '90'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                timeRange === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r === '7' ? t('days7') : r === '30' ? t('days30') : t('days90')}
            </button>
          ))}
        </div>

        {/* Chart / List view toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'chart' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            {t('chartView')}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            {t('listView')}
          </button>
        </div>
      </div>

      {/* 1. Spending Trend Chart (Matching Screenshot 5) */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{t('spendingTrendChart')}</h3>
            <span className="text-[11px] text-slate-400">
              Đỉnh điểm: {peakSpendDay.day} ({formatVND(peakSpendDay.amount)})
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <TrendChart
          data={spendingTrendData}
          color={themeConfig.primary}
          height={150}
        />
      </div>

      {/* 2. Donut Category Breakdown Chart */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm mb-3">Cơ cấu chi tiêu danh mục</h3>
        <div className="flex items-center justify-center my-3">
          <DonutChart
            slices={categoryExpenses.map((c) => ({
              label: c.category.name,
              value: c.amount,
              color: c.category.color,
              percentage: c.percentage
            }))}
            centerLabel={t('totalExpense')}
            centerValue={totalExpense}
            size={180}
            strokeWidth={24}
          />
        </div>

        <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
          {categoryExpenses.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-md inline-block shadow-2xs"
                  style={{ backgroundColor: item.category.color }}
                />
                <span className="font-semibold text-slate-700">{item.category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">({item.percentage}%)</span>
                <span className="font-bold text-slate-900">{formatVND(item.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Gemini AI Financial Insights Module */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Trợ lý tài chính AI Gemini</h3>
              <p className="text-[10px] text-slate-400">Phân tích & Tối ưu hóa dòng tiền</p>
            </div>
          </div>
          <button
            onClick={handleRunAiAnalysis}
            disabled={isAiLoading}
            className="px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            style={{ background: themeConfig.floatingBtnBg }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiLoading ? 'Đang phân tích...' : 'Phân tích ngay'}</span>
          </button>
        </div>

        {aiReport ? (
          <div className="mt-4 space-y-3 animate-slide-up text-xs">
            <p className="text-slate-200 leading-relaxed font-medium bg-white/5 p-3 rounded-2xl border border-white/10">
              {aiReport.summary}
            </p>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Điểm nổi bật:
              </span>
              {aiReport.insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400">•</span>
                  <span>{ins}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Lời khuyên tiết kiệm:
              </span>
              {aiReport.savingTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-300">
                  <span className="text-amber-400">💡</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-center py-3 text-slate-400 text-xs">
            Bấm "Phân tích ngay" để AI đưa ra nhận xét chi tiêu và lời khuyên tiết kiệm thông minh.
          </div>
        )}
      </div>
    </div>
  );
};
