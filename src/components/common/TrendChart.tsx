import React, { useState } from 'react';
import { formatVND } from '../../services/voiceParser';

interface TrendPoint {
  day: string;
  amount: number;
  date: string;
}

interface TrendChartProps {
  data: TrendPoint[];
  color?: string;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  color = '#10B981',
  height = 140
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);

  // Fallback demo curve if empty
  const points = data.length > 0 ? data : [
    { day: '01', amount: 4500000, date: '2024-05-01' },
    { day: '05', amount: 6200000, date: '2024-05-05' },
    { day: '10', amount: 3800000, date: '2024-05-10' },
    { day: '15', amount: 10350000, date: '2024-05-15' },
    { day: '20', amount: 5100000, date: '2024-05-20' },
    { day: '25', amount: 7400000, date: '2024-05-25' },
    { day: '30', amount: 8900000, date: '2024-05-30' }
  ];

  const maxAmount = Math.max(...points.map((p) => p.amount), 15000000);
  const width = 320;
  const paddingX = 20;
  const paddingY = 20;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Generate SVG path coordinates
  const coords = points.map((p, i) => {
    const x = paddingX + (i / (points.length - 1)) * plotWidth;
    const y = height - paddingY - (p.amount / maxAmount) * plotHeight;
    return { x, y, point: p };
  });

  // Create smooth bezier curve path
  const linePath = coords.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;

  // Find peak
  const peakCoord = coords.reduce((max, curr) => (curr.point.amount > max.point.amount ? curr : max), coords[0]);

  return (
    <div className="w-full relative select-none">
      {/* Tooltip Overlay */}
      {hoveredPoint && (
        <div className="absolute top-0 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-100 text-xs flex items-center gap-1.5 z-10 animate-fade-in">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-semibold text-slate-700">{hoveredPoint.day}:</span>
          <span className="font-bold text-slate-900">{formatVND(hoveredPoint.amount)}</span>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={color} floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={paddingX}
            y1={height - paddingY - ratio * plotHeight}
            x2={width - paddingX}
            y2={height - paddingY - ratio * plotHeight}
            stroke="#E2E8F0"
            strokeDasharray="3 3"
            strokeWidth="0.8"
            opacity="0.6"
          />
        ))}

        {/* Gradient Area */}
        <path d={areaPath} fill="url(#trendGradient)" />

        {/* Smooth Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Peak Highlight Pill Banner */}
        <g transform={`translate(${peakCoord.x}, ${peakCoord.y - 12})`}>
          <circle cx="0" cy="12" r="5" fill="#FFFFFF" stroke={color} strokeWidth="3" />
          <rect
            x="-42"
            y="-18"
            width="84"
            height="20"
            rx="10"
            fill="#FFFFFF"
            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
          />
          <text
            x="0"
            y="-4"
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#1E293B"
          >
            {formatVND(peakCoord.point.amount)}
          </text>
        </g>

        {/* Interactive Point Dots */}
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="4"
            fill={c === peakCoord ? color : '#FFFFFF'}
            stroke={color}
            strokeWidth="2"
            className="cursor-pointer hover:r-6 transition-all"
            onMouseEnter={() => setHoveredPoint(c.point)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}

        {/* X Axis Labels */}
        {coords.map((c, i) => {
          if (i % 2 === 0 || i === coords.length - 1) {
            return (
              <text
                key={i}
                x={c.x}
                y={height - 4}
                textAnchor="middle"
                fontSize="9"
                fontWeight="500"
                fill="#94A3B8"
              >
                {c.point.day}
              </text>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};
