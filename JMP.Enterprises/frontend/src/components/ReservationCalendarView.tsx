import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Building2, 
  User, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Sparkles 
} from 'lucide-react';
import { Reservation } from '../types/reservation';
import { Property } from '../types/property';

interface ReservationCalendarViewProps {
  reservations: Reservation[];
  properties: Property[];
  onSelectReservation?: (reservation: Reservation) => void;
  onOpenCreateForDate?: (dateStr: string, propertyId?: number) => void;
}

export const ReservationCalendarView: React.FC<ReservationCalendarViewProps> = ({
  reservations,
  properties,
  onSelectReservation,
  onOpenCreateForDate,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedPropId, setSelectedPropId] = useState<string>('All');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate Days in Month Grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  // Active Non-Cancelled Reservations
  const activeReservations = reservations.filter(r => r.reservationStatus !== 'Cancelled');

  const filteredProperties = selectedPropId === 'All'
    ? properties
    : properties.filter(p => p.propertyId === Number(selectedPropId));

  // Build grid calendar array
  const calendarCells = [];
  // Empty lead cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let day = 1; day <= totalDaysInMonth; day++) {
    calendarCells.push(day);
  }

  // Format YYYY-MM-DD
  const formatCellDateStr = (dayNum: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = dayNum.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      marginBottom: '24px'
    }}>
      {/* Calendar Header Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Booking Schedule & Availability Calendar
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Crossed out dates indicate occupied unit schedule
            </p>
          </div>
        </div>

        {/* Property Selector & Month Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} style={{ color: '#64748b' }} />
            <select
              value={selectedPropId}
              onChange={e => setSelectedPropId(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#0f172a',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Units (Lily, Lala, Pamae)</option>
              {properties.map(p => (
                <option key={p.propertyId} value={p.propertyId}>
                  {p.propertyName} ({p.propertyCode})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={handlePrevMonth}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', padding: '0 12px', minWidth: '140px', textAlign: 'center' }}>
              {monthNames[month]} {year}
            </span>

            <button
              onClick={handleNextMonth}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={handleToday}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        padding: '10px 16px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '16px',
        fontSize: '0.82rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontWeight: 700, color: '#475569' }}>Legend:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            background: '#ecfdf5',
            color: '#15803d',
            border: '1px solid #a7f3d0',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '0.75rem'
          }}>
            15
          </span>
          <span>Available Day</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            background: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '0.75rem',
            textDecoration: 'line-through'
          }}>
            15
          </span>
          <span>Booked / Occupied (Crossed Out)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            background: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fde68a',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '0.75rem'
          }}>
            15
          </span>
          <span>Reserved / Confirmed</span>
        </div>
      </div>

      {/* Calendar Grid Header (Days of week) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.82rem',
        color: '#64748b',
        marginBottom: '8px',
        textTransform: 'uppercase'
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ padding: '6px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px'
      }}>
        {calendarCells.map((dayNum, idx) => {
          if (dayNum === null) {
            return (
              <div
                key={`empty-${idx}`}
                style={{
                  background: '#f8fafc',
                  borderRadius: '10px',
                  minHeight: '110px',
                  opacity: 0.4
                }}
              />
            );
          }

          const cellDateStr = formatCellDateStr(dayNum);
          const isToday = cellDateStr === todayStr;

          // Find reservations for this date
          const cellReservations = activeReservations.filter(r => {
            if (selectedPropId !== 'All' && r.propertyId !== Number(selectedPropId)) return false;
            const inDate = r.checkInDate ? r.checkInDate.split('T')[0] : '';
            const outDate = r.checkOutDate ? r.checkOutDate.split('T')[0] : '';
            return cellDateStr >= inDate && cellDateStr < outDate;
          });

          const isFullyBooked = selectedPropId !== 'All'
            ? cellReservations.length > 0
            : cellReservations.length >= properties.length;

          const isPartiallyBooked = cellReservations.length > 0 && !isFullyBooked;

          return (
            <div
              key={`day-${dayNum}`}
              style={{
                background: isFullyBooked ? '#fef2f2' : isPartiallyBooked ? '#fffbe6' : isToday ? '#f0f9ff' : '#ffffff',
                border: isToday
                  ? '2px solid #0284c7'
                  : isFullyBooked
                  ? '1px solid #fca5a5'
                  : isPartiallyBooked
                  ? '1px solid #ffe58f'
                  : '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '8px',
                minHeight: '110px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              {/* Day Number Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textDecoration: isFullyBooked ? 'line-through' : 'none',
                  background: isToday ? '#0284c7' : 'transparent',
                  color: isToday ? '#ffffff' : isFullyBooked ? '#b91c1c' : '#0f172a',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {dayNum}
                </span>

                {isToday && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                    Today
                  </span>
                )}
              </div>

              {/* Reservation Schedule Cards inside cell */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '75px' }}>
                {cellReservations.length === 0 ? (
                  <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>
                    ✓ Available
                  </span>
                ) : (
                  cellReservations.map(r => {
                    const isCheckedIn = r.reservationStatus === 'CheckedIn';
                    return (
                      <div
                        key={r.reservationId}
                        onClick={() => onSelectReservation && onSelectReservation(r)}
                        style={{
                          background: isCheckedIn ? '#dc2626' : '#2563eb',
                          color: '#ffffff',
                          borderRadius: '4px',
                          padding: '3px 6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1px'
                        }}
                        title={`Click to view reservation for ${r.guestName} (${r.propertyName})`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ textDecoration: 'line-through', opacity: 0.9 }}>
                            {r.propertyCode || r.propertyName}
                          </span>
                          <span style={{ fontSize: '0.6rem', opacity: 0.85 }}>
                            {isCheckedIn ? 'Checked-In' : 'Confirmed'}
                          </span>
                        </div>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          👤 {r.guestName}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
