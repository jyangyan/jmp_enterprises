export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  propertyId?: number;
  rentalType?: string;
  presetRange?: 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'last_year' | 'custom';
}

export interface FinancialTransaction {
  transactionId: string;
  transactionDate: string;
  propertyId: number;
  propertyName: string;
  propertyCode: string;
  reservationId?: number;
  rentalType?: string;
  bookingSource?: string;
  transactionType: 'Income' | 'Expense';
  category: string;
  amount: number;
  incomeAmount: number;
  expenseAmount: number;
  year: number;
  month: number;
  yearMonth: string;
}

export interface MonthlyProfitability {
  year: number;
  month: number;
  yearMonth: string;
  propertyId?: number;
  propertyName?: string;
  rentalType?: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  profitMargin: number;
}

export interface PropertyPerformance {
  propertyId: number;
  propertyName: string;
  propertyCode: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  profitMargin: number;
  reservationCount: number;
  shortStayCount: number;
  longStayCount: number;
  occupiedDays: number;
}

export interface DemandTrend {
  year: number;
  month: number;
  yearMonth: string;
  propertyId: number;
  propertyName: string;
  rentalType: string;
  reservationCount: number;
  confirmedReservationCount: number;
  cancelledReservationCount: number;
  occupiedDays: number;
  averageLengthOfStay: number;
}

export interface RentalTypePerformance {
  rentalType: string;
  reservationCount: number;
  revenue: number;
  directExpenses: number;
  netProfitBeforeSharedExpenses: number;
  averageStayLength: number;
}

export interface ExpenseAnalysis {
  expenseCategory: string;
  propertyId: number;
  propertyName: string;
  reservationId?: number;
  rentalType?: string;
  totalAmount: number;
  year: number;
  month: number;
  yearMonth: string;
}

export interface ExpenseCategorySummary {
  category: string;
  totalAmount: number;
  expenseCount?: number;
  percentage: number;
}

export interface BookingSourcePerformance {
  bookingSource: string;
  propertyId?: number;
  propertyName?: string;
  rentalType?: string;
  reservationCount: number;
  revenue: number;
  averageReservationValue: number;
}

export interface DashboardReportOverview {
  periodText: string;
  filteredPropertyName: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  profitLossStatus: 'PROFITABLE' | 'LOSS';
  totalReservations: number;
  shortStayReservations: number;
  longStayReservations: number;
  totalOccupiedDays: number;
  overallOccupancyRate: number;
  securityDepositsHeld: number;
  topPerformingProperty: string;
  monthlyTrends: MonthlyProfitability[];
  propertyPerformances: PropertyPerformance[];
  rentalTypePerformances: RentalTypePerformance[];
  expenseBreakdown: ExpenseCategorySummary[];
  bookingSourceBreakdown: BookingSourcePerformance[];
  recentTransactions: FinancialTransaction[];
}

export interface ExecutiveReportSummary {
  generatedAt: string;
  periodText: string;
  filteredPropertyName: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  profitLossStatus: 'PROFITABLE' | 'LOSS';
  totalReservations: number;
  shortStayReservations: number;
  longStayReservations: number;
  occupiedDays: number;
  occupancyRate: number;
  securityDepositsHeld: number;
  topPerformingProperty: string;
  monthlyProfitability: MonthlyProfitability[];
  propertyPerformances: PropertyPerformance[];
  rentalTypePerformances: RentalTypePerformance[];
  expenseBreakdown: ExpenseCategorySummary[];
  bookingSourceBreakdown: BookingSourcePerformance[];
  financialTransactions: FinancialTransaction[];
}
