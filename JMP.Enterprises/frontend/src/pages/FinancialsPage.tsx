import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Building2, Calendar, RefreshCw, PieChart, Layers, Check } from 'lucide-react';
import { FinancialSummary } from '../types/financial';
import { Property } from '../types/property';
import { financialApi } from '../api/financialApi';
import { TrendGraphChart, TrendDataPoint } from '../components/TrendGraphChart';

interface FinancialsPageProps {
  properties: Property[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const FinancialsPage: React.FC<FinancialsPageProps> = ({ properties, onRefresh, isRefreshing = false }) => {
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('All');

  // Date Filter State
  const [datePreset, setDatePreset] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Trend View Mode: 'Combined' | 'ByProperty'
  const [trendViewMode, setTrendViewMode] = useState<'Combined' | 'ByProperty'>('Combined');
  const [selectedTrendPropertyId, setSelectedTrendPropertyId] = useState<string>('All');

  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === 'ThisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'LastMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'ThisYear') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      const lastDay = new Date(now.getFullYear(), 11, 31);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'All') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleRefreshClick = async () => {
    if (onRefresh) onRefresh();
    await fetchFinancials();
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 2500);
  };

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      setError(null);
      const propId = selectedPropertyId !== 'All' ? Number(selectedPropertyId) : undefined;
      const sDate = startDate || undefined;
      const eDate = endDate || undefined;
      const data = await financialApi.getFinancialSummary(propId, sDate, eDate);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load financial profitability summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, [selectedPropertyId, startDate, endDate]);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 style={{ color: 'var(--primary-color)' }} /> Profitability & Financial Summary
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Real-time income vs expense reports and net profitability breakdown by property unit.
          </p>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={handleRefreshClick} 
          disabled={loading || isRefreshing}
          title="Refresh Financials" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            background: justRefreshed ? '#dcfce7' : '#ffffff',
            color: justRefreshed ? '#15803d' : '#334155',
            borderColor: justRefreshed ? '#86efac' : '#cbd5e1',
            fontWeight: 700
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
              <span>{loading || isRefreshing ? 'Refreshing...' : 'Refresh Financials'}</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          {/* Property Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Property Filter:</span>
            <select
              className="form-control"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              style={{ width: '220px' }}
            >
              <option value="All">All Properties Combined</option>
              {properties.map((p) => (
                <option key={p.propertyId} value={p.propertyId}>
                  {p.propertyName} ({p.propertyCode})
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} /> Date Filter:
            </span>

            <select
              className="form-control"
              style={{ width: '150px', fontSize: '0.85rem' }}
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
            >
              <option value="All">All Time</option>
              <option value="ThisMonth">This Month</option>
              <option value="LastMonth">Last Month</option>
              <option value="ThisYear">This Year</option>
              <option value="Custom">Custom Range</option>
            </select>

            {(datePreset === 'Custom' || startDate || endDate) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="date"
                  className="date-input-sm"
                  value={startDate}
                  onChange={(e) => {
                    setDatePreset('Custom');
                    setStartDate(e.target.value);
                  }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>to</span>
                <input
                  type="date"
                  className="date-input-sm"
                  value={endDate}
                  onChange={(e) => {
                    setDatePreset('Custom');
                    setEndDate(e.target.value);
                  }}
                />
                {(startDate || endDate) && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    onClick={() => handleDatePresetChange('All')}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Calculating profitability analytics...</p>
        </div>
      ) : summary ? (
        <>
          {/* Top KPI Metric Cards */}
          <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
            {/* Total Revenue */}
            <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="stat-label">Total Revenue</span>
                  <h2 className="stat-value" style={{ color: '#10b981', marginTop: '4px' }}>
                    ₱{summary.totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {summary.totalPaymentsCount} payments recorded
                  </span>
                </div>
                <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981', padding: '10px', borderRadius: '50%' }}>
                  <TrendingUp size={22} />
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="stat-label">Total Expenses</span>
                  <h2 className="stat-value" style={{ color: '#ef4444', marginTop: '4px' }}>
                    ₱{summary.totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {summary.totalExpensesCount} expense items
                  </span>
                </div>
                <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '50%' }}>
                  <TrendingDown size={22} />
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="stat-card" style={{ borderLeft: `4px solid ${summary.netProfit >= 0 ? '#10b981' : '#ef4444'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="stat-label">Net Profit</span>
                  <h2
                    className="stat-value"
                    style={{
                      color: summary.netProfit >= 0 ? '#10b981' : '#ef4444',
                      marginTop: '4px',
                    }}
                  >
                    ₱{summary.netProfit.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Revenue minus Expenses</span>
                </div>
                <div
                  className="stat-icon"
                  style={{
                    background: summary.netProfit >= 0 ? '#ecfdf5' : '#fef2f2',
                    color: summary.netProfit >= 0 ? '#10b981' : '#ef4444',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1 }}>₱</span>
                </div>
              </div>
            </div>

            {/* Profit Margin % */}
            <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="stat-label">Profit Margin</span>
                  <h2 className="stat-value" style={{ color: '#8b5cf6', marginTop: '4px' }}>
                    {summary.profitMarginPercentage}%
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Overall Return Rate</span>
                </div>
                <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '10px', borderRadius: '50%' }}>
                  <PieChart size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Profitability & Cashflow Trend Graph (Uptrend & Downtrend Detection) */}
          <TrendGraphChart
            data={summary.monthlyTrends.map((t) => ({
              month: t.monthYear,
              revenue: t.revenue,
              expenses: t.expenses,
              netProfit: t.netProfit,
            }))}
            title="Monthly Profitability & Income Trend"
            subtitle="Automated analysis of income growth, expense ratio, and net profitability trajectory"
          />

          {/* Property Profitability Cards (Lily, Lala, Pamae, Villa Sampaguita) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} style={{ color: 'var(--primary-color)' }} /> Per-Property Profitability Breakdown
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Comparing income vs expenses across individual units
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {summary.propertyBreakdowns.map((prop) => {
              const maxVal = Math.max(prop.revenue, prop.expenses, 1);
              const revPct = Math.min((prop.revenue / maxVal) * 100, 100);
              const expPct = Math.min((prop.expenses / maxVal) * 100, 100);

              return (
                <div className="card" key={prop.propertyId} style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{prop.propertyName}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Code: {prop.propertyCode}</span>
                    </div>
                    <span
                      style={{
                        background: prop.netProfit >= 0 ? '#ecfdf5' : '#fef2f2',
                        color: prop.netProfit >= 0 ? '#10b981' : '#ef4444',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {prop.profitMarginPercentage}% Margin
                    </span>
                  </div>

                  {/* Visual Bar Comparison */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      <span>Revenue vs Expense Ratio</span>
                    </div>
                    <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${revPct}%`, background: '#10b981' }} title={`Revenue: ₱${prop.revenue}`} />
                      <div style={{ width: `${expPct}%`, background: '#ef4444' }} title={`Expense: ₱${prop.expenses}`} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Revenue:</span>
                      <strong style={{ color: '#10b981' }}>₱{prop.revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Expenses:</span>
                      <strong style={{ color: '#ef4444' }}>₱{prop.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '8px',
                        marginTop: '4px',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Net Profit:</span>
                      <strong style={{ color: prop.netProfit >= 0 ? '#10b981' : '#ef4444', fontSize: '1.05rem' }}>
                        ₱{prop.netProfit.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Property Comparison Matrix Table */}
          <div className="card" style={{ padding: '20px', marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} /> Property Performance Comparison Table
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Property Name</th>
                    <th>Property Code</th>
                    <th style={{ textAlign: 'right' }}>Total Revenue</th>
                    <th style={{ textAlign: 'right' }}>Total Expenses</th>
                    <th style={{ textAlign: 'right' }}>Net Profit</th>
                    <th style={{ textAlign: 'right' }}>Profit Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.propertyBreakdowns.map((p) => (
                    <tr key={p.propertyId}>
                      <td style={{ fontWeight: 700 }}>{p.propertyName}</td>
                      <td>
                        <span className="property-badge">{p.propertyCode}</span>
                      </td>
                      <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                        ₱{p.revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
                        ₱{p.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: p.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                        ₱{p.netProfit.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: p.profitMarginPercentage >= 0 ? '#10b981' : '#ef4444' }}>
                        {p.profitMarginPercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense Category Breakdown & Monthly Trend History */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Category Breakdown Table */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={18} /> Expenses by Category
              </h3>

              {summary.expenseCategorySummaries.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No expenses logged for this period.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {summary.expenseCategorySummaries.map((cat) => (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span>
                          <strong>{cat.category}</strong> ({cat.expenseCount} items)
                        </span>
                        <span>
                          ₱{cat.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} ({cat.percentage}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${cat.percentage}%`,
                            background: '#ef4444',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Trend Table with Property Filter Toggle */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} /> Monthly Financial History
                </h3>

                {summary.propertyMonthlyTrends && summary.propertyMonthlyTrends.length > 0 && (
                  <select
                    className="form-control"
                    style={{ width: '160px', fontSize: '0.8rem', padding: '4px 8px' }}
                    value={selectedTrendPropertyId}
                    onChange={(e) => setSelectedTrendPropertyId(e.target.value)}
                  >
                    <option value="All">All Combined</option>
                    {properties.map((p) => (
                      <option key={p.propertyId} value={p.propertyId}>
                        {p.propertyName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <table className="data-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Month</th>
                    {selectedTrendPropertyId !== 'All' && <th>Property</th>}
                    <th style={{ textAlign: 'right' }}>Revenue</th>
                    <th style={{ textAlign: 'right' }}>Expenses</th>
                    <th style={{ textAlign: 'right' }}>Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTrendPropertyId === 'All'
                    ? summary.monthlyTrends.map((t) => (
                        <tr key={t.monthYear}>
                          <td style={{ fontWeight: 600 }}>{t.monthYear}</td>
                          <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                            ₱{t.revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
                            ₱{t.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: t.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                            ₱{t.netProfit.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    : (summary.propertyMonthlyTrends || [])
                        .filter((pt) => pt.propertyId === Number(selectedTrendPropertyId))
                        .map((pt, idx) => (
                          <tr key={`${pt.propertyId}-${pt.monthYear}-${idx}`}>
                            <td style={{ fontWeight: 600 }}>{pt.monthYear}</td>
                            <td>
                              <span className="property-badge">{pt.propertyName}</span>
                            </td>
                            <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                              ₱{pt.revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
                              ₱{pt.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: pt.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                              ₱{pt.netProfit.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
