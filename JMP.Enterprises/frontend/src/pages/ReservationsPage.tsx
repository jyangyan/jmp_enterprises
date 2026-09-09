import React, { useState } from 'react';
import { Plus, Eye, Edit2, XCircle, CalendarDays, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Reservation } from '../types/reservation';
import { Property } from '../types/property';
import { AvailabilityChecker } from '../components/AvailabilityChecker';

interface ReservationsPageProps {
  reservations: Reservation[];
  properties: Property[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (reservation: Reservation) => void;
  onOpenDetailModal: (reservation: Reservation) => void;
  onCancelReservation: (reservation: Reservation) => void;
}

type SortField = 'checkInDate' | 'checkOutDate' | 'agreedRentalAmount' | 'guestName' | 'propertyName';
type SortOrder = 'asc' | 'desc';

export const ReservationsPage: React.FC<ReservationsPageProps> = ({
  reservations,
  properties,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDetailModal,
  onCancelReservation,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('All');
  const [selectedRentalType, setSelectedRentalType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

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
    const matchesStatus = selectedStatus === 'All' || r.reservationStatus === selectedStatus;

    return matchesProperty && matchesType && matchesStatus;
  });

  // Sort reservations
  const sortedReservations = [...filteredReservations].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'checkInDate') {
      comparison = new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
    } else if (sortField === 'checkOutDate') {
      comparison = new Date(a.checkOutDate).getTime() - new Date(b.checkOutDate).getTime();
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
      {/* Property Availability Checker Section */}
      <AvailabilityChecker />

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
            <option value="All">All Statuses</option>
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

        <button className="btn btn-primary" onClick={onOpenCreateModal}>
          <Plus size={18} />
          Create Reservation
        </button>
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
    </div>
  );
};
