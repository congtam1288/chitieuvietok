import React from 'react';
import { formatVND } from '../../services/voiceParser';

interface DonutSlice {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface DonutChartProps {
  slices: DonutSlice[];
  centerLabel: string;
  centerValue: number;
  size?: number;
  strokeWidth?: number;
}

const DEFAULT_COLORS = ['#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6', '#94A3B8'];

export const DonutChart: React.FC<DonutChartProps> = ({
  slices,
  centerLabel,
  centerValue,
  size = 180,
  strokeWidth = 26
}) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const validSlices = slices.length > 0 ? slices : [
    { label: 'Ăn uống', value: 3250000, color: '#10B981', percentage: 31 },
    { label: 'Di chuyển', value: 1850000, color: '#3B82F6', percentage: 18 },
    { label: 'Mua sắm', value: 1650000, color: '#EC4899', percentage: 16 },
    { label: 'Hóa đơn', value: 1200000, color: '#F59E0B', percentage: 12 },
    { label: 'Giải trí', value: 850000, color: '#8B5CF6', percentage: 8 },
    { label: 'Khác', value: 1550000, color: '#CBD5E1', percentage: 15 }
  ];

  let accumulatedPercent = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Soft Glow Underlay */}
      <div
        className="absolute inset-2 rounded-full opacity-40 blur-md pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(59,130,246,0.1) 100%)'
        }}
      />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <defs>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Base Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth - 2}
          opacity={0.3}
        />

        {/* Slices */}
        {validSlices.map((slice, index) => {
          const sliceLength = (slice.percentage / 100) * circumference;
          const strokeDashoffset = -(accumulatedPercent / 100) * circumference;
          accumulatedPercent += slice.percentage;

          return (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={slice.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${Math.max(0, sliceLength - 2)} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              filter="url(#softShadow)"
            />
          );
        })}
      </svg>

      {/* Center Label & Total */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 pointer-events-none">
        <span className="text-[15px] font-bold text-slate-800 tracking-tight leading-tight">
          {formatVND(centerValue)}
        </span>
        <span className="text-[11px] font-medium text-slate-500 mt-0.5">
          {centerLabel}
        </span>
      </div>
    </div>
  );
};
