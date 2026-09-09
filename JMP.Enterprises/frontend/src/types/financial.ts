import { ExpenseCategorySummary } from './expense';

export interface PropertyFinancialBreakdown {
  propertyId: number;
  propertyName: string;
  propertyCode: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  profitMarginPercentage: number;
}

export interface MonthlyFinancialTrend {
  monthYear: string;
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  netProfit: number;
}

export interface PropertyMonthlyTrend {
  propertyId: number;
  propertyName: string;
  monthYear: string;
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  netProfit: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercentage: number;
  totalPaymentsCount: number;
  totalExpensesCount: number;
  propertyBreakdowns: PropertyFinancialBreakdown[];
  expenseCategorySummaries: ExpenseCategorySummary[];
  monthlyTrends: MonthlyFinancialTrend[];
  propertyMonthlyTrends?: PropertyMonthlyTrend[];
}
