import React from 'react';
import { Business, UserBusinessAccess } from '../types/business';
import { Building2, Shirt, Printer, ShoppingBag, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

interface EnterpriseHomePageProps {
  businesses: Business[];
  userAccess: UserBusinessAccess[];
  onSelectBusiness: (businessCode: string) => void;
  currentUserRole: string;
}

export const EnterpriseHomePage: React.FC<EnterpriseHomePageProps> = ({
  businesses,
  userAccess,
  onSelectBusiness,
  currentUserRole,
}) => {

  const getIcon = (code: string) => {
    switch (code) {
      case 'RENTAL': return <Building2 size={24} style={{ color: '#2563eb' }} />;
      case 'LAUNDRY': return <Shirt size={24} style={{ color: '#0284c7' }} />;
      case 'PRINT': return <Printer size={24} style={{ color: '#6366f1' }} />;
      case 'MINIMART': return <ShoppingBag size={24} style={{ color: '#059669' }} />;
      default: return <Building2 size={24} />;
    }
  };

  const isAccessible = (b: Business) => {
    if (currentUserRole === 'SuperAdmin' || currentUserRole === 'Owner') return true;
    if (userAccess.length === 0) return true;
    return userAccess.some((a) => a.businessId === b.businessId && a.canAccess);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Enterprise Overview Banner - Clean & Subtle */}
      <div className="card" style={{
        background: '#ffffff',
        color: '#0f172a',
        padding: '28px 32px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{
              display: 'inline-block',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#3b82f6',
              background: '#eff6ff',
              padding: '3px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '10px',
            }}>
              Business Platform Shell
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a', letterSpacing: '-0.01em' }}>
              JMP Enterprises
            </h1>

            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Central management system for JMP business operations. Select a business unit below to open its dedicated workspace.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <ShieldCheck size={16} style={{ color: '#10b981' }} />
              <span>Role: <strong style={{ color: '#0f172a' }}>{currentUserRole}</strong></span>
            </div>

            <button
              onClick={() => onSelectBusiness('RENTAL')}
              className="btn btn-primary"
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              Open JMP Rental Property <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Business Units
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
          Overview of active and upcoming business modules under JMP Enterprises.
        </p>
      </div>

      {/* Business Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>
        {businesses.map((b) => {
          const allowed = isAccessible(b);
          return (
            <div
              key={b.businessId}
              className="card"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '10px',
                border: allowed ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                opacity: allowed ? 1 : 0.65,
                background: '#ffffff',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}>
                    {getIcon(b.businessCode)}
                  </div>

                  <div>
                    {b.isImplemented ? (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: '#ecfdf5',
                        color: '#047857',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        ACTIVE
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#64748b',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        COMING SOON
                      </span>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  {b.businessName}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {b.description}
                </p>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                {!allowed ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                    <Lock size={14} /> Restricted by Role Access
                  </div>
                ) : b.isImplemented ? (
                  <button
                    onClick={() => onSelectBusiness(b.businessCode)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    Open Workspace <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectBusiness(b.businessCode)}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    View Planned Features <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
