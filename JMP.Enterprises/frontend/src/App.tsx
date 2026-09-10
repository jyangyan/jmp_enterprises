import React, { useState, useEffect } from 'react';
import { AdminLayout, ActiveModule, ActiveRentalTab } from './components/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { GuestsPage } from './pages/GuestsPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { FinancialsPage } from './pages/FinancialsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SystemTransactionsPage } from './pages/SystemTransactionsPage';
import { EnterpriseHomePage } from './pages/EnterpriseHomePage';
import { BusinessPlaceholderPage } from './pages/BusinessPlaceholderPage';
import { UserAccessPage } from './pages/UserAccessPage';

import { PropertyModal } from './components/PropertyModal';
import { GuestModal } from './components/GuestModal';
import { ReservationModal } from './components/ReservationModal';
import { ReservationDetailModal } from './components/ReservationDetailModal';
import { PaymentModal } from './components/PaymentModal';
import { ExpenseModal } from './components/ExpenseModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ReceiptModal } from './components/ReceiptModal';

import { propertyApi } from './api/propertyApi';
import { guestApi } from './api/guestApi';
import { reservationApi } from './api/reservationApi';
import { paymentApi } from './api/paymentApi';
import { expenseApi } from './api/expenseApi';
import { businessApi } from './api/businessApi';

import { Property, CreatePropertyDto, UpdatePropertyDto } from './types/property';
import { Guest, CreateGuestDto, UpdateGuestDto } from './types/guest';
import { Reservation, CreateReservationDto, UpdateReservationDto } from './types/reservation';
import { Payment, CreatePaymentDto, UpdatePaymentDto } from './types/payment';
import { Expense, CreateExpenseDto, UpdateExpenseDto } from './types/expense';
import { Receipt } from './types/receipt';
import { Business, UserBusinessAccess } from './types/business';

