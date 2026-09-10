import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Eye, 
  Printer, 
  RefreshCw, 
  Check, 
  Layers, 
  DollarSign, 
  ShieldCheck 
} from 'lucide-react';
import { Property } from '../types/property';
import { Receipt } from '../types/receipt';
import { Payment } from '../types/payment';
import { Expense } from '../types/expense';
import { receiptApi } from '../api/receiptApi';
import { paymentApi } from '../api/paymentApi';
import { expenseApi } from '../api/expenseApi';
import { ReceiptModal } from '../components/ReceiptModal';

export interface SystemTransactionItem {
  id: string; // unique key
  date: string;
  type: 'Income' | 'Expense' | 'Checkout' | 'Deposit';
  category: string; // e.g. 'Rental Payment', 'Checkout Settlement', 'Maintenance Expense'
  propertyName: string;
  propertyCode: string;
  guestOrVendor: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  receiptObj?: Receipt;
  paymentObj?: Payment;
  expenseObj?: Expense;
}

interface SystemTransactionsPageProps {
  properties: Property[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const SystemTransactionsPage: React.FC<SystemTransactionsPageProps> = ({
  properties,
  onRefresh,
  isRefreshing = false,
}) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [datePreset, setDatePreset] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Selected Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  const fetchAllSystemTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedReceipts, fetchedPayments, fetchedExpenses] = await Promise.all([
        receiptApi.getReceipts().catch(() => []),
        paymentApi.getPayments().catch(() => []),
        expenseApi.getExpenses().catch(() => []),
      ]);

