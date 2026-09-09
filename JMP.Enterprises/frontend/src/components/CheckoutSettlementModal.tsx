import React, { useState } from 'react';
import { Reservation } from '../types/reservation';
import { CheckoutSettlementInput, Receipt } from '../types/receipt';
import { receiptApi } from '../api/receiptApi';
import { X, CheckCircle, FileText } from 'lucide-react';

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
      };

      const receipt = await receiptApi.createCheckoutReceipt(input);
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

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: 'var(--primary-color)' }} />
            <h3 className="modal-title">Checkout / Final Settlement</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {error && <div className="error-alert">{error}</div>}

            {/* Reservation Info */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{reservation.propertyName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>{guestDisplayName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Check-In: {reservation.checkInDate?.split('T')[0]} | Check-Out: {reservation.checkOutDate?.split('T')[0]}
              </div>
            </div>

            {/* Read-only Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Total Rental Amount</label>
                <div style={{ fontWeight: 700, background: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  ₱{reservation.agreedRentalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="form-group">
                <label>Security Deposit Tracked</label>
                <div style={{ fontWeight: 700, background: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  ₱{(reservation.securityDeposit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="form-group">
              <label>Additional Charges (if applicable)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={additionalCharges}
                onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label>Security Deposit Returned / Applied</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={securityDepositReturned}
                onChange={(e) => setSecurityDepositReturned(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label>Settlement Status</label>
              <select
                className="form-control"
                value={settlementStatus}
                onChange={(e) => setSettlementStatus(e.target.value)}
              >
                <option value="PAID IN FULL">PAID IN FULL</option>
                <option value="BALANCE REMAINING">BALANCE REMAINING</option>
                <option value="SECURITY DEPOSIT RETURNED">SECURITY DEPOSIT RETURNED</option>
                <option value="SECURITY DEPOSIT PARTIALLY APPLIED">SECURITY DEPOSIT PARTIALLY APPLIED</option>
              </select>
            </div>

            <div className="form-group">
              <label>Notes / Remarks</label>
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
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} />
              {submitting ? 'Generating...' : 'Generate Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
