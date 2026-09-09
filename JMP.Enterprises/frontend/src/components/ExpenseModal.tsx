import React, { useState, useEffect } from 'react';
import { X, TrendingDown, Calendar, FileText, Tag, Building2 } from 'lucide-react';
import { Expense, CreateExpenseDto } from '../types/expense';
import { Property } from '../types/property';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dto: CreateExpenseDto) => Promise<void>;
  properties: Property[];
  initialData?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  properties,
  initialData,
}) => {
  const [propertyId, setPropertyId] = useState<number | ''>('');
  const [expenseDate, setExpenseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<string>('Maintenance');
  const [amount, setAmount] = useState<number | ''>('');
  const [vendorPayee, setVendorPayee] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [receiptReference, setReceiptReference] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setPropertyId(initialData.propertyId ?? '');
      setExpenseDate(initialData.expenseDate ? initialData.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0]);
      setCategory(initialData.category || 'Maintenance');
      setAmount(initialData.amount);
      setVendorPayee(initialData.vendorPayee || '');
      setDescription(initialData.description || '');
      setReceiptReference(initialData.receiptReference || '');
    } else {
      setPropertyId('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setCategory('Maintenance');
      setAmount('');
      setVendorPayee('');
      setDescription('');
      setReceiptReference('');
    }
    setError(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description for this expense.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        propertyId: propertyId !== '' ? Number(propertyId) : undefined,
        expenseDate: new Date(expenseDate).toISOString(),
        category,
        amount: numAmount,
        vendorPayee: vendorPayee.trim() || undefined,
        description: description.trim(),
        receiptReference: receiptReference.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingDown size={22} style={{ color: '#ef4444' }} />
            <h3 className="modal-title">{initialData ? 'Edit Property Expense' : 'Log Property Expense'}</h3>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {error && <div className="error-alert">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Property Selection */}
              <div className="form-group">
                <label className="form-label">Property Unit (Optional)</label>
                <select
                  className="form-control"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">General / Overall Business Overhead</option>
                  {properties.map((p) => (
                    <option key={p.propertyId} value={p.propertyId}>
                      {p.propertyName} ({p.propertyCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Expense Category */}
              <div className="form-group">
                <label className="form-label">Category <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="Maintenance">Maintenance & Repair</option>
                  <option value="Utilities">Utilities (Water/Electric)</option>
                  <option value="Cleaning">Cleaning & Housekeeping</option>
                  <option value="HOA Fees">HOA / Association Fees</option>
                  <option value="Taxes">Taxes & Permits</option>
                  <option value="Supplies">Supplies & Amenities</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Date */}
              <div className="form-group">
                <label className="form-label">
                  Expense Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                />
              </div>

              {/* Amount */}
              <div className="form-group">
                <label className="form-label">
                  Amount (₱) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  className="form-control"
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Vendor / Payee */}
            <div className="form-group">
              <label className="form-label">Vendor / Payee (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Meralco, Plumber John, Home Depot"
                value={vendorPayee}
                onChange={(e) => setVendorPayee(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Description / Purpose <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Repaired leaking bathroom faucet in Lily"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Receipt Reference */}
            <div className="form-group">
              <label className="form-label">Receipt / Invoice # (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. OR # 987654"
                value={receiptReference}
                onChange={(e) => setReceiptReference(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" style={{ background: '#dc2626' }} disabled={saving}>
              {saving ? 'Saving Expense...' : initialData ? 'Update Expense' : 'Log Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
