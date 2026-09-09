import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, RotateCcw, Users, Building, Phone, Mail } from 'lucide-react';
import { Guest } from '../types/guest';

interface GuestsPageProps {
  guests: Guest[];
  includeInactive: boolean;
  onToggleIncludeInactive: (val: boolean) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (guest: Guest) => void;
  onDeactivate: (guest: Guest) => void;
  onReactivate: (guest: Guest) => void;
}

export const GuestsPage: React.FC<GuestsPageProps> = ({
  guests,
  includeInactive,
  onToggleIncludeInactive,
  onOpenAddModal,
  onOpenEditModal,
  onDeactivate,
  onReactivate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuests = guests.filter((g) => {
    const query = searchQuery.toLowerCase();
    return (
      g.firstName.toLowerCase().includes(query) ||
      g.lastName.toLowerCase().includes(query) ||
      (g.companyName && g.companyName.toLowerCase().includes(query)) ||
      (g.mobileNumber && g.mobileNumber.toLowerCase().includes(query)) ||
      (g.emailAddress && g.emailAddress.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      {/* Toolbar Controls */}
      <div className="toolbar">
        <div className="search-filter-group">
          <div className="search-input-wrapper">
            <Search size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, company, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <label className="toggle-label">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => onToggleIncludeInactive(e.target.checked)}
            />
            Show Inactive Guests/Tenants
          </label>
        </div>

        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={18} />
          Add Guest / Tenant
        </button>
      </div>

      {/* Guest Table Card */}
      <div className="card">
        {filteredGuests.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No Guests or Tenants Found</h3>
            <p>Add short-stay guests or corporate tenants to start recording bookings.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Guest / Company Name</th>
                  <th style={{ padding: '12px 16px' }}>Contact Person</th>
                  <th style={{ padding: '12px 16px' }}>Mobile Number</th>
                  <th style={{ padding: '12px 16px' }}>Email Address</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((g) => {
                  const isInactive = !g.isActive;

                  return (
                    <tr 
                      key={g.guestId} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        opacity: isInactive ? 0.6 : 1,
                        background: isInactive ? '#fafafa' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        {g.companyName ? (
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Building size={14} color="var(--primary-color)" />
                              {g.companyName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Corporate Tenant
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {g.fullName}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {g.companyName ? (
                          <span>Contact: <strong>{g.fullName}</strong></span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {g.mobileNumber ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={13} color="var(--text-muted)" />
                            {g.mobileNumber}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {g.emailAddress ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={13} color="var(--text-muted)" />
                            {g.emailAddress}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span className={`status-pill ${isInactive ? 'inactive' : 'available'}`}>
                          <span className="status-dot"></span>
                          {isInactive ? 'Inactive' : 'Active'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {!isInactive ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onOpenEditModal(g)}
                              title="Edit Guest"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--danger-color)' }}
                              onClick={() => onDeactivate(g)}
                              title="Deactivate Guest"
                            >
                              <Trash2 size={14} />
                              Deactivate
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--success-color)' }}
                            onClick={() => onReactivate(g)}
                          >
                            <RotateCcw size={14} />
                            Reactivate
                          </button>
                        )}
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
