import {
  ReportFilter,
  DashboardReportOverview,
  FinancialTransaction,
  MonthlyProfitability,
  PropertyPerformance,
  DemandTrend,
  RentalTypePerformance,
  ExpenseAnalysis,
  BookingSourcePerformance,
  ExecutiveReportSummary,
} from '../types/reports';

const API_BASE_URL = 'http://localhost:5184/api/reports';

function buildQuery(filter: ReportFilter): string {
  const params = new URLSearchParams();
  if (filter.startDate) params.append('startDate', filter.startDate);
  if (filter.endDate) params.append('endDate', filter.endDate);
  if (filter.propertyId) params.append('propertyId', filter.propertyId.toString());
  if (filter.rentalType) params.append('rentalType', filter.rentalType);
  const q = params.toString();
  return q ? `?${q}` : '';
}

export const reportsApi = {
  async getDashboardOverview(filter: ReportFilter = {}): Promise<DashboardReportOverview> {
    const res = await fetch(`${API_BASE_URL}/dashboard${buildQuery(filter)}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard overview reports');
    return res.json();
  },

  async getFinancialTransactions(filter: ReportFilter = {}): Promise<FinancialTransaction[]> {
    const res = await fetch(`${API_BASE_URL}/financial-transactions${buildQuery(filter)}`);
    if (!res.ok) throw new Error('Failed to fetch financial transactions');
    return res.json();
  },

  async getMonthlyProfitability(filter: ReportFilter = {}): Promise<MonthlyProfitability[]> {
    const res = await fetch(`${API_BASE_URL}/monthly-profitability${buildQuery(filter)}`);
    if (!res.ok) throw new Error('Failed to fetch monthly profitability');
    return res.json();
  },

  async getPropertyPerformance(filter: ReportFilter = {}): Promise<PropertyPerformance[]> {
    const res = await fetch(`${API_BASE_URL}/property-performance${buildQuery(filter)}`);
    if (!res.ok) throw new Error('Failed to fetch property performance');
    return res.json();
  },

  async getDemandTrends(filter: ReportFilter = {}): Promise<DemandTrend[]> {
    const res = await fetch(`${API_BASE_URL}/demand-trends${buildQuery(filter)}`);
    if (!res.ok) throw new Error('Failed to fetch demand trends');
    return res.json();
  },

  async getRentalTypePerformance(filter: ReportFilter = {}): Promise<RentalTypePerformance[]> {
    const res = await fetch(`${API_BASE_URL}/rental-type-performance${buildQuery(filter)}`);
    if (!res.ok) throw new Error('Failed to fetch rental type performance');
    return res.json();
  },

  async getExpenseAnalysis(filter: ReportFilter = {}): Promise<ExpenseAnalysis[]> {
    const res = await fetch(`${API_BASE_URL}/expense-analysis${buildQuery(filter)}`);
    if (!res.ok) throw new Error('Failed to fetch expense analysis');
    return res.json();
  },

  async getBookingSources(filter: ReportFilter = {}): Promise<BookingSourcePerformance[]> {
    const res = await fetch(`${API_BASE_URL}/booking-sources${buildQuery(filter)}`);
    if (!res.ok) throw new Error('Failed to fetch booking sources');
    return res.json();
  },

  async getExecutiveReport(filter: ReportFilter = {}): Promise<ExecutiveReportSummary> {
    const res = await fetch(`${API_BASE_URL}/executive-report${buildQuery(filter)}`);
    if (!res.ok) throw new Error('Failed to fetch executive management report');
    return res.json();
  },
};
