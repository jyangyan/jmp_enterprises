import React, { useState } from 'react';
import { Reservation } from '../types/reservation';
import { CheckoutSettlementInput, Receipt } from '../types/receipt';
import { receiptApi } from '../api/receiptApi';
import { reservationApi } from '../api/reservationApi';
import { X, CheckCircle, FileText, CreditCard, DollarSign, Sparkles } from 'lucide-react';

interface CheckoutSettlementModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onReceiptGenerated: (receipt: Receipt) => void;
}

export const CheckoutSettlementModal: React.FC<CheckoutSettlementModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onReceiptGenerated,
}) => {
  if (!isOpen || !reservation) return null;

  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [securityDepositReturned, setSecurityDepositReturned] = useState<number>(reservation.securityDeposit || 0);
  const [settlementStatus, setSettlementStatus] = useState<string>('PAID IN FULL');
  const [notes, setNotes] = useState<string>('Checkout and final settlement completed.');
  
  // Payment Collection State
  const [recordPaymentNow, setRecordPaymentNow] = useState<boolean>(true);
  const [paymentAmount, setPaymentAmount] = useState<number>(reservation.agreedRentalAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [paymentType, setPaymentType] = useState<string>('Rental Payment');
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const input: CheckoutSettlementInput = {
        reservationId: reservation.reservationId,
        additionalCharges: Number(additionalCharges),
        securityDepositReturned: Number(securityDepositReturned),
        settlementStatus,
        notes,
        paymentAmount: recordPaymentNow ? Number(paymentAmount) : 0,
        paymentMethod: recordPaymentNow ? paymentMethod : undefined,
        paymentType: recordPaymentNow ? paymentType : undefined,
        referenceNumber: recordPaymentNow && referenceNumber.trim() ? referenceNumber.trim() : undefined,
      };

      // 1. Create Checkout Settlement Receipt & record backend payment + status
      const receipt = await receiptApi.createCheckoutReceipt(input);

      // 2. Ensure reservation status is set to CheckedOut via API
      try {
        await reservationApi.updateReservation(reservation.reservationId, {
          propertyId: reservation.propertyId,
          guestId: reservation.guestId,
          rentalType: reservation.rentalType,
          bookingSource: reservation.bookingSource,
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          dailyRate: reservation.dailyRate,
          monthlyRate: reservation.monthlyRate,
          agreedRentalAmount: reservation.agreedRentalAmount,
          securityDeposit: reservation.securityDeposit,
          reservationFee: reservation.reservationFee,
          reservationStatus: 'CheckedOut',
          notes: reservation.notes || undefined,
        });
      } catch (statusErr) {
        console.warn('Backup status update notice:', statusErr);
      }

      onReceiptGenerated(receipt);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate checkout settlement receipt');
    } finally {
      setSubmitting(false);
    }
  };

  const guestDisplayName = reservation.guestCompanyName
    ? `${reservation.guestCompanyName} (Contact: ${reservation.guestName})`
    : reservation.guestName || 'Guest';

  // Live Calculations
  const calculatedTotalDue = (reservation.agreedRentalAmount || 0) + Number(additionalCharges);
  const collectedPayment = recordPaymentNow ? Number(paymentAmount) : 0;
  const netBalance = Math.max(0, calculatedTotalDue - collectedPayment);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: 'var(--primary-color)' }} />
            <h3 className="modal-title">Checkout & Final Settlement</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
          <div className="modal-body" style={{ overflowY: 'auto', paddingRight: '4px' }}>
            {error && <div className="error-alert">{error}</div>}

            {/* Reservation Info Header */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{reservation.propertyName}</div>
              <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>{guestDisplayName}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'flex', gap: '12px' }}>
                <span>Check-In: <strong>{reservation.checkInDate?.split('T')[0]}</strong></span>
                <span>Check-Out: <strong>{reservation.checkOutDate?.split('T')[0]}</strong></span>
              </div>
            </div>

            {/* Read-only Baseline Financials */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Total Agreed Rent</label>
                <div style={{ fontWeight: 800, background: '#f1f5f9', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', color: '#0f172a' }}>
                  ₱{(reservation.agreedRentalAmount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Security Deposit Tracked</label>
                <div style={{ fontWeight: 800, background: '#f1f5f9', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', color: '#0f172a' }}>
                  ₱{(reservation.securityDeposit || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Additional Charges & Security Deposit Refund */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Additional Charges (Damages / Utilities)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Security Deposit Refund / Applied</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={securityDepositReturned}
                  onChange={(e) => setSecurityDepositReturned(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Direct Payment Collection Section */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 800, color: '#1e40af', margin: 0, fontSize: '0.92rem' }}>
                  <input
                    type="checkbox"
                    checked={recordPaymentNow}
                    onChange={(e) => setRecordPaymentNow(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                  <CreditCard size={18} style={{ color: '#2563eb' }} />
                  Record / Collect Payment Right Now at Checkout
                </label>
                <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Instant Payment Log
                </span>
              </div>

              {recordPaymentNow && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a8a' }}>Payment Amount Collected (₱)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                        style={{ fontWeight: 800, color: '#15803d', background: '#ffffff' }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a8a' }}>Payment Method</label>
                      <select
                        className="form-control"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ background: '#ffffff', fontWeight: 600 }}
                      >
                        <option value="Cash">Cash</option>
                        <option value="GCash">GCash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Check">Check</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a8a' }}>Payment Category</label>
                      <select
                        className="form-control"
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        style={{ background: '#ffffff', fontWeight: 600 }}
                      >
                        <option value="Rental Payment">Rental Payment</option>
                        <option value="Additional Charge">Additional Charge / Utility</option>
                        <option value="Full Settlement">Full Final Settlement</option>
                        <option value="Security Deposit">Security Deposit</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a8a' }}>Reference / GCash No. (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. GCash Ref #987654"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        style={{ background: '#ffffff' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Settlement Summary Banner */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                  Total Rent + Additions: ₱{calculatedTotalDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: netBalance === 0 ? '#15803d' : '#dc2626' }}>
                  Remaining Balance: ₱{netBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="form-group" style={{ margin: 0, width: '200px' }}>
                <select
                  className="form-control"
                  value={settlementStatus}
                  onChange={(e) => setSettlementStatus(e.target.value)}
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    background: settlementStatus === 'PAID IN FULL' ? '#dcfce7' : '#fff1f2',
                    color: settlementStatus === 'PAID IN FULL' ? '#15803d' : '#be123c',
                    border: `1px solid ${settlementStatus === 'PAID IN FULL' ? '#86efac' : '#fecdd3'}`
                  }}
                >
                  <option value="PAID IN FULL">PAID IN FULL</option>
                  <option value="BALANCE REMAINING">BALANCE REMAINING</option>
                  <option value="SECURITY DEPOSIT RETURNED">SECURITY DEPOSIT RETURNED</option>
                  <option value="SECURITY DEPOSIT PARTIALLY APPLIED">SECURITY DEPOSIT PARTIALLY APPLIED</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Notes / Settlement Remarks</label>
              <textarea
                className="form-control"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                fontWeight: 800,
                padding: '10px 20px'
              }}
            >
              <CheckCircle size={18} />
              {submitting ? 'Processing Settlement...' : 'Complete Checkout & Generate Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
