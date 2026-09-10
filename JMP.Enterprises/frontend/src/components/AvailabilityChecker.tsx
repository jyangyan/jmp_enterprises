import React, { useState } from 'react';
import { CalendarSearch, CheckCircle2, XCircle, Clock, PlusCircle } from 'lucide-react';
import { PropertyAvailability } from '../types/reservation';
import { reservationApi } from '../api/reservationApi';

interface AvailabilityCheckerProps {
  onReserveUnit?: (propertyId: number, checkIn: string, checkOut: string) => void;
}

export const AvailabilityChecker: React.FC<AvailabilityCheckerProps> = ({ onReserveUnit }) => {
  const [checkIn, setCheckIn] = useState<string>(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState<string>(new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]);
  const [results, setResults] = useState<PropertyAvailability[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('Check-Out Date must be later than Check-In Date.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await reservationApi.checkAvailability(checkIn, checkOut);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to check availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <CalendarSearch size={20} color="var(--primary-color)" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Property Availability Checker</h3>
      </div>

      <form onSubmit={handleCheck} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', marginBottom: results ? '20px' : '0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Check-In Date</label>
          <input
            type="date"
            className="form-control"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Check-Out Date</label>
          <input
            type="date"
            className="form-control"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Checking...' : 'Check Availability'}
        </button>
      </form>

      {error && <div className="error-alert" style={{ marginTop: '12px' }}>{error}</div>}

      {results && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📅 Availability Results for:</span>
            <span style={{ background: '#eff6ff', padding: '2px 8px', borderRadius: '6px', color: '#1d4ed8' }}>
              {formatDateDisplay(checkIn)} ➔ {formatDateDisplay(checkOut)}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {results.map((item) => (
              <div
                key={item.propertyId}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: item.isAvailable ? '#a7f3d0' : '#fecaca',
                  background: item.isAvailable ? '#ecfdf5' : '#fef2f2',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div>
                  <span className="property-code-badge">{item.propertyCode}</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>
                    {item.propertyName}
                  </div>
                  {!item.isAvailable && item.currentReservationGuest && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger-text)', marginTop: '4px' }}>
                      Booked by: <strong>{item.currentReservationGuest}</strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {item.isAvailable ? (
                    <>
                      <span className="status-pill available" style={{ fontSize: '0.72rem' }}>
                        <CheckCircle2 size={12} /> AVAILABLE
                      </span>
                      {onReserveUnit && (
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                          onClick={() => onReserveUnit(item.propertyId, checkIn, checkOut)}
                          title="Create reservation with pre-filled unit and dates"
                        >
                          <PlusCircle size={13} /> Reserve Unit
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="status-pill inactive" style={{ fontSize: '0.72rem' }}>
                      <XCircle size={12} /> BOOKED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
