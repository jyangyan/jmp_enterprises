import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  FileSpreadsheet,
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Eye, 
  Printer, 
  RefreshCw, 
  Check, 
  Layers, 
  DollarSign, 
  ShieldCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  FolderOpen,
  ScrollText
} from 'lucide-react';
import { Property } from '../types/property';
import { Receipt } from '../types/receipt';
import { Payment } from '../types/payment';
import { Expense } from '../types/expense';
import { Reservation } from '../types/reservation';
import { RentalAgreement } from '../types/rentalAgreement';
import { receiptApi } from '../api/receiptApi';
import { paymentApi } from '../api/paymentApi';
import { expenseApi } from '../api/expenseApi';
import { reservationApi } from '../api/reservationApi';
import { rentalAgreementApi } from '../api/rentalAgreementApi';
import { ReceiptModal } from '../components/ReceiptModal';
import { StatementOfAccountModal } from '../components/StatementOfAccountModal';
import { ReservationDetailModal } from '../components/ReservationDetailModal';
import { RentalAgreementModal } from '../components/RentalAgreementModal';

export interface SystemTransactionItem {
  id: string; // unique key
  date: string;
  type: 'Income' | 'Expense' | 'Checkout' | 'Deposit';
  category: string; // e.g. 'Rental Payment', 'Checkout Settlement', 'Maintenance Expense'
  propertyName: string;
  propertyCode: string;
  guestOrVendor: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  rentalType?: 'ShortStay' | 'LongStay' | string;
  reservationId?: number;
  receiptObj?: Receipt;
  paymentObj?: Payment;
  expenseObj?: Expense;
}

interface SystemTransactionsPageProps {
  properties: Property[];
  reservations?: Reservation[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const SystemTransactionsPage: React.FC<SystemTransactionsPageProps> = ({
  properties,
  reservations,
  onRefresh,
  isRefreshing = false,
}) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [internalReservations, setInternalReservations] = useState<Reservation[]>(reservations || []);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRentalType, setSelectedRentalType] = useState<string>('All');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [datePreset, setDatePreset] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  type SortField = 'date' | 'amount' | 'reference' | 'guestOrVendor' | 'propertyName';
  type SortOrder = 'asc' | 'desc';

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Selected Receipt Modal (AR)
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Statement of Account (SOA) Modal
  const [activeSoaAgreement, setActiveSoaAgreement] = useState<RentalAgreement | null>(null);
  const [activeSoaReservationId, setActiveSoaReservationId] = useState<number | null>(null);
  const [isSoaModalOpen, setIsSoaModalOpen] = useState<boolean>(false);
  const [loadingSoaId, setLoadingSoaId] = useState<number | null>(null);

  // Complete Stay & Account Dossier Modal
  const [activeDossierReservation, setActiveDossierReservation] = useState<Reservation | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [loadingDossierId, setLoadingDossierId] = useState<number | null>(null);

  // Official Rental Agreement Contract Modal
  const [activeAgreement, setActiveAgreement] = useState<RentalAgreement | null>(null);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState<boolean>(false);
  const [loadingAgreementId, setLoadingAgreementId] = useState<number | null>(null);

