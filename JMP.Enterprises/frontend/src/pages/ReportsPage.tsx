import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Calendar, 
  RefreshCw, 
  Printer, 
  ShieldCheck, 
  PieChart, 
  Layers, 
  DollarSign, 
  FileText, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Users,
  Check,
  GitCompare,
  CalendarDays,
  ArrowRight
} from 'lucide-react';
import { Property } from '../types/property';
import { 
  ReportFilter, 
  DashboardReportOverview, 
  ExecutiveReportSummary, 
  FinancialTransaction,
  MonthlyProfitability
} from '../types/reports';
import { reportsApi } from '../api/reportsApi';
import { ManagementReportPdfModal } from '../components/ManagementReportPdfModal';
import { TrendGraphChart, TrendDataPoint } from '../components/TrendGraphChart';

interface ReportsPageProps {
  properties: Property[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ properties, onRefresh, isRefreshing = false }) => {
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('All');
  const [presetRange, setPresetRange] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTx, setSearchTx] = useState<string>('');

  const [overview, setOverview] = useState<DashboardReportOverview | null>(null);
  const [execReport, setExecReport] = useState<ExecutiveReportSummary | null>(null);
  const [allMonthlyTrends, setAllMonthlyTrends] = useState<MonthlyProfitability[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'mom' | 'yoy' | 'side_by_side'>('mom');
  const [comparePeriodA, setComparePeriodA] = useState<string>('');
  const [comparePeriodB, setComparePeriodB] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const applyPreset = (preset: string) => {
    setPresetRange(preset);
    const now = new Date();

    if (preset === 'this_month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
      setSelectedYear(now.getFullYear().toString());
      setSelectedMonth(String(now.getMonth() + 1).padStart(2, '0'));
    } else if (preset === 'last_month') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      setSelectedYear(prevMonthDate.getFullYear().toString());
      setSelectedMonth(String(prevMonthDate.getMonth() + 1).padStart(2, '0'));
    } else if (preset === 'last_3_months') {
      const first = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
      setSelectedYear('All');
      setSelectedMonth('All');
    } else if (preset === 'last_6_months') {
      const first = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
      setSelectedYear('All');
      setSelectedMonth('All');
    } else if (preset === 'this_year') {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
      setSelectedYear(now.getFullYear().toString());
      setSelectedMonth('All');
    } else if (preset === 'last_year') {
      const first = new Date(now.getFullYear() - 1, 0, 1);
      const last = new Date(now.getFullYear() - 1, 11, 31);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
      setSelectedYear((now.getFullYear() - 1).toString());
      setSelectedMonth('All');
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      setSelectedYear('All');
      setSelectedMonth('All');
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (year === 'All') {
      if (selectedMonth === 'All') {
        setStartDate('');
        setEndDate('');
        setPresetRange('all');
      } else {
        const curY = new Date().getFullYear();
        const m = parseInt(selectedMonth, 10);
        const first = new Date(curY, m - 1, 1).toISOString().split('T')[0];
        const last = new Date(curY, m, 0).toISOString().split('T')[0];
        setStartDate(first);
        setEndDate(last);
        setPresetRange('custom');
      }
    } else {
      const y = parseInt(year, 10);
      if (selectedMonth === 'All') {
        setStartDate(`${y}-01-01`);
        setEndDate(`${y}-12-31`);
        setPresetRange('custom');
      } else {
        const m = parseInt(selectedMonth, 10);
        const first = new Date(y, m - 1, 1).toISOString().split('T')[0];
        const last = new Date(y, m, 0).toISOString().split('T')[0];
        setStartDate(first);
        setEndDate(last);
        setPresetRange('custom');
      }
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    const y = selectedYear !== 'All' ? parseInt(selectedYear, 10) : new Date().getFullYear();
    if (month === 'All') {
      if (selectedYear === 'All') {
        setStartDate('');
        setEndDate('');
        setPresetRange('all');
      } else {
        setStartDate(`${y}-01-01`);
        setEndDate(`${y}-12-31`);
        setPresetRange('custom');
      }
    } else {
      const m = parseInt(month, 10);
      const first = new Date(y, m - 1, 1).toISOString().split('T')[0];
      const last = new Date(y, m, 0).toISOString().split('T')[0];
      setStartDate(first);
      setEndDate(last);
      setPresetRange('custom');
    }
  };

  const handleRefreshClick = async () => {
    if (onRefresh) onRefresh();
    await loadData();
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 2500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filter: ReportFilter = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        propertyId: selectedPropertyId !== 'All' ? Number(selectedPropertyId) : undefined
      };

      const data = await reportsApi.getDashboardOverview(filter);
      setOverview(data);

      const execData = await reportsApi.getExecutiveReport(filter);
      setExecReport(execData);

      const fullTrends = await reportsApi.getMonthlyProfitability({
        propertyId: selectedPropertyId !== 'All' ? Number(selectedPropertyId) : undefined
      });
      setAllMonthlyTrends(fullTrends);
    } catch (err: any) {
      setError(err.message || 'Failed to load report analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId, startDate, endDate]);

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    set.add(new Date().getFullYear());
    allMonthlyTrends.forEach(t => {
      if (t.year) set.add(t.year);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [allMonthlyTrends]);

  const monthsList = [
    { value: 'All', label: 'All Months' },
    { value: '01', label: '01 - January' },
    { value: '02', label: '02 - February' },
    { value: '03', label: '03 - March' },
    { value: '04', label: '04 - April' },
    { value: '05', label: '05 - May' },
    { value: '06', label: '06 - June' },
    { value: '07', label: '07 - July' },
    { value: '08', label: '08 - August' },
    { value: '09', label: '09 - September' },
    { value: '10', label: '10 - October' },
    { value: '11', label: '11 - November' },
    { value: '12', label: '12 - December' },
  ];

  // Group and compute Month-over-Month (MoM) metrics
  const aggregatedMonthly = useMemo(() => {
    const map = new Map<string, { year: number; month: number; yearMonth: string; revenue: number; expenses: number; netProfit: number }>();
    allMonthlyTrends.forEach(t => {
      const key = t.yearMonth;
      const existing = map.get(key);
      if (existing) {
        existing.revenue += t.revenue;
        existing.expenses += t.expenses;
        existing.netProfit += t.netProfit;
      } else {
        map.set(key, {
          year: t.year,
          month: t.month,
          yearMonth: t.yearMonth,
          revenue: t.revenue,
          expenses: t.expenses,
          netProfit: t.netProfit,
        });
      }
    });

    const list = Array.from(map.values()).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
    return list.map((curr, idx) => {
      const prev = list[idx - 1];
      const revenueGrowth = prev && prev.revenue > 0 ? ((curr.revenue - prev.revenue) / prev.revenue) * 100 : null;
      const expensesGrowth = prev && prev.expenses > 0 ? ((curr.expenses - prev.expenses) / prev.expenses) * 100 : null;
      const netProfitGrowth = prev && prev.netProfit !== 0 ? ((curr.netProfit - prev.netProfit) / Math.abs(prev.netProfit)) * 100 : null;
      const margin = curr.revenue > 0 ? (curr.netProfit / curr.revenue) * 100 : 0;
      return {
        ...curr,
        revenueGrowth,
        expensesGrowth,
        netProfitGrowth,
        margin: Math.round(margin * 100) / 100,
      };
    });
  }, [allMonthlyTrends]);

  // Group and compute Year-over-Year (YoY) metrics
  const aggregatedYearly = useMemo(() => {
    const map = new Map<number, { year: number; revenue: number; expenses: number; netProfit: number; monthsCount: number }>();
    aggregatedMonthly.forEach(m => {
      const existing = map.get(m.year);
      if (existing) {
        existing.revenue += m.revenue;
        existing.expenses += m.expenses;
        existing.netProfit += m.netProfit;
        existing.monthsCount += 1;
      } else {
        map.set(m.year, {
          year: m.year,
          revenue: m.revenue,
          expenses: m.expenses,
          netProfit: m.netProfit,
          monthsCount: 1,
        });
      }
    });

    const list = Array.from(map.values()).sort((a, b) => a.year - b.year);
    return list.map((curr, idx) => {
      const prev = list[idx - 1];
      const revenueGrowth = prev && prev.revenue > 0 ? ((curr.revenue - prev.revenue) / prev.revenue) * 100 : null;
      const expensesGrowth = prev && prev.expenses > 0 ? ((curr.expenses - prev.expenses) / prev.expenses) * 100 : null;
      const netProfitGrowth = prev && prev.netProfit !== 0 ? ((curr.netProfit - prev.netProfit) / Math.abs(prev.netProfit)) * 100 : null;
      const margin = curr.revenue > 0 ? (curr.netProfit / curr.revenue) * 100 : 0;
      return {
        ...curr,
        revenueGrowth,
        expensesGrowth,
        netProfitGrowth,
        margin: Math.round(margin * 100) / 100,
      };
    });
  }, [aggregatedMonthly]);

  useEffect(() => {
    if (aggregatedMonthly.length > 0) {
      if (!comparePeriodA) {
        setComparePeriodA(aggregatedMonthly[aggregatedMonthly.length - 1].yearMonth);
      }
      if (!comparePeriodB) {
        const prevIdx = Math.max(0, aggregatedMonthly.length - 2);
        setComparePeriodB(aggregatedMonthly[prevIdx].yearMonth);
      }
    }
  }, [aggregatedMonthly]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
  };

  const filteredTx = overview?.recentTransactions.filter(t => {
    if (!searchTx.trim()) return true;
    const s = searchTx.toLowerCase();
    return (
      t.transactionId.toLowerCase().includes(s) ||
      t.propertyName.toLowerCase().includes(s) ||
      t.category.toLowerCase().includes(s) ||
      (t.rentalType && t.rentalType.toLowerCase().includes(s))
    );
  }) || [];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header & Executive Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                Rental Analytics & Management Reporting
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                Cash-basis profitability, property yield analysis, and printable executive reports
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleRefreshClick}
            disabled={loading || isRefreshing}
            style={{
              background: justRefreshed ? '#dcfce7' : '#ffffff',
              border: `1px solid ${justRefreshed ? '#86efac' : '#cbd5e1'}`,
              color: justRefreshed ? '#15803d' : '#334155',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: loading || isRefreshing ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {justRefreshed ? (
              <>
                <Check size={16} />
                <span>Refreshed!</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} className={loading || isRefreshing ? 'animate-spin' : ''} />
                <span>{loading || isRefreshing ? 'Refreshing...' : 'Refresh Analytics'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            disabled={loading || !execReport}
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)'
            }}
          >
            <Printer size={18} />
            Print Executive Report (PDF)
          </button>
        </div>
      </div>

      {/* Filter Control Toolbar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Preset Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'last_3_months', label: 'Last 3 Months' },
              { id: 'last_6_months', label: 'Last 6 Months' },
              { id: 'this_year', label: 'This Year' },
              { id: 'last_year', label: 'Last Year' },
              { id: 'custom', label: 'Custom Range' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => {
                  if (p.id !== 'custom') applyPreset(p.id);
                  else setPresetRange('custom');
                }}
                style={{
                  background: presetRange === p.id ? '#0f172a' : '#f1f5f9',
                  color: presetRange === p.id ? '#ffffff' : '#475569',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: presetRange === p.id ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date Range, Year, Month & Property Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Year Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <CalendarDays size={16} style={{ color: '#64748b' }} />
              <select
                value={selectedYear}
                onChange={e => handleYearChange(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: '#f8fafc',
                  cursor: 'pointer'
                }}
                title="Filter by Year"
              >
                <option value="All">All Years</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr.toString()}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <select
                value={selectedMonth}
                onChange={e => handleMonthChange(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: '#f8fafc',
                  cursor: 'pointer'
                }}
                title="Filter by Month"
              >
                {monthsList.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Date Range Inputs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <Calendar size={16} style={{ color: '#64748b' }} />
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  setPresetRange('custom');
                  setStartDate(e.target.value);
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem'
                }}
              />
              <span style={{ color: '#94a3b8' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => {
                  setPresetRange('custom');
                  setEndDate(e.target.value);
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem'
                }}
              />
              {(startDate || endDate || selectedYear !== 'All' || selectedMonth !== 'All') && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  onClick={() => applyPreset('all')}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Property Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <Building2 size={16} style={{ color: '#64748b' }} />
              <select
                value={selectedPropertyId}
                onChange={e => setSelectedPropertyId(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Rental Properties</option>
                {properties.map(p => (
                  <option key={p.propertyId} value={p.propertyId}>
                    {p.propertyName} ({p.propertyCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && !overview ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', color: '#2563eb' }} />
          <p style={{ fontWeight: 600 }}>Calculating property performance & profitability metrics...</p>
        </div>
      ) : error ? (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '12px',
          padding: '20px',
          color: '#b91c1c',
          marginBottom: '24px'
        }}>
          <strong>Error Loading Reports:</strong> {error}
        </div>
      ) : overview ? (
        <>
          {/* Metric Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
            marginBottom: '24px'
          }}>
            {/* Total Revenue */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Rental Revenue
                </span>
                <div style={{ background: '#dcfce7', color: '#16a34a', padding: '6px', borderRadius: '8px' }}>
                  <ArrowUpRight size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                {formatCurrency(overview.totalRevenue)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                Cash-basis rental collections
              </div>
            </div>

            {/* Total Expenses */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Operating Expenses
                </span>
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                  <ArrowDownRight size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                {formatCurrency(overview.totalExpenses)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                Property & general maintenance
              </div>
            </div>

            {/* Net Profit / Loss */}
            <div style={{
              background: overview.profitLossStatus === 'LOSS' ? '#fff5f5' : '#f0fdf4',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: `1px solid ${overview.profitLossStatus === 'LOSS' ? '#fca5a5' : '#86efac'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Net Profit / (Loss)
                </span>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: overview.profitLossStatus === 'LOSS' ? '#fee2e2' : '#dcfce7',
                  color: overview.profitLossStatus === 'LOSS' ? '#b91c1c' : '#15803d'
                }}>
                  {overview.profitLossStatus}
                </span>
              </div>
              <div style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: overview.profitLossStatus === 'LOSS' ? '#dc2626' : '#16a34a'
              }}>
                {formatCurrency(overview.netProfit)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                Profit Margin: <strong>{overview.profitMargin}%</strong>
              </div>
            </div>

            {/* Occupancy Rate */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Occupancy Rate
                </span>
                <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '6px', borderRadius: '8px' }}>
                  <Calendar size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                {overview.overallOccupancyRate}%
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                {overview.totalOccupiedDays} Days Occupied ({overview.totalReservations} Bookings)
              </div>
            </div>

            {/* Security Deposits Held */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Security Deposits
                </span>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '6px', borderRadius: '8px' }}>
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                {formatCurrency(overview.securityDepositsHeld)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 600, marginTop: '6px' }}>
                Liability held in trust (Not revenue)
              </div>
            </div>
          </div>

          {/* Interactive Trend Analysis with Uptrend / Downtrend Detection */}
          <TrendGraphChart
            data={overview.monthlyTrends.map((t) => ({
              month: t.yearMonth,
              revenue: t.revenue,
              expenses: t.expenses,
              netProfit: t.netProfit,
            }))}
            title="Executive Monthly Financial & Profitability Trend"
            subtitle="Automated analysis of income growth, expense ratio, and net profitability trajectory"
          />

          {/* Executive Comparative Growth & Trend Analysis (MoM vs YoY vs Side-by-Side) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitCompare size={20} style={{ color: '#2563eb' }} />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    Comparative Growth & Performance Analysis
                  </h3>
                </div>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.83rem', color: '#64748b' }}>
                  Evaluate business performance across consecutive months (MoM), fiscal years (YoY), and custom period pairings
                </p>
              </div>

              {/* View Mode Toggle Buttons */}
              <div style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '10px',
                gap: '4px'
              }}>
                <button
                  onClick={() => setComparisonMode('mom')}
                  style={{
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: comparisonMode === 'mom' ? '#ffffff' : 'transparent',
                    color: comparisonMode === 'mom' ? '#0f172a' : '#64748b',
                    boxShadow: comparisonMode === 'mom' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📅 Month-over-Month (MoM)
                </button>
                <button
                  onClick={() => setComparisonMode('yoy')}
                  style={{
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: comparisonMode === 'yoy' ? '#ffffff' : 'transparent',
                    color: comparisonMode === 'yoy' ? '#0f172a' : '#64748b',
                    boxShadow: comparisonMode === 'yoy' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🏛️ Year-over-Year (YoY)
                </button>
                <button
                  onClick={() => setComparisonMode('side_by_side')}
                  style={{
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: comparisonMode === 'side_by_side' ? '#ffffff' : 'transparent',
                    color: comparisonMode === 'side_by_side' ? '#0f172a' : '#64748b',
                    boxShadow: comparisonMode === 'side_by_side' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ⚖️ Side-by-Side (A vs B)
                </button>
              </div>
            </div>

            {/* MODE 1: Month-over-Month (MoM) Table */}
            {comparisonMode === 'mom' && (
              <div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Month / Period</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Rental Revenue</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Operating Expenses</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Net Profit</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Net Margin</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>MoM Revenue Trajectory</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aggregatedMonthly.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                            No monthly transaction records found for this scope.
                          </td>
                        </tr>
                      ) : (
                        aggregatedMonthly.map((row, idx) => {
                          const isProfitable = row.netProfit >= 0;
                          return (
                            <tr
                              key={row.yearMonth}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                background: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                              }}
                            >
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                                {row.yearMonth}
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 600, color: '#16a34a' }}>
                                {formatCurrency(row.revenue)}
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 600, color: '#dc2626' }}>
                                {formatCurrency(row.expenses)}
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: isProfitable ? '#16a34a' : '#dc2626' }}>
                                {formatCurrency(row.netProfit)}
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: isProfitable ? '#047857' : '#b91c1c' }}>
                                {row.margin}%
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                {row.revenueGrowth === null ? (
                                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Base Period</span>
                                ) : (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: row.revenueGrowth >= 0 ? '#dcfce7' : '#fee2e2',
                                    color: row.revenueGrowth >= 0 ? '#15803d' : '#b91c1c'
                                  }}>
                                    {row.revenueGrowth >= 0 ? (
                                      <>
                                        <TrendingUp size={12} /> +{row.revenueGrowth.toFixed(1)}% MoM
                                      </>
                                    ) : (
                                      <>
                                        <TrendingDown size={12} /> {row.revenueGrowth.toFixed(1)}% MoM
                                      </>
                                    )}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  background: isProfitable ? '#dcfce7' : '#fee2e2',
                                  color: isProfitable ? '#15803d' : '#b91c1c'
                                }}>
                                  {isProfitable ? 'PROFITABLE' : 'LOSS'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODE 2: Year-over-Year (YoY) Annual Table */}
            {comparisonMode === 'yoy' && (
              <div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Calendar Year</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Annual Gross Revenue</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Annual Operating Expenses</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Annual Net Yield</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Annual Profit Margin</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>YoY Growth Rate</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>Fiscal Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aggregatedYearly.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                            No annual records available.
                          </td>
                        </tr>
                      ) : (
                        aggregatedYearly.map((yr, idx) => {
                          const isProfitable = yr.netProfit >= 0;
                          return (
                            <tr
                              key={yr.year}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                background: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                              }}
                            >
                              <td style={{ padding: '14px', fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                                Fiscal Year {yr.year}
                              </td>
                              <td style={{ padding: '14px', fontWeight: 700, color: '#16a34a' }}>
                                {formatCurrency(yr.revenue)}
                              </td>
                              <td style={{ padding: '14px', fontWeight: 600, color: '#dc2626' }}>
                                {formatCurrency(yr.expenses)}
                              </td>
                              <td style={{ padding: '14px', fontWeight: 800, color: isProfitable ? '#16a34a' : '#dc2626' }}>
                                {formatCurrency(yr.netProfit)}
                              </td>
                              <td style={{ padding: '14px', fontWeight: 700, color: isProfitable ? '#047857' : '#b91c1c' }}>
                                {yr.margin}%
                              </td>
                              <td style={{ padding: '14px', textAlign: 'center' }}>
                                {yr.revenueGrowth === null ? (
                                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Inaugural Year</span>
                                ) : (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: yr.revenueGrowth >= 0 ? '#dcfce7' : '#fee2e2',
                                    color: yr.revenueGrowth >= 0 ? '#15803d' : '#b91c1c'
                                  }}>
                                    {yr.revenueGrowth >= 0 ? (
                                      <>
                                        <TrendingUp size={13} /> +{yr.revenueGrowth.toFixed(1)}% YoY
                                      </>
                                    ) : (
                                      <>
                                        <TrendingDown size={13} /> {yr.revenueGrowth.toFixed(1)}% YoY
                                      </>
                                    )}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '14px', textAlign: 'center' }}>
                                <span style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  background: isProfitable ? '#dcfce7' : '#fee2e2',
                                  color: isProfitable ? '#15803d' : '#b91c1c'
                                }}>
                                  {isProfitable ? 'HIGH YIELD' : 'DEFICIT'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODE 3: Side-by-Side (A vs B) Comparison Matrix */}
            {comparisonMode === 'side_by_side' && (() => {
              const dataA = aggregatedMonthly.find(m => m.yearMonth === comparePeriodA) || {
                revenue: 0,
                expenses: 0,
                netProfit: 0,
                margin: 0
              };
              const dataB = aggregatedMonthly.find(m => m.yearMonth === comparePeriodB) || {
                revenue: 0,
                expenses: 0,
                netProfit: 0,
                margin: 0
              };

              const revDiff = dataA.revenue - dataB.revenue;
              const revPct = dataB.revenue > 0 ? (revDiff / dataB.revenue) * 100 : (dataA.revenue > 0 ? 100 : 0);

              const expDiff = dataA.expenses - dataB.expenses;
              const expPct = dataB.expenses > 0 ? (expDiff / dataB.expenses) * 100 : (dataA.expenses > 0 ? 100 : 0);

              const netDiff = dataA.netProfit - dataB.netProfit;
              const netPct = Math.abs(dataB.netProfit) > 0 ? (netDiff / Math.abs(dataB.netProfit)) * 100 : (dataA.netProfit !== 0 ? 100 : 0);

              const marginDiff = dataA.margin - dataB.margin;

              return (
                <div>
                  {/* Selectors Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    padding: '14px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Period A (Current):</span>
                      <select
                        value={comparePeriodA}
                        onChange={e => setComparePeriodA(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          background: '#ffffff',
                          color: '#0f172a'
                        }}
                      >
                        {aggregatedMonthly.map(m => (
                          <option key={m.yearMonth} value={m.yearMonth}>{m.yearMonth}</option>
                        ))}
                      </select>
                    </div>

                    <ArrowRight size={18} style={{ color: '#94a3b8' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Period B (Benchmark):</span>
                      <select
                        value={comparePeriodB}
                        onChange={e => setComparePeriodB(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          background: '#ffffff',
                          color: '#0f172a'
                        }}
                      >
                        {aggregatedMonthly.map(m => (
                          <option key={m.yearMonth} value={m.yearMonth}>{m.yearMonth}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 4 Cards Comparison Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    {/* Revenue Card */}
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Gross Revenue
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem' }}>
                        <span><strong>{comparePeriodA}:</strong> {formatCurrency(dataA.revenue)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                        <span><strong>{comparePeriodB}:</strong> {formatCurrency(dataB.revenue)}</span>
                      </div>
                      <div style={{
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: revDiff >= 0 ? '#15803d' : '#b91c1c'
                      }}>
                        Variance: {revDiff >= 0 ? '+' : ''}{formatCurrency(revDiff)} ({revDiff >= 0 ? '+' : ''}{revPct.toFixed(1)}%)
                      </div>
                    </div>

                    {/* Expenses Card */}
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Operating Expenses
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem' }}>
                        <span><strong>{comparePeriodA}:</strong> {formatCurrency(dataA.expenses)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                        <span><strong>{comparePeriodB}:</strong> {formatCurrency(dataB.expenses)}</span>
                      </div>
                      <div style={{
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: expDiff <= 0 ? '#15803d' : '#b91c1c'
                      }}>
                        Variance: {expDiff >= 0 ? '+' : ''}{formatCurrency(expDiff)} ({expDiff >= 0 ? '+' : ''}{expPct.toFixed(1)}%)
                      </div>
                    </div>

                    {/* Net Profit Card */}
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Net Profit Yield
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem' }}>
                        <span><strong>{comparePeriodA}:</strong> {formatCurrency(dataA.netProfit)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                        <span><strong>{comparePeriodB}:</strong> {formatCurrency(dataB.netProfit)}</span>
                      </div>
                      <div style={{
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: netDiff >= 0 ? '#15803d' : '#b91c1c'
                      }}>
                        Variance: {netDiff >= 0 ? '+' : ''}{formatCurrency(netDiff)} ({netDiff >= 0 ? '+' : ''}{netPct.toFixed(1)}%)
                      </div>
                    </div>

                    {/* Profit Margin Card */}
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Profit Margin %
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem' }}>
                        <span><strong>{comparePeriodA}:</strong> {dataA.margin}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                        <span><strong>{comparePeriodB}:</strong> {dataB.margin}%</span>
                      </div>
                      <div style={{
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: marginDiff >= 0 ? '#15803d' : '#b91c1c'
                      }}>
                        Difference: {marginDiff >= 0 ? '+' : ''}{marginDiff.toFixed(1)} percentage pts
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Section 1: Property Performance Comparison (Lily, Lala, Pamae) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Property Performance & Yield Comparison
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Financial and occupancy breakdown across Lily, Lala, and Pamae
                </p>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '6px' }}>
                Top Unit: {overview.topPerformingProperty}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {overview.propertyPerformances.map(prop => {
                const isPropLoss = prop.netProfit < 0;
                return (
                  <div key={prop.propertyId} style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '18px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          {prop.propertyName}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Code: {prop.propertyCode}</span>
                      </div>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isPropLoss ? '#fee2e2' : '#dcfce7',
                        color: isPropLoss ? '#b91c1c' : '#15803d'
                      }}>
                        {prop.profitMargin}% Margin
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Revenue</span>
                        <strong style={{ color: '#16a34a' }}>{formatCurrency(prop.revenue)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Expenses</span>
                        <strong style={{ color: '#dc2626' }}>{formatCurrency(prop.expenses)}</strong>
                      </div>
                    </div>

                    <div style={{
                      padding: '10px',
                      background: isPropLoss ? '#fef2f2' : '#f0fdf4',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isPropLoss ? '#b91c1c' : '#15803d' }}>
                        Net Yield:
                      </span>
                      <strong style={{ fontSize: '1rem', color: isPropLoss ? '#dc2626' : '#16a34a' }}>
                        {formatCurrency(prop.netProfit)}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                      <span>Bookings: <strong>{prop.reservationCount}</strong> ({prop.shortStayCount} Short / {prop.longStayCount} Long)</span>
                      <span><strong>{prop.occupiedDays}</strong> days occupied</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Rental Type & Expense Categorization */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Rental Model Comparison */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Rental Model Analysis (Short vs. Long Stay)
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748b' }}>
                Transient nightly vs long-term monthly lease performance
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {overview.rentalTypePerformances.map(rt => (
                  <div key={rt.rentalType} style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                        {rt.rentalType === 'ShortStay' ? 'Short-Stay (Transient)' : 'Long-Stay (Monthly Lease)'}
                      </strong>
                      <span style={{ fontSize: '0.78rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        {rt.reservationCount} Bookings
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Direct Revenue</span>
                        <strong style={{ color: '#16a34a' }}>{formatCurrency(rt.revenue)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Direct Expenses</span>
                        <strong style={{ color: '#dc2626' }}>{formatCurrency(rt.directExpenses)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Net Profit</span>
                        <strong style={{ color: '#0f172a' }}>{formatCurrency(rt.netProfitBeforeSharedExpenses)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Distribution */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Expense Distribution by Category
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748b' }}>
                Where operating capital is being spent
              </p>

              {overview.expenseBreakdown.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.88rem' }}>
                  No recorded expenses for selected period.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {overview.expenseBreakdown.map((exp, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{exp.category}</span>
                        <span><strong>{formatCurrency(exp.totalAmount)}</strong> ({exp.percentage}%)</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, exp.percentage)}%`,
                          background: '#ef4444',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Cash-Basis Financial Audit Log Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Cash-Basis Financial Audit Stream
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Normalized stream of all cash receipts and disbursements
                </p>
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Filter transactions..."
                  value={searchTx}
                  onChange={e => setSearchTx(e.target.value)}
                  style={{
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    width: '240px'
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tx ID</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Property</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Model</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                        No transactions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTx.map(t => {
                      const isInc = t.transactionType === 'Income';
                      return (
                        <tr key={t.transactionId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px', color: '#334155' }}>
                            {new Date(t.transactionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>
                            {t.transactionId}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>
                            {t.propertyName}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: isInc ? '#dcfce7' : '#fee2e2',
                              color: isInc ? '#15803d' : '#b91c1c'
                            }}>
                              {t.transactionType}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>
                            {t.category}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>
                            {t.rentalType || 'N/A'}
                          </td>
                          <td style={{
                            padding: '10px 12px',
                            textAlign: 'right',
                            fontWeight: 700,
                            color: isInc ? '#16a34a' : '#dc2626'
                          }}>
                            {isInc ? '+' : '-'}{formatCurrency(t.amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {/* Printable Executive Management PDF Modal */}
      <ManagementReportPdfModal
        report={execReport}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
};
