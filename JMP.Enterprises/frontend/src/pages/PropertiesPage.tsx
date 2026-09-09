import React, { useState } from 'react';
import { Search, Plus, MapPin, Edit2, Trash2, RotateCcw, Building2 } from 'lucide-react';
import { Property } from '../types/property';

interface PropertiesPageProps {
  properties: Property[];
  includeInactive: boolean;
  onToggleIncludeInactive: (val: boolean) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (property: Property) => void;
  onDeactivate: (property: Property) => void;
  onReactivate: (property: Property) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({
  properties,
  includeInactive,
  onToggleIncludeInactive,
  onOpenAddModal,
  onOpenEditModal,
  onDeactivate,
  onReactivate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.propertyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ||
      (!p.isActive && statusFilter === 'Inactive') ||
      (p.isActive && p.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  const formatPesos = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

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
              placeholder="Search by code, name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
            {includeInactive && <option value="Inactive">Inactive</option>}
          </select>

          <label className="toggle-label">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => onToggleIncludeInactive(e.target.checked)}
            />
            Show Inactive Properties
          </label>
        </div>

        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={18} />
          Add Property
        </button>
      </div>

      {/* Property Cards Grid */}
      {filteredProperties.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} />
          <h3>No Properties Match Your Search</h3>
          <p>Try adjusting your search query, status filter, or enable "Show Inactive Properties".</p>
        </div>
      ) : (
        <div className="properties-grid">
          {filteredProperties.map((p) => {
            const isInactive = !p.isActive || p.status === 'Inactive';

            return (
              <div
                key={p.propertyId}
                className={`property-card ${isInactive ? 'inactive' : ''}`}
              >
                <div>
                  <div className="property-card-header">
                    <div>
                      <span className="property-code-badge">{p.propertyCode}</span>
                      <h3 className="property-title">{p.propertyName}</h3>
                    </div>
                    <span
                      className={`status-pill ${
                        isInactive ? 'inactive' : p.status.toLowerCase()
                      }`}
                    >
                      <span className="status-dot"></span>
                      {isInactive ? 'Inactive' : p.status}
                    </span>
                  </div>

                  {p.location && (
                    <div className="property-location">
                      <MapPin size={14} />
                      <span>{p.location}</span>
                    </div>
                  )}

                  <p className="property-description">
                    {p.description || 'No description provided.'}
                  </p>

                  <div className="rates-box">
                    <div className="rate-item">
                      <div className="rate-label">Monthly Rate</div>
                      <div className="rate-amount">{formatPesos(p.defaultMonthlyRate)}</div>
                    </div>
                    <div className="rate-item">
                      <div className="rate-label">Daily Rate</div>
                      <div className="rate-amount">{formatPesos(p.defaultDailyRate)}</div>
                    </div>
                  </div>
                </div>

                <div className="property-card-actions">
                  {!isInactive ? (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => onOpenEditModal(p)}
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger-color)' }}
                        onClick={() => onDeactivate(p)}
                        title="Deactivate Property"
                      >
                        <Trash2 size={14} />
                        Deactivate
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', color: 'var(--success-color)' }}
                      onClick={() => onReactivate(p)}
                    >
                      <RotateCcw size={14} />
                      Reactivate Property
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
