import React, { useState } from 'react';
import { Plus, Eye, Edit2, XCircle, CalendarDays, Filter, ArrowUpDown, ArrowUp, ArrowDown, LogOut, LayoutList, Calendar as CalendarIcon, RefreshCw, Check } from 'lucide-react';
import { Reservation } from '../types/reservation';
import { Property } from '../types/property';
import { AvailabilityChecker } from '../components/AvailabilityChecker';
import { CheckoutSettlementModal } from '../components/CheckoutSettlementModal';
import { ReservationCalendarView } from '../components/ReservationCalendarView';

interface ReservationsPageProps {
  reservations: Reservation[];
  properties: Property[];
  onOpenCreateModal: (prefill?: { propertyId?: number; checkInDate?: string; checkOutDate?: string }) => void;
  onOpenEditModal: (reservation: Reservation) => void;
  onOpenDetailModal: (reservation: Reservation) => void;
  onCancelReservation: (reservation: Reservation) => void;
  onRefreshData?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

type SortField = 'checkInDate' | 'checkOutDate' | 'createdDate' | 'agreedRentalAmount' | 'guestName' | 'propertyName';
type SortOrder = 'asc' | 'desc';

export const ReservationsPage: React.FC<ReservationsPageProps> = ({
  reservations,
  properties,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDetailModal,
  onCancelReservation,
  onRefreshData,
  onRefresh,
  isRefreshing = false,
}) => {
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);

