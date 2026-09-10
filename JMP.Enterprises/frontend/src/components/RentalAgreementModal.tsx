import React, { useState } from 'react';
import { RentalAgreement, UpdateRentalAgreementDto } from '../types/rentalAgreement';
import { rentalAgreementApi } from '../api/rentalAgreementApi';
import { 
  X, 
  Printer, 
  Download, 
  Edit3, 
  CheckCircle, 
  FileText, 
  ShieldCheck, 
  Building2, 
  User, 
  Calendar, 
  DollarSign, 
  Dog, 
  Zap, 
  AlertCircle 
} from 'lucide-react';

interface RentalAgreementModalProps {
  agreement: RentalAgreement;
  isOpen: boolean;
  onClose: () => void;
  onAgreementUpdated: (updated: RentalAgreement) => void;
}

export const RentalAgreementModal: React.FC<RentalAgreementModalProps> = ({
  agreement,
  isOpen,
  onClose,
  onAgreementUpdated
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(agreement.agreementStatus === 'Draft');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<UpdateRentalAgreementDto>({
    agreementDate: agreement.agreementDate ? agreement.agreementDate.split('T')[0] : new Date().toISOString().split('T')[0],
    rentalStartDate: agreement.rentalStartDate ? agreement.rentalStartDate.split('T')[0] : '',
    rentalEndDate: agreement.rentalEndDate ? agreement.rentalEndDate.split('T')[0] : '',
    numberOfMonths: agreement.numberOfMonths || 1,
    monthlyRent: agreement.monthlyRent || 0,
    reservationFee: agreement.reservationFee || 0,
    isReservationFeeDeductible: agreement.isReservationFeeDeductible ?? true,
    securityDeposit: agreement.securityDeposit || 0,
    advancePayment: agreement.advancePayment || 0,
    hasPet: agreement.hasPet || false,
    petDescription: agreement.petDescription || '',
    maximumOccupants: agreement.maximumOccupants || 2,
    electricityResponsibility: agreement.electricityResponsibility || 'Tenant',
    waterResponsibility: agreement.waterResponsibility || 'Tenant',
    internetResponsibility: agreement.internetResponsibility || 'Tenant',
    additionalTerms: agreement.additionalTerms || '',
    earlyTerminationTerms: agreement.earlyTerminationTerms || 'Early termination of the rental agreement shall be subject to prior notice and mutual agreement between the Lessor and Lessee.'
  });

  if (!isOpen) return null;

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updated = await rentalAgreementApi.updateDraft(agreement.rentalAgreementId, formData);
      onAgreementUpdated(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save draft changes');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    const confirmFinalize = window.confirm(
      'Once finalized, this agreement will be preserved as the official version. Continue?'
    );
    if (!confirmFinalize) return;

    setLoading(true);
    setError(null);
    try {
      const finalized = await rentalAgreementApi.finalize(agreement.rentalAgreementId);
      onAgreementUpdated(finalized);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to finalize agreement');
    } finally {
      setLoading(false);
    }
  };

  const triggerIframePrint = () => {
    const content = document.getElementById('printable-contract-document');
    if (!content) {
      alert('Contract document is not ready.');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!frameDoc) return;

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rental Agreement - ${agreement.agreementNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 18mm;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #111827;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            * {
              box-sizing: border-box;
            }
            img {
              max-height: 65px;
              width: auto;
            }
            .no-print {
              display: none !important;
            }
            div {
              box-shadow: none !important;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 300);
  };

  const handlePrint = () => {
    if (isEditing) {
      setIsEditing(false);
      setTimeout(() => {
        triggerIframePrint();
      }, 300);
    } else {
      triggerIframePrint();
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    }}>

      {/* Robust Print CSS styling */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-contract-document, #printable-contract-document * {
            visibility: visible !important;
          }
          #printable-contract-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        overflow: 'hidden'
      }}>
        
        {/* Header Controls (No-Print) */}
        <div className="no-print" style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={22} style={{ color: '#2563eb' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Rental Agreement: {agreement.agreementNumber}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: agreement.agreementStatus === 'Finalized' ? 'rgba(16, 185, 129, 0.15)' : agreement.agreementStatus === 'Draft' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: agreement.agreementStatus === 'Finalized' ? '#059669' : agreement.agreementStatus === 'Draft' ? '#d97706' : '#dc2626'
                }}>
                  {agreement.agreementStatus}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {agreement.propertyName} • {agreement.tenantName}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {agreement.agreementStatus === 'Draft' && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={16} />
                Edit Draft
              </button>
            )}

            {agreement.agreementStatus === 'Draft' && (
              <button
                onClick={handleFinalize}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                }}
              >
                <CheckCircle size={16} />
                Finalize Agreement
              </button>
            )}

            <button
              onClick={handlePrint}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Printer size={16} />
              Print / Save PDF
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                padding: '6px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="no-print" style={{ padding: '12px 24px', background: '#fef2f2', color: '#dc2626', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Modal Main Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* EDIT DRAFT MODE */}
          {isEditing && agreement.agreementStatus === 'Draft' ? (
            <form onSubmit={handleSaveDraft} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                  Auto-Populated Details (From Reservation & Property)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem', color: '#475569' }}>
                  <div><strong>Tenant / Lessee:</strong> {agreement.tenantName} {agreement.tenantCompanyName ? `(${agreement.tenantCompanyName})` : ''}</div>
                  <div><strong>Property Unit:</strong> {agreement.propertyName}</div>
                  <div><strong>Rental Start:</strong> {formatDate(agreement.rentalStartDate)}</div>
                  <div><strong>Rental End:</strong> {formatDate(agreement.rentalEndDate)}</div>
                  <div><strong>Monthly Rent:</strong> {formatCurrency(agreement.monthlyRent)}</div>
                  <div><strong>Reservation Fee:</strong> {formatCurrency(agreement.reservationFee)}</div>
                  <div><strong>Security Deposit:</strong> {formatCurrency(agreement.securityDeposit)}</div>
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Agreement Date
                  </label>
                  <input
                    type="date"
                    value={formData.agreementDate}
                    onChange={(e) => setFormData({ ...formData, agreementDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Advance Payment (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.advancePayment}
                    onChange={(e) => setFormData({ ...formData, advancePayment: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Maximum Occupants
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maximumOccupants}
                    onChange={(e) => setFormData({ ...formData, maximumOccupants: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Pet Allowed?
                  </label>
                  <select
                    value={formData.hasPet ? 'Yes' : 'No'}
                    onChange={(e) => setFormData({ ...formData, hasPet: e.target.value === 'Yes' })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {formData.hasPet && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Pet Description (e.g. 1 Labrador)
                    </label>
                    <input
                      type="text"
                      placeholder="Specify approved pet type and count"
                      value={formData.petDescription || ''}
                      onChange={(e) => setFormData({ ...formData, petDescription: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                )}
              </div>

              {/* Utility Responsibility */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                  Utility Responsibilities
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Electricity
                    </label>
                    <select
                      value={formData.electricityResponsibility}
                      onChange={(e) => setFormData({ ...formData, electricityResponsibility: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="Tenant">Tenant (Submeter Billed)</option>
                      <option value="JMP Rental Property">JMP Rental Property</option>
                      <option value="Included in Rent">Included in Rent</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Water
                    </label>
                    <select
                      value={formData.waterResponsibility}
                      onChange={(e) => setFormData({ ...formData, waterResponsibility: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="Tenant">Tenant</option>
                      <option value="JMP Rental Property">JMP Rental Property</option>
                      <option value="Included in Rent">Included in Rent</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Internet
                    </label>
                    <select
                      value={formData.internetResponsibility}
                      onChange={(e) => setFormData({ ...formData, internetResponsibility: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="Tenant">Tenant</option>
                      <option value="JMP Rental Property">JMP Rental Property</option>
                      <option value="Included in Rent">Included in Rent</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Terms */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Additional Special Terms (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter any additional agreed conditions (parking, specific terms, etc.)"
                  value={formData.additionalTerms || ''}
                  onChange={(e) => setFormData({ ...formData, additionalTerms: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600 }}
                >
                  Cancel Edit
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 600 }}
                >
                  Save Draft Changes
                </button>
              </div>
            </form>
          ) : (
            
            /* OFFICIAL PRINTABLE CONTRACT PREVIEW DOCUMENT */
            <div id="printable-contract-document" className="printable-contract-area" style={{
              background: '#ffffff',
              padding: '40px',
              fontFamily: "'Times New Roman', Times, serif",
              color: '#111827',
              lineHeight: 1.6,
              maxWidth: '780px',
              margin: '0 auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              position: 'relative'
            }}>

              {/* Draft Watermark Badge */}
              {agreement.agreementStatus === 'Draft' && (
                <div className="no-print" style={{
                  position: 'absolute',
                  top: '120px',
                  right: '40px',
                  border: '3px solid rgba(239, 68, 68, 0.3)',
                  color: 'rgba(239, 68, 68, 0.3)',
                  fontSize: '2rem',
                  fontWeight: 900,
                  padding: '4px 16px',
                  borderRadius: '8px',
                  letterSpacing: '0.2em',
                  transform: 'rotate(-10deg)',
                  userSelect: 'none'
                }}>
                  DRAFT
                </div>
              )}

              {/* Contract Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '16px', marginBottom: '24px' }}>
                <img
                  src="/logo.png"
                  alt="JMP Logo"
                  style={{ height: '65px', width: 'auto', objectFit: 'contain', margin: '0 auto 8px', display: 'block' }}
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  JMP Rental Property
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#4b5563' }}>
                  Deo Homes Residences, Brgy. Salvacion, Ormoc City, Leyte
                </p>
              </div>

              {/* Title & Ref */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', textDecoration: 'underline' }}>
                  RENTAL AGREEMENT
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '12px', fontWeight: 600 }}>
                  <span>Agreement No: <strong>{agreement.agreementNumber}</strong></span>
                  <span>Date: <strong>{formatDate(agreement.agreementDate)}</strong></span>
                </div>
              </div>

              {/* INTRODUCTION */}
              <div style={{ marginBottom: '18px', textAlign: 'justify', fontSize: '0.95rem' }}>
                This Rental Agreement is entered into between <strong>JMP Rental Property</strong>, hereinafter referred to as the <strong>LESSOR</strong>, and <strong>{agreement.tenantName}</strong> {agreement.tenantCompanyName ? `(representing ${agreement.tenantCompanyName})` : ''}, hereinafter referred to as the <strong>LESSEE</strong>.
              </div>

              {/* CONTRACT SECTIONS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.92rem' }}>
                
                {/* 1. PROPERTY */}
                <div>
                  <strong>1. RENTAL PROPERTY</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    The LESSOR agrees to rent to the LESSEE the property/unit identified as <strong>Unit {agreement.propertyName} ({agreement.propertyCode})</strong>, located at Deo Homes Residences, Brgy. Salvacion, Ormoc City, Leyte.
                  </div>
                </div>

                {/* 2. RENTAL TERM */}
                <div>
                  <strong>2. RENTAL TERM</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    The rental period shall be for a duration of <strong>{agreement.numberOfMonths} Month(s)</strong>, commencing on <strong>{formatDate(agreement.rentalStartDate)}</strong> and ending on <strong>{formatDate(agreement.rentalEndDate)}</strong>.
                  </div>
                </div>

                {/* 3. MONTHLY RENT */}
                <div>
                  <strong>3. MONTHLY RENT</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    The monthly rental rate shall be <strong>{formatCurrency(agreement.monthlyRent)}</strong>, payable according to the agreed monthly billing schedule.
                  </div>
                </div>

                {/* 4. RESERVATION FEE */}
                <div>
                  <strong>4. RESERVATION FEE</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    The LESSEE has paid a reservation fee of <strong>{formatCurrency(agreement.reservationFee)}</strong>. {agreement.isReservationFeeDeductible ? 'The reservation fee shall be credited toward the rental amount.' : 'The reservation fee is separate from the monthly rental amount.'}
                  </div>
                </div>

                {/* 5. ADVANCE PAYMENT */}
                <div>
                  <strong>5. ADVANCE PAYMENT</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    The LESSEE has provided an advance rental payment of <strong>{formatCurrency(agreement.advancePayment)}</strong>, which shall be applied according to the agreed rental terms.
                  </div>
                </div>

                {/* 6. SECURITY DEPOSIT */}
                <div>
                  <strong>6. SECURITY DEPOSIT</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    The LESSEE shall maintain a Security Deposit of <strong>{formatCurrency(agreement.securityDeposit)}</strong>. The Security Deposit is held separately and is subject to the rental terms and final property inspection upon turnover. It is not classified as monthly rental income.
                  </div>
                </div>

                {/* 7. UTILITIES */}
                <div>
                  <strong>7. UTILITIES & SERVICES RESPONSIBILITY</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    Responsibility for utilities is designated as follows:
                    <ul style={{ margin: '6px 0 6px 30px', padding: 0 }}>
                      <li><strong>Electricity:</strong> {agreement.electricityResponsibility} {agreement.electricityResponsibility === 'Tenant' && '— Electricity consumption shall be billed separately based on the property\'s submeter reading and the applicable rate per kWh.'}</li>
                      <li><strong>Water:</strong> {agreement.waterResponsibility}</li>
                      <li><strong>Internet:</strong> {agreement.internetResponsibility}</li>
                    </ul>
                  </div>
                </div>

                {/* 8. OCCUPANCY */}
                <div>
                  <strong>8. MAXIMUM OCCUPANCY</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    The maximum allowable occupants for the premises shall be <strong>{agreement.maximumOccupants} Person(s)</strong>. The premises are intended solely for the registered tenant and authorized occupants.
                  </div>
                </div>

                {/* 9. PETS */}
                <div>
                  <strong>9. PET POLICY</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    {agreement.hasPet ? (
                      <span>Approved Pet: <strong>{agreement.petDescription || 'Declared Pet'}</strong>. Only the approved pet is permitted in the premises. Additional pets require prior written consent from the LESSOR.</span>
                    ) : (
                      <span>No pets shall be kept in the premises without prior written approval from the LESSOR.</span>
                    )}
                  </div>
                </div>

                {/* 10. CARE OF PROPERTY */}
                <div>
                  <strong>10. CARE OF PROPERTY</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    The LESSEE agrees to maintain the premises in good and clean condition and promptly inform the LESSOR of any necessary maintenance concerns or damages.
                  </div>
                </div>

                {/* 11. ALTERATIONS & DAMAGE */}
                <div>
                  <strong>11. ALTERATIONS AND DAMAGE</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    The LESSEE shall not make major structural alterations or modifications without prior written consent and shall be responsible for damages beyond reasonable wear and tear.
                  </div>
                </div>

                {/* 12. EARLY TERMINATION */}
                <div>
                  <strong>12. EARLY TERMINATION</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    {agreement.earlyTerminationTerms || 'Early termination of the rental agreement shall be subject to prior notice and mutual agreement between the LESSOR and LESSEE.'}
                  </div>
                </div>

                {/* 13. CHECKOUT */}
                <div>
                  <strong>13. CHECKOUT & TURNOVER</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    Upon termination of the rental period, the LESSEE shall return the premises in reasonable condition, subject to normal wear and tear. Outstanding monthly rent and utility obligations remain payable.
                  </div>
                </div>

                {/* 14. ADDITIONAL TERMS */}
                {agreement.additionalTerms && (
                  <div>
                    <strong>14. ADDITIONAL SPECIAL TERMS</strong>
                    <div style={{ marginTop: '4px', textIndent: '20px' }}>
                      {agreement.additionalTerms}
                    </div>
                  </div>
                )}

                {/* 15. MUTUAL AGREEMENT */}
                <div style={{ marginTop: '8px' }}>
                  <strong>15. ACKNOWLEDGEMENT</strong>
                  <div style={{ marginTop: '4px', textIndent: '20px' }}>
                    IN WITNESS WHEREOF, the parties hereto have acknowledged and agreed to the terms stated in this Rental Agreement.
                  </div>
                </div>

              </div>

              {/* SIGNATURE SECTION */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '48px', pageBreakInside: 'avoid' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '40px' }}>
                    LESSOR:
                  </div>
                  <div style={{ borderTop: '1px solid #000000', paddingTop: '6px' }}>
                    <strong>JMP RENTAL PROPERTY</strong>
                    <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>Authorized Representative</div>
                    <div style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '4px' }}>Date: ________________________</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '40px' }}>
                    LESSEE:
                  </div>
                  <div style={{ borderTop: '1px solid #000000', paddingTop: '6px' }}>
                    <strong>{agreement.tenantName}</strong>
                    {agreement.tenantCompanyName && (
                      <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>{agreement.tenantCompanyName}</div>
                    )}
                    <div style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '4px' }}>Date: ________________________</div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
