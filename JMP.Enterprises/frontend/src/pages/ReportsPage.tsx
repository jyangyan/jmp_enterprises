import React, { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import { Property } from '../types/property';
import { 
  ReportFilter, 
  DashboardReportOverview, 
  ExecutiveReportSummary, 
  FinancialTransaction 
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
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTx, setSearchTx] = useState<string>('');

  const [overview, setOverview] = useState<DashboardReportOverview | null>(null);
  const [execReport, setExecReport] = useState<ExecutiveReportSummary | null>(null);
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
    } else if (preset === 'last_month') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
    } else if (preset === 'last_3_months') {
      const first = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
    } else if (preset === 'last_6_months') {
      const first = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
    } else if (preset === 'this_year') {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
    } else if (preset === 'last_year') {
      const first = new Date(now.getFullYear() - 1, 0, 1);
      const last = new Date(now.getFullYear() - 1, 11, 31);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
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
    } catch (err: any) {
      setError(err.message || 'Failed to load report analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId, startDate, endDate]);

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
              { id: 'last_year', label: 'Last Year' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
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

          {/* Date Range & Property Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
            </div>

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
