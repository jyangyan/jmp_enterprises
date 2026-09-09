import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Payment, CreatePaymentDto, ReservationPaymentSummary } from '../types/payment';
import { Reservation } from '../types/reservation';
import { paymentApi } from '../api/paymentApi';
import { receiptApi } from '../api/receiptApi';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dto: CreatePaymentDto) => Promise<void>;
  reservations: Reservation[];
  initialData?: Payment | null;
  preselectedReservationId?: number | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reservations,
  initialData,
  preselectedReservationId,
}) => {
  const [reservationId, setReservationId] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentType, setPaymentType] = useState<string>('Rent');
  const [paymentMethod, setPaymentMethod] = useState<string>('GCash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [summary, setSummary] = useState<ReservationPaymentSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setReservationId(initialData.reservationId);
      setPaymentDate(initialData.paymentDate ? initialData.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0]);
      setAmount(initialData.amount);
      setPaymentType(initialData.paymentType || 'Rent');
      setPaymentMethod(initialData.paymentMethod || 'Cash');
      setReferenceNumber(initialData.referenceNumber || '');
      setNotes(initialData.notes || '');
    } else {
      setReservationId(preselectedReservationId || (reservations.length > 0 ? reservations[0].reservationId : 0));
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setPaymentType('Rent');
      setPaymentMethod('GCash');
      setReferenceNumber('');
      setNotes('');
    }
    setError(null);
  }, [isOpen, initialData, preselectedReservationId, reservations]);

  // Fetch summary when selected reservation changes
  useEffect(() => {
    if (reservationId > 0 && isOpen) {
      setLoadingSummary(true);
      paymentApi
        .getReservationSummary(reservationId)
        .then((res) => {
          setSummary(res);
          // If creating new payment and amount is empty, default to balance due if positive
          if (!initialData && res.balanceDue > 0 && amount === '') {
            setAmount(res.balanceDue);
          }
        })
        .catch(() => setSummary(null))
        .finally(() => setLoadingSummary(false));
    } else {
      setSummary(null);
    }
  }, [reservationId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationId) {
      setError('Please select a reservation.');
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        reservationId,
        paymentDate: new Date(paymentDate).toISOString(),
        amount: numAmount,
        paymentType,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save payment');
    } finally {
      setSaving(false);
    }
  };

  const selectedRes = reservations.find((r) => r.reservationId === reservationId);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={22} style={{ color: 'var(--primary-color)' }} />
            <h3 className="modal-title">{initialData ? 'Edit Payment' : 'Record Rental Payment'}</h3>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {error && <div className="error-alert">{error}</div>}

            {/* Reservation Selection */}
            <div className="form-group">
              <label className="form-label">
                Reservation / Unit & Guest <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="form-control"
                value={reservationId}
                onChange={(e) => setReservationId(Number(e.target.value))}
                disabled={!!initialData}
                required
              >
                <option value={0}>-- Select Reservation --</option>
                {reservations.map((r) => (
                  <option key={r.reservationId} value={r.reservationId}>
                    #{r.reservationId} - {r.propertyName} ({r.guestName}) [{r.rentalType}]
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Summary Info Card */}
            {summary && (
              <div
                style={{
                  background: 'var(--bg-card-alt, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Total Cost</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                    ₱{summary.totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Total Paid</span>
                  <strong style={{ fontSize: '1rem', color: '#10b981' }}>
                    ₱{summary.totalPaid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Balance Due</span>
                  <strong
                    style={{
                      fontSize: '1rem',
                      color: summary.balanceDue > 0 ? '#ef4444' : '#10b981',
                    }}
                  >
                    ₱{summary.balanceDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Payment Date */}
              <div className="form-group">
                <label className="form-label">
                  Payment Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              {/* Amount */}
              <div className="form-group">
                <label className="form-label">
                  Amount Received (₱) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  className="form-control"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Payment Type */}
              <div className="form-group">
                <label className="form-label">Payment Category / Type</label>
                <select
                  className="form-control"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <option value="Rent">Rent Payment</option>
                  <option value="SecurityDeposit">Security Deposit</option>
                  <option value="ReservationFee">Reservation Fee</option>
                  <option value="Utility">Utility Payment</option>
                  <option value="Other">Other Payment</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="GCash">GCash</option>
                  <option value="BankTransfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Reference Number */}
            <div className="form-group">
              <label className="form-label">Reference / Transaction # (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. GCash Ref # 123456789"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes / Remarks (Optional)</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Any special remarks or receipt details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-secondary" disabled={saving} style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>
              {saving ? 'Saving...' : 'Save Payment'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving}
              onClick={async (e) => {
                const form = (e.target as HTMLElement).closest('form');
                if (form && !form.checkValidity()) {
                  form.reportValidity();
                  return;
                }
                const numAmount = Number(amount);
                if (!reservationId || !numAmount || numAmount <= 0) {
                  setError('Please select a valid reservation and enter an amount.');
                  return;
                }
                try {
                  setSaving(true);
                  setError(null);
                  const createdPayment = await paymentApi.createPayment({
                    reservationId,
                    paymentDate: new Date(paymentDate).toISOString(),
                    amount: numAmount,
                    paymentType,
                    paymentMethod,
                    referenceNumber: referenceNumber.trim() || undefined,
                    notes: notes.trim() || undefined,
                  });
                  
                  // Auto-generate receipt
                  const receipt = await receiptApi.createReceipt({
                    paymentId: createdPayment.paymentId,
                    reservationId: createdPayment.reservationId,
                    receiptType: createdPayment.paymentType === 'SecurityDeposit' ? 'SecurityDeposit' : 'Payment',
                    amount: createdPayment.amount,
                    paymentType: createdPayment.paymentType === 'SecurityDeposit' ? 'Security Deposit' : createdPayment.paymentType === 'Rent' ? 'Rent Payment' : createdPayment.paymentType,
                    paymentMethod: createdPayment.paymentMethod,
                    referenceNumber: createdPayment.referenceNumber,
                  });

                  onClose();
                  // Trigger receipt modal via custom event or parent
                  window.dispatchEvent(new CustomEvent('open-receipt-modal', { detail: receipt }));
                } catch (err: any) {
                  setError(err.message || 'Failed to save payment and receipt');
                } finally {
                  setSaving(false);
                }
              }}
            >
              <FileText size={16} />
              <span>Save & Generate Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