import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try {
      const savedLocal = localStorage.getItem('jmp_auth_user');
      if (savedLocal) return JSON.parse(savedLocal).username || 'Admin User';
      const savedSession = sessionStorage.getItem('jmp_auth_user');
      if (savedSession) return JSON.parse(savedSession).username || 'Admin User';
    } catch {
      // Ignore JSON parse error
    }
    return null;
  });

  // Navigation State
  const [activeModule, setActiveModule] = useState<ActiveModule>('home');
  const [activeRentalTab, setActiveRentalTab] = useState<ActiveRentalTab>('dashboard');

  // Business Units State
  const [businesses, setBusinesses] = useState<Business[]>([
    {
      businessId: 1,
      businessCode: 'RENTAL',
      businessName: 'JMP Rental Property',
      description: 'Rental property management, reservations, and income tracking',
      icon: 'Building2',
      route: '/rental',
      isActive: true,
      displayOrder: 1,
      isImplemented: true,
    },
    {
      businessId: 2,
      businessCode: 'LAUNDRY',
      businessName: 'JMP Laundry',
      description: 'Laundry shop management, orders, and services',
      icon: 'Shirt',
      route: '/laundry',
      isActive: true,
      displayOrder: 2,
      isImplemented: false,
    },
    {
      businessId: 3,
      businessCode: 'PRINT',
      businessName: 'JMP Piso Print',
      description: 'Printing service management and jobs tracking',
      icon: 'Printer',
      route: '/print',
      isActive: true,
      displayOrder: 3,
      isImplemented: false,
    },
    {
      businessId: 4,
      businessCode: 'MINIMART',
      businessName: 'JMP Mini-Mart',
      description: 'Mini-mart, retail sales, and inventory management',
      icon: 'ShoppingBag',
      route: '/minimart',
      isActive: true,
      displayOrder: 4,
      isImplemented: false,
    },
  ]);

  const [userAccess, setUserAccess] = useState<UserBusinessAccess[]>([]);

  // Master Data State
  const [properties, setProperties] = useState<Property[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Toggles
  const [includeInactiveProperties, setIncludeInactiveProperties] = useState<boolean>(true);
  const [includeInactiveGuests, setIncludeInactiveGuests] = useState<boolean>(true);

  // Status
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Property Modals State
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Guest Modals State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Reservation Modals State
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isReservationDetailOpen, setIsReservationDetailOpen] = useState(false);

  // Payment Modals State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Expense Modals State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Confirmation Modal State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDanger?: boolean;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  // Listen for global custom events to open receipt modal from anywhere
  useEffect(() => {
    const handleOpenReceipt = (e: any) => {
      if (e.detail) {
        setActiveReceipt(e.detail);
        setIsReceiptModalOpen(true);
      }
    };
    window.addEventListener('open-receipt-modal' as any, handleOpenReceipt);
    return () => {
      window.removeEventListener('open-receipt-modal' as any, handleOpenReceipt);
    };
  }, []);

  // Fetch Businesses & User Access
  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const fetched = await businessApi.getBusinesses();
        if (fetched && fetched.length > 0) {
          setBusinesses(fetched);
        }
      } catch (err) {
        console.warn('Backend business API fallback to initial list:', err);
      }
    };
    fetchBusinessInfo();
  }, []);

  // Initial Master Data Load
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchProperties(),
        fetchGuests(),
        fetchReservations(),
        fetchPayments(),
        fetchExpenses(),
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  // Data Fetchers
  const fetchProperties = async () => {
    try {
      const data = await propertyApi.getProperties(includeInactiveProperties);
      setProperties(data);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
    }
  };

  const fetchGuests = async () => {
    try {
      const data = await guestApi.getGuests(includeInactiveGuests);
      setGuests(data);
    } catch (err: any) {
      console.error('Error fetching guests:', err);
    }
  };

  const fetchReservations = async () => {
    try {
      const data = await reservationApi.getReservations();
      setReservations(data);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await paymentApi.getPayments();
      setPayments(data);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const data = await expenseApi.getExpenses();
      setExpenses(data);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
    }
  };

  // Re-fetch on filter toggles
  useEffect(() => {
    if (currentUser) fetchProperties();
  }, [includeInactiveProperties]);

  useEffect(() => {
    if (currentUser) fetchGuests();
  }, [includeInactiveGuests]);

  // --- Handlers: Property ---
  const handleOpenAddProperty = () => {
    setSelectedProperty(null);
    setIsPropertyModalOpen(true);
  };

  const handleOpenEditProperty = (p: Property) => {
    setSelectedProperty(p);
    setIsPropertyModalOpen(true);
  };

  const handleSaveProperty = async (dto: CreatePropertyDto | UpdatePropertyDto) => {
    if (selectedProperty) {
      await propertyApi.updateProperty(selectedProperty.propertyId, dto as UpdatePropertyDto);
    } else {
      await propertyApi.createProperty(dto as CreatePropertyDto);
    }
    await fetchProperties();
  };

  const handleDeactivateProperty = (p: Property) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Deactivate Property',
      message: `Are you sure you want to deactivate property "${p.propertyName}"?`,
      confirmText: 'Deactivate',
      isDanger: true,
      action: async () => {
        await propertyApi.deactivateProperty(p.propertyId);
        await fetchProperties();
      },
    });
  };

  const handleReactivateProperty = (p: Property) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Reactivate Property',
      message: `Reactivate property "${p.propertyName}"?`,
      confirmText: 'Reactivate',
      isDanger: false,
      action: async () => {
        await propertyApi.reactivateProperty(p.propertyId);
        await fetchProperties();
      },
    });
  };

  // --- Handlers: Guest ---
  const handleOpenAddGuest = () => {
    setSelectedGuest(null);
    setIsGuestModalOpen(true);
  };

  const handleOpenEditGuest = (g: Guest) => {
    setSelectedGuest(g);
    setIsGuestModalOpen(true);
  };

  const handleSaveGuest = async (dto: CreateGuestDto | UpdateGuestDto) => {
    if (selectedGuest) {
      await guestApi.updateGuest(selectedGuest.guestId, dto as UpdateGuestDto);
    } else {
      await guestApi.createGuest(dto as CreateGuestDto);
    }
    await fetchGuests();
  };

  const handleDeactivateGuest = (g: Guest) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Deactivate Guest/Tenant',
      message: `Deactivate guest profile for "${g.firstName} ${g.lastName}"?`,
      confirmText: 'Deactivate',
      isDanger: true,
      action: async () => {
        await guestApi.deactivateGuest(g.guestId);
        await fetchGuests();
      },
    });
  };

  const handleReactivateGuest = (g: Guest) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Reactivate Guest/Tenant',
      message: `Reactivate guest profile for "${g.firstName} ${g.lastName}"?`,
      confirmText: 'Reactivate',
      isDanger: false,
      action: async () => {
        await guestApi.reactivateGuest(g.guestId);
        await fetchGuests();
      },
    });
  };

  // --- Handlers: Reservation ---
  const handleOpenCreateReservation = () => {
    setSelectedReservation(null);
    setIsReservationModalOpen(true);
  };

  const handleOpenEditReservation = (r: Reservation) => {
    setSelectedReservation(r);
    setIsReservationModalOpen(true);
  };

  const handleOpenDetailReservation = (r: Reservation) => {
    setSelectedReservation(r);
    setIsReservationDetailOpen(true);
  };

  const handleSaveReservation = async (dto: CreateReservationDto | UpdateReservationDto) => {
    if (selectedReservation) {
      await reservationApi.updateReservation(selectedReservation.reservationId, dto as UpdateReservationDto);
    } else {
      await reservationApi.createReservation(dto as CreateReservationDto);
    }
    await fetchReservations();
  };

  const handleCancelReservation = (r: Reservation) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Cancel Reservation',
      message: `Are you sure you want to CANCEL reservation #${r.reservationId} for ${r.propertyName}?`,
      confirmText: 'Cancel Reservation',
      isDanger: true,
      action: async () => {
        await reservationApi.cancelReservation(r.reservationId);
        await fetchReservations();
      },
    });
  };

  // --- Handlers: Payment ---
  const handleOpenCreatePayment = () => {
    setSelectedPayment(null);
    setIsPaymentModalOpen(true);
  };

  const handleOpenEditPayment = (p: Payment) => {
    setSelectedPayment(p);
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (dto: CreatePaymentDto | UpdatePaymentDto) => {
    if (selectedPayment) {
      await paymentApi.updatePayment(selectedPayment.paymentId, dto as UpdatePaymentDto);
    } else {
      await paymentApi.createPayment(dto as CreatePaymentDto);
    }
    await fetchPayments();
    await fetchReservations();
  };

  const handleDeletePayment = (p: Payment) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Delete Payment Record',
      message: `Are you sure you want to delete payment of ₱${p.amount.toLocaleString('en-PH')} for ${p.propertyName}?`,
      confirmText: 'Delete Payment',
      isDanger: true,
      action: async () => {
        await paymentApi.deletePayment(p.paymentId);
        await fetchPayments();
        await fetchReservations();
      },
    });
  };

  // --- Handlers: Expense ---
  const handleOpenCreateExpense = () => {
    setSelectedExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (e: Expense) => {
    setSelectedExpense(e);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (dto: CreateExpenseDto | UpdateExpenseDto) => {
    if (selectedExpense) {
      await expenseApi.updateExpense(selectedExpense.expenseId, dto as UpdateExpenseDto);
    } else {
      await expenseApi.createExpense(dto as CreateExpenseDto);
    }
    await fetchExpenses();
  };

  const handleDeleteExpense = (e: Expense) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Delete Expense Record',
      message: `Are you sure you want to delete expense record "${e.description}" (₱${e.amount.toLocaleString('en-PH')})?`,
      confirmText: 'Delete Expense',
      isDanger: true,
      action: async () => {
        await expenseApi.deleteExpense(e.expenseId);
        await fetchExpenses();
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('jmp_auth_user');
    sessionStorage.removeItem('jmp_auth_user');
    setCurrentUser(null);
  };

  const handleSelectBusinessCode = (code: string) => {
    if (code === 'RENTAL') {
      setActiveModule('rental');
      setActiveRentalTab('dashboard');
    } else if (code === 'LAUNDRY') {
      setActiveModule('laundry');
    } else if (code === 'PRINT') {
      setActiveModule('print');
    } else if (code === 'MINIMART') {
      setActiveModule('minimart');
    } else {
      setActiveModule('home');
    }
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={(username) => setCurrentUser(username || 'Admin User')} />;
  }

  return (
    <AdminLayout
      activeModule={activeModule}
      activeRentalTab={activeRentalTab}
      onModuleChange={(mod) => setActiveModule(mod)}
      onRentalTabChange={(tab) => setActiveRentalTab(tab)}
      businesses={businesses}
      currentUser={currentUser}
      userRole="Owner"
      onLogout={handleLogout}
      onRefresh={fetchAllData}
      isRefreshing={loading}
    >
      {error && <div className="error-alert">{error}</div>}

      {loading && activeModule === 'rental' && (properties.length === 0 && reservations.length === 0) ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading JMP Rental Property data...</p>
        </div>
      ) : activeModule === 'home' ? (
        <EnterpriseHomePage
          businesses={businesses}
          userAccess={userAccess}
          onSelectBusiness={handleSelectBusinessCode}
          currentUserRole="Owner"
        />
      ) : activeModule === 'user-access' ? (
        <UserAccessPage
          businesses={businesses}
          currentUserRole="Owner"
        />
      ) : activeModule === 'laundry' || activeModule === 'print' || activeModule === 'minimart' ? (
        <BusinessPlaceholderPage
          businessCode={activeModule.toUpperCase()}
          onBackToHome={() => setActiveModule('home')}
          onOpenRental={() => {
            setActiveModule('rental');
            setActiveRentalTab('dashboard');
          }}
        />
      ) : activeModule === 'rental' ? (
        activeRentalTab === 'dashboard' ? (
          <DashboardPage
            properties={properties}
            reservations={reservations}
            onNavigateToProperties={() => setActiveRentalTab('properties')}
            onNavigateToReservations={() => setActiveRentalTab('reservations')}
            onOpenAddPropertyModal={handleOpenAddProperty}
            onOpenCreateReservationModal={handleOpenCreateReservation}
            onRefresh={fetchAllData}
            isRefreshing={loading}
          />
        ) : activeRentalTab === 'properties' ? (
          <PropertiesPage
            properties={properties}
            includeInactive={includeInactiveProperties}
            onToggleIncludeInactive={setIncludeInactiveProperties}
            onOpenAddModal={handleOpenAddProperty}
            onOpenEditModal={handleOpenEditProperty}
            onDeactivate={handleDeactivateProperty}
            onReactivate={handleReactivateProperty}
            onRefresh={fetchAllData}
            isRefreshing={loading}
          />
        ) : activeRentalTab === 'guests' ? (
          <GuestsPage
            guests={guests}
            includeInactive={includeInactiveGuests}
            onToggleIncludeInactive={setIncludeInactiveGuests}
            onOpenAddModal={handleOpenAddGuest}
            onOpenEditModal={handleOpenEditGuest}
            onDeactivate={handleDeactivateGuest}
            onReactivate={handleReactivateGuest}
            onRefresh={fetchAllData}
            isRefreshing={loading}
          />
        ) : activeRentalTab === 'reservations' ? (
          <ReservationsPage
            reservations={reservations}
            properties={properties}
            onOpenCreateModal={handleOpenCreateReservation}
            onOpenEditModal={handleOpenEditReservation}
            onOpenDetailModal={handleOpenDetailReservation}
            onCancelReservation={handleCancelReservation}
            onRefreshData={fetchReservations}
            onRefresh={fetchAllData}
            isRefreshing={loading}
          />
        ) : activeRentalTab === 'payments' ? (
          <PaymentsPage
            payments={payments}
            properties={properties}
            onOpenCreateModal={handleOpenCreatePayment}
            onOpenEditModal={handleOpenEditPayment}
            onDeletePayment={handleDeletePayment}
            onRefresh={fetchAllData}
            isRefreshing={loading}
          />
        ) : activeRentalTab === 'expenses' ? (
          <ExpensesPage
            expenses={expenses}
            properties={properties}
            onOpenCreateModal={handleOpenCreateExpense}
            onOpenEditModal={handleOpenEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onRefresh={fetchAllData}
            isRefreshing={loading}
          />
        ) : activeRentalTab === 'financials' ? (
          <FinancialsPage 
            properties={properties} 
            onRefresh={fetchAllData}
            isRefreshing={loading}
          />
        ) : activeRentalTab === 'reports' ? (
          <ReportsPage 
            properties={properties} 
            onRefresh={fetchAllData}
            isRefreshing={loading}
          />
        ) : (
          <SystemTransactionsPage
            properties={properties}
            onRefresh={fetchAllData}
            isRefreshing={loading}
          />
        )
      ) : (
        <EnterpriseHomePage
          businesses={businesses}
          userAccess={userAccess}
          onSelectBusiness={handleSelectBusinessCode}
          currentUserRole="Owner"
        />
      )}

      {/* Property Modal */}
      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSave={handleSaveProperty}
        initialData={selectedProperty}
      />

      {/* Guest Modal */}
      <GuestModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onSave={handleSaveGuest}
        initialData={selectedGuest}
      />

      {/* Reservation Form Modal */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        onSave={handleSaveReservation}
        properties={properties.filter((p) => p.isActive)}
        guests={guests.filter((g) => g.isActive)}
        existingReservations={reservations}
        onRefreshGuests={fetchGuests}
        initialData={selectedReservation}
      />

      {/* Reservation Detail View Modal */}
      <ReservationDetailModal
        isOpen={isReservationDetailOpen}
        onClose={() => setIsReservationDetailOpen(false)}
        reservation={selectedReservation}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleSavePayment}
        reservations={reservations}
        initialData={selectedPayment}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        properties={properties.filter((p) => p.isActive)}
        initialData={selectedExpense}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.action}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        isDanger={confirmModalConfig.isDanger}
      />

      {/* Global Receipt Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onReceiptUpdated={(updated) => setActiveReceipt(updated)}
      />
    </AdminLayout>
  );
};

export default App;
