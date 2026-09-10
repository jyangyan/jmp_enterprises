import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  BarChart2, 
  Activity, 
  DollarSign, 
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
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
  title = "Monthly Financial & Profitability Trend",
  subtitle = "Combined multi-line comparison of Gross Revenue, Operating Expenses, and Net Profit",
  height = 360,
  currencyPrefix = "₱"
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'combined' | 'netProfit' | 'revenue' | 'expenses'>('combined');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  // Overall Totals
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = data.reduce((sum, d) => sum + d.netProfit, 0);
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Period over Period (Latest vs Previous)
  const latestPt = data[data.length - 1];
  const prevPt = data.length > 1 ? data[data.length - 2] : null;

  // Net Profit Change
  const profitChange = latestPt.netProfit - (prevPt ? prevPt.netProfit : 0);
  const profitPct = prevPt && prevPt.netProfit !== 0
    ? ((latestPt.netProfit - prevPt.netProfit) / Math.abs(prevPt.netProfit)) * 100
    : (latestPt.netProfit > 0 ? 100 : 0);

  // Revenue Change
  const revChange = latestPt.revenue - (prevPt ? prevPt.revenue : 0);
  const revPct = prevPt && prevPt.revenue !== 0
    ? ((latestPt.revenue - prevPt.revenue) / Math.abs(prevPt.revenue)) * 100
    : (latestPt.revenue > 0 ? 100 : 0);

  // Expenses Change
  const expChange = latestPt.expenses - (prevPt ? prevPt.expenses : 0);
  const expPct = prevPt && prevPt.expenses !== 0
    ? ((latestPt.expenses - prevPt.expenses) / Math.abs(prevPt.expenses)) * 100
    : (latestPt.expenses > 0 ? 100 : 0);

  const isUptrend = profitChange > 0;
  const isDowntrend = profitChange < 0;

  // Calculate dynamic Min and Max across active metrics
  let allRelevantValues: number[] = [];
  if (selectedMetric === 'combined') {
    allRelevantValues = data.flatMap(d => [d.revenue, d.expenses, d.netProfit]);
  } else {
    allRelevantValues = data.map(d => d[selectedMetric]);
  }

  const rawMax = Math.max(...allRelevantValues, 1000);
  const rawMin = Math.min(...allRelevantValues, 0);
  // Add 10% breathing room to chart top/bottom
  const maxVal = Math.ceil((rawMax * 1.1) / 500) * 500;
  const minVal = rawMin < 0 ? Math.floor((rawMin * 1.1) / 500) * 500 : 0;
  const range = maxVal - minVal || 1;

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = height;
  const paddingX = 64;
  const paddingTop = 40;
  const paddingBottom = 48;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
  };

  const getX = (index: number) => {
    return paddingX + (index / Math.max(data.length - 1, 1)) * chartWidth;
  };

  // Build series points
  const revenuePoints = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.revenue),
    val: d.revenue,
    data: d
  }));

  const expensePoints = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.expenses),
    val: d.expenses,
    data: d
  }));

  const profitPoints = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.netProfit),
    val: d.netProfit,
    data: d
  }));

  // Build SVG path strings
  const buildPath = (pts: { x: number; y: number }[]) => {
    return pts.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  };

  const revenuePathD = buildPath(revenuePoints);
  const expensePathD = buildPath(expensePoints);
  const profitPathD = buildPath(profitPoints);

  const zeroY = getY(0);

  // Colors
  const REVENUE_COLOR = '#10b981'; // Emerald
  const EXPENSE_COLOR = '#ef4444'; // Red
  const PROFIT_COLOR = '#2563eb';  // Royal Blue / Indigo

  // Active hover data point
  const activeHoverData = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', borderRadius: '16px', background: '#ffffff' }}>
      {/* Header Bar with Combined Overview & Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', color: '#2563eb', display: 'flex' }}>
              <BarChart2 size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Uptrend / Downtrend Real-Time Status Indicator Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '12px',
            background: isUptrend ? '#dcfce7' : isDowntrend ? '#fee2e2' : '#eff6ff',
            color: isUptrend ? '#15803d' : isDowntrend ? '#b91c1c' : '#1d4ed8',
            border: `1px solid ${isUptrend ? '#86efac' : isDowntrend ? '#fca5a5' : '#bfdbfe'}`,
            fontWeight: 800,
            fontSize: '0.88rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            {isUptrend ? (
              <>
                <TrendingUp size={18} />
                <span>PROFIT UPTREND: +{profitPct.toFixed(1)}% MoM</span>
              </>
            ) : isDowntrend ? (
              <>
                <TrendingDown size={18} />
                <span>PROFIT DOWNTREND: {profitPct.toFixed(1)}% MoM</span>
              </>
            ) : (
              <>
                <Minus size={18} />
                <span>STEADY (0.0%)</span>
              </>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#334155'
          }}>
            <span>Overall Margin:</span>
            <span style={{ color: overallMargin >= 0 ? '#15803d' : '#b91c1c', fontWeight: 800 }}>
              {overallMargin.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Combined All-in-One vs Individual Metric Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px', background: '#f8fafc', padding: '10px 16px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* COMBINED 3-IN-1 BUTTON */}
          <button
            onClick={() => setSelectedMetric('combined')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: selectedMetric === 'combined' ? '1px solid #1e293b' : '1px solid transparent',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: selectedMetric === 'combined' ? '#0f172a' : '#ffffff',
              color: selectedMetric === 'combined' ? '#ffffff' : '#334155',
              boxShadow: selectedMetric === 'combined' ? '0 2px 10px rgba(15,23,42,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Layers size={15} />
            <span>Combined Trend (All 3 Combined)</span>
          </button>

          {/* REVENUE BUTTON */}
          <button
            onClick={() => setSelectedMetric('revenue')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: selectedMetric === 'revenue' ? '1px solid #059669' : '1px solid transparent',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: selectedMetric === 'revenue' ? '#10b981' : '#ffffff',
              color: selectedMetric === 'revenue' ? '#ffffff' : '#64748b',
              boxShadow: selectedMetric === 'revenue' ? '0 2px 8px rgba(16,185,129,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedMetric === 'revenue' ? '#ffffff' : '#10b981' }} />
            <span>Revenue Only</span>
          </button>

          {/* EXPENSES BUTTON */}
          <button
            onClick={() => setSelectedMetric('expenses')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: selectedMetric === 'expenses' ? '1px solid #dc2626' : '1px solid transparent',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: selectedMetric === 'expenses' ? '#ef4444' : '#ffffff',
              color: selectedMetric === 'expenses' ? '#ffffff' : '#64748b',
              boxShadow: selectedMetric === 'expenses' ? '0 2px 8px rgba(239,68,68,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedMetric === 'expenses' ? '#ffffff' : '#ef4444' }} />
            <span>Expenses Only</span>
          </button>

          {/* NET PROFIT BUTTON */}
          <button
            onClick={() => setSelectedMetric('netProfit')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: selectedMetric === 'netProfit' ? '1px solid #1d4ed8' : '1px solid transparent',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: selectedMetric === 'netProfit' ? '#2563eb' : '#ffffff',
              color: selectedMetric === 'netProfit' ? '#ffffff' : '#64748b',
              boxShadow: selectedMetric === 'netProfit' ? '0 2px 8px rgba(37,99,235,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedMetric === 'netProfit' ? '#ffffff' : '#2563eb' }} />
            <span>Net Profit Only</span>
          </button>
        </div>

        {/* Legend Indicator Pills */}
        <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '4px', borderRadius: '2px', background: REVENUE_COLOR }} />
            <span>Revenue</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '4px', borderRadius: '2px', background: EXPENSE_COLOR }} />
            <span>Expenses</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '4px', borderRadius: '2px', background: PROFIT_COLOR }} />
            <span>Net Profit</span>
          </span>
        </div>
      </div>

      {/* SVG Interactive Multi-Line Trend Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: '650px', userSelect: 'none' }}>
          <defs>
            {/* Revenue Soft Gradient */}
            <linearGradient id="combinedRevenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={REVENUE_COLOR} stopOpacity="0.22" />
              <stop offset="100%" stopColor={REVENUE_COLOR} stopOpacity="0.0" />
            </linearGradient>

            {/* Profit Soft Gradient */}
            <linearGradient id="combinedProfitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PROFIT_COLOR} stopOpacity="0.18" />
              <stop offset="100%" stopColor={PROFIT_COLOR} stopOpacity="0.0" />
            </linearGradient>

            {/* Expenses Soft Gradient */}
            <linearGradient id="combinedExpenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity="0.20" />
              <stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-Axis Labels */}
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
                  x={paddingX - 10}
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

          {/* Optional Zero Break-Even Line if minVal < 0 */}
          {minVal < 0 && (
            <line
              x1={paddingX}
              y1={zeroY}
              x2={svgWidth - paddingX}
              y2={zeroY}
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          )}

          {/* Area Fills */}
          {selectedMetric === 'revenue' && (
            <path
              d={`${revenuePathD} L ${revenuePoints[revenuePoints.length - 1].x} ${getY(minVal)} L ${revenuePoints[0].x} ${getY(minVal)} Z`}
              fill="url(#combinedRevenueGrad)"
            />
          )}
          {selectedMetric === 'expenses' && (
            <path
              d={`${expensePathD} L ${expensePoints[expensePoints.length - 1].x} ${getY(minVal)} L ${expensePoints[0].x} ${getY(minVal)} Z`}
              fill="url(#combinedExpenseGrad)"
            />
          )}
          {selectedMetric === 'netProfit' && (
            <path
              d={`${profitPathD} L ${profitPoints[profitPoints.length - 1].x} ${getY(minVal)} L ${profitPoints[0].x} ${getY(minVal)} Z`}
              fill="url(#combinedProfitGrad)"
            />
          )}
          {selectedMetric === 'combined' && (
            <path
              d={`${revenuePathD} L ${revenuePoints[revenuePoints.length - 1].x} ${getY(minVal)} L ${revenuePoints[0].x} ${getY(minVal)} Z`}
              fill="url(#combinedRevenueGrad)"
              opacity="0.6"
            />
          )}

          {/* Trend Polylines */}
          {/* 1. REVENUE LINE (Emerald) */}
          {(selectedMetric === 'combined' || selectedMetric === 'revenue') && (
            <path
              d={revenuePathD}
              fill="none"
              stroke={REVENUE_COLOR}
              strokeWidth={selectedMetric === 'revenue' ? '4' : '3.5'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 2. EXPENSES LINE (Red) */}
          {(selectedMetric === 'combined' || selectedMetric === 'expenses') && (
            <path
              d={expensePathD}
              fill="none"
              stroke={EXPENSE_COLOR}
              strokeWidth={selectedMetric === 'expenses' ? '4' : '3'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={selectedMetric === 'combined' ? '6 4' : undefined}
            />
          )}

          {/* 3. NET PROFIT LINE (Royal Blue) */}
          {(selectedMetric === 'combined' || selectedMetric === 'netProfit') && (
            <path
              d={profitPathD}
              fill="none"
              stroke={PROFIT_COLOR}
              strokeWidth={selectedMetric === 'netProfit' ? '4' : '3.5'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Month Hover Slices & Vertical Guidance */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Vertical Guideline on Hover */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={svgHeight - paddingBottom}
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Transparent Hover Hitbox for easy touch/mouse hovering */}
                <rect
                  x={x - (chartWidth / Math.max(data.length, 1)) / 2}
                  y={paddingTop}
                  width={chartWidth / Math.max(data.length, 1)}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* 1. Revenue Point Circle */}
                {(selectedMetric === 'combined' || selectedMetric === 'revenue') && (
                  <circle
                    cx={x}
                    cy={revenuePoints[i].y}
                    r={isHovered ? 7 : 5}
                    fill="#ffffff"
                    stroke={REVENUE_COLOR}
                    strokeWidth={isHovered ? 3.5 : 2.5}
                  />
                )}

                {/* 2. Expense Point Circle */}
                {(selectedMetric === 'combined' || selectedMetric === 'expenses') && (
                  <circle
                    cx={x}
                    cy={expensePoints[i].y}
                    r={isHovered ? 7 : 4.5}
                    fill="#ffffff"
                    stroke={EXPENSE_COLOR}
                    strokeWidth={isHovered ? 3.5 : 2.5}
                  />
                )}

                {/* 3. Net Profit Point Circle */}
                {(selectedMetric === 'combined' || selectedMetric === 'netProfit') && (
                  <circle
                    cx={x}
                    cy={profitPoints[i].y}
                    r={isHovered ? 7 : 5}
                    fill="#ffffff"
                    stroke={PROFIT_COLOR}
                    strokeWidth={isHovered ? 3.5 : 2.5}
                  />
                )}

                {/* Month Label below X-axis */}
                <text
                  x={x}
                  y={svgHeight - paddingBottom + 22}
                  fill={isHovered ? '#0f172a' : '#64748b'}
                  fontSize="12"
                  fontWeight={isHovered ? '800' : '600'}
                  textAnchor="middle"
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Multi-Metric Floating Inspection Overlay */}
        {activeHoverData && hoveredIndex !== null && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: `${Math.min(Math.max((getX(hoveredIndex) / svgWidth) * 100, 15), 85)}%`,
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
            zIndex: 10,
            fontSize: '0.82rem',
            minWidth: '220px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc' }}>{activeHoverData.month}</span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: activeHoverData.netProfit >= 0 ? '#86efac' : '#fca5a5',
                background: 'rgba(255,255,255,0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {activeHoverData.revenue > 0 ? `${((activeHoverData.netProfit / activeHoverData.revenue) * 100).toFixed(1)}% Margin` : '0% Margin'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#86efac', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  Gross Revenue:
                </span>
                <span style={{ fontWeight: 800, color: '#ffffff' }}>{formatMoney(activeHoverData.revenue)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fca5a5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                  Operating Expenses:
                </span>
                <span style={{ fontWeight: 800, color: '#ffffff' }}>{formatMoney(activeHoverData.expenses)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
                <span style={{ color: '#93c5fd', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                  Net Profit:
                </span>
                <span style={{ fontWeight: 800, color: activeHoverData.netProfit >= 0 ? '#93c5fd' : '#f87171' }}>
                  {formatMoney(activeHoverData.netProfit)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Summary Cards & Narrative Insight Footer */}
      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {/* Total Revenue Box */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#15803d' }}>Total Revenue (Period)</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534', marginTop: '2px' }}>
              {formatMoney(totalRevenue)}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#15803d' }}>
              MoM: {revChange >= 0 ? '+' : ''}{formatMoney(revChange)} ({revPct >= 0 ? '+' : ''}{revPct.toFixed(1)}%)
            </span>
          </div>
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '8px', borderRadius: '50%' }}>
            <ArrowUpRight size={20} />
          </div>
        </div>

        {/* Total Expenses Box */}
        <div style={{ background: '#fef2f2', border: '1px solid #fecdd3', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#b91c1c' }}>Total Expenses (Period)</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991b1b', marginTop: '2px' }}>
              {formatMoney(totalExpenses)}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#b91c1c' }}>
              MoM: {expChange >= 0 ? '+' : ''}{formatMoney(expChange)} ({expPct >= 0 ? '+' : ''}{expPct.toFixed(1)}%)
            </span>
          </div>
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px', borderRadius: '50%' }}>
            <ArrowDownRight size={20} />
          </div>
        </div>

        {/* Total Net Profit Box */}
        <div style={{ background: totalProfit >= 0 ? '#eff6ff' : '#fff1f2', border: `1px solid ${totalProfit >= 0 ? '#bfdbfe' : '#fecdd3'}`, padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: totalProfit >= 0 ? '#1d4ed8' : '#be123c' }}>Total Net Profit (Period)</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: totalProfit >= 0 ? '#1e40af' : '#9f1239', marginTop: '2px' }}>
              {formatMoney(totalProfit)}
            </div>
            <span style={{ fontSize: '0.72rem', color: totalProfit >= 0 ? '#1d4ed8' : '#be123c' }}>
              MoM: {profitChange >= 0 ? '+' : ''}{formatMoney(profitChange)} ({profitPct >= 0 ? '+' : ''}{profitPct.toFixed(1)}%)
            </span>
          </div>
          <div style={{ background: totalProfit >= 0 ? '#dbeafe' : '#ffe4e6', color: totalProfit >= 0 ? '#1d4ed8' : '#be123c', padding: '8px', borderRadius: '50%' }}>
            <DollarSign size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
