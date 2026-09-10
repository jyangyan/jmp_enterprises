import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  BarChart2, 
  Activity, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export interface TrendDataPoint {
  month: string; // e.g. 'Jan 2026' or '2026-01'
  revenue: number;
  expenses: number;
  netProfit: number;
  occupancyRate?: number;
}

interface TrendGraphChartProps {
  data: TrendDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  currencyPrefix?: string;
}

export const TrendGraphChart: React.FC<TrendGraphChartProps> = ({
  data,
  title = "Financial & Profitability Trend Analysis",
  subtitle = "Interactive month-over-month performance with automatic uptrend and downtrend detection",
  height = 340,
  currencyPrefix = "₱"
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'netProfit' | 'revenue' | 'expenses'>('netProfit');
  const [hoveredPoint, setHoveredPoint] = useState<TrendDataPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        <Activity size={36} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
        <h4 style={{ margin: 0, fontWeight: 700 }}>No Historical Trend Data Available</h4>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
          Log more reservations and expenses to calculate uptrend and downtrend graphs.
        </p>
      </div>
    );
  }

  // Formatting helpers
  const formatMoney = (val: number) => {
    return `${currencyPrefix}${val.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Extract metrics array based on selected tab
  const getMetricValue = (pt: TrendDataPoint, metric: 'netProfit' | 'revenue' | 'expenses') => {
    return pt[metric];
  };

  const values = data.map(d => getMetricValue(d, selectedMetric));
  const maxVal = Math.max(...values, 1000);
  const minVal = Math.min(...values, 0); // Allow negative for profit losses
  const range = maxVal - minVal || 1;

  // Period over Period (Latest vs Previous) analysis
  const latestPt = data[data.length - 1];
  const prevPt = data.length > 1 ? data[data.length - 2] : null;

  const currentVal = getMetricValue(latestPt, selectedMetric);
  const prevVal = prevPt ? getMetricValue(prevPt, selectedMetric) : 0;
  
  const popChange = currentVal - prevVal;
  const popPct = prevPt && prevVal !== 0 
    ? ((currentVal - prevVal) / Math.abs(prevVal)) * 100 
    : (currentVal > 0 ? 100 : 0);

  const isUptrend = popChange > 0;
  const isDowntrend = popChange < 0;

  // Peak month
  let peakIndex = 0;
  let peakVal = values[0];
  values.forEach((v, idx) => {
    if (v > peakVal) {
      peakVal = v;
      peakIndex = idx;
    }
  });

  // Calculate SVG Points
  const svgWidth = 800;
  const svgHeight = height;
  const paddingX = 50;
  const paddingTop = 40;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const val = getMetricValue(d, selectedMetric);
    // Y is inverted in SVG
    const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
    return { x, y, data: d, val };
  });

  // Path SVG polyline string
  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Fill area under path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;

  // Color scheme based on metric & trend
  const getThemeColors = () => {
    if (selectedMetric === 'expenses') {
      return {
        lineColor: '#ef4444',
        gradId: 'expenseGradient',
        badgeBg: '#fee2e2',
        badgeText: '#dc2626',
        badgeBorder: '#fca5a5'
      };
    }
    if (isUptrend) {
      return {
        lineColor: '#10b981',
        gradId: 'uptrendGradient',
        badgeBg: '#dcfce7',
        badgeText: '#15803d',
        badgeBorder: '#86efac'
      };
    }
    if (isDowntrend) {
      return {
        lineColor: '#f43f5e',
        gradId: 'downtrendGradient',
        badgeBg: '#ffe4e6',
        badgeText: '#be123c',
        badgeBorder: '#fecdd3'
      };
    }
    return {
      lineColor: '#3b82f6',
      gradId: 'neutralGradient',
      badgeBg: '#eff6ff',
      badgeText: '#1d4ed8',
      badgeBorder: '#bfdbfe'
    };
  };

  const theme = getThemeColors();

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', borderRadius: '16px' }}>
      {/* Header Bar with Uptrend / Downtrend Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '10px', color: '#0f172a', display: 'flex' }}>
              <BarChart2 size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.83rem', color: '#64748b' }}>{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Uptrend / Downtrend Real-Time Status Indicator Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '12px',
            background: theme.badgeBg,
            color: theme.badgeText,
            border: `1px solid ${theme.badgeBorder}`,
            fontWeight: 800,
            fontSize: '0.9rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            {isUptrend ? (
              <>
                <TrendingUp size={20} />
                <span>UPTREND: +{popPct.toFixed(1)}%</span>
              </>
            ) : isDowntrend ? (
              <>
                <TrendingDown size={20} />
                <span>DOWNTREND: {popPct.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <Minus size={20} />
                <span>STEADY (0.0%)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar & Metric Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSelectedMetric('netProfit')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: selectedMetric === 'netProfit' ? '#0f172a' : '#ffffff',
              color: selectedMetric === 'netProfit' ? '#ffffff' : '#64748b',
              boxShadow: selectedMetric === 'netProfit' ? '0 2px 8px rgba(15,23,42,0.2)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Net Profit Trend
          </button>
          <button
            onClick={() => setSelectedMetric('revenue')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: selectedMetric === 'revenue' ? '#10b981' : '#ffffff',
              color: selectedMetric === 'revenue' ? '#ffffff' : '#64748b',
              boxShadow: selectedMetric === 'revenue' ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Revenue Trend
          </button>
          <button
            onClick={() => setSelectedMetric('expenses')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: selectedMetric === 'expenses' ? '#ef4444' : '#ffffff',
              color: selectedMetric === 'expenses' ? '#ffffff' : '#64748b',
              boxShadow: selectedMetric === 'expenses' ? '0 2px 8px rgba(239,68,68,0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Expense Trend
          </button>
        </div>

        {/* Peak Performance Highlight */}
        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} style={{ color: '#eab308' }} />
          <span>Peak Month: <strong>{data[peakIndex]?.month}</strong> ({formatMoney(peakVal)})</span>
        </div>
      </div>

      {/* SVG Interactive Trend Line Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: '600px' }}>
          <defs>
            {/* Emerald Uptrend Gradient */}
            <linearGradient id="uptrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            {/* Rose Downtrend Gradient */}
            <linearGradient id="downtrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            {/* Expense Red Gradient */}
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
            {/* Neutral Blue Gradient */}
            <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * chartHeight;
            const val = maxVal - ratio * range;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="end"
                  fontWeight="600"
                >
                  {formatMoney(val)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill={`url(#${theme.gradId})`} />

          {/* Trend Polyline */}
          <path
            d={pathD}
            fill="none"
            stroke={theme.lineColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bars / Points / Markers */}
          {points.map((pt, i) => {
            const isSelected = hoveredPoint?.month === pt.data.month;
            const isPeak = i === peakIndex;

            return (
              <g 
                key={i} 
                onMouseEnter={() => setHoveredPoint(pt.data)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Vertical Indicator Line on Hover */}
                {isSelected && (
                  <line
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={svgHeight - paddingBottom}
                    stroke={theme.lineColor}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Point Outer Ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 8 : isPeak ? 6 : 5}
                  fill="#ffffff"
                  stroke={theme.lineColor}
                  strokeWidth={isSelected ? 4 : 3}
                />

                {/* Month Label */}
                <text
                  x={pt.x}
                  y={svgHeight - paddingBottom + 20}
                  fill={isSelected ? '#0f172a' : '#64748b'}
                  fontSize="12"
                  fontWeight={isSelected ? '800' : '600'}
                  textAnchor="middle"
                >
                  {pt.data.month}
                </text>

                {/* Value overlay label over points */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  fill={theme.lineColor}
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {formatMoney(pt.val)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Interpretation & Trend Insight Footer */}
      <div style={{
        marginTop: '20px',
        padding: '14px 18px',
        borderRadius: '12px',
        background: isUptrend ? '#f0fdf4' : isDowntrend ? '#fff1f2' : '#f8fafc',
        border: `1px solid ${isUptrend ? '#bbf7d0' : isDowntrend ? '#fecdd3' : '#e2e8f0'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isUptrend ? (
            <div style={{ background: '#10b981', color: '#ffffff', padding: '6px', borderRadius: '50%' }}>
              <TrendingUp size={18} />
            </div>
          ) : isDowntrend ? (
            <div style={{ background: '#ef4444', color: '#ffffff', padding: '6px', borderRadius: '50%' }}>
              <TrendingDown size={18} />
            </div>
          ) : (
            <div style={{ background: '#64748b', color: '#ffffff', padding: '6px', borderRadius: '50%' }}>
              <Minus size={18} />
            </div>
          )}
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
              {selectedMetric === 'netProfit' && (isUptrend ? 'Profit Uptrend Detected!' : isDowntrend ? 'Profit Downtrend Alert' : 'Stable Financial Performance')}
              {selectedMetric === 'revenue' && (isUptrend ? 'Revenue Expansion Uptrend!' : isDowntrend ? 'Revenue Contraction Warning' : 'Flat Revenue Trend')}
              {selectedMetric === 'expenses' && (isUptrend ? 'Expense Growth (Monitor Outflows)' : isDowntrend ? 'Expense Reduction (Positive Control)' : 'Stable Expense Rate')}
            </span>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#475569' }}>
              {selectedMetric === 'netProfit' && (
                isUptrend 
                  ? `Net profit increased by ${formatMoney(popChange)} (+${popPct.toFixed(1)}%) compared to the previous period.` 
                  : `Net profit dipped by ${formatMoney(Math.abs(popChange))} (${popPct.toFixed(1)}%) compared to the previous period.`
              )}
              {selectedMetric === 'revenue' && (
                isUptrend 
                  ? `Gross income expanded by ${formatMoney(popChange)} (+${popPct.toFixed(1)}%) due to higher unit bookings.` 
                  : `Gross income fell by ${formatMoney(Math.abs(popChange))} (${popPct.toFixed(1)}%). Check unit availability.`
              )}
              {selectedMetric === 'expenses' && (
                isUptrend 
                  ? `Operating costs increased by ${formatMoney(popChange)} (+${popPct.toFixed(1)}%). Review recent maintenance or utility bills.` 
                  : `Operating costs decreased by ${formatMoney(Math.abs(popChange))} (${popPct.toFixed(1)}%), boosting net margin.`
              )}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} /> Revenue
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} /> Expense
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0f172a' }} /> Net Profit
          </span>
        </div>
      </div>
    </div>
  );
};
