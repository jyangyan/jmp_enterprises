import React, { useState } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Receipt, 
  TrendingDown, 
  BarChart3,
  LogOut,
  Home,
  Shirt,
  Printer,
  ShoppingBag,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Check,
  Layers
} from 'lucide-react';
import { Business } from '../types/business';

export type ActiveModule = 'home' | 'rental' | 'laundry' | 'print' | 'minimart' | 'user-access';
export type ActiveRentalTab = 'dashboard' | 'properties' | 'guests' | 'reservations' | 'payments' | 'expenses' | 'financials' | 'reports' | 'transactions';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeModule: ActiveModule;
  activeRentalTab: ActiveRentalTab;
  onModuleChange: (module: ActiveModule) => void;
  onRentalTabChange: (tab: ActiveRentalTab) => void;
  businesses: Business[];
  currentUser?: string;
  userRole?: string;
  onLogout?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeModule,
  activeRentalTab,
  onModuleChange,
  onRentalTabChange,
  businesses,
  currentUser = 'Admin User',
  userRole = 'Owner',
  onLogout,
  onRefresh,
  isRefreshing = false,
}) => {
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);

  const handleGlobalRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2500);
    }
  };

  const getBusinessIcon = (code: string) => {
    switch (code) {
      case 'RENTAL': return <Building2 size={18} />;
      case 'LAUNDRY': return <Shirt size={18} />;
      case 'PRINT': return <Printer size={18} />;
      case 'MINIMART': return <ShoppingBag size={18} />;
      default: return <Building2 size={18} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ padding: '16px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div 
            className="brand-logo-wrapper" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              cursor: 'pointer', 
              width: '100%',
              userSelect: 'none',
              padding: '8px 10px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }} 
            onClick={() => onModuleChange('home')}
          >
            {/* Minimalist Monogram Icon */}
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.95rem',
              letterSpacing: '-0.02em',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              flexShrink: 0
            }}>
              JMP
            </div>

            {/* Text Title & Subtitle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: 800, 
                  color: '#ffffff', 
                  letterSpacing: '0.04em',
                  fontFamily: "'Inter', -apple-system, sans-serif"
                }}>
                  JMP
                </span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 600, 
                  color: '#94a3b8', 
                  letterSpacing: '0.08em',
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  textTransform: 'uppercase'
                }}>
                  ENTERPRISES
                </span>
              </div>
              <span style={{
                fontSize: '0.63rem',
                fontWeight: 600,
                color: '#34d399',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                Multi-Business Hub
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          
          {/* Main Global Section */}
          <div className="nav-section-label">Enterprise Navigation</div>

          <button 
            className={`nav-item ${activeModule === 'home' ? 'active' : ''}`}
            onClick={() => onModuleChange('home')}
          >
            <Home size={18} />
            <span>Enterprise Home</span>
          </button>

          {/* Business Units Section */}
          <div className="nav-section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Business Units</span>
          </div>

          <button 
            className={`nav-item ${activeModule === 'rental' ? 'active' : ''}`}
            onClick={() => onModuleChange('rental')}
          >
            <Building2 size={18} />
            <span style={{ flex: 1 }}>JMP Rental Property</span>
            <span style={{ fontSize: '0.62rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Active</span>
          </button>

          <button 
            className={`nav-item ${activeModule === 'laundry' ? 'active' : ''}`}
            onClick={() => onModuleChange('laundry')}
          >
            <Shirt size={18} />
            <span style={{ flex: 1 }}>JMP Laundry</span>
            <span style={{ fontSize: '0.62rem', background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', padding: '2px 6px', borderRadius: '4px' }}>Soon</span>
          </button>

          <button 
            className={`nav-item ${activeModule === 'print' ? 'active' : ''}`}
            onClick={() => onModuleChange('print')}
          >
            <Printer size={18} />
            <span style={{ flex: 1 }}>JMP Piso Print</span>
            <span style={{ fontSize: '0.62rem', background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', padding: '2px 6px', borderRadius: '4px' }}>Soon</span>
          </button>

          <button 
            className={`nav-item ${activeModule === 'minimart' ? 'active' : ''}`}
            onClick={() => onModuleChange('minimart')}
          >
            <ShoppingBag size={18} />
            <span style={{ flex: 1 }}>JMP Mini-Mart</span>
            <span style={{ fontSize: '0.62rem', background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', padding: '2px 6px', borderRadius: '4px' }}>Soon</span>
          </button>

          {/* Sub-Navigation for Rental Property (when inside Rental module) */}
          {activeModule === 'rental' && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="nav-section-label" style={{ color: '#94a3b8', fontWeight: 600 }}>
                Rental Property Menu
              </div>

              <button 
                className={`nav-item ${activeRentalTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => onRentalTabChange('dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button 
                className={`nav-item ${activeRentalTab === 'properties' ? 'active' : ''}`}
                onClick={() => onRentalTabChange('properties')}
              >
                <Building2 size={18} />
                <span>Properties</span>
              </button>

              <button 
                className={`nav-item ${activeRentalTab === 'guests' ? 'active' : ''}`}
                onClick={() => onRentalTabChange('guests')}
              >
                <Users size={18} />
                <span>Guests & Tenants</span>
              </button>

              <button 
                className={`nav-item ${activeRentalTab === 'reservations' ? 'active' : ''}`}
                onClick={() => onRentalTabChange('reservations')}
              >
                <CalendarDays size={18} />
                <span>Reservations</span>
              </button>

              <button 
                className={`nav-item ${activeRentalTab === 'payments' ? 'active' : ''}`}
                onClick={() => onRentalTabChange('payments')}
              >
                <Receipt size={18} />
                <span>Payments</span>
              </button>

              <button 
                className={`nav-item ${activeRentalTab === 'expenses' ? 'active' : ''}`}
                onClick={() => onRentalTabChange('expenses')}
              >
                <TrendingDown size={18} />
                <span>Expenses</span>
              </button>

              <button 
                className={`nav-item ${activeRentalTab === 'financials' ? 'active' : ''}`}
                onClick={() => onRentalTabChange('financials')}
              >
                <BarChart3 size={18} />
                <span>Financial Summary</span>
              </button>

              <button 
                className={`nav-item ${activeRentalTab === 'reports' ? 'active' : ''}`}
                onClick={() => onRentalTabChange('reports')}
              >
                <Sparkles size={18} />
                <span>Reports & Analytics</span>
              </button>

              <button 
                className={`nav-item ${activeRentalTab === 'transactions' ? 'active' : ''}`}
                onClick={() => onRentalTabChange('transactions')}
              >
                <Layers size={18} />
                <span>All Transactions & History</span>
              </button>
            </div>
          )}

          {/* System Administration */}
          <div className="nav-section-label" style={{ marginTop: '20px' }}>Administration</div>

          <button 
            className={`nav-item ${activeModule === 'user-access' ? 'active' : ''}`}
            onClick={() => onModuleChange('user-access')}
          >
            <ShieldAlert size={18} />
            <span>Users & Business Access</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeModule === 'home' && 'Enterprise Home'}
              {activeModule === 'user-access' && 'User & Business Access Control'}
              {activeModule === 'laundry' && 'JMP Laundry'}
              {activeModule === 'print' && 'JMP Piso Print'}
              {activeModule === 'minimart' && 'JMP Mini-Mart'}
              {activeModule === 'rental' && (
                <>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>JMP Rental Property</span>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                  <span>
                    {activeRentalTab === 'dashboard' && 'Dashboard Overview'}
                    {activeRentalTab === 'properties' && 'Property Management'}
                    {activeRentalTab === 'guests' && 'Guest & Tenant Management'}
                    {activeRentalTab === 'reservations' && 'Reservation Management'}
                    {activeRentalTab === 'payments' && 'Rental Payments'}
                    {activeRentalTab === 'expenses' && 'Expense Management'}
                    {activeRentalTab === 'financials' && 'Profitability & Financial Summary'}
                    {activeRentalTab === 'reports' && 'Reports & Analytics'}
                    {activeRentalTab === 'transactions' && 'System Master Transactions & Audit Stream'}
                  </span>
                </>
              )}
            </h2>
          </div>

          <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onRefresh && (
              <button
                onClick={handleGlobalRefresh}
                disabled={isRefreshing}
                title="Refresh Page & Master Data"
                style={{
                  background: justRefreshed ? '#dcfce7' : 'var(--primary-light, #eff6ff)',
                  color: justRefreshed ? '#15803d' : 'var(--primary-color, #2563eb)',
                  border: `1px solid ${justRefreshed ? '#86efac' : '#bfdbfe'}`,
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  marginRight: '6px'
                }}
              >
                {justRefreshed ? (
                  <>
                    <Check size={15} />
                    <span>Data Refreshed!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh Page Data'}</span>
                  </>
                )}
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="user-avatar" style={{ background: '#3b82f6', color: '#ffffff', fontWeight: 700 }}>
                {currentUser.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="user-name" style={{ fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  {currentUser}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {userRole}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginLeft: '8px',
                }}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </header>

        <main className="content-container">
          {children}
        </main>
      </div>
    </div>
  );
};
