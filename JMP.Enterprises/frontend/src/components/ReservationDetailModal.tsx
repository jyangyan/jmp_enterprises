import React, { useState, useEffect } from 'react';
import { X, Building2, User, Calendar, MapPin, Tag, Phone, FileText, Plus, Printer, Eye, AlertOctagon, Zap } from 'lucide-react';
import { Reservation } from '../types/reservation';
import { Receipt } from '../types/receipt';
import { RentalAgreement } from '../types/rentalAgreement';
import { receiptApi } from '../api/receiptApi';
import { rentalAgreementApi } from '../api/rentalAgreementApi';
import { ReceiptModal } from './ReceiptModal';
import { CheckoutSettlementModal } from './CheckoutSettlementModal';
import { RentalAgreementModal } from './RentalAgreementModal';
import { StatementOfAccountModal } from './StatementOfAccountModal';

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onPaymentRecordRequest?: (reservation: Reservation) => void;
}

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onPaymentRecordRequest,
}) => {
  if (!isOpen || !reservation) return null;

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [creatingQuickReceipt, setCreatingQuickReceipt] = useState<boolean>(false);

  // Rental Agreement State
  const [agreement, setAgreement] = useState<RentalAgreement | null>(null);
  const [loadingAgreement, setLoadingAgreement] = useState<boolean>(false);
  const [generatingAgreement, setGeneratingAgreement] = useState<boolean>(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState<boolean>(false);
  const [isSoaModalOpen, setIsSoaModalOpen] = useState<boolean>(false);

  const fetchReceipts = async () => {
    if (!reservation) return;
    setLoadingReceipts(true);
    try {
      const data = await receiptApi.getReservationReceipts(reservation.reservationId);
      setReceipts(data);
    } catch (err) {
      console.error('Failed to fetch receipts for reservation', err);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const fetchAgreement = async () => {
    if (!reservation || reservation.rentalType !== 'LongStay') return;
    setLoadingAgreement(true);
    try {
      const data = await rentalAgreementApi.getByReservationId(reservation.reservationId);
      setAgreement(data);
    } catch (err) {
      console.error('Failed to fetch rental agreement', err);
    } finally {
      setLoadingAgreement(false);
    }
  };

  useEffect(() => {
    if (isOpen && reservation) {
      fetchReceipts();
      if (reservation.rentalType === 'LongStay') {
        fetchAgreement();
      }
    }
  }, [isOpen, reservation]);

  const handleGenerateAgreement = async () => {
    if (!reservation) return;
    setGeneratingAgreement(true);
    try {
      const newAgreement = await rentalAgreementApi.generateDraft(reservation.reservationId);
      setAgreement(newAgreement);
      setIsAgreementModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to generate rental agreement');
    } finally {
      setGeneratingAgreement(false);
    }
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  const handleCreateReservationReceipt = async (type: string) => {
    if (!reservation) return;
    setCreatingQuickReceipt(true);
    try {
      let amount = reservation.reservationFee || 0;
      let paymentType = 'Reservation Fee';

      if (type === 'SecurityDeposit') {
        amount = reservation.securityDeposit || 0;
        paymentType = 'Security Deposit';
      } else if (type === 'Rent') {
        amount = reservation.agreedRentalAmount || 0;
        paymentType = 'Rent Payment';
      }

      const receipt = await receiptApi.createReceipt({
        receiptType: type,
        reservationId: reservation.reservationId,
        amount: amount > 0 ? amount : undefined,
        paymentType: paymentType,
        paymentMethod: 'Cash',
        purpose: `${paymentType} – ${reservation.propertyName}`,
      });

      setSelectedReceipt(receipt);
      setIsReceiptModalOpen(true);
      fetchReceipts();
    } catch (err: any) {
      alert(err.message || 'Failed to generate receipt');
    } finally {
      setCreatingQuickReceipt(false);
    }
  };

  const handleVoidReceipt = async (receipt: Receipt) => {
    if (!window.confirm(`Are you sure you want to VOID receipt ${receipt.receiptNumber}?`)) return;
    try {
      await receiptApi.voidReceipt(receipt.receiptId);
      fetchReceipts();
    } catch (err: any) {
      alert(err.message || 'Failed to void receipt');
    }
  };

  const formatPesos = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '720px' }}>
          <div className="modal-header">
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} style={{ color: 'var(--primary-color)' }} />
              Reservation #{reservation.reservationId} Details & Receipts
            </h3>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Banner */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="property-code-badge">{reservation.propertyCode}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0 2px' }}>{reservation.propertyName}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Source: <strong>{reservation.bookingSource}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`status-pill ${reservation.reservationStatus.toLowerCase()}`}>
                  <span className="status-dot"></span>
                  {reservation.reservationStatus === 'CheckedIn' ? 'Checked-In' : reservation.reservationStatus === 'CheckedOut' ? 'Checked-Out' : reservation.reservationStatus}
                </span>
                <div style={{ fontSize: '0.75rem', marginTop: '6px', color: 'var(--primary-color)', fontWeight: 600 }}>
                  {reservation.rentalType === 'ShortStay' ? 'Short Stay (Daily)' : 'Long Stay (Monthly)'}
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                Guest / Tenant Info
              </div>
              {reservation.guestCompanyName && (
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  🏢 {reservation.guestCompanyName}
                </div>
              )}
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                👤 Contact: {reservation.guestName}
              </div>
              {reservation.guestMobileNumber && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} /> {reservation.guestMobileNumber}
                </div>
              )}
            </div>

            {/* Stay Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHECK-IN</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {formatDate(reservation.checkInDate)}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHECK-OUT</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {formatDate(reservation.checkOutDate)}
                </div>
              </div>

              <div style={{ background: 'var(--primary-light)', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 600 }}>DURATION</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-color)', marginTop: '2px' }}>
                  {reservation.rentalType === 'ShortStay' ? `${reservation.numberOfNights} Night(s)` : 'Long Stay'}
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '12px' }}>
                Financial Breakdown
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                <span>Base Rate:</span>
                <span style={{ fontWeight: 600 }}>
                  {reservation.rentalType === 'ShortStay' ? `${formatPesos(reservation.dailyRate)} / night` : `${formatPesos(reservation.monthlyRate)} / month`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                <span>Security Deposit:</span>
                <span style={{ fontWeight: 600 }}>{formatPesos(reservation.securityDeposit)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                <span>Reservation Fee:</span>
                <span style={{ fontWeight: 600 }}>{formatPesos(reservation.reservationFee)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                <span>Agreed Rental Amount:</span>
                <span>{formatPesos(reservation.agreedRentalAmount)}</span>
              </div>
            </div>

            {/* RENTAL AGREEMENT CONTRACT SECTION (LongStay Only) */}
            {reservation.rentalType === 'LongStay' && (
              <div className="card" style={{ padding: '16px', background: '#ffffff', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} style={{ color: '#2563eb' }} />
                    RENTAL AGREEMENT CONTRACT
                  </div>
                  {agreement && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: agreement.agreementStatus === 'Finalized' ? 'rgba(16, 185, 129, 0.15)' : agreement.agreementStatus === 'Draft' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: agreement.agreementStatus === 'Finalized' ? '#059669' : agreement.agreementStatus === 'Draft' ? '#d97706' : '#dc2626'
                    }}>
                      {agreement.agreementStatus}
                    </span>
                  )}
                </div>

                {loadingAgreement ? (
                  <div style={{ padding: '12px', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                    Loading agreement details...
                  </div>
                ) : !agreement ? (
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>No Rental Agreement Generated Yet</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Generate an official long-stay rental contract agreement for {reservation.guestName}.</div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleGenerateAgreement}
                      disabled={generatingAgreement}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                    >
                      <Plus size={14} />
                      Generate Rental Agreement
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', fontFamily: 'monospace' }}>
                        {agreement.agreementNumber}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        Term: {formatDate(agreement.rentalStartDate)} – {formatDate(agreement.rentalEndDate)} ({agreement.numberOfMonths} Mos.)
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsAgreementModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: '#ffffff' }}
                      >
                        <Eye size={14} />
                        View Agreement
                      </button>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setIsSoaModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: '#2563eb', color: '#ffffff' }}
                      >
                        <Zap size={14} />
                        Monthly Billing (SOA)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RECEIPTS SECTION (Requirements Step 9) */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} style={{ color: 'var(--primary-color)' }} /> Acknowledgement Receipts History
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCreateReservationReceipt('Reservation')}
                    disabled={creatingQuickReceipt}
                    style={{ fontSize: '0.75rem' }}
                  >
                    + Reservation Receipt
                  </button>

                  {(() => {
                    const existingCheckoutReceipt = receipts.find(
                      (r) => (r.receiptType === 'Checkout' || r.receiptType === 'FinalSettlement' || r.paymentType?.includes('Checkout')) && !r.isVoided
                    );

                    if (existingCheckoutReceipt) {
                      return (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewReceipt(existingCheckoutReceipt)}
                          style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', borderColor: '#86efac', fontWeight: 700 }}
                          title="Checkout Settlement is complete. Click to view official receipt."
                        >
                          ✓ View Checkout Receipt
                        </button>
                      );
                    }

                    return (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsCheckoutModalOpen(true)}
                        style={{ fontSize: '0.75rem', background: '#f8fafc', borderColor: '#cbd5e1' }}
                      >
                        Checkout Settlement
                      </button>
                    );
                  })()}
                </div>
              </div>

              {loadingReceipts ? (
                <div style={{ textAlign: 'center', padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Loading receipts...
                </div>
              ) : receipts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    No receipts issued yet for this reservation.
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleCreateReservationReceipt('Reservation')}
                  >
                    Issue First Receipt
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Receipt Number</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map((r) => {
                        const displayAmt = (r.amount && r.amount > 0)
                          ? r.amount
                          : (r.totalRentalAmount || r.agreedRentalAmount || reservation.agreedRentalAmount || 0);

                        return (
                          <tr key={r.receiptId} style={{ background: r.isVoided ? '#fef2f2' : 'transparent' }}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.receiptNumber}</td>
                            <td>{formatDate(r.receiptDate)}</td>
                            <td>
                              <span className="badge" style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#eff6ff', color: '#1d4ed8' }}>
                                {r.paymentType || r.receiptType}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                              ₱{displayAmt.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </td>
                          <td style={{ textAlign: 'center' }}>
                            {r.isVoided ? (
                              <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700, background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                                VOID
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700, background: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button
                                className="btn-icon"
                                title="View & Print Receipt"
                                onClick={() => handleViewReceipt(r)}
                              >
                                <Eye size={14} />
                              </button>
                              {!r.isVoided && (
                                <button
                                  className="btn-icon btn-danger"
                                  title="Void Receipt"
                                  onClick={() => handleVoidReceipt(r)}
                                >
                                  <AlertOctagon size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notes */}
            {reservation.notes && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: '#fffbeb', padding: '10px', borderRadius: '6px', border: '1px solid #fef3c7' }}>
                📌 Notes: {reservation.notes}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onReceiptUpdated={(updated) => {
          setSelectedReceipt(updated);
          fetchReceipts();
        }}
      />

      {/* Checkout Settlement Modal */}
      <CheckoutSettlementModal
        reservation={reservation}
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onReceiptGenerated={(r) => {
          setSelectedReceipt(r);
          setIsReceiptModalOpen(true);
          fetchReceipts();
        }}
      />

      {/* Rental Agreement Contract Modal */}
      {agreement && (
        <RentalAgreementModal
          agreement={agreement}
          isOpen={isAgreementModalOpen}
          onClose={() => setIsAgreementModalOpen(false)}
          onAgreementUpdated={(updated) => {
            setAgreement(updated);
          }}
        />
      )}

      {/* Monthly Statement of Account (SOA) Modal */}
      {agreement && (
        <StatementOfAccountModal
          isOpen={isSoaModalOpen}
          onClose={() => setIsSoaModalOpen(false)}
          rentalAgreement={agreement}
          reservationId={reservation.reservationId}
        />
      )}
    </>
  );
};
