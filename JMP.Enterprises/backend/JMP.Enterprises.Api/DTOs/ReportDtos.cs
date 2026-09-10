using System;
using System.Collections.Generic;

namespace JMP.Enterprises.Api.DTOs;

public class ReportFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? PropertyId { get; set; }
    public string? RentalType { get; set; }
}

public class FinancialTransactionDto
{
    public string TransactionId { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyCode { get; set; } = string.Empty;
    public int? ReservationId { get; set; }
    public string? RentalType { get; set; }
    public string? BookingSource { get; set; }
    public string TransactionType { get; set; } = string.Empty; // "Income" or "Expense"
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal IncomeAmount { get; set; }
    public decimal ExpenseAmount { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public string YearMonth { get; set; } = string.Empty;
}

public class MonthlyProfitabilityDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string YearMonth { get; set; } = string.Empty;
    public int? PropertyId { get; set; }
    public string? PropertyName { get; set; }
    public string? RentalType { get; set; }
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
    public decimal NetProfit { get; set; }
    public double ProfitMargin { get; set; }
}

public class PropertyPerformanceDto
{
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyCode { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
    public decimal NetProfit { get; set; }
    public double ProfitMargin { get; set; }
    public int ReservationCount { get; set; }
    public int ShortStayCount { get; set; }
    public int LongStayCount { get; set; }
    public int OccupiedDays { get; set; }
}

public class DemandTrendDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string YearMonth { get; set; } = string.Empty;
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string RentalType { get; set; } = string.Empty;
    public int ReservationCount { get; set; }
    public int ConfirmedReservationCount { get; set; }
    public int CancelledReservationCount { get; set; }
    public int OccupiedDays { get; set; }
    public double AverageLengthOfStay { get; set; }
}

public class RentalTypePerformanceDto
{
    public string RentalType { get; set; } = string.Empty;
    public int ReservationCount { get; set; }
    public decimal Revenue { get; set; }
    public decimal DirectExpenses { get; set; }
    public decimal NetProfitBeforeSharedExpenses { get; set; }
    public double AverageStayLength { get; set; }
}

public class ExpenseAnalysisDto
{
    public string ExpenseCategory { get; set; } = string.Empty;
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public int? ReservationId { get; set; }
    public string? RentalType { get; set; }
    public decimal TotalAmount { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public string YearMonth { get; set; } = string.Empty;
}

public class BookingSourcePerformanceDto
{
    public string BookingSource { get; set; } = string.Empty;
    public int? PropertyId { get; set; }
    public string? PropertyName { get; set; }
    public string? RentalType { get; set; }
    public int ReservationCount { get; set; }
    public decimal Revenue { get; set; }
    public decimal AverageReservationValue { get; set; }
}

public class DashboardReportOverviewDto
{
    public string PeriodText { get; set; } = string.Empty;
    public string FilteredPropertyName { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit { get; set; }
    public double ProfitMargin { get; set; }
    public string ProfitLossStatus { get; set; } = "PROFITABLE"; // "PROFITABLE" or "LOSS"
    public int TotalReservations { get; set; }
    public int ShortStayReservations { get; set; }
    public int LongStayReservations { get; set; }
    public int TotalOccupiedDays { get; set; }
    public double OverallOccupancyRate { get; set; }
    public decimal SecurityDepositsHeld { get; set; }
    public string TopPerformingProperty { get; set; } = "N/A";
    
    public List<MonthlyProfitabilityDto> MonthlyTrends { get; set; } = new();
    public List<PropertyPerformanceDto> PropertyPerformances { get; set; } = new();
    public List<RentalTypePerformanceDto> RentalTypePerformances { get; set; } = new();
    public List<ExpenseCategorySummaryDto> ExpenseBreakdown { get; set; } = new();
    public List<BookingSourcePerformanceDto> BookingSourceBreakdown { get; set; } = new();
    public List<FinancialTransactionDto> RecentTransactions { get; set; } = new();
}

public class ExecutiveReportSummaryDto
{
    public DateTime GeneratedAt { get; set; } = DateTime.Now;
    public string PeriodText { get; set; } = string.Empty;
    public string FilteredPropertyName { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit { get; set; }
    public double ProfitMargin { get; set; }
    public string ProfitLossStatus { get; set; } = "PROFITABLE"; // "PROFITABLE" or "LOSS"
    
    public int TotalReservations { get; set; }
    public int ShortStayReservations { get; set; }
    public int LongStayReservations { get; set; }
    public int OccupiedDays { get; set; }
    public double OccupancyRate { get; set; }
    public decimal SecurityDepositsHeld { get; set; }
    public string TopPerformingProperty { get; set; } = "N/A";

    public List<MonthlyProfitabilityDto> MonthlyProfitability { get; set; } = new();
    public List<PropertyPerformanceDto> PropertyPerformances { get; set; } = new();
    public List<RentalTypePerformanceDto> RentalTypePerformances { get; set; } = new();
    public List<ExpenseCategorySummaryDto> ExpenseBreakdown { get; set; } = new();
    public List<BookingSourcePerformanceDto> BookingSourceBreakdown { get; set; } = new();
    public List<FinancialTransactionDto> FinancialTransactions { get; set; } = new();
}
