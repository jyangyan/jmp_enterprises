import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Banknote,
  Plus,
  CalendarDays,
  AlertTriangle,
  AlertCircle,
  CalendarPlus,
  Building,
  Tag,
} from 'lucide-react';
import { Reservation, CreateReservationDto } from '../types/reservation';
import { Property } from '../types/property';
import { Guest } from '../types/guest';
import { guestApi } from '../api/guestApi';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateReservationDto) => Promise<void>;
  properties: Property[];
  guests: Guest[];
  existingReservations?: Reservation[];
  onRefreshGuests: () => Promise<void>;
  initialData?: Reservation | null;
  prefillData?: { propertyId?: number; checkInDate?: string; checkOutDate?: string };
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  properties,
  guests,
  existingReservations = [],
  onRefreshGuests,
  initialData,
  prefillData,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<CreateReservationDto>({
    propertyId: 0,
    guestId: 0,
    rentalType: 'ShortStay',
    bookingSource: 'Direct',
    checkInDate: todayStr,
    checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    dailyRate: 0,
    monthlyRate: 0,
    agreedRentalAmount: 0,
    securityDeposit: 0,
    reservationFee: 0,
    reservationFeePaymentMethod: 'Cash',
    reservationFeeReferenceNumber: '',
    reservationStatus: 'Confirmed',
    notes: '',
  });

  const [isAddingNewGuest, setIsAddingNewGuest] = useState(false);
  const [newGuestFirstName, setNewGuestFirstName] = useState('');
  const [newGuestLastName, setNewGuestLastName] = useState('');
  const [newGuestCompany, setNewGuestCompany] = useState('');
  const [newGuestMobile, setNewGuestMobile] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prevIsOpenRef = React.useRef<boolean>(false);
  const prevInitialDataRef = React.useRef<Reservation | null | undefined>(undefined);

  // Initialize form
  useEffect(() => {
    const isJustOpening = isOpen && !prevIsOpenRef.current;
    const isTargetChanged = initialData !== prevInitialDataRef.current;

    if (isOpen && (isJustOpening || isTargetChanged)) {
      if (initialData) {
        const inDate = initialData.checkInDate ? initialData.checkInDate.split('T')[0] : todayStr;
        let status = initialData.reservationStatus || 'Confirmed';
        if (status === 'CheckedIn' && inDate > todayStr) {
          status = 'Confirmed';
        }

        setFormData({
          propertyId: initialData.propertyId,
          guestId: initialData.guestId,
          rentalType: initialData.rentalType || 'ShortStay',
          bookingSource: initialData.bookingSource || 'Direct',
          checkInDate: inDate,
          checkOutDate: initialData.checkOutDate ? initialData.checkOutDate.split('T')[0] : '',
          dailyRate: initialData.dailyRate || 0,
          monthlyRate: initialData.monthlyRate || 0,
          agreedRentalAmount: initialData.agreedRentalAmount || 0,
          securityDeposit: initialData.securityDeposit || 0,
          reservationFee: initialData.reservationFee || 0,
          reservationFeePaymentMethod: initialData.reservationFeePaymentMethod || 'Cash',
          reservationFeeReferenceNumber: initialData.reservationFeeReferenceNumber || '',
          reservationStatus: status,
          notes: initialData.notes || '',
        });
      } else {
        const targetPropId = prefillData?.propertyId || (properties[0] ? properties[0].propertyId : 0);
        const targetProp = properties.find(p => p.propertyId === targetPropId) || properties[0];
        const inDate = prefillData?.checkInDate || todayStr;
        const outDate = prefillData?.checkOutDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

        // Calculate days
        const d1 = new Date(inDate);
        const d2 = new Date(outDate);
        const diffTime = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
        const dailyRate = targetProp ? targetProp.defaultDailyRate : 0;

        setFormData({
          propertyId: targetProp ? targetProp.propertyId : 0,
          guestId: guests[0] ? guests[0].guestId : 0,
          rentalType: 'ShortStay',
          bookingSource: 'Direct',
          checkInDate: inDate,
          checkOutDate: outDate,
          dailyRate: dailyRate,
          monthlyRate: targetProp ? targetProp.defaultMonthlyRate : 0,
          agreedRentalAmount: dailyRate * diffTime,
          securityDeposit: 0,
          reservationFee: 0,
          reservationFeePaymentMethod: 'Cash',
          reservationFeeReferenceNumber: '',
          reservationStatus: 'Confirmed',
          notes: '',
        });
      }
      setIsAddingNewGuest(false);
      setError(null);
    }

    prevIsOpenRef.current = isOpen;
    prevInitialDataRef.current = initialData;
  }, [initialData, isOpen, properties]);

  const isFutureCheckIn = formData.checkInDate > todayStr;

  useEffect(() => {
    if (isFutureCheckIn && formData.reservationStatus === 'CheckedIn') {
      setFormData((prev) => ({ ...prev, reservationStatus: 'Confirmed' }));
    }
  }, [formData.checkInDate, isFutureCheckIn]);

  const selectedProperty = properties.find((p) => p.propertyId === formData.propertyId);

  const propertyOccupiedRanges = existingReservations
    .filter(
      (r) =>
        r.propertyId === formData.propertyId &&
        r.reservationStatus !== 'Cancelled' &&
        r.reservationStatus !== 'CheckedOut' &&
        (!initialData || r.reservationId !== initialData.reservationId)
    )
    .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());

  const selectedIn = new Date(formData.checkInDate);
  const selectedOut = new Date(formData.checkOutDate);
  const dateConflict = propertyOccupiedRanges.find((r) => {
    const rIn = new Date(r.checkInDate);
    const rOut = new Date(r.checkOutDate);
    return selectedIn < rOut && selectedOut > rIn;
  });

  const handlePropertyChange = (propId: number) => {
    const selectedProp = properties.find((p) => p.propertyId === propId);
    if (!selectedProp) return;

    const daily = selectedProp.defaultDailyRate;
    const monthly = selectedProp.defaultMonthlyRate;

    let suggestedAmount = formData.agreedRentalAmount;
    if (formData.rentalType === 'ShortStay') {
      const nights = calculateNights(formData.checkInDate, formData.checkOutDate);
      suggestedAmount = nights > 0 ? nights * daily : 0;
    } else if (formData.rentalType === 'LongStay') {
      suggestedAmount = monthly;
    }

    setFormData((prev) => ({
      ...prev,
      propertyId: propId,
      dailyRate: daily,
      monthlyRate: monthly,
      agreedRentalAmount: suggestedAmount,
    }));
  };

  const calculateNights = (inDateStr: string, outDateStr: string): number => {
    if (!inDateStr || !outDateStr) return 0;
    const d1 = new Date(inDateStr);
    const d2 = new Date(outDateStr);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleDateChange = (inDateStr: string, outDateStr: string, rentalType: string) => {
    const nights = calculateNights(inDateStr, outDateStr);
    let suggestedAmount = formData.agreedRentalAmount;

    if (rentalType === 'ShortStay' && nights > 0 && formData.dailyRate > 0) {
      suggestedAmount = nights * formData.dailyRate;
    } else if (rentalType === 'LongStay' && formData.monthlyRate > 0) {
      suggestedAmount = formData.monthlyRate;
    }

    let status = formData.reservationStatus;
    if (inDateStr > todayStr && status === 'CheckedIn') {
      status = 'Confirmed';
    }

    setFormData((prev) => ({
      ...prev,
      checkInDate: inDateStr,
      checkOutDate: outDateStr,
      rentalType: rentalType,
      reservationStatus: status,
      agreedRentalAmount: suggestedAmount,
    }));
  };

  const handleQuickAddGuest = async () => {
    if (!newGuestFirstName.trim() || !newGuestLastName.trim()) {
      setError('Guest First Name and Last Name are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newGuest = await guestApi.createGuest({
        firstName: newGuestFirstName,
        lastName: newGuestLastName,
        companyName: newGuestCompany,
        mobileNumber: newGuestMobile,
      });

      await onRefreshGuests();
      setFormData((prev) => ({ ...prev, guestId: newGuest.guestId }));
      setIsAddingNewGuest(false);
      setNewGuestFirstName('');
      setNewGuestLastName('');
      setNewGuestCompany('');
      setNewGuestMobile('');
    } catch (err: any) {
      setError(err.message || 'Failed to create new guest.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const nights = calculateNights(formData.checkInDate, formData.checkOutDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.propertyId || !formData.guestId) {
      setError('Please select a property and a guest.');
      return;
    }

    if (nights <= 0) {
      setError('Check-Out Date must be after Check-In Date.');
      return;
    }

    if (formData.reservationStatus === 'CheckedIn' && formData.checkInDate > todayStr) {
      setError('Cannot set status to "Checked-In" for a future check-in date. Status for future dates must be Confirmed or Reserved.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save reservation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--primary-light)',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarPlus size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0 }}>
                {initialData ? 'Edit Reservation' : 'Create New Reservation'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Configure stay dates, property unit, rates, and tenant details
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <div className="modal-body">
            {error && <div className="error-banner">{error}</div>}

            {/* Occupancy Conflict Warning Card */}
            {dateConflict && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  borderLeft: '4px solid #ef4444',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#991b1b',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <AlertTriangle size={18} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700 }}>Occupancy Conflict Detected</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                    <strong>{selectedProperty?.propertyName}</strong> is already booked from{' '}
                    <strong>{new Date(dateConflict.checkInDate).toLocaleDateString()}</strong> to{' '}
                    <strong>{new Date(dateConflict.checkOutDate).toLocaleDateString()}</strong> ({dateConflict.guestName}).
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 1: UNIT & TENANT */}
            <div>
              <div className="modal-section-title">
                <Building size={14} /> Unit & Tenant Selection
              </div>

              <div className="form-grid">
                {/* Property Unit */}
                <div className="form-group full-width">
                  <label>Property Unit *</label>
                  <select
                    className="form-control"
                    value={formData.propertyId}
                    onChange={(e) => handlePropertyChange(parseInt(e.target.value))}
                    required
                  >
                    {properties.map((p) => (
                      <option key={p.propertyId} value={p.propertyId}>
                        {p.propertyCode} - {p.propertyName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compact Occupied Schedule Pills */}
                {propertyOccupiedRanges.length > 0 && (
                  <div
                    className="form-group full-width"
                    style={{
                      background: '#f8fafc',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '6px',
                      }}
                    >
                      <CalendarDays size={14} style={{ color: 'var(--primary-color)' }} />
                      Booked Schedule for {selectedProperty?.propertyName}:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '80px', overflowY: 'auto' }}>
                      {propertyOccupiedRanges.map((occ) => {
                        const isConflict = dateConflict?.reservationId === occ.reservationId;
                        return (
                          <span
                            key={occ.reservationId}
                            style={{
                              fontSize: '0.72rem',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: isConflict ? '#fee2e2' : '#e0f2fe',
                              border: isConflict ? '1px solid #fca5a5' : '1px solid #bae6fd',
                              color: isConflict ? '#991b1b' : '#0369a1',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {new Date(occ.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                            {new Date(occ.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({occ.reservationStatus}) - {occ.guestName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Guest / Tenant Selection */}
                <div className="form-group full-width">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ margin: 0 }}>Guest / Tenant *</label>
                    {!isAddingNewGuest && (
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-color)',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        onClick={() => setIsAddingNewGuest(true)}
                      >
                        <Plus size={13} /> Quick Add New Guest
                      </button>
                    )}
                  </div>

                  {!isAddingNewGuest ? (
                    <select
                      className="form-control"
                      value={formData.guestId}
                      onChange={(e) => setFormData({ ...formData, guestId: parseInt(e.target.value) })}
                      required
                    >
                      {guests.map((g) => (
                        <option key={g.guestId} value={g.guestId}>
                          {g.companyName ? `🏢 ${g.companyName} (${g.firstName} ${g.lastName})` : `👤 ${g.firstName} ${g.lastName}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        Quick Add Guest / Corporate Renter
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          placeholder="First Name *"
                          className="form-control"
                          value={newGuestFirstName}
                          onChange={(e) => setNewGuestFirstName(e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Last Name *"
                          className="form-control"
                          value={newGuestLastName}
                          onChange={(e) => setNewGuestLastName(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          placeholder="Company Name (Optional)"
                          className="form-control"
                          value={newGuestCompany}
                          onChange={(e) => setNewGuestCompany(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Mobile Number"
                          className="form-control"
                          value={newGuestMobile}
                          onChange={(e) => setNewGuestMobile(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" className="btn btn-primary btn-sm" onClick={handleQuickAddGuest} disabled={loading}>
                          Save & Select
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingNewGuest(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: DATES & STAY DETAILS */}
            <div>
              <div className="modal-section-title">
                <Calendar size={14} /> Stay Dates & Booking Type
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Rental Type *</label>
                  <select
                    className="form-control"
                    value={formData.rentalType}
                    onChange={(e) => handleDateChange(formData.checkInDate, formData.checkOutDate, e.target.value)}
                  >
                    <option value="ShortStay">Short Stay (Daily Rate)</option>
                    <option value="LongStay">Long Stay (Monthly Rate)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Booking Source *</label>
                  <select
                    className="form-control"
                    value={formData.bookingSource}
                    onChange={(e) => setFormData({ ...formData, bookingSource: e.target.value })}
                  >
                    <option value="Direct">Direct</option>
                    <option value="Airbnb">Airbnb</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Referral">Referral</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Check-In Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.checkInDate}
                    onChange={(e) => handleDateChange(e.target.value, formData.checkOutDate, formData.rentalType)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Check-Out Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.checkOutDate}
                    onChange={(e) => handleDateChange(formData.checkInDate, e.target.value, formData.rentalType)}
                    required
                  />
                </div>

                {/* Calculation Breakdown Banner */}
                <div
                  className="form-group full-width"
                  style={{
                    background: 'var(--primary-light)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      {formData.rentalType === 'ShortStay' ? `${nights} Night(s)` : 'Long Stay Contract'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {formData.rentalType === 'ShortStay'
                        ? `Daily Default: ₱${formData.dailyRate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                        : `Monthly Default: ₱${formData.monthlyRate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: PRICING & DEPOSITS */}
            <div>
              <div className="modal-section-title">
                <Banknote size={14} /> Agreed Pricing & Fees
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Agreed Rental Amount (₱) *</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 500 }}>
                      Editable (Owner agreed rate)
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-color)' }}
                    value={formData.agreedRentalAmount}
                    onChange={(e) => setFormData({ ...formData, agreedRentalAmount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Security Deposit (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label>Reservation Fee (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.reservationFee}
                    onChange={(e) => setFormData({ ...formData, reservationFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                {formData.reservationFee > 0 && (
                  <div
                    className="full-width"
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      marginTop: '4px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ color: '#166534', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Fee Payment Method *
                      </label>
                      <select
                        className="form-control"
                        value={formData.reservationFeePaymentMethod || 'Cash'}
                        onChange={(e) => setFormData({ ...formData, reservationFeePaymentMethod: e.target.value })}
                        style={{ background: '#fff', borderColor: '#86efac' }}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="GCash">GCash</option>
                        <option value="Check">Check</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ color: '#166534', fontWeight: 600, fontSize: '0.82rem' }}>
                        Reference # / Txn # {formData.reservationFeePaymentMethod !== 'Cash' ? '*' : '(Optional)'}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={
                          formData.reservationFeePaymentMethod === 'Bank Transfer'
                            ? 'e.g. BDO Ref / Txn #'
                            : formData.reservationFeePaymentMethod === 'GCash'
                            ? 'e.g. GCash Ref (13 digits)'
                            : formData.reservationFeePaymentMethod === 'Check'
                            ? 'e.g. Check #'
                            : 'e.g. Transaction Ref #'
                        }
                        value={formData.reservationFeeReferenceNumber || ''}
                        onChange={(e) => setFormData({ ...formData, reservationFeeReferenceNumber: e.target.value })}
                        style={{ background: '#fff', borderColor: '#86efac' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1', fontSize: '0.76rem', color: '#15803d', background: '#dcfce7', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                      ✓ An official Acknowledgement Receipt will record this reservation fee as <strong>{formData.reservationFeePaymentMethod || 'Cash'}</strong> {formData.reservationFeeReferenceNumber ? `(Ref: ${formData.reservationFeeReferenceNumber})` : ''}.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: STATUS & NOTES */}
            <div>
              <div className="modal-section-title">
                <Tag size={14} /> Status & Special Notes
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Reservation Status *</label>
                  <select
                    className="form-control"
                    value={formData.reservationStatus}
                    onChange={(e) => setFormData({ ...formData, reservationStatus: e.target.value })}
                  >
                    <option value="Inquiry">Inquiry</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="CheckedIn" disabled={isFutureCheckIn}>
                      Checked-In {isFutureCheckIn ? '(Disabled for future check-in dates)' : ''}
                    </option>
                    <option value="CheckedOut">Checked-Out</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {isFutureCheckIn && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#b45309',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 500,
                      }}
                    >
                      <AlertCircle size={13} />
                      "Checked-In" status is disabled for future check-in dates ({formData.checkInDate}). Status for future dates must be Confirmed or Reserved.
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Notes / Special Requests</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Special arrangement notes, payment instructions..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !!dateConflict}>
              {loading ? 'Saving...' : initialData ? 'Update Reservation' : 'Save Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
