import React, { useState, useMemo } from 'react';
import { TrendingDown, Plus, Search, Filter, Trash2, Edit2, Building2, Tag, Calendar, RefreshCw, Check } from 'lucide-react';
import { Expense } from '../types/expense';
import { Property } from '../types/property';

interface ExpensesPageProps {
  expenses: Expense[];
  properties: Property[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  expenses,
  properties,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteExpense,
  onRefresh,
  isRefreshing = false,
}) => {
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRefreshClick = () => {
    if (onRefresh) {
      onRefresh();
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2500);
    }
  };
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Date Filter State
  const [datePreset, setDatePreset] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Property Filter
      if (selectedPropertyId !== 'All') {
        if (selectedPropertyId === 'General') {
          if (e.propertyId != null) return false;
        } else if (e.propertyId !== Number(selectedPropertyId)) {
          return false;
        }
      }
      // Category Filter
      if (selectedCategory !== 'All' && e.category !== selectedCategory) {
        return false;
      }
      // Date Filter
      if (startDate) {
        const eDate = e.expenseDate.split('T')[0];
        if (eDate < startDate) return false;
      }
      if (endDate) {
        const eDate = e.expenseDate.split('T')[0];
        if (eDate > endDate) return false;
      }
      // Search Term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesDesc = e.description.toLowerCase().includes(query);
        const matchesPayee = (e.vendorPayee || '').toLowerCase().includes(query);
        const matchesProp = (e.propertyName || '').toLowerCase().includes(query);
        const matchesRef = (e.receiptReference || '').toLowerCase().includes(query);
        if (!matchesDesc && !matchesPayee && !matchesProp && !matchesRef) return false;
      }

      return true;
    });
  }, [expenses, selectedPropertyId, selectedCategory, startDate, endDate, searchTerm]);

  // Key Metrics
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const topCategory = useMemo(() => {
    if (filteredExpenses.length === 0) return 'None';
    const catMap: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    let maxCat = 'None';
    let maxAmount = 0;
    Object.entries(catMap).forEach(([cat, amt]) => {
      if (amt > maxAmount) {
        maxAmount = amt;
        maxCat = cat;
      }
    });
    return maxCat;
  }, [filteredExpenses]);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingDown style={{ color: '#ef4444' }} /> Expense Management
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Log and audit property maintenance, utilities, cleaning, and operational expenses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onRefresh && (
            <button 
              className="btn btn-secondary" 
              onClick={handleRefreshClick} 
              disabled={isRefreshing}
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
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </>
              )}
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={onOpenCreateModal}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dc2626', borderColor: '#dc2626' }}
          >
            <Plus size={18} /> Log Expense
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Total Expenses</span>
              <h2 className="stat-value" style={{ color: '#ef4444', marginTop: '4px' }}>
                ₱{totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '50%' }}>
              <TrendingDown size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Logged Expense Items</span>
              <h2 className="stat-value" style={{ marginTop: '4px' }}>
                {filteredExpenses.length}
              </h2>
            </div>
            <div className="stat-icon" style={{ background: '#fffbe6', color: '#f59e0b', padding: '10px', borderRadius: '50%' }}>
              <Tag size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Largest Expense Category</span>
              <h2 className="stat-value" style={{ fontSize: '1.25rem', marginTop: '4px' }}>
                {topCategory}
              </h2>
            </div>
            <div className="stat-icon" style={{ background: '#eef2ff', color: '#6366f1', padding: '10px', borderRadius: '50%' }}>
              <Building2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Row 1: Search & Dropdown Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
            {/* Search Box */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by description, vendor, property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            {/* Property Filter */}
            <div>
              <select className="form-control" value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)}>
                <option value="All">All Properties</option>
                <option value="General">General / Overhead</option>
                {properties.map((p) => (
                  <option key={p.propertyId} value={p.propertyId}>
                    {p.propertyName} ({p.propertyCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select className="form-control" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Maintenance">Maintenance & Repair</option>
                <option value="Utilities">Utilities</option>
                <option value="Cleaning">Cleaning</option>
                <option value="HOA Fees">HOA Fees</option>
                <option value="Taxes">Taxes & Permits</option>
                <option value="Supplies">Supplies</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date Range Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} /> Date Range:
            </span>

            <select
              className="form-control"
              style={{ width: '150px', fontSize: '0.825rem', padding: '6px 10px' }}
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
                    Clear Date Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Property</th>
                <th>Category</th>
                <th>Description</th>
                <th>Vendor / Payee</th>
                <th>Receipt #</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No expenses logged matching your filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => (
                  <tr key={e.expenseId}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(e.expenseDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td>
                      <span className="property-badge" style={{ fontWeight: 600 }}>
                        {e.propertyName || 'General'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            e.category === 'Utilities'
                              ? '#fef3c7'
                              : e.category === 'Maintenance'
                              ? '#fee2e2'
                              : e.category === 'Cleaning'
                              ? '#e0e7ff'
                              : '#f3f4f6',
                          color:
                            e.category === 'Utilities'
                              ? '#92400e'
                              : e.category === 'Maintenance'
                              ? '#991b1b'
                              : e.category === 'Cleaning'
                              ? '#3730a3'
                              : '#374151',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {e.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{e.description}</td>
                    <td style={{ fontSize: '0.85rem' }}>{e.vendorPayee || '—'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {e.receiptReference || '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444', fontSize: '0.95rem' }}>
                      ₱{e.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          className="btn-icon"
                          title="Edit Expense"
                          onClick={() => onOpenEditModal(e)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          title="Delete Expense"
                          onClick={() => onDeleteExpense(e)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
