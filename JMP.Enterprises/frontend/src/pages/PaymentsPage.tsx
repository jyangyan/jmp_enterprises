import React, { useState, useMemo } from 'react';
import { CreditCard, Plus, Search, Filter, Trash2, Edit2, CheckCircle2, ArrowUpRight, Calendar, FileText, Printer, RefreshCw, Check } from 'lucide-react';
import { Payment } from '../types/payment';
import { Property } from '../types/property';
import { Receipt } from '../types/receipt';
import { receiptApi } from '../api/receiptApi';
import { ReceiptModal } from '../components/ReceiptModal';

interface PaymentsPageProps {
  payments: Payment[];
  properties: Property[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  payments,
  properties,
  onOpenCreateModal,
  onOpenEditModal,
  onDeletePayment,
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
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Date Filter State
  const [datePreset, setDatePreset] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [loadingReceiptId, setLoadingReceiptId] = useState<number | null>(null);

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

  const handleOpenReceipt = async (payment: Payment) => {
    setLoadingReceiptId(payment.paymentId);
    try {
      let receipt = await receiptApi.getPaymentReceipt(payment.paymentId);
      if (!receipt) {
        // Automatically generate acknowledgement receipt for this payment
        receipt = await receiptApi.createReceipt({
          paymentId: payment.paymentId,
          reservationId: payment.reservationId,
          receiptType: payment.paymentType === 'SecurityDeposit' ? 'SecurityDeposit' : 'Payment',
          amount: payment.amount,
          paymentType: payment.paymentType === 'SecurityDeposit' ? 'Security Deposit' : payment.paymentType === 'Rent' ? 'Rent Payment' : payment.paymentType,
          paymentMethod: payment.paymentMethod,
          referenceNumber: payment.referenceNumber,
        });
      }
      setSelectedReceipt(receipt);
      setIsReceiptModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to open receipt');
    } finally {
      setLoadingReceiptId(null);
    }
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (selectedPropertyId !== 'All' && p.propertyId !== Number(selectedPropertyId)) return false;
      if (selectedMethod !== 'All' && p.paymentMethod !== selectedMethod) return false;
      if (selectedType !== 'All' && p.paymentType !== selectedType) return false;

      if (startDate) {
        const pDate = p.paymentDate.split('T')[0];
        if (pDate < startDate) return false;
      }
      if (endDate) {
        const pDate = p.paymentDate.split('T')[0];
        if (pDate > endDate) return false;
      }

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesGuest = p.guestName.toLowerCase().includes(query);
        const matchesProp = p.propertyName.toLowerCase().includes(query);
        const matchesRef = (p.referenceNumber || '').toLowerCase().includes(query);
        const matchesNotes = (p.notes || '').toLowerCase().includes(query);
        if (!matchesGuest && !matchesProp && !matchesRef && !matchesNotes) return false;
      }

      return true;
    });
  }, [payments, selectedPropertyId, selectedMethod, selectedType, startDate, endDate, searchTerm]);

  // Key Metrics
  const totalCollected = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const avgPayment = useMemo(() => {
    return filteredPayments.length > 0 ? totalCollected / filteredPayments.length : 0;
  }, [filteredPayments, totalCollected]);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard style={{ color: 'var(--primary-color)' }} /> Rental Payments
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Track guest rental payments, security deposits, and transaction receipts.
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

          <button className="btn btn-primary" onClick={onOpenCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Record Payment
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Total Revenue Collected</span>
              <h2 className="stat-value" style={{ color: '#10b981', marginTop: '4px' }}>
                ₱{totalCollected.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981', padding: '10px', borderRadius: '50%' }}>
              <ArrowUpRight size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Total Transactions</span>
              <h2 className="stat-value" style={{ marginTop: '4px' }}>
                {filteredPayments.length}
              </h2>
            </div>
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6', padding: '10px', borderRadius: '50%' }}>
              <CreditCard size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Average Payment</span>
              <h2 className="stat-value" style={{ marginTop: '4px' }}>
                ₱{avgPayment.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1 }}>₱</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by guest, property, ref #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <div>
              <select className="form-control" value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)}>
                <option value="All">All Properties</option>
                {properties.map((p) => (
                  <option key={p.propertyId} value={p.propertyId}>
                    {p.propertyName} ({p.propertyCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select className="form-control" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Rent">Rent</option>
                <option value="Checkout Settlement">Checkout Settlement</option>
                <option value="SecurityDeposit">Security Deposit</option>
                <option value="ReservationFee">Reservation Fee</option>
                <option value="Utility">Utility</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <select className="form-control" value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)}>
                <option value="All">All Payment Methods</option>
                <option value="GCash">GCash</option>
                <option value="BankTransfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

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

      {/* Payments Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Property</th>
                <th>Guest / Renter</th>
                <th>Type</th>
                <th>Method</th>
                <th>Reference #</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Receipt</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No payments found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.paymentId}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(p.paymentDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td>
                      <span className="property-badge" style={{ fontWeight: 600 }}>
                        {p.propertyName}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.guestName}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            p.paymentType === 'Rent'
                              ? '#dbeafe'
                              : p.paymentType === 'Checkout Settlement'
                              ? '#fef3c7'
                              : p.paymentType === 'SecurityDeposit'
                              ? '#fef3c7'
                              : p.paymentType === 'ReservationFee'
                              ? '#e0e7ff'
                              : '#f3f4f6',
                          color:
                            p.paymentType === 'Rent'
                              ? '#1e40af'
                              : p.paymentType === 'Checkout Settlement'
                              ? '#b45309'
                              : p.paymentType === 'SecurityDeposit'
                              ? '#92400e'
                              : p.paymentType === 'ReservationFee'
                              ? '#3730a3'
                              : '#374151',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {p.paymentType}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{p.paymentMethod}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {p.referenceNumber || '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>
                      ₱{p.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleOpenReceipt(p)}
                        disabled={loadingReceiptId === p.paymentId}
                      >
                        <FileText size={13} style={{ color: 'var(--primary-color)' }} />
                        <span>{loadingReceiptId === p.paymentId ? 'Loading...' : 'Receipt'}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          className="btn-icon"
                          title="Edit Payment"
                          onClick={() => onOpenEditModal(p)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          title="Delete Payment"
                          onClick={() => onDeletePayment(p)}
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

      {/* Receipt Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onReceiptUpdated={(updated) => setSelectedReceipt(updated)}
      />
    </div>
  );
};
