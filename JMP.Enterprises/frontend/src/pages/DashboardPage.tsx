import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  CalendarDays, 
  ArrowRight, 
  Plus, 
  LogIn, 
  LogOut, 
  User, 
  Building,
  RefreshCw,
  TrendingUp,
  Check
} from 'lucide-react';
import { Property } from '../types/property';
import { Reservation } from '../types/reservation';

interface DashboardPageProps {
  properties: Property[];
  reservations: Reservation[];
  onNavigateToProperties: () => void;
  onNavigateToReservations: () => void;
  onOpenAddPropertyModal: () => void;
  onOpenCreateReservationModal: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  properties,
  reservations,
  onNavigateToProperties,
  onNavigateToReservations,
  onOpenAddPropertyModal,
  onOpenCreateReservationModal,
  onRefresh,
  isRefreshing = false,
}) => {
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2500);
    }
  };
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const totalProperties = properties.length;

  // Find property IDs that are currently occupied today
  // (have an active reservation where today falls within check-in to check-out)
  const occupiedPropertyIds = new Set(
    reservations
      .filter((r) => {
        if (r.reservationStatus === 'Cancelled' || r.reservationStatus === 'CheckedOut') return false;
        const checkIn = new Date(r.checkInDate);
        checkIn.setHours(0, 0, 0, 0);
        const checkOut = new Date(r.checkOutDate);
        checkOut.setHours(0, 0, 0, 0);
        return now >= checkIn && now < checkOut;
      })
      .map((r) => r.propertyId)
  );

  const availableProperties = properties.filter(
    (p) => p.isActive && !occupiedPropertyIds.has(p.propertyId)
  ).length;
  
  const activeReservations = reservations.filter(
    (r) => r.reservationStatus === 'Confirmed' || r.reservationStatus === 'CheckedIn' || r.reservationStatus === 'Reserved'
  ).length;

  const upcomingCheckIns = reservations.filter((r) => {
    if (r.reservationStatus === 'Cancelled' || r.reservationStatus === 'CheckedOut') return false;
    const checkIn = new Date(r.checkInDate);
    return checkIn >= now;
  }).length;

  const upcomingCheckOuts = reservations.filter((r) => {
    if (r.reservationStatus !== 'CheckedIn' && r.reservationStatus !== 'Confirmed') return false;
    const checkOut = new Date(r.checkOutDate);
    return checkOut >= now;
  }).length;

  // Current Occupancy list (CheckedIn or currently active)
  const currentOccupancy = reservations.filter((r) => {
    if (r.reservationStatus === 'Cancelled' || r.reservationStatus === 'CheckedOut') return false;
    const checkIn = new Date(r.checkInDate);
    const checkOut = new Date(r.checkOutDate);
    return now >= checkIn && now <= checkOut;
  });

  // Upcoming Reservations ordered by nearest CheckInDate
  const upcomingReservationsList = reservations
    .filter((r) => {
      if (r.reservationStatus === 'Cancelled' || r.reservationStatus === 'CheckedOut') return false;
      const checkIn = new Date(r.checkInDate);
      return checkIn >= now;
    })
    .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())
    .slice(0, 5);

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
      {/* Dashboard Action Header with Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Rental Management Dashboard
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Real-time occupancy status, active bookings, and automated trend analytics
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '8px 16px',
              background: justRefreshed ? '#dcfce7' : '#ffffff',
              color: justRefreshed ? '#15803d' : '#334155',
              borderColor: justRefreshed ? '#86efac' : '#cbd5e1'
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
                <span>Refresh Dashboard</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Properties</div>
            <div className="stat-value">{totalProperties}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Available Units</div>
            <div className="stat-value">{availableProperties}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <CalendarDays size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Bookings</div>
            <div className="stat-value">{activeReservations}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <LogIn size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Upcoming Check-Ins</div>
            <div className="stat-value">{upcomingCheckIns}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon gray">
            <LogOut size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Upcoming Check-Outs</div>
            <div className="stat-value">{upcomingCheckOuts}</div>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="card" style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
            JMP Enterprises Rental Operations
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Short Stay (daily/nightly) & Long Stay (monthly) rental management dashboard.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={onOpenCreateReservationModal}>
            <Plus size={16} />
            New Reservation
          </button>
          <button className="btn btn-secondary" onClick={onOpenAddPropertyModal}>
            <Plus size={16} />
            Add Unit
          </button>
        </div>
      </div>

      {/* Current Occupancy Section */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            CURRENT OCCUPANCY
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToReservations}>
            View All Reservations
          </button>
        </div>

        {currentOccupancy.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', background: '#f8fafc', borderRadius: '6px' }}>
            No guests currently checked in for today ({formatDate(now.toISOString())}).
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 14px' }}>Property</th>
                  <th style={{ padding: '10px 14px' }}>Current Guest / Tenant</th>
                  <th style={{ padding: '10px 14px' }}>Rental Type</th>
                  <th style={{ padding: '10px 14px' }}>Check-In</th>
                  <th style={{ padding: '10px 14px' }}>Check-Out</th>
                  <th style={{ padding: '10px 14px' }}>Agreed Amount</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentOccupancy.map((r) => (
                  <tr key={r.reservationId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <span className="property-code-badge">{r.propertyCode}</span>
                      <div style={{ fontWeight: 700 }}>{r.propertyName}</div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {r.guestCompanyName ? (
                        <div>
                          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={13} color="var(--primary-color)" /> {r.guestCompanyName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Contact: {r.guestName}</div>
                        </div>
                      ) : (
                        <div style={{ fontWeight: 600 }}>{r.guestName}</div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                      {r.rentalType === 'ShortStay' ? 'Short Stay' : 'Long Stay'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>{formatDate(r.checkInDate)}</td>
                    <td style={{ padding: '10px 14px' }}>{formatDate(r.checkOutDate)}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--primary-color)' }}>
                      {formatPesos(r.agreedRentalAmount)}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`status-pill ${r.reservationStatus.toLowerCase()}`}>
                        <span className="status-dot"></span>
                        {r.reservationStatus === 'CheckedIn' ? 'Checked-In' : r.reservationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming Reservations Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            UPCOMING RESERVATIONS
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToReservations}>
            Go to Reservations
            <ArrowRight size={14} />
          </button>
        </div>

        {upcomingReservationsList.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', background: '#f8fafc', borderRadius: '6px' }}>
            No upcoming reservations scheduled.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 14px' }}>Property</th>
                  <th style={{ padding: '10px 14px' }}>Guest / Company</th>
                  <th style={{ padding: '10px 14px' }}>Check-In Date</th>
                  <th style={{ padding: '10px 14px' }}>Check-Out Date</th>
                  <th style={{ padding: '10px 14px' }}>Rental Type</th>
                  <th style={{ padding: '10px 14px' }}>Agreed Amount</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingReservationsList.map((r) => (
                  <tr key={r.reservationId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <span className="property-code-badge">{r.propertyCode}</span>
                      <span style={{ fontWeight: 700, marginLeft: '6px' }}>{r.propertyName}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {r.guestCompanyName ? r.guestCompanyName : r.guestName}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--primary-color)' }}>
                      {formatDate(r.checkInDate)}
                    </td>
                    <td style={{ padding: '10px 14px' }}>{formatDate(r.checkOutDate)}</td>
                    <td style={{ padding: '10px 14px' }}>{r.rentalType === 'ShortStay' ? 'Short Stay' : 'Long Stay'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{formatPesos(r.agreedRentalAmount)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`status-pill ${r.reservationStatus.toLowerCase()}`}>
                        <span className="status-dot"></span>
                        {r.reservationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
