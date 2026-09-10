import React, { useState, useEffect } from 'react';
import { 
  StatementOfAccount, 
  CreateStatementOfAccountDto, 
  RecordSoaPaymentDto 
} from '../types/statementOfAccount';
import { statementOfAccountApi } from '../api/statementOfAccountApi';
import { RentalAgreement } from '../types/rentalAgreement';
import { 
  X, 
  Printer, 
  Plus, 
  DollarSign, 
  Zap, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Building2,
  User,
  Clock,
  ArrowRight,
  Edit3
} from 'lucide-react';

interface StatementOfAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalAgreement: RentalAgreement;
  reservationId: number;
  existingSoaList?: StatementOfAccount[];
  onSoaListUpdated?: () => void;
}

export const StatementOfAccountModal: React.FC<StatementOfAccountModalProps> = ({
  isOpen,
  onClose,
  rentalAgreement,
  reservationId,
  existingSoaList = [],
  onSoaListUpdated
}) => {
  const [soas, setSoas] = useState<StatementOfAccount[]>(existingSoaList);
  const [selectedSoa, setSelectedSoa] = useState<StatementOfAccount | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isEditingSoa, setIsEditingSoa] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);

  // Form State for New / Edit SOA
  const [formData, setFormData] = useState<CreateStatementOfAccountDto>({
    reservationId: reservationId,
    rentalAgreementId: rentalAgreement.rentalAgreementId,
    billingPeriodStart: new Date().toISOString().split('T')[0],
    billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthlyRentAmount: rentalAgreement.monthlyRent || 0,
    previousElectricityReading: 0,
    presentElectricityReading: 0,
    electricityRatePerKwh: 15.00, // Default ₱15.00 / kWh
    waterAmount: 0,
    internetAmount: 0,
    additionalCharges: 0,
    additionalChargesDescription: '',
    previousBalance: 0,
    notes: ''
  });

  // Payment Form State
  const [paymentData, setPaymentData] = useState<RecordSoaPaymentDto>({
    paymentAmount: 0,
    paymentMethod: 'Cash',
    referenceNumber: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchSoaList();
    }
  }, [isOpen, rentalAgreement.rentalAgreementId]);

  const fetchSoaList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statementOfAccountApi.getByAgreementId(rentalAgreement.rentalAgreementId);
      setSoas(data);
      if (data.length > 0) {
        setSelectedSoa(data[0]);
      } else {
        // Auto fetch latest reading for property
        const lastReading = await statementOfAccountApi.getLatestReading(rentalAgreement.reservationId);
        setFormData(prev => ({
          ...prev,
          previousElectricityReading: lastReading,
          presentElectricityReading: lastReading
        }));
        setIsCreating(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Statements of Account');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Live Calculations for Form
  const formConsumption = Math.max(0, formData.presentElectricityReading - formData.previousElectricityReading);
  const formElectricityTotal = Math.round(formConsumption * formData.electricityRatePerKwh * 100) / 100;
  const formTotalAmountDue = Math.round((
    formData.monthlyRentAmount +
    formElectricityTotal +
    formData.waterAmount +
    formData.internetAmount +
    formData.additionalCharges +
    formData.previousBalance
  ) * 100) / 100;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEditingSoa && selectedSoa) {
        const updated = await statementOfAccountApi.update(selectedSoa.statementOfAccountId, {
          ...formData,
          status: selectedSoa.status
        });
        setSoas(soas.map(s => s.statementOfAccountId === updated.statementOfAccountId ? updated : s));
        setSelectedSoa(updated);
        setIsEditingSoa(false);
        setIsCreating(false);
      } else {
        const created = await statementOfAccountApi.create(formData);
        setSoas([created, ...soas]);
        setSelectedSoa(created);
        setIsCreating(false);
      }
      if (onSoaListUpdated) onSoaListUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to save Statement of Account');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSoa) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await statementOfAccountApi.recordPayment(selectedSoa.statementOfAccountId, paymentData);
      setSoas(soas.map(s => s.statementOfAccountId === updated.statementOfAccountId ? updated : s));
      setSelectedSoa(updated);
      setPaymentModalOpen(false);
      setPaymentData({ paymentAmount: 0, paymentMethod: 'Cash', referenceNumber: '', notes: '' });
      if (onSoaListUpdated) onSoaListUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const triggerIframePrint = () => {
    const content = document.getElementById('printable-soa-document');
    if (!content) {
      alert('SOA document is not ready to print.');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!frameDoc) return;

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Statement of Account - ${selectedSoa?.soaNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 18mm;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #111827;
              line-height: 1.5;
              margin: 0;
              padding: 20px;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            * {
              box-sizing: border-box;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 8px 12px;
              text-align: left;
              font-size: 0.9rem;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 700;
            }
            .text-right {
              text-align: right;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 300);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    }}>

      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1050px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        overflow: 'hidden'
      }}>

        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={22} style={{ color: '#2563eb' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Monthly Statements of Account (SOA)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Unit {rentalAgreement.propertyName} • Tenant: {rentalAgreement.tenantName}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isCreating && (
              <button
                onClick={() => {
                  const lastReading = soas.length > 0 ? soas[0].presentElectricityReading : 0;
                  setFormData(prev => ({
                    ...prev,
                    previousElectricityReading: lastReading,
                    presentElectricityReading: lastReading
                  }));
                  setIsCreating(true);
                }}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                Generate New SOA
              </button>
            )}

            {selectedSoa && !isCreating && (
              <button
                onClick={triggerIframePrint}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} />
                Print / Save PDF
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                padding: '6px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 24px', background: '#fef2f2', color: '#dc2626', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Modal Main Body: Sidebar selector + Main view */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* SOA History Sidebar */}
          <div style={{
            width: '260px',
            borderRight: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Billing History ({soas.length})
            </div>

            {soas.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No SOA generated yet. Click "Generate New SOA" to begin.
              </div>
            ) : (
              soas.map(s => (
                <button
                  key={s.statementOfAccountId}
                  onClick={() => {
                    setSelectedSoa(s);
                    setIsCreating(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    border: 'none',
                    borderBottom: '1px solid #e2e8f0',
                    background: selectedSoa?.statementOfAccountId === s.statementOfAccountId && !isCreating ? '#ffffff' : 'transparent',
                    borderLeft: selectedSoa?.statementOfAccountId === s.statementOfAccountId && !isCreating ? '4px solid #2563eb' : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                      {s.soaNumber}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: s.status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : s.status === 'PartiallyPaid' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: s.status === 'Paid' ? '#059669' : s.status === 'PartiallyPaid' ? '#2563eb' : '#d97706'
                    }}>
                      {s.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                    Period: {formatDate(s.billingPeriodStart)} - {formatDate(s.billingPeriodEnd)}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
                    {formatCurrency(s.totalAmountDue)}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f1f5f9' }}>

            {/* FORM MODE: Create New SOA */}
            {isCreating ? (
              <form onSubmit={handleCreateSubmit} style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Generate New Monthly Statement of Account
                  </h4>
                  {soas.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* Period & Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Billing Period Start
                    </label>
                    <input
                      type="date"
                      value={formData.billingPeriodStart}
                      onChange={(e) => setFormData({ ...formData, billingPeriodStart: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Billing Period End
                    </label>
                    <input
                      type="date"
                      value={formData.billingPeriodEnd}
                      onChange={(e) => setFormData({ ...formData, billingPeriodEnd: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                </div>

                {/* Electricity Submeter kWh Calculator Box */}
                <div style={{ background: '#f0f9ff', padding: '18px', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#0369a1', fontWeight: 700 }}>
                    <Zap size={18} />
                    Electricity Submeter kWh Calculator
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', marginBottom: '4px' }}>
                        Previous Reading (kWh)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.previousElectricityReading}
                        onChange={(e) => setFormData({ ...formData, previousElectricityReading: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #7dd3fc', fontSize: '0.85rem' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', marginBottom: '4px' }}>
                        Present Reading (kWh)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.presentElectricityReading}
                        onChange={(e) => setFormData({ ...formData, presentElectricityReading: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #7dd3fc', fontSize: '0.85rem' }}
                        required
                      />
                      {formData.presentElectricityReading <= formData.previousElectricityReading && (
                        <div style={{ fontSize: '0.68rem', color: '#d97706', marginTop: '4px', fontWeight: 600 }}>
                          💡 Enter current meter reading (&gt; {formData.previousElectricityReading} kWh)
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', marginBottom: '4px' }}>
                        Rate / kWh (₱)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.electricityRatePerKwh}
                        onChange={(e) => setFormData({ ...formData, electricityRatePerKwh: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #7dd3fc', fontSize: '0.85rem' }}
                        required
                      />
                    </div>

                    <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Consumption & Total</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>
                        {formConsumption} kWh = {formatCurrency(formElectricityTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Charges & Adjustments */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Monthly Rent Amount (₱)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthlyRentAmount}
                      onChange={(e) => setFormData({ ...formData, monthlyRentAmount: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Water Charge (₱)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.waterAmount}
                      onChange={(e) => setFormData({ ...formData, waterAmount: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Internet Charge (₱)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.internetAmount}
                      onChange={(e) => setFormData({ ...formData, internetAmount: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Previous Balance (₱)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.previousBalance}
                      onChange={(e) => setFormData({ ...formData, previousBalance: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Additional Charges (₱)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.additionalCharges}
                      onChange={(e) => setFormData({ ...formData, additionalCharges: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Add-on Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Parking fee"
                      value={formData.additionalChargesDescription || ''}
                      onChange={(e) => setFormData({ ...formData, additionalChargesDescription: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Total Summary Footer */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Computed Total Amount Due:</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#2563eb' }}>
                      {formatCurrency(formTotalAmountDue)}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      Generate & Save SOA
                    </button>
                  </div>
                </div>
              </form>
            ) : selectedSoa ? (

              /* VIEW MODE: Official Printable Statement of Account Slip */
              <div>
                
                {/* Action Bar Above Document */}
                <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Status:</span>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '4px 12px',
                      borderRadius: '6px',
                      background: selectedSoa.status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : selectedSoa.status === 'PartiallyPaid' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: selectedSoa.status === 'Paid' ? '#059669' : selectedSoa.status === 'PartiallyPaid' ? '#2563eb' : '#d97706'
                    }}>
                      {selectedSoa.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => {
                        if (!selectedSoa) return;
                        setFormData({
                          reservationId: selectedSoa.reservationId,
                          rentalAgreementId: selectedSoa.rentalAgreementId,
                          billingPeriodStart: selectedSoa.billingPeriodStart.split('T')[0],
                          billingPeriodEnd: selectedSoa.billingPeriodEnd.split('T')[0],
                          dueDate: selectedSoa.dueDate.split('T')[0],
                          monthlyRentAmount: selectedSoa.monthlyRentAmount,
                          previousElectricityReading: selectedSoa.previousElectricityReading,
                          presentElectricityReading: selectedSoa.presentElectricityReading,
                          electricityRatePerKwh: selectedSoa.electricityRatePerKwh,
                          waterAmount: selectedSoa.waterAmount,
                          internetAmount: selectedSoa.internetAmount,
                          additionalCharges: selectedSoa.additionalCharges,
                          additionalChargesDescription: selectedSoa.additionalChargesDescription || '',
                          previousBalance: selectedSoa.previousBalance,
                          notes: selectedSoa.notes || ''
                        });
                        setIsEditingSoa(true);
                        setIsCreating(true);
                      }}
                      style={{
                        background: '#ffffff',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit3 size={16} />
                      Edit Readings / SOA
                    </button>

                    {selectedSoa.status !== 'Paid' && (
                      <button
                        onClick={() => {
                          setPaymentData({
                            paymentAmount: selectedSoa.balanceRemaining,
                            paymentMethod: 'Cash',
                            referenceNumber: '',
                            notes: ''
                          });
                          setPaymentModalOpen(true);
                        }}
                        style={{
                          background: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <DollarSign size={16} />
                        Record Payment
                      </button>
                    )}
                  </div>
                </div>

                {/* Printable SOA Document Container */}
                <div id="printable-soa-document" style={{
                  background: '#ffffff',
                  padding: '40px',
                  fontFamily: "'Times New Roman', Times, serif",
                  color: '#111827',
                  maxWidth: '780px',
                  margin: '0 auto',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  border: '1px solid #cbd5e1'
                }}>

                  {/* Header */}
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '16px', marginBottom: '24px' }}>
                    <img
                      src="/logo.png"
                      alt="JMP Logo"
                      style={{ height: '60px', width: 'auto', objectFit: 'contain', margin: '0 auto 6px', display: 'block' }}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      JMP Rental Property
                    </h1>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#4b5563' }}>
                      Deo Homes Residences, Brgy. Salvacion, Ormoc City, Leyte
                    </p>
                  </div>

                  {/* Title & Ref */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, textTransform: 'uppercase', textDecoration: 'underline' }}>
                      STATEMENT OF ACCOUNT
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginTop: '12px', fontWeight: 600 }}>
                      <span>SOA No: <strong>{selectedSoa.soaNumber}</strong></span>
                      <span>Issue Date: <strong>{formatDate(selectedSoa.issueDate)}</strong></span>
                    </div>
                  </div>

                  {/* Tenant & Property Details Grid */}
                  <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div><strong>Tenant Name:</strong> {selectedSoa.tenantName} {selectedSoa.tenantCompanyName ? `(${selectedSoa.tenantCompanyName})` : ''}</div>
                      <div><strong>Property / Unit:</strong> {selectedSoa.propertyName}</div>
                      <div><strong>Billing Period:</strong> {formatDate(selectedSoa.billingPeriodStart)} to {formatDate(selectedSoa.billingPeriodEnd)}</div>
                      <div><strong>Payment Due Date:</strong> <span style={{ color: '#dc2626', fontWeight: 800 }}>{formatDate(selectedSoa.dueDate)}</span></div>
                    </div>
                  </div>

                  {/* Submeter Breakdown Detail Table */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      1. Electricity Submeter Consumption
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9' }}>
                          <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px' }}>Previous Reading</th>
                          <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px' }}>Present Reading</th>
                          <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px' }}>Total kWh Consumed</th>
                          <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px' }}>Rate / kWh</th>
                          <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right' }}>Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px' }}>{selectedSoa.previousElectricityReading} kWh</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px' }}>{selectedSoa.presentElectricityReading} kWh</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontWeight: 700 }}>{selectedSoa.electricityConsumptionKwh} kWh</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px' }}>{formatCurrency(selectedSoa.electricityRatePerKwh)}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(selectedSoa.electricityAmount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Charges Table */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      2. Statement Summary & Breakdown
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9' }}>
                          <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Description</th>
                          <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'right' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Monthly Rent</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(selectedSoa.monthlyRentAmount)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Electricity Submeter Charge ({selectedSoa.electricityConsumptionKwh} kWh @ {formatCurrency(selectedSoa.electricityRatePerKwh)}/kWh)</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(selectedSoa.electricityAmount)}</td>
                        </tr>
                        {selectedSoa.waterAmount > 0 && (
                          <tr>
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Water Utility Charge</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(selectedSoa.waterAmount)}</td>
                          </tr>
                        )}
                        {selectedSoa.internetAmount > 0 && (
                          <tr>
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Internet Service Charge</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(selectedSoa.internetAmount)}</td>
                          </tr>
                        )}
                        {selectedSoa.additionalCharges > 0 && (
                          <tr>
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>{selectedSoa.additionalChargesDescription || 'Additional Charges'}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(selectedSoa.additionalCharges)}</td>
                          </tr>
                        )}
                        {selectedSoa.previousBalance > 0 && (
                          <tr>
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Carried Forward Previous Unpaid Balance</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{formatCurrency(selectedSoa.previousBalance)}</td>
                          </tr>
                        )}
                        <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', fontSize: '0.95rem' }}>TOTAL AMOUNT DUE</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontSize: '1.05rem', color: '#2563eb' }}>{formatCurrency(selectedSoa.totalAmountDue)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Amount Paid / Payments Applied</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>{formatCurrency(selectedSoa.amountPaid)}</td>
                        </tr>
                        <tr style={{ background: '#fef2f2', fontWeight: 800 }}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', fontSize: '0.95rem' }}>REMAINING BALANCE DUE</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontSize: '1.05rem', color: '#dc2626' }}>{formatCurrency(selectedSoa.balanceRemaining)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Instructions & Signatures */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '36px', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>Payment Instructions:</div>
                      <div style={{ color: '#4b5563', lineHeight: '1.4' }}>
                        Please remit payment on or before <strong>{formatDate(selectedSoa.dueDate)}</strong>.<br />
                        Cash or GCash / Bank Transfers accepted. Please keep this SOA for your records.
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, marginBottom: '32px' }}>Issued By:</div>
                      <div style={{ borderTop: '1px solid #000000', paddingTop: '4px', display: 'inline-block', width: '180px', textAlign: 'center' }}>
                        <strong>JMP Rental Property</strong>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : null}

          </div>

        </div>

      </div>

      {/* Record Payment Sub-Modal */}
      {paymentModalOpen && selectedSoa && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <form onSubmit={handleRecordPaymentSubmit} style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Record Payment for {selectedSoa.soaNumber}
            </h4>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Payment Amount (₱)
              </label>
              <input
                type="number"
                step="0.01"
                value={paymentData.paymentAmount}
                onChange={(e) => setPaymentData({ ...paymentData, paymentAmount: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Payment Method
              </label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="Cash">Cash</option>
                <option value="GCash">GCash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Reference / Transaction No.
              </label>
              <input
                type="text"
                placeholder="Optional GCash / Bank reference"
                value={paymentData.referenceNumber || ''}
                onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700 }}
              >
                Save Payment
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
