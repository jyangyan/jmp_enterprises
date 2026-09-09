import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Property, CreatePropertyDto } from '../types/property';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePropertyDto) => Promise<void>;
  initialData?: Property | null;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<CreatePropertyDto>({
    propertyName: '',
    propertyCode: '',
    location: '',
    description: '',
    defaultMonthlyRate: 0,
    defaultDailyRate: 0,
    status: 'Available',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        propertyName: initialData.propertyName || '',
        propertyCode: initialData.propertyCode || '',
        location: initialData.location || '',
        description: initialData.description || '',
        defaultMonthlyRate: initialData.defaultMonthlyRate || 0,
        defaultDailyRate: initialData.defaultDailyRate || 0,
        status: initialData.status || 'Available',
      });
    } else {
      setFormData({
        propertyName: '',
        propertyCode: '',
        location: '',
        description: '',
        defaultMonthlyRate: 0,
        defaultDailyRate: 0,
        status: 'Available',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyName.trim() || !formData.propertyCode.trim()) {
      setError('Property Code and Property Name are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? 'Edit Property' : 'Add New Property'}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-alert">{error}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label>Property Code *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. LILY, LALA"
                  value={formData.propertyCode}
                  onChange={(e) => setFormData({ ...formData, propertyCode: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Property Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Lily Unit 1"
                  value={formData.propertyName}
                  onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Matina, Davao City"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Additional unit details or amenities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Monthly Rate (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.defaultMonthlyRate}
                  onChange={(e) => setFormData({ ...formData, defaultMonthlyRate: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label>Daily Rate (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.defaultDailyRate}
                  onChange={(e) => setFormData({ ...formData, defaultDailyRate: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group full-width">
                <label>Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Update Property' : 'Save Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