  const fetchAllSystemTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedReceipts, fetchedPayments, fetchedExpenses, fetchedReservations] = await Promise.all([
        receiptApi.getReceipts().catch(() => []),
        paymentApi.getPayments().catch(() => []),
        expenseApi.getExpenses().catch(() => []),
        reservationApi.getReservations().catch(() => []),
      ]);

      setReceipts(fetchedReceipts);
      setPayments(fetchedPayments);
      setExpenses(fetchedExpenses);
      if (fetchedReservations && fetchedReservations.length > 0) {
        setInternalReservations(fetchedReservations);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load master system transactions history');
    } finally {
      setLoading(false);
    }
  };

  // Keep internalReservations updated if parent passes updated reservations
  useEffect(() => {
    if (reservations && reservations.length > 0) {
      setInternalReservations(reservations);
    }
  }, [reservations]);

  useEffect(() => {
    fetchAllSystemTransactions();
  }, []);

  const handleRefreshClick = async () => {
    if (onRefresh) onRefresh();
    await fetchAllSystemTransactions();
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 2500);
  };

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (preset === 'Today') {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'Yesterday') {
      const yest = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
      setStartDate(yest);
      setEndDate(yest);
    } else if (preset === 'ThisWeek') {
      const past7 = new Date(now.getTime() - 6 * 86400000).toISOString().split('T')[0];
      setStartDate(past7);
      setEndDate(today);
    } else if (preset === 'ThisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'LastMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'ThisYear') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      const lastDay = new Date(now.getFullYear(), 11, 31);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'SpecificDate') {
      if (!startDate) {
        setStartDate(today);
        setEndDate(today);
      } else {
        setEndDate(startDate);
      }
    } else if (preset === 'Custom') {
      // Keep existing inputs for user customization
    } else if (preset === 'All') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Build lookup map of reservations for fast access to rentalType & reservation details
  const reservationsMap = useMemo(() => {
    const map = new Map<number, Reservation>();
    (internalReservations || []).forEach(res => {
      map.set(res.reservationId, res);
    });
    return map;
  }, [internalReservations]);

  // Combine Receipts, Payments & Expenses into single unified System Transaction Items List
  const allTransactionItems = useMemo<SystemTransactionItem[]>(() => {
    const list: SystemTransactionItem[] = [];

    // 1. Add Receipts (Receipts & Checkout Settlements)
    receipts.forEach((r) => {
      const amt = (r.amount && r.amount > 0)
        ? r.amount
        : (r.totalRentalAmount || r.agreedRentalAmount || 0);

      const isCheckout = r.receiptType === 'Checkout' || r.receiptType === 'FinalSettlement' || r.paymentType?.includes('Checkout');
      const isDeposit = r.paymentType === 'Security Deposit' || r.receiptType === 'SecurityDeposit';

      const resMatch = r.reservationId ? reservationsMap.get(r.reservationId) : undefined;
      const rentalType = r.rentalType || resMatch?.rentalType;

      list.push({
        id: `R-${r.receiptId}`,
        date: r.receiptDate || r.createdDate,
        type: isCheckout ? 'Checkout' : isDeposit ? 'Deposit' : 'Income',
        category: r.paymentType || r.receiptType || 'Receipt',
        propertyName: r.propertyName || 'Property Unit',
        propertyCode: r.propertyCode || 'P-01',
        guestOrVendor: r.guestCompanyName ? `${r.guestCompanyName} (${r.guestName})` : r.guestName || 'Guest',
        amount: amt,
        paymentMethod: r.paymentMethod || 'Cash',
        referenceNumber: r.referenceNumber || r.receiptNumber,
        notes: r.notes || r.purpose,
        rentalType: rentalType,
        reservationId: r.reservationId,
        receiptObj: r,
      });
    });

    // 2. Add Payments that might not have duplicate receipt entry
    payments.forEach((p) => {
      const hasMatchingReceipt = receipts.some(r => r.paymentId === p.paymentId);
      if (!hasMatchingReceipt) {
        const matchingProp = properties.find(pr => pr.propertyId === p.propertyId);
        const resMatch = p.reservationId ? reservationsMap.get(p.reservationId) : undefined;

        list.push({
          id: `P-${p.paymentId}`,
          date: p.paymentDate || p.createdDate,
          type: p.paymentType === 'Security Deposit' ? 'Deposit' : 'Income',
          category: p.paymentType || 'Rental Payment',
          propertyName: p.propertyName || matchingProp?.propertyName || 'Property Unit',
          propertyCode: matchingProp?.propertyCode || `P-${p.propertyId}`,
          guestOrVendor: p.guestName || 'Guest',
          amount: p.amount,
          paymentMethod: p.paymentMethod || 'Cash',
          referenceNumber: p.referenceNumber,
          notes: p.notes || undefined,
          rentalType: resMatch?.rentalType,
          reservationId: p.reservationId,
          paymentObj: p,
        });
      }
    });

    // 3. Add Expenses (Outflows)
    expenses.forEach((e) => {
      const matchingProp = properties.find(pr => pr.propertyId === e.propertyId);
      list.push({
        id: `E-${e.expenseId}`,
        date: e.expenseDate || e.createdDate,
        type: 'Expense',
        category: `Expense: ${e.category}`,
        propertyName: e.propertyName || matchingProp?.propertyName || 'General Enterprise',
        propertyCode: matchingProp?.propertyCode || (e.propertyId ? `P-${e.propertyId}` : 'ALL'),
        guestOrVendor: e.vendorPayee || 'Vendor / Expense Payee',
        amount: e.amount,
        paymentMethod: 'Cash/Other',
        referenceNumber: e.receiptReference,
        notes: e.description,
        expenseObj: e,
      });
    });

    // Sort by Date Descending
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [receipts, payments, expenses, reservationsMap, properties]);

  // Filtered List
  const filteredTransactions = useMemo(() => {
    return allTransactionItems.filter((item) => {
      // Type Filter
      if (selectedType !== 'All') {
        if (selectedType === 'Income' && item.type !== 'Income' && item.type !== 'Checkout') return false;
        if (selectedType === 'Expense' && item.type !== 'Expense') return false;
        if (selectedType === 'Checkout' && item.type !== 'Checkout') return false;
        if (selectedType === 'Deposit' && item.type !== 'Deposit') return false;
      }

      // Stay Type Filter (Long Stay vs Short Stay)
      if (selectedRentalType !== 'All') {
        if (selectedRentalType === 'LongStay' && item.rentalType !== 'LongStay') return false;
        if (selectedRentalType === 'ShortStay' && item.rentalType !== 'ShortStay') return false;
      }

      // Property Filter
      if (selectedPropertyId !== 'All') {
        const prop = properties.find(p => p.propertyId === Number(selectedPropertyId));
        if (prop && item.propertyCode !== prop.propertyCode && item.propertyName !== prop.propertyName) return false;
      }

      // Method Filter
      if (selectedMethod !== 'All' && item.paymentMethod !== selectedMethod) return false;

      // Date Filter
      const itemDateStr = item.date ? item.date.split('T')[0] : '';
      if (startDate && itemDateStr < startDate) return false;
      if (endDate && itemDateStr > endDate) return false;

      // Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.propertyName.toLowerCase().includes(q) ||
          item.propertyCode.toLowerCase().includes(q) ||
          item.guestOrVendor.toLowerCase().includes(q) ||
          item.paymentMethod.toLowerCase().includes(q) ||
          (item.referenceNumber && item.referenceNumber.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [allTransactionItems, selectedType, selectedRentalType, selectedPropertyId, selectedMethod, startDate, endDate, searchTerm, properties]);

  // Sorted Transactions based on active sortField and sortOrder
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'reference') {
        comparison = (a.referenceNumber || a.id).localeCompare(b.referenceNumber || b.id);
      } else if (sortField === 'guestOrVendor') {
        comparison = a.guestOrVendor.localeCompare(b.guestOrVendor);
      } else if (sortField === 'propertyName') {
        comparison = a.propertyName.localeCompare(b.propertyName);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  // Summary Metrics
  const totalIncomeCollected = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'Income' || t.type === 'Checkout')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpensesOutflow = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netBalance = totalIncomeCollected - totalExpensesOutflow;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleOpenReceiptForTransaction = (item: SystemTransactionItem) => {
    if (item.receiptObj) {
      setActiveReceipt(item.receiptObj);
      setIsReceiptModalOpen(true);
    } else {
      // Synthesize receipt object for viewing/printing
      const tempReceipt: Receipt = {
        receiptId: 999000,
        receiptNumber: item.referenceNumber || item.id,
        receiptType: item.type === 'Expense' ? 'Expense Vouch' : item.type === 'Checkout' ? 'Checkout' : 'Payment',
        receiptDate: item.date,
        paymentDate: item.date,
        amount: item.amount,
        guestName: item.guestOrVendor,
        propertyName: item.propertyName,
        propertyCode: item.propertyCode,
        paymentType: item.category,
        paymentMethod: item.paymentMethod,
        referenceNumber: item.referenceNumber,
        purpose: item.notes || `${item.category} for ${item.propertyName}`,
        issuedBy: 'JMP Rental Property',
        isVoided: false,
        createdDate: item.date
      };
      setActiveReceipt(tempReceipt);
      setIsReceiptModalOpen(true);
    }
  };

  // Open Monthly Statement of Account (SOA) for Long Stay transactions
  const handleOpenSoaForTransaction = async (reservationId: number) => {
    setLoadingSoaId(reservationId);
    try {
      let agreement = await rentalAgreementApi.getByReservationId(reservationId);
      if (!agreement) {
        // Automatically create draft rental agreement if one doesn't exist yet
        agreement = await rentalAgreementApi.generateDraft(reservationId);
      }
      setActiveSoaAgreement(agreement);
      setActiveSoaReservationId(reservationId);
      setIsSoaModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Unable to open Statement of Account for this transaction.');
    } finally {
      setLoadingSoaId(null);
    }
  };

  // Open Full Guest Stay & Account Dossier (Contract, SOAs, all AR receipts, settlements)
  const handleOpenStayDossier = async (reservationId: number) => {
    setLoadingDossierId(reservationId);
    try {
      const res = reservationsMap.get(reservationId);
      if (res) {
        setActiveDossierReservation(res);
        setIsDossierModalOpen(true);
      } else {
        const fetchedRes = await reservationApi.getReservationById(reservationId);
        setActiveDossierReservation(fetchedRes);
        setIsDossierModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Unable to open stay dossier for this reservation.');
    } finally {
      setLoadingDossierId(null);
    }
  };

  // Open Official Rental Agreement Contract
  const handleOpenAgreementContract = async (reservationId: number) => {
    setLoadingAgreementId(reservationId);
    try {
      let agr = await rentalAgreementApi.getByReservationId(reservationId);
      if (!agr) {
        agr = await rentalAgreementApi.generateDraft(reservationId);
      }
      setActiveAgreement(agr);
      setIsAgreementModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Unable to open Rental Agreement for this transaction.');
    } finally {
      setLoadingAgreementId(null);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header & Refresh */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            <Layers style={{ color: 'var(--primary-color)' }} /> System Master Transactions & Audit Stream
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
            Complete audit trail of all receipts, rental payments, checkout settlements, and maintenance expenses across JMP Enterprises.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleRefreshClick}
          disabled={loading || isRefreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: justRefreshed ? '#dcfce7' : '#ffffff',
            color: justRefreshed ? '#15803d' : '#334155',
            borderColor: justRefreshed ? '#86efac' : '#cbd5e1',
            fontWeight: 700,
            padding: '8px 16px',
            borderRadius: '10px'
          }}
        >
          {justRefreshed ? (
            <>
              <Check size={16} />
              <span>Refreshed!</span>
            </>
          ) : (
            <>
              <RefreshCw size={16} className={loading || isRefreshing ? 'animate-spin' : ''} />
              <span>{loading || isRefreshing ? 'Refreshing...' : 'Refresh Audit Stream'}</span>
            </>
          )}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                Total Inflow Collected
              </span>
              <h2 className="stat-value" style={{ color: '#10b981', marginTop: '4px', fontSize: '1.5rem', fontWeight: 800 }}>
                ₱{totalIncomeCollected.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Payments & Checkout Settlements</span>
            </div>
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981', padding: '10px', borderRadius: '50%' }}>
              <ArrowUpRight size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                Total Operating Expenses
              </span>
              <h2 className="stat-value" style={{ color: '#ef4444', marginTop: '4px', fontSize: '1.5rem', fontWeight: 800 }}>
                ₱{totalExpensesOutflow.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Maintenance, Utilities, Supplies</span>
            </div>
            <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '50%' }}>
              <ArrowDownRight size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: `4px solid ${netBalance >= 0 ? '#3b82f6' : '#dc2626'}`, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                Net Stream Balance
              </span>
              <h2 className="stat-value" style={{ color: netBalance >= 0 ? '#1d4ed8' : '#dc2626', marginTop: '4px', fontSize: '1.5rem', fontWeight: 800 }}>
                ₱{netBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Inflow minus Outflow</span>
            </div>
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb', padding: '10px', borderRadius: '50%' }}>
              <DollarSign size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar Card */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '280px', flex: 1 }}>
            <div className="search-input-wrapper" style={{ width: '100%' }}>
              <Search size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search receipt #, guest/vendor, property, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Filter size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '170px', fontSize: '0.85rem' }}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All">All Transactions</option>
              <option value="Income">Payments (Income)</option>
              <option value="Checkout">Checkout Settlements</option>
              <option value="Expense">Expenses (Outflow)</option>
              <option value="Deposit">Security Deposits</option>
            </select>
          </div>

          {/* Stay Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Layers size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '155px', fontSize: '0.85rem' }}
              value={selectedRentalType}
              onChange={(e) => setSelectedRentalType(e.target.value)}
            >
              <option value="All">All Stay Types</option>
              <option value="LongStay">🏢 Long Stay</option>
              <option value="ShortStay">🌙 Short Stay</option>
            </select>
          </div>

          {/* Property Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Building2 size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '170px', fontSize: '0.85rem' }}
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
            >
              <option value="All">All Properties</option>
              {properties.map((p) => (
                <option key={p.propertyId} value={p.propertyId}>
                  {p.propertyName} ({p.propertyCode})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <CreditCard size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '140px', fontSize: '0.85rem' }}
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="All">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Check">Check</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <ArrowUpDown size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '180px', fontSize: '0.85rem' }}
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const parts = e.target.value.split('-');
                setSortField(parts[0] as SortField);
                setSortOrder(parts[1] as SortOrder);
              }}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (Highest First)</option>
              <option value="amount-asc">Amount (Lowest First)</option>
              <option value="guestOrVendor-asc">Guest / Payee (A-Z)</option>
              <option value="propertyName-asc">Property Name (A-Z)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <Calendar size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '165px', fontSize: '0.85rem' }}
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="ThisWeek">This Week (Last 7 Days)</option>
              <option value="ThisMonth">This Month</option>
              <option value="LastMonth">Last Month</option>
              <option value="ThisYear">This Year</option>
              <option value="SpecificDate">Specific Exact Date</option>
              <option value="Custom">Custom Date Range</option>
            </select>

            {datePreset === 'SpecificDate' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Date:</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: '140px', fontSize: '0.8rem', padding: '4px 8px' }}
                  value={startDate}
                  onChange={(e) => {
                    setDatePreset('SpecificDate');
                    setStartDate(e.target.value);
                    setEndDate(e.target.value);
                  }}
                />
                {startDate && (
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => handleDatePresetChange('All')}
                    title="Clear Date Filter"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
            )}

            {datePreset === 'Custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: '135px', fontSize: '0.8rem', padding: '4px 8px' }}
                  value={startDate}
                  onChange={(e) => {
                    setDatePreset('Custom');
                    setStartDate(e.target.value);
                  }}
                  placeholder="Start Date"
                />
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>to</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: '135px', fontSize: '0.8rem', padding: '4px 8px' }}
                  value={endDate}
                  onChange={(e) => {
                    setDatePreset('Custom');
                    setEndDate(e.target.value);
                  }}
                  placeholder="End Date"
                />
                {(startDate || endDate) && (
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => handleDatePresetChange('All')}
                    title="Clear Date Filter"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
            )}

            {datePreset !== 'All' && datePreset !== 'Custom' && datePreset !== 'SpecificDate' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '0.75rem',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 600
                }}>
                  {formatDate(startDate)} {startDate !== endDate && `— ${formatDate(endDate)}`}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => handleDatePresetChange('All')}
                  title="Clear Date Filter"
                >
                  <X size={12} /> Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Master Transaction Audit Table */}
      <div className="card" style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#2563eb' }} />
            <p style={{ fontWeight: 600 }}>Loading master transaction audit stream...</p>
          </div>
        ) : error ? (
          <div className="error-alert">{error}</div>
        ) : sortedTransactions.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} />
            <h3>No Transactions Found</h3>
            <p>Try adjusting your search query, property filter, or date range.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('reference')}
                    title="Click to sort by Ref / Receipt #"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Ref / Receipt #</span>
                      {sortField === 'reference' ? (
                        sortOrder === 'desc' ? <ArrowDown size={14} color="#2563eb" /> : <ArrowUp size={14} color="#2563eb" />
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" />
                      )}
                    </div>
                  </th>

                  <th 
                    style={{ cursor: 'pointer', userSelect: 'none', background: sortField === 'date' ? '#f1f5f9' : undefined }}
                    onClick={() => handleSort('date')}
                    title="Click to sort by Date"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: sortField === 'date' ? 800 : undefined, color: sortField === 'date' ? '#0f172a' : undefined }}>Date</span>
                      {sortField === 'date' ? (
                        sortOrder === 'desc' ? <ArrowDown size={14} color="#2563eb" /> : <ArrowUp size={14} color="#2563eb" />
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" />
                      )}
                    </div>
                  </th>

                  <th 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('propertyName')}
                    title="Click to sort by Property"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Property</span>
                      {sortField === 'propertyName' ? (
                        sortOrder === 'desc' ? <ArrowDown size={14} color="#2563eb" /> : <ArrowUp size={14} color="#2563eb" />
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" />
                      )}
                    </div>
                  </th>

                  <th style={{ textAlign: 'center' }}>Stay Type</th>

                  <th 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('guestOrVendor')}
                    title="Click to sort by Guest / Payee"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Guest / Payee</span>
                      {sortField === 'guestOrVendor' ? (
                        sortOrder === 'desc' ? <ArrowDown size={14} color="#2563eb" /> : <ArrowUp size={14} color="#2563eb" />
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" />
                      )}
                    </div>
                  </th>

                  <th>Category / Purpose</th>
                  <th>Method</th>

                  <th 
                    style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none', background: sortField === 'amount' ? '#f1f5f9' : undefined }}
                    onClick={() => handleSort('amount')}
                    title="Click to sort by Amount"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <span style={{ fontWeight: sortField === 'amount' ? 800 : undefined, color: sortField === 'amount' ? '#0f172a' : undefined }}>Amount</span>
                      {sortField === 'amount' ? (
                        sortOrder === 'desc' ? <ArrowDown size={14} color="#2563eb" /> : <ArrowUp size={14} color="#2563eb" />
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" />
                      )}
                    </div>
                  </th>

                  <th style={{ textAlign: 'center' }}>Type</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((item) => {
                  const isExpense = item.type === 'Expense';
                  const isCheckout = item.type === 'Checkout';

                  return (
                    <tr key={item.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        {item.referenceNumber || item.id}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(item.date)}</td>
                      <td>
                        <span className="property-badge">{item.propertyCode}</span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.propertyName}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {item.rentalType === 'LongStay' ? (
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#e0e7ff',
                            color: '#4338ca',
                            border: '1px solid #c7d2fe',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            🏢 Long Stay
                          </span>
                        ) : item.rentalType === 'ShortStay' ? (
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            🌙 Short Stay
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {item.reservationId ? (
                          <button
                            onClick={() => handleOpenStayDossier(item.reservationId!)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              font: 'inherit',
                              cursor: 'pointer',
                              textAlign: 'left',
                              color: '#1d4ed8',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            title={`Click to view full stay history (Contract, SOAs & all receipts) for ${item.guestOrVendor}`}
                          >
                            <span>{item.guestOrVendor}</span>
                            <FolderOpen size={13} style={{ color: '#2563eb', flexShrink: 0 }} />
                          </button>
                        ) : (
                          <span>{item.guestOrVendor}</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: isExpense ? '#dc2626' : '#15803d', fontSize: '0.92rem' }}>
                        {isExpense ? '-' : '+'}₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isExpense ? '#fee2e2' : isCheckout ? '#fef3c7' : '#dcfce7',
                          color: isExpense ? '#b91c1c' : isCheckout ? '#b45309' : '#15803d'
                        }}>
                          {item.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {/* 1. AR (Acknowledgement Receipt) Button */}
                          <button
                            className="btn-icon"
                            title="View / Print Acknowledgement Receipt (AR)"
                            onClick={() => handleOpenReceiptForTransaction(item)}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              padding: '4px 7px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: '#1e293b'
                            }}
                          >
                            <Eye size={12} style={{ color: '#2563eb' }} />
                            <span>AR</span>
                          </button>

                          {/* 2. Official Rental Agreement Contract (Long Stay Only) */}
                          {item.rentalType === 'LongStay' && item.reservationId && (
                            <button
                              className="btn-icon"
                              title="View / Print Official Rental Agreement Contract"
                              onClick={() => handleOpenAgreementContract(item.reservationId!)}
                              disabled={loadingAgreementId === item.reservationId}
                              style={{
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                padding: '4px 7px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                color: '#047857'
                              }}
                            >
                              {loadingAgreementId === item.reservationId ? (
                                <RefreshCw size={12} className="animate-spin" style={{ color: '#059669' }} />
                              ) : (
                                <ScrollText size={12} style={{ color: '#059669' }} />
                              )}
                              <span>Contract</span>
                            </button>
                          )}

                          {/* 3. Monthly Statement of Account (SOA) Button (Long Stay Only) */}
                          {item.rentalType === 'LongStay' && item.reservationId && (
                            <button
                              className="btn-icon"
                              title="View / Manage Historical Monthly Statement of Account (SOA)"
                              onClick={() => handleOpenSoaForTransaction(item.reservationId!)}
                              disabled={loadingSoaId === item.reservationId}
                              style={{
                                background: '#ede9fe',
                                border: '1px solid #c4b5fd',
                                padding: '4px 7px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                color: '#5b21b6'
                              }}
                            >
                              {loadingSoaId === item.reservationId ? (
                                <RefreshCw size={12} className="animate-spin" style={{ color: '#7c3aed' }} />
                              ) : (
                                <FileSpreadsheet size={12} style={{ color: '#7c3aed' }} />
                              )}
                              <span>SOA</span>
                            </button>
                          )}

                          {/* 4. Complete Stay & Account Dossier Button */}
                          {item.reservationId && (
                            <button
                              className="btn-icon"
                              title="View Complete Stay Dossier (Contract Agreement, SOAs, Receipts Ledger & Settlements)"
                              onClick={() => handleOpenStayDossier(item.reservationId!)}
                              disabled={loadingDossierId === item.reservationId}
                              style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                padding: '4px 7px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                color: '#1d4ed8'
                              }}
                            >
                              {loadingDossierId === item.reservationId ? (
                                <RefreshCw size={12} className="animate-spin" style={{ color: '#2563eb' }} />
                              ) : (
                                <FolderOpen size={12} style={{ color: '#2563eb' }} />
                              )}
                              <span>History</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Receipt Preview Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onReceiptUpdated={(updated) => setActiveReceipt(updated)}
      />

      {/* Historical Statement of Account (SOA) Modal */}
      {activeSoaAgreement && activeSoaReservationId && (
        <StatementOfAccountModal
          isOpen={isSoaModalOpen}
          onClose={() => {
            setIsSoaModalOpen(false);
            setActiveSoaAgreement(null);
            setActiveSoaReservationId(null);
          }}
          rentalAgreement={activeSoaAgreement}
          reservationId={activeSoaReservationId}
        />
      )}

      {/* Full Stay & Account Dossier Modal */}
      {activeDossierReservation && (
        <ReservationDetailModal
          isOpen={isDossierModalOpen}
          onClose={() => {
            setIsDossierModalOpen(false);
            setActiveDossierReservation(null);
          }}
          reservation={activeDossierReservation}
        />
      )}

      {/* Official Rental Agreement Contract Modal */}
      {activeAgreement && (
        <RentalAgreementModal
          isOpen={isAgreementModalOpen}
          onClose={() => {
            setIsAgreementModalOpen(false);
            setActiveAgreement(null);
          }}
          agreement={activeAgreement}
          onAgreementUpdated={(updated) => {
            setActiveAgreement(updated);
          }}
        />
      )}
    </div>
  );
};
