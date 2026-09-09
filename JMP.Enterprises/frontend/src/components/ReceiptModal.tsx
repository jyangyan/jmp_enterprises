import React from 'react';
import { Receipt } from '../types/receipt';
import { Printer, Download, X, AlertOctagon } from 'lucide-react';
import { receiptApi } from '../api/receiptApi';

interface ReceiptModalProps {
  receipt: Receipt | null;
  isOpen: boolean;
  onClose: () => void;
  onReceiptUpdated?: (receipt: Receipt) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onReceiptUpdated,
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleVoid = async () => {
    if (!window.confirm(`Are you sure you want to VOID receipt ${receipt.receiptNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      const updated = await receiptApi.voidReceipt(receipt.receiptId);
      if (onReceiptUpdated) {
        onReceiptUpdated(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to void receipt');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '₱0.00';
    return `₱${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isSecurityDeposit = receipt.receiptType === 'SecurityDeposit' || receipt.paymentType === 'Security Deposit';
  const isCheckout = receipt.receiptType === 'Checkout' || receipt.receiptType === 'FinalSettlement';

  return (
    <div className="receipt-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      overflowY: 'auto',
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div className="receipt-modal-content" style={{
        background: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        maxWidth: '720px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        
        {/* Modal Controls Bar (Hidden when printing) */}
        <div className="no-print" style={{
          background: '#1e293b',
          color: '#ffffff',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #334155',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>Acknowledgement Receipt</span>
            <span style={{
              fontSize: '0.75rem',
              background: '#334155',
              color: '#94a3b8',
              padding: '3px 10px',
              borderRadius: '20px',
              fontFamily: 'monospace',
            }}>
              {receipt.receiptNumber}
            </span>
            {receipt.isVoided && (
              <span style={{
                fontSize: '0.7rem',
                background: '#dc2626',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: '20px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <AlertOctagon size={12} /> VOIDED
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              className="btn"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '0.8rem',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Printer size={14} /> Print
            </button>

            <button
              onClick={handlePrint}
              className="btn"
              style={{
                background: '#059669',
                color: '#ffffff',
                fontSize: '0.8rem',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Download size={14} /> Save PDF
            </button>

            {!receipt.isVoided && (
              <button
                onClick={handleVoid}
                className="btn"
                style={{
                  background: 'rgba(220, 38, 38, 0.15)',
                  color: '#fca5a5',
                  fontSize: '0.75rem',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  cursor: 'pointer',
                }}
              >
                <AlertOctagon size={14} /> Void
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                marginLeft: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="receipt-printable-area" style={{
          padding: '40px',
          overflowY: 'auto',
          maxHeight: '78vh',
          background: '#ffffff',
          position: 'relative',
        }}>
          
          {/* VOID Watermark */}
          {receipt.isVoided && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 10,
              opacity: 0.12,
            }}>
              <span style={{
                color: '#dc2626',
                fontSize: '120px',
                fontWeight: 900,
                transform: 'rotate(-18deg)',
                border: '8px solid #dc2626',
                padding: '10px 50px',
                borderRadius: '24px',
                letterSpacing: '0.15em',
              }}>
                VOID
              </span>
            </div>
          )}

          {/* Receipt Body */}
          <div style={{
            maxWidth: '580px',
            margin: '0 auto',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            color: '#1e293b',
            position: 'relative',
          }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
              <img
                src="/logo.png"
                alt="JMP Logo"
                style={{ height: '60px', width: 'auto', objectFit: 'contain', margin: '0 auto 10px', display: 'block' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#0f172a', textTransform: 'uppercase', margin: '0' }}>
                JMP Rental Property
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, margin: '4px 0 0' }}>
                Deo Homes Residences, Brgy. Salvacion, Ormoc City, Leyte
              </p>
              <div style={{
                marginTop: '14px',
                display: 'inline-block',
                background: '#0f172a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '5px 20px',
                borderRadius: '20px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                Acknowledgement Receipt
              </div>
            </div>

            {/* Receipt Number & Date */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              background: '#f8fafc',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #f1f5f9',
              marginBottom: '20px',
              fontSize: '0.85rem',
            }}>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Receipt Number</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{receipt.receiptNumber}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Receipt Date</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatDate(receipt.receiptDate)}</span>
              </div>
            </div>

            {/* Received From */}
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>Received From</span>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{receipt.guestName}</div>
              {receipt.guestCompanyName && (
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500, marginTop: '2px' }}>{receipt.guestCompanyName}</div>
              )}
            </div>

            {/* Property & Rental Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>Property / Unit</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{receipt.propertyName} ({receipt.propertyCode})</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>Rental Type</span>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  {receipt.rentalType === 'ShortStay' ? 'Short Stay' : receipt.rentalType === 'LongStay' ? 'Long Stay' : receipt.rentalType || 'N/A'}
                </div>
              </div>
              {receipt.checkInDate && (
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>Check-In</span>
                  <div style={{ fontWeight: 500, color: '#1e293b' }}>{formatDate(receipt.checkInDate)}</div>
                </div>
              )}
              {receipt.checkOutDate && (
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>Check-Out</span>
                  <div style={{ fontWeight: 500, color: '#1e293b' }}>{formatDate(receipt.checkOutDate)}</div>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px',
              background: '#f8fafc',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #f1f5f9',
              marginBottom: '16px',
              fontSize: '0.82rem',
            }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>Payment Type</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{receipt.paymentType}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>Method</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{receipt.paymentMethod}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>Reference #</span>
                <div style={{ fontFamily: 'monospace', color: '#1e293b' }}>{receipt.referenceNumber || 'N/A'}</div>
              </div>
            </div>

            {/* Amount Display */}
            <div style={{
              padding: '24px',
              borderRadius: '10px',
              border: `2px solid ${isSecurityDeposit ? '#fbbf24' : '#3b82f6'}`,
              background: isSecurityDeposit ? '#fffbeb' : '#eff6ff',
              textAlign: 'center',
              margin: '20px 0',
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Amount Received
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: isSecurityDeposit ? '#78350f' : '#1e3a8a' }}>
                {formatCurrency(receipt.amount)}
              </div>
              {receipt.amountInWords && (
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', fontStyle: 'italic', marginTop: '6px' }}>
                  ({receipt.amountInWords})
                </div>
              )}
            </div>

            {/* Purpose */}
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>Payment For</span>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>{receipt.purpose}</div>
            </div>

            {/* Security Deposit Notice */}
            {isSecurityDeposit && (
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fbbf24',
                color: '#78350f',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                lineHeight: '1.5',
                fontWeight: 500,
                marginBottom: '14px',
              }}>
                <div style={{ fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>SECURITY DEPOSIT NOTICE</div>
                Security Deposit – This amount is tracked separately from rental income and is subject to the applicable rental agreement and checkout settlement.
              </div>
            )}

            {/* Rental Balance (non-checkout) */}
            {!isCheckout && receipt.agreedRentalAmount !== undefined && receipt.agreedRentalAmount !== null && (
              <div style={{
                background: '#f8fafc',
                padding: '14px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.8rem',
                marginBottom: '14px',
              }}>
                <div style={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', marginBottom: '8px' }}>Rental Balance Breakdown</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#64748b' }}>
                  <span>Agreed Rental Amount:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(receipt.agreedRentalAmount)}</span>
                </div>
                {receipt.previouslyPaid !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#64748b' }}>
                    <span>Previously Paid:</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(receipt.previouslyPaid)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#64748b', fontWeight: 600 }}>
                  <span>Current Payment:</span>
                  <span style={{ color: '#0f172a' }}>{formatCurrency(receipt.amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '6px', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                  <span>Remaining Balance:</span>
                  <span style={{ color: '#1d4ed8' }}>{formatCurrency(receipt.remainingBalance)}</span>
                </div>
              </div>
            )}

            {/* Checkout / Final Settlement Breakdown */}
            {isCheckout && (
              <div style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.8rem',
                marginBottom: '14px',
              }}>
                <div style={{ fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span>Checkout Final Settlement</span>
                  <span style={{ fontSize: '0.7rem', background: '#0f172a', color: '#ffffff', padding: '2px 10px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {receipt.settlementStatus || 'FINAL SETTLEMENT'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#475569' }}>
                  <span>Total Rental Amount:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(receipt.totalRentalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#475569' }}>
                  <span>Total Payments Received:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(receipt.totalRentalPaymentsReceived)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#475569' }}>
                  <span>Security Deposit Received:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(receipt.securityDepositReceived)}</span>
                </div>
                {receipt.additionalCharges !== undefined && receipt.additionalCharges > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#b45309', fontWeight: 500 }}>
                    <span>Additional Charges:</span>
                    <span>+{formatCurrency(receipt.additionalCharges)}</span>
                  </div>
                )}
                {receipt.securityDepositReturned !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#047857', fontWeight: 500 }}>
                    <span>Security Deposit Returned:</span>
                    <span>{formatCurrency(receipt.securityDepositReturned)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '6px', marginTop: '6px', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  <span>Outstanding Balance:</span>
                  <span style={{ color: receipt.outstandingBalance && receipt.outstandingBalance > 0 ? '#dc2626' : '#047857' }}>
                    {formatCurrency(receipt.outstandingBalance)}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            {receipt.notes && (
              <div style={{
                fontSize: '0.78rem',
                color: '#64748b',
                fontStyle: 'italic',
                background: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #f1f5f9',
                marginBottom: '14px',
              }}>
                <span style={{ fontWeight: 700, color: '#475569', fontStyle: 'normal', display: 'block', marginBottom: '2px' }}>Remarks / Notes:</span>
                {receipt.notes}
              </div>
            )}

            {/* Acknowledgement Statement */}
            <div style={{
              margin: '24px 0',
              textAlign: 'center',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#475569',
              fontStyle: 'italic',
              borderTop: '1px solid #f1f5f9',
              borderBottom: '1px solid #f1f5f9',
              padding: '10px 0',
            }}>
              "This is to acknowledge receipt of the amount stated above for the purpose indicated in this receipt."
            </div>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', margin: '32px 0', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontWeight: 500, display: 'block', marginBottom: '48px' }}>Received by:</span>
                <div style={{ borderTop: '2px solid #0f172a', paddingTop: '6px', fontWeight: 700, color: '#0f172a' }}>
                  JMP Rental Property
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Authorized Representative</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontWeight: 500, display: 'block', marginBottom: '48px' }}>Received / Acknowledged by:</span>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', fontWeight: 600, color: '#1e293b' }}>
                  {receipt.guestName}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Guest / Tenant</div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '2px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                Thank you for choosing JMP Rental Property.
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>
                This acknowledgement receipt is generated through the JMP Enterprises Rental Management System.
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
