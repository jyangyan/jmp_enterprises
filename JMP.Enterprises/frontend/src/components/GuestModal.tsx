import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Guest, CreateGuestDto } from '../types/guest';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateGuestDto) => Promise<void>;
  initialData?: Guest | null;
}

export const GuestModal: React.FC<GuestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<CreateGuestDto>({
    firstName: '',
    lastName: '',
    companyName: '',
    mobileNumber: '',
    emailAddress: '',
    address: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        companyName: initialData.companyName || '',
        mobileNumber: initialData.mobileNumber || '',
        emailAddress: initialData.emailAddress || '',
        address: initialData.address || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        companyName: '',
        mobileNumber: '',
        emailAddress: '',
        address: '',
        notes: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First Name and Last Name are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving guest/tenant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? 'Edit Guest / Tenant' : 'Add New Guest / Tenant'}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-alert">{error}</div>}

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Company / Corporate Name (Optional for Individuals)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. CTI Engineering International Co., Ltd."
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Juan"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Dela Cruz"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 0917 123 4567"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. guest@example.com"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Billing / Permanent Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Davao City, Philippines"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Special preferences, corporate contact notes, etc..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Update Guest' : 'Save Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
