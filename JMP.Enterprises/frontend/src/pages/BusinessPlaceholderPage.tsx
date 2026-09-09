import React from 'react';
import { Shirt, Printer, ShoppingBag, ArrowLeft, Building2, Clock, CheckCircle2 } from 'lucide-react';

interface BusinessPlaceholderPageProps {
  businessCode: string;
  onBackToHome: () => void;
  onOpenRental: () => void;
}

export const BusinessPlaceholderPage: React.FC<BusinessPlaceholderPageProps> = ({
  businessCode,
  onBackToHome,
  onOpenRental,
}) => {
  let title = 'Business Module';
  let description = 'This module is scheduled for future release under JMP Enterprises.';
  let icon = <Building2 size={40} style={{ color: '#2563eb' }} />;
  let plannedModules: string[] = [];

  if (businessCode === 'LAUNDRY') {
    title = 'JMP Laundry';
    description = 'Full-service laundry management system for tracking customer drop-offs, wash/dry/fold orders, service packages, and payments.';
    icon = <Shirt size={48} style={{ color: '#0284c7' }} />;
    plannedModules = [
      'Customer Directory & History',
      'Laundry Orders & Weight Tracker',
      'Wash, Dry, Fold Service Packages',
      'Order Status Pipeline (Received, In Wash, Ready for Pickup, Delivered)',
      'Payment & Revenue Reports',
    ];
  } else if (businessCode === 'PRINT') {
    title = 'JMP Piso Print';
    description = 'Piso print and document printing management system for tracking print jobs, counter readings, paper stock, and daily revenues.';
    icon = <Printer size={48} style={{ color: '#7c3aed' }} />;
    plannedModules = [
      'Print Job Register & Page Counter',
      'Pricing Tier Manager (B&W, Colored, Photo Paper)',
      'Paper & Ink Consumables Tracker',
      'Daily Revenue & Collection Summary',
    ];
  } else if (businessCode === 'MINIMART') {
    title = 'JMP Mini-Mart';
    description = 'Retail mini-mart point-of-sale and inventory system for managing stock levels, barcode scanning, supplier orders, and daily sales.';
    icon = <ShoppingBag size={48} style={{ color: '#059669' }} />;
    plannedModules = [
      'Retail POS & Cashier Interface',
      'Product Master & Barcode Inventory',
      'Low Stock Alerts & Supplier Orders',
      'Daily Sales, Profit Margin & Cost Reports',
    ];
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Navigation Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onBackToHome}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Back to Enterprise Home
        </button>
      </div>

      {/* Main Module Card */}
      <div className="card" style={{
        padding: '40px',
        textAlign: 'center',
        borderRadius: '16px',
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        maxWidth: '720px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          border: '1px solid #e2e8f0',
        }}>
          {icon}
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#b45309', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          <Clock size={14} /> MODULE IN DEVELOPMENT • COMING SOON
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
          {title}
        </h1>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 28px 0' }}>
          {description}
        </p>

        {/* Planned Features List */}
        <div style={{
          textAlign: 'left',
          background: '#f8fafc',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #f1f5f9',
          marginBottom: '28px',
        }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px 0' }}>
            Planned Modules & Features for {title}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plannedModules.map((mod, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#475569' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                <span>{mod}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch Active Module */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenRental}
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Building2 size={16} /> Switch to JMP Rental Property (Active)
          </button>
        </div>
      </div>

    </div>
  );
};