      setReceipts(fetchedReceipts);
      setPayments(fetchedPayments);
      setExpenses(fetchedExpenses);
    } catch (err: any) {
      setError(err.message || 'Failed to load master system transactions history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSystemTransactions();
  }, []);

  const handleRefreshClick = async () => {
    if (onRefresh) onRefresh();
    await fetchAllSystemTransactions();
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 2500);
  };

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

  // Combine Receipts, Payments & Expenses into single unified System Transaction Items List
  const allTransactionItems = useMemo<SystemTransactionItem[]>(() => {
    const list: SystemTransactionItem[] = [];

    // 1. Add Receipts (Receipts & Checkout Settlements)
    receipts.forEach((r) => {
      const amt = (r.amount && r.amount > 0)
        ? r.amount
        : (r.totalRentalAmount || r.agreedRentalAmount || 0);

      const isCheckout = r.receiptType === 'Checkout' || r.receiptType === 'FinalSettlement' || r.paymentType?.includes('Checkout');
      const isDeposit = r.paymentType === 'Security Deposit' || r.receiptType === 'SecurityDeposit';

      list.push({
        id: `R-${r.receiptId}`,
        date: r.receiptDate || r.createdDate,
        type: isCheckout ? 'Checkout' : isDeposit ? 'Deposit' : 'Income',
        category: r.paymentType || r.receiptType || 'Receipt',
        propertyName: r.propertyName || 'Property Unit',
        propertyCode: r.propertyCode || 'P-01',
        guestOrVendor: r.guestCompanyName ? `${r.guestCompanyName} (${r.guestName})` : r.guestName || 'Guest',
        amount: amt,
        paymentMethod: r.paymentMethod || 'Cash',
        referenceNumber: r.referenceNumber || r.receiptNumber,
        notes: r.notes || r.purpose,
        receiptObj: r,
      });
    });

    // 2. Add Payments that might not have duplicate receipt entry
    payments.forEach((p) => {
      const hasMatchingReceipt = receipts.some(r => r.paymentId === p.paymentId);
      if (!hasMatchingReceipt) {
        const matchingProp = properties.find(pr => pr.propertyId === p.propertyId);
        list.push({
          id: `P-${p.paymentId}`,
          date: p.paymentDate || p.createdDate,
          type: p.paymentType === 'Security Deposit' ? 'Deposit' : 'Income',
          category: p.paymentType || 'Rental Payment',
          propertyName: p.propertyName || matchingProp?.propertyName || 'Property Unit',
          propertyCode: matchingProp?.propertyCode || `P-${p.propertyId}`,
          guestOrVendor: p.guestName || 'Guest',
          amount: p.amount,
          paymentMethod: p.paymentMethod || 'Cash',
          referenceNumber: p.referenceNumber,
          notes: p.notes || undefined,
          paymentObj: p,
        });
      }
    });

    // 3. Add Expenses (Outflows)
    expenses.forEach((e) => {
      const matchingProp = properties.find(pr => pr.propertyId === e.propertyId);
      list.push({
        id: `E-${e.expenseId}`,
        date: e.expenseDate || e.createdDate,
        type: 'Expense',
        category: `Expense: ${e.category}`,
        propertyName: e.propertyName || matchingProp?.propertyName || 'General Enterprise',
        propertyCode: matchingProp?.propertyCode || (e.propertyId ? `P-${e.propertyId}` : 'ALL'),
        guestOrVendor: e.vendorPayee || 'Vendor / Expense Payee',
        amount: e.amount,
        paymentMethod: 'Cash/Other',
        referenceNumber: e.receiptReference,
        notes: e.description,
        expenseObj: e,
      });
    });

    // Sort by Date Descending
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [receipts, payments, expenses]);

  // Filtered List
  const filteredTransactions = useMemo(() => {
    return allTransactionItems.filter((item) => {
      // Type Filter
      if (selectedType !== 'All') {
        if (selectedType === 'Income' && item.type !== 'Income' && item.type !== 'Checkout') return false;
        if (selectedType === 'Expense' && item.type !== 'Expense') return false;
        if (selectedType === 'Checkout' && item.type !== 'Checkout') return false;
        if (selectedType === 'Deposit' && item.type !== 'Deposit') return false;
      }

      // Property Filter
      if (selectedPropertyId !== 'All') {
        const prop = properties.find(p => p.propertyId === Number(selectedPropertyId));
        if (prop && item.propertyCode !== prop.propertyCode && item.propertyName !== prop.propertyName) return false;
      }

      // Method Filter
      if (selectedMethod !== 'All' && item.paymentMethod !== selectedMethod) return false;

      // Date Filter
      if (startDate && new Date(item.date) < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(item.date) > end) return false;
      }

      // Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.propertyName.toLowerCase().includes(q) ||
          item.propertyCode.toLowerCase().includes(q) ||
          item.guestOrVendor.toLowerCase().includes(q) ||
          item.paymentMethod.toLowerCase().includes(q) ||
          (item.referenceNumber && item.referenceNumber.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [allTransactionItems, selectedType, selectedPropertyId, selectedMethod, startDate, endDate, searchTerm, properties]);

  // Summary Metrics
  const totalIncomeCollected = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'Income' || t.type === 'Checkout')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpensesOutflow = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netBalance = totalIncomeCollected - totalExpensesOutflow;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleOpenReceiptForTransaction = (item: SystemTransactionItem) => {
    if (item.receiptObj) {
      setActiveReceipt(item.receiptObj);
      setIsReceiptModalOpen(true);
    } else {
      // Synthesize receipt object for viewing/printing
      const tempReceipt: Receipt = {
        receiptId: 999000,
        receiptNumber: item.referenceNumber || item.id,
        receiptType: item.type === 'Expense' ? 'Expense Vouch' : item.type === 'Checkout' ? 'Checkout' : 'Payment',
        receiptDate: item.date,
        paymentDate: item.date,
        amount: item.amount,
        guestName: item.guestOrVendor,
        propertyName: item.propertyName,
        propertyCode: item.propertyCode,
        paymentType: item.category,
        paymentMethod: item.paymentMethod,
        referenceNumber: item.referenceNumber,
        purpose: item.notes || `${item.category} for ${item.propertyName}`,
        issuedBy: 'JMP Rental Property',
        isVoided: false,
        createdDate: item.date
      };
      setActiveReceipt(tempReceipt);
      setIsReceiptModalOpen(true);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header & Refresh */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            <Layers style={{ color: 'var(--primary-color)' }} /> System Master Transactions & Audit Stream
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
            Complete audit trail of all receipts, rental payments, checkout settlements, and maintenance expenses across JMP Enterprises.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleRefreshClick}
          disabled={loading || isRefreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: justRefreshed ? '#dcfce7' : '#ffffff',
            color: justRefreshed ? '#15803d' : '#334155',
            borderColor: justRefreshed ? '#86efac' : '#cbd5e1',
            fontWeight: 700,
            padding: '8px 16px',
            borderRadius: '10px'
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
              <span>{loading || isRefreshing ? 'Refreshing...' : 'Refresh Audit Stream'}</span>
            </>
          )}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                Total Inflow Collected
              </span>
              <h2 className="stat-value" style={{ color: '#10b981', marginTop: '4px', fontSize: '1.5rem', fontWeight: 800 }}>
                ₱{totalIncomeCollected.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Payments & Checkout Settlements</span>
            </div>
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981', padding: '10px', borderRadius: '50%' }}>
              <ArrowUpRight size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                Total Operating Expenses
              </span>
              <h2 className="stat-value" style={{ color: '#ef4444', marginTop: '4px', fontSize: '1.5rem', fontWeight: 800 }}>
                ₱{totalExpensesOutflow.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Maintenance, Utilities, Supplies</span>
            </div>
            <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '50%' }}>
              <ArrowDownRight size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: `4px solid ${netBalance >= 0 ? '#3b82f6' : '#dc2626'}`, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                Net Stream Balance
              </span>
              <h2 className="stat-value" style={{ color: netBalance >= 0 ? '#1d4ed8' : '#dc2626', marginTop: '4px', fontSize: '1.5rem', fontWeight: 800 }}>
                ₱{netBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Inflow minus Outflow</span>
            </div>
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb', padding: '10px', borderRadius: '50%' }}>
              <DollarSign size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar Card */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '280px', flex: 1 }}>
            <div className="search-input-wrapper" style={{ width: '100%' }}>
              <Search size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search receipt #, guest/vendor, property, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Filter size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '170px', fontSize: '0.85rem' }}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All">All Transactions</option>
              <option value="Income">Payments (Income)</option>
              <option value="Checkout">Checkout Settlements</option>
              <option value="Expense">Expenses (Outflow)</option>
              <option value="Deposit">Security Deposits</option>
            </select>
          </div>

          {/* Property Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Building2 size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '170px', fontSize: '0.85rem' }}
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
            >
              <option value="All">All Properties</option>
              {properties.map((p) => (
                <option key={p.propertyId} value={p.propertyId}>
                  {p.propertyName} ({p.propertyCode})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <CreditCard size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '140px', fontSize: '0.85rem' }}
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="All">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Check">Check</option>
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Calendar size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '140px', fontSize: '0.85rem' }}
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
            >
              <option value="All">All Time</option>
              <option value="ThisMonth">This Month</option>
              <option value="LastMonth">Last Month</option>
              <option value="ThisYear">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Master Transaction Audit Table */}
      <div className="card" style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#2563eb' }} />
            <p style={{ fontWeight: 600 }}>Loading master transaction audit stream...</p>
          </div>
        ) : error ? (
          <div className="error-alert">{error}</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} />
            <h3>No Transactions Found</h3>
            <p>Try adjusting your search query, property filter, or date range.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Ref / Receipt #</th>
                  <th>Date</th>
                  <th>Property</th>
                  <th>Guest / Payee</th>
                  <th>Category / Purpose</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Type</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((item) => {
                  const isExpense = item.type === 'Expense';
                  const isCheckout = item.type === 'Checkout';

                  return (
                    <tr key={item.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        {item.referenceNumber || item.id}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(item.date)}</td>
                      <td>
                        <span className="property-badge">{item.propertyCode}</span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.propertyName}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.guestOrVendor}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: isExpense ? '#dc2626' : '#15803d', fontSize: '0.92rem' }}>
                        {isExpense ? '-' : '+'}₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isExpense ? '#fee2e2' : isCheckout ? '#fef3c7' : '#dcfce7',
                          color: isExpense ? '#b91c1c' : isCheckout ? '#b45309' : '#15803d'
                        }}>
                          {item.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-icon"
                          title="View / Print Receipt Document"
                          onClick={() => handleOpenReceiptForTransaction(item)}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px' }}
                        >
                          <Eye size={14} style={{ color: '#2563eb' }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Receipt Preview Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onReceiptUpdated={(updated) => setActiveReceipt(updated)}
      />
    </div>
  );
};