  const handleRefreshClick = () => {
    if (onRefreshData) onRefreshData();
    if (onRefresh) onRefresh();
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 2500);
  };
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showAvailabilityChecker, setShowAvailabilityChecker] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('All');
  const [selectedRentalType, setSelectedRentalType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  const [selectedForCheckout, setSelectedForCheckout] = useState<Reservation | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('checkInDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleHeaderClick = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter reservations
  const filteredReservations = reservations.filter((r) => {
    const matchesProperty = selectedPropertyId === 'All' || r.propertyId === parseInt(selectedPropertyId);
    const matchesType = selectedRentalType === 'All' || r.rentalType === selectedRentalType;
    const matchesStatus = 
      selectedStatus === 'All' 
        ? true 
        : selectedStatus === 'Active' 
        ? (r.reservationStatus !== 'CheckedOut' && r.reservationStatus !== 'Cancelled')
        : selectedStatus === 'History' 
        ? (r.reservationStatus === 'CheckedOut' || r.reservationStatus === 'Cancelled')
        : r.reservationStatus === selectedStatus;

    return matchesProperty && matchesType && matchesStatus;
  });

  // Sort reservations
  const sortedReservations = [...filteredReservations].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'checkInDate') {
      comparison = new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
    } else if (sortField === 'checkOutDate') {
      comparison = new Date(a.checkOutDate).getTime() - new Date(b.checkOutDate).getTime();
    } else if (sortField === 'createdDate') {
      comparison = new Date(a.createdDate || 0).getTime() - new Date(b.createdDate || 0).getTime();
    } else if (sortField === 'agreedRentalAmount') {
      comparison = a.agreedRentalAmount - b.agreedRentalAmount;
    } else if (sortField === 'guestName') {
      comparison = (a.guestName || '').localeCompare(b.guestName || '');
    } else if (sortField === 'propertyName') {
      comparison = (a.propertyName || '').localeCompare(b.propertyName || '');
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Top Header & View Mode Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAvailabilityChecker(!showAvailabilityChecker)}
            style={{
              background: showAvailabilityChecker ? '#2563eb' : '#ffffff',
              color: showAvailabilityChecker ? '#ffffff' : '#1e40af',
              border: showAvailabilityChecker ? '1px solid #1d4ed8' : '1px solid #bfdbfe',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Filter size={15} />
            {showAvailabilityChecker ? 'Hide Availability Checker' : '🔍 Check Property Availability'}
          </button>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            style={{
              background: showCalendar ? '#0f172a' : '#ffffff',
              color: showCalendar ? '#ffffff' : '#334155',
              border: showCalendar ? '1px solid #0f172a' : '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <CalendarIcon size={15} />
            {showCalendar ? 'Hide Booking Calendar' : '📅 Check Book Calendar'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

          <button className="btn btn-primary" onClick={() => onOpenCreateModal()}>
            <Plus size={18} /> Create New Reservation
          </button>
        </div>
      </div>

      {/* Property Availability Checker Section (Collapsible) */}
      {showAvailabilityChecker && (
        <AvailabilityChecker
          onReserveUnit={(propId, inDate, outDate) => {
            onOpenCreateModal({ propertyId: propId, checkInDate: inDate, checkOutDate: outDate });
          }}
        />
      )}

      {/* Booking Calendar Schedule (Collapsible - shown only when 'Check Book Calendar' is clicked) */}
      {showCalendar && (
        <ReservationCalendarView
          reservations={reservations}
          properties={properties}
          onSelectReservation={onOpenDetailModal}
        />
      )}

      {/* Toolbar Controls */}
      <div className="toolbar">
        <div className="search-filter-group" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <Filter size={16} /> Filter:
          </div>

          <select
            className="select-filter"
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
          >
            <option value="All">All Properties</option>
            {properties.map((p) => (
              <option key={p.propertyId} value={p.propertyId}>
                {p.propertyCode} - {p.propertyName}
              </option>
            ))}
          </select>

          <select
            className="select-filter"
            value={selectedRentalType}
            onChange={(e) => setSelectedRentalType(e.target.value)}
          >
            <option value="All">All Rental Types</option>
            <option value="ShortStay">Short Stay</option>
            <option value="LongStay">Long Stay</option>
          </select>

          <select
            className="select-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="Active">Active Bookings (Current & Future)</option>
            <option value="History">Completed & Cancelled (History)</option>
            <option value="All">All Statuses (Everything)</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Reserved">Reserved</option>
            <option value="Confirmed">Confirmed</option>
            <option value="CheckedIn">Checked-In</option>
            <option value="CheckedOut">Checked-Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: '6px' }}>
            <ArrowUpDown size={16} /> Sort:
          </div>

          <select
            className="select-filter"
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const parts = e.target.value.split('-');
              setSortField(parts[0] as SortField);
              setSortOrder(parts[1] as SortOrder);
            }}
          >
            <option value="createdDate-desc">Created Date (Newest First)</option>
            <option value="createdDate-asc">Created Date (Oldest First)</option>
            <option value="checkInDate-asc">Check-In Date (Earliest First)</option>
            <option value="checkInDate-desc">Check-In Date (Latest First)</option>
            <option value="checkOutDate-asc">Check-Out Date (Earliest First)</option>
            <option value="checkOutDate-desc">Check-Out Date (Latest First)</option>
            <option value="agreedRentalAmount-desc">Amount: High to Low</option>
            <option value="agreedRentalAmount-asc">Amount: Low to High</option>
            <option value="guestName-asc">Guest Name (A-Z)</option>
            <option value="propertyName-asc">Property Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Reservation List Table Card */}
      <div className="card">
        {sortedReservations.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={48} />
            <h3>No Reservations Found</h3>
            <p>No bookings match the selected property, rental type, or status filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th
                    style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleHeaderClick('propertyName')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Property
                      {sortField === 'propertyName' ? (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>

                  <th
                    style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleHeaderClick('guestName')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Guest / Tenant
                      {sortField === 'guestName' ? (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>

                  <th style={{ padding: '12px 16px' }}>Rental Type</th>

                  <th
                    style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleHeaderClick('createdDate')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Created Date
                      {sortField === 'createdDate' ? (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>

                  <th
                    style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleHeaderClick('checkInDate')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Check-In
                      {sortField === 'checkInDate' ? (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>

                  <th
                    style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleHeaderClick('checkOutDate')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Check-Out
                      {sortField === 'checkOutDate' ? (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>

                  <th
                    style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleHeaderClick('agreedRentalAmount')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Agreed Amount
                      {sortField === 'agreedRentalAmount' ? (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>

                  <th style={{ padding: '12px 16px' }}>Source</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedReservations.map((r) => {
                  const isCancelled = r.reservationStatus === 'Cancelled';

                  return (
                    <tr
                      key={r.reservationId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        opacity: isCancelled ? 0.6 : 1,
                        background: isCancelled ? '#fafafa' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <span className="property-code-badge">{r.propertyCode}</span>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.propertyName}</div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {r.guestCompanyName ? (
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              🏢 {r.guestCompanyName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Contact: {r.guestName}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontWeight: 600 }}>{r.guestName}</div>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: r.rentalType === 'ShortStay' ? 'var(--info-color)' : '#6b21a8' }}>
                          {r.rentalType === 'ShortStay' ? 'Short Stay' : 'Long Stay'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                        {formatDate(r.createdDate)}
                      </td>

                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        {formatDate(r.checkInDate)}
                      </td>

                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        {formatDate(r.checkOutDate)}
                      </td>

                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary-color)' }}>
                        {formatPesos(r.agreedRentalAmount)}
                      </td>

                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {r.bookingSource}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span className={`status-pill ${r.reservationStatus.toLowerCase()}`}>
                          <span className="status-dot"></span>
                          {r.reservationStatus === 'CheckedIn'
                            ? 'Checked-In'
                            : r.reservationStatus === 'CheckedOut'
                            ? 'Checked-Out'
                            : r.reservationStatus}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {r.reservationStatus === 'CheckedIn' && (
                            <button
                              className="btn btn-sm"
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                                whiteSpace: 'nowrap'
                              }}
                              onClick={() => setSelectedForCheckout(r)}
                              title="Perform Checkout Settlement"
                            >
                              <LogOut size={14} />
                              Check-Out
                            </button>
                          )}

                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenDetailModal(r)}
                            title="View Reservation Details"
                          >
                            <Eye size={14} />
                            View
                          </button>

                          {!isCancelled && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => onOpenEditModal(r)}
                                title="Edit Reservation"
                              >
                                <Edit2 size={14} />
                                Edit
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ color: 'var(--danger-color)' }}
                                onClick={() => onCancelReservation(r)}
                                title="Cancel Reservation"
                              >
                                <XCircle size={14} />
                                Cancel
                              </button>
                            </>
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

      {/* Checkout Settlement Modal */}
      {selectedForCheckout && (
        <CheckoutSettlementModal
          reservation={selectedForCheckout}
          isOpen={!!selectedForCheckout}
          onClose={() => setSelectedForCheckout(null)}
          onReceiptGenerated={(receipt) => {
            setSelectedForCheckout(null);
            window.dispatchEvent(new CustomEvent('open-receipt-modal', { detail: receipt }));
            if (onRefreshData) onRefreshData();
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
};
