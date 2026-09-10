using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.DTOs;

namespace JMP.Enterprises.Api.Services;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;

    public ReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardReportOverviewDto> GetDashboardOverviewAsync(ReportFilterDto filter)
    {
        var executiveSummary = await GetExecutiveReportSummaryAsync(filter);

        return new DashboardReportOverviewDto
        {
            PeriodText = executiveSummary.PeriodText,
            FilteredPropertyName = executiveSummary.FilteredPropertyName,
            TotalRevenue = executiveSummary.TotalRevenue,
            TotalExpenses = executiveSummary.TotalExpenses,
            NetProfit = executiveSummary.NetProfit,
            ProfitMargin = executiveSummary.ProfitMargin,
            ProfitLossStatus = executiveSummary.ProfitLossStatus,
            TotalReservations = executiveSummary.TotalReservations,
            ShortStayReservations = executiveSummary.ShortStayReservations,
            LongStayReservations = executiveSummary.LongStayReservations,
            TotalOccupiedDays = executiveSummary.OccupiedDays,
            OverallOccupancyRate = executiveSummary.OccupancyRate,
            SecurityDepositsHeld = executiveSummary.SecurityDepositsHeld,
            TopPerformingProperty = executiveSummary.TopPerformingProperty,
            MonthlyTrends = executiveSummary.MonthlyProfitability,
            PropertyPerformances = executiveSummary.PropertyPerformances,
            RentalTypePerformances = executiveSummary.RentalTypePerformances,
            ExpenseBreakdown = executiveSummary.ExpenseBreakdown,
            BookingSourceBreakdown = executiveSummary.BookingSourceBreakdown,
            RecentTransactions = executiveSummary.FinancialTransactions.Take(10).ToList()
        };
    }

    public async Task<List<FinancialTransactionDto>> GetFinancialTransactionsAsync(ReportFilterDto filter)
    {
        var sql = @"
            SELECT 
                TransactionId, TransactionDate, PropertyId, PropertyName, PropertyCode,
                ReservationId, RentalType, BookingSource, TransactionType, Category,
                Amount, IncomeAmount, ExpenseAmount, Year, Month, YearMonth
            FROM vw_rental_financial_transactions
            WHERE 1=1";

        var (whereSql, sqlParams) = BuildWhereClause(filter, "TransactionDate", "PropertyId");
        sql += whereSql + " ORDER BY TransactionDate DESC, TransactionId DESC";

        return await _context.Database.SqlQueryRaw<FinancialTransactionDto>(sql, sqlParams.ToArray()).ToListAsync();
    }

    public async Task<List<MonthlyProfitabilityDto>> GetMonthlyProfitabilityAsync(ReportFilterDto filter)
    {
        var sql = @"
            SELECT 
                Year, Month, YearMonth,
                PropertyId, PropertyName, RentalType,
                SUM(IncomeAmount) AS Revenue,
                SUM(ExpenseAmount) AS Expenses,
                SUM(IncomeAmount) - SUM(ExpenseAmount) AS NetProfit,
                CASE 
                    WHEN SUM(IncomeAmount) > 0 THEN 
                        ((SUM(IncomeAmount) - SUM(ExpenseAmount)) / SUM(IncomeAmount)) * 100.0
                    ELSE 0.0 
                END AS ProfitMargin
            FROM vw_rental_financial_transactions
            WHERE 1=1";

        var (whereSql, sqlParams) = BuildWhereClause(filter, "TransactionDate", "PropertyId");
        sql += whereSql + " GROUP BY Year, Month, YearMonth, PropertyId, PropertyName, RentalType ORDER BY YearMonth ASC";

        return await _context.Database.SqlQueryRaw<MonthlyProfitabilityDto>(sql, sqlParams.ToArray()).ToListAsync();
    }

    public async Task<List<PropertyPerformanceDto>> GetPropertyPerformanceAsync(ReportFilterDto filter)
    {
        // Query properties combined with financial view and reservation counts within filtered range
        var properties = await _context.Properties.AsNoTracking().Where(p => p.IsActive).ToListAsync();
        var result = new List<PropertyPerformanceDto>();

        foreach (var prop in properties)
        {
            if (filter.PropertyId.HasValue && filter.PropertyId.Value != prop.PropertyId)
                continue;

            // Financials for this property
            var finSql = @"
                SELECT 
                    COALESCE(SUM(IncomeAmount), 0.00) AS Revenue,
                    COALESCE(SUM(ExpenseAmount), 0.00) AS Expenses
                FROM vw_rental_financial_transactions
                WHERE PropertyId = @propId";

            var finParams = new List<object> { new SqlParameter("@propId", prop.PropertyId) };

            if (filter.StartDate.HasValue)
            {
                finSql += " AND TransactionDate >= @startDate";
                finParams.Add(new SqlParameter("@startDate", filter.StartDate.Value));
            }
            if (filter.EndDate.HasValue)
            {
                finSql += " AND TransactionDate <= @endDate";
                finParams.Add(new SqlParameter("@endDate", filter.EndDate.Value));
            }

            var finRow = await _context.Database.SqlQueryRaw<FinSummaryTemp>(finSql, finParams.ToArray()).FirstOrDefaultAsync()
                         ?? new FinSummaryTemp();

            // Reservations count & occupied days
            var resQuery = _context.Reservations.AsNoTracking()
                .Where(r => r.PropertyId == prop.PropertyId && r.ReservationStatus != "Cancelled");

            if (filter.StartDate.HasValue)
                resQuery = resQuery.Where(r => r.CheckOutDate >= filter.StartDate.Value);
            if (filter.EndDate.HasValue)
                resQuery = resQuery.Where(r => r.CheckInDate <= filter.EndDate.Value);

            var resList = await resQuery.ToListAsync();

            int shortStay = resList.Count(r => r.RentalType == "ShortStay");
            int longStay = resList.Count(r => r.RentalType == "LongStay");
            int occupiedDays = resList.Sum(r => (r.CheckOutDate - r.CheckInDate).Days);

            decimal revenue = finRow.Revenue ?? 0.00m;
            decimal expenses = finRow.Expenses ?? 0.00m;
            decimal netProfit = revenue - expenses;
            double profitMargin = revenue > 0 ? (double)((netProfit / revenue) * 100m) : 0.0;

            result.Add(new PropertyPerformanceDto
            {
                PropertyId = prop.PropertyId,
                PropertyName = prop.PropertyName,
                PropertyCode = prop.PropertyCode,
                Revenue = revenue,
                Expenses = expenses,
                NetProfit = netProfit,
                ProfitMargin = Math.Round(profitMargin, 2),
                ReservationCount = resList.Count,
                ShortStayCount = shortStay,
                LongStayCount = longStay,
                OccupiedDays = occupiedDays
            });
        }

        return result;
    }

    public async Task<List<DemandTrendDto>> GetDemandTrendsAsync(ReportFilterDto filter)
    {
        var sql = @"
            SELECT 
                Year, Month, YearMonth, PropertyId, PropertyName, RentalType,
                ReservationCount, ConfirmedReservationCount, CancelledReservationCount,
                OccupiedDays, AverageLengthOfStay
            FROM vw_rental_demand_trend
            WHERE 1=1";

        var (whereSql, sqlParams) = BuildWhereClause(filter, null, "PropertyId");
        sql += whereSql + " ORDER BY YearMonth ASC";

        return await _context.Database.SqlQueryRaw<DemandTrendDto>(sql, sqlParams.ToArray()).ToListAsync();
    }

    public async Task<List<RentalTypePerformanceDto>> GetRentalTypePerformanceAsync(ReportFilterDto filter)
    {
        var resQuery = _context.Reservations.AsNoTracking()
            .Where(r => r.ReservationStatus != "Cancelled");

        if (filter.PropertyId.HasValue)
            resQuery = resQuery.Where(r => r.PropertyId == filter.PropertyId.Value);
        if (filter.StartDate.HasValue)
            resQuery = resQuery.Where(r => r.CheckOutDate >= filter.StartDate.Value);
        if (filter.EndDate.HasValue)
            resQuery = resQuery.Where(r => r.CheckInDate <= filter.EndDate.Value);

        var reservations = await resQuery.ToListAsync();

        var finTx = await GetFinancialTransactionsAsync(filter);

        var types = new[] { "ShortStay", "LongStay" };
        var result = new List<RentalTypePerformanceDto>();

        foreach (var type in types)
        {
            var resForType = reservations.Where(r => r.RentalType == type).ToList();
            var resIds = resForType.Select(r => r.ReservationId).ToHashSet();

            var txForType = finTx.Where(t => t.RentalType == type || (t.ReservationId.HasValue && resIds.Contains(t.ReservationId.Value))).ToList();

            decimal revenue = txForType.Where(t => t.TransactionType == "Income").Sum(t => t.IncomeAmount);
            decimal directExpenses = txForType.Where(t => t.TransactionType == "Expense").Sum(t => t.ExpenseAmount);
            decimal netProfit = revenue - directExpenses;

            double avgStay = resForType.Any() ? resForType.Average(r => (r.CheckOutDate - r.CheckInDate).Days) : 0.0;

            result.Add(new RentalTypePerformanceDto
            {
                RentalType = type,
                ReservationCount = resForType.Count,
                Revenue = revenue,
                DirectExpenses = directExpenses,
                NetProfitBeforeSharedExpenses = netProfit,
                AverageStayLength = Math.Round(avgStay, 1)
            });
        }

        return result;
    }

    public async Task<List<ExpenseAnalysisDto>> GetExpenseAnalysisAsync(ReportFilterDto filter)
    {
        var sql = @"
            SELECT 
                ExpenseCategory, PropertyId, PropertyName, ReservationId, RentalType,
                TotalAmount, Year, Month, YearMonth
            FROM vw_rental_expense_analysis
            WHERE 1=1";

        var (whereSql, sqlParams) = BuildWhereClause(filter, null, "PropertyId");
        sql += whereSql + " ORDER BY TotalAmount DESC";

        return await _context.Database.SqlQueryRaw<ExpenseAnalysisDto>(sql, sqlParams.ToArray()).ToListAsync();
    }

    public async Task<List<BookingSourcePerformanceDto>> GetBookingSourcePerformanceAsync(ReportFilterDto filter)
    {
        var resQuery = _context.Reservations.AsNoTracking()
            .Where(r => r.ReservationStatus != "Cancelled");

        if (filter.PropertyId.HasValue)
            resQuery = resQuery.Where(r => r.PropertyId == filter.PropertyId.Value);

        var reservations = await resQuery.ToListAsync();
        var finTx = await GetFinancialTransactionsAsync(filter);

        var sources = reservations.Select(r => r.BookingSource).Distinct().ToList();
        if (!sources.Any())
        {
            sources = new List<string> { "Direct", "AirBnB", "Booking.com", "Facebook", "Walk-in" };
        }

        var result = new List<BookingSourcePerformanceDto>();

        foreach (var source in sources)
        {
            var resForSource = reservations.Where(r => r.BookingSource == source).ToList();
            var resIds = resForSource.Select(r => r.ReservationId).ToHashSet();

            var txForSource = finTx.Where(t => t.BookingSource == source || (t.ReservationId.HasValue && resIds.Contains(t.ReservationId.Value))).ToList();
            decimal rev = txForSource.Where(t => t.TransactionType == "Income").Sum(t => t.IncomeAmount);
            int count = resForSource.Count;
            decimal avgVal = count > 0 ? rev / count : 0.00m;

            result.Add(new BookingSourcePerformanceDto
            {
                BookingSource = source,
                PropertyId = filter.PropertyId,
                PropertyName = filter.PropertyId.HasValue ? (await _context.Properties.FindAsync(filter.PropertyId.Value))?.PropertyName : "All Properties",
                ReservationCount = count,
                Revenue = rev,
                AverageReservationValue = Math.Round(avgVal, 2)
            });
        }

        return result.OrderByDescending(b => b.Revenue).ToList();
    }

    public async Task<ExecutiveReportSummaryDto> GetExecutiveReportSummaryAsync(ReportFilterDto filter)
    {
        // 1. Get Transactions & Base Financials
        var transactions = await GetFinancialTransactionsAsync(filter);
        decimal totalRevenue = transactions.Where(t => t.TransactionType == "Income").Sum(t => t.IncomeAmount);
        decimal totalExpenses = transactions.Where(t => t.TransactionType == "Expense").Sum(t => t.ExpenseAmount);
        decimal netProfit = totalRevenue - totalExpenses;
        double profitMargin = totalRevenue > 0 ? (double)((netProfit / totalRevenue) * 100m) : 0.0;
        string profitLossStatus = netProfit >= 0 ? "PROFITABLE" : "LOSS";

        // 2. Property Performance Breakdown
        var propertyPerformances = await GetPropertyPerformanceAsync(filter);
        string topProperty = propertyPerformances.OrderByDescending(p => p.NetProfit).FirstOrDefault()?.PropertyName ?? "N/A";

        // 3. Rental Type Breakdown
        var rentalTypePerformances = await GetRentalTypePerformanceAsync(filter);

        // 4. Monthly Profitability
        var monthlyProfitability = await GetMonthlyProfitabilityAsync(filter);

        // 5. Expense Breakdown by Category
        var rawExpenses = transactions.Where(t => t.TransactionType == "Expense").ToList();
        var expenseCategories = rawExpenses
            .GroupBy(e => string.IsNullOrWhiteSpace(e.Category) ? "Uncategorized" : e.Category)
            .Select(g => new ExpenseCategorySummaryDto
            {
                Category = g.Key,
                TotalAmount = g.Sum(x => x.ExpenseAmount),
                Percentage = totalExpenses > 0 ? Math.Round((double)(g.Sum(x => x.ExpenseAmount) / totalExpenses * 100m), 1) : 0.0
            })
            .OrderByDescending(c => c.TotalAmount)
            .ToList();

        // 6. Booking Source Breakdown
        var bookingSources = await GetBookingSourcePerformanceAsync(filter);

        // 7. Security Deposits Held (Rule: Security deposits are liabilities, NOT rental revenue)
        var secDepQuery = _context.Payments.AsNoTracking()
            .Where(p => p.PaymentType == "Security Deposit");
        if (filter.PropertyId.HasValue)
            secDepQuery = secDepQuery.Where(p => p.PropertyId == filter.PropertyId.Value);

        decimal totalSecDeposits = await secDepQuery.SumAsync(p => p.Amount);

        // 8. Occupancy Rate Calculation
        var resQuery = _context.Reservations.AsNoTracking()
            .Where(r => r.ReservationStatus != "Cancelled");
        if (filter.PropertyId.HasValue)
            resQuery = resQuery.Where(r => r.PropertyId == filter.PropertyId.Value);
        if (filter.StartDate.HasValue)
            resQuery = resQuery.Where(r => r.CheckOutDate >= filter.StartDate.Value);
        if (filter.EndDate.HasValue)
            resQuery = resQuery.Where(r => r.CheckInDate <= filter.EndDate.Value);

        var activeReservations = await resQuery.ToListAsync();
        int totalReservations = activeReservations.Count;
        int shortStayCount = activeReservations.Count(r => r.RentalType == "ShortStay");
        int longStayCount = activeReservations.Count(r => r.RentalType == "LongStay");
        int occupiedDays = activeReservations.Sum(r => (r.CheckOutDate - r.CheckInDate).Days);

        int totalPropertiesCount = filter.PropertyId.HasValue ? 1 : await _context.Properties.CountAsync(p => p.IsActive);
        if (totalPropertiesCount == 0) totalPropertiesCount = 1;

        DateTime rangeStart = filter.StartDate ?? (activeReservations.Any() ? activeReservations.Min(r => r.CheckInDate) : DateTime.Today.AddDays(-30));
        DateTime rangeEnd = filter.EndDate ?? (activeReservations.Any() ? activeReservations.Max(r => r.CheckOutDate) : DateTime.Today);
        int daysInPeriod = Math.Max(1, (rangeEnd - rangeStart).Days + 1);
        double totalAvailableDays = totalPropertiesCount * daysInPeriod;
        double occupancyRate = Math.Min(100.0, Math.Round((occupiedDays / totalAvailableDays) * 100.0, 1));

        // Period Text & Filtered Property Name
        string periodText = filter.StartDate.HasValue && filter.EndDate.HasValue
            ? $"{filter.StartDate.Value:MMM dd, yyyy} - {filter.EndDate.Value:MMM dd, yyyy}"
            : "All Time";

        string propertyNameText = "All Rental Properties";
        if (filter.PropertyId.HasValue)
        {
            var p = await _context.Properties.FindAsync(filter.PropertyId.Value);
            if (p != null) propertyNameText = p.PropertyName;
        }

        return new ExecutiveReportSummaryDto
        {
            GeneratedAt = DateTime.Now,
            PeriodText = periodText,
            FilteredPropertyName = propertyNameText,
            TotalRevenue = totalRevenue,
            TotalExpenses = totalExpenses,
            NetProfit = netProfit,
            ProfitMargin = Math.Round(profitMargin, 2),
            ProfitLossStatus = profitLossStatus,
            TotalReservations = totalReservations,
            ShortStayReservations = shortStayCount,
            LongStayReservations = longStayCount,
            OccupiedDays = occupiedDays,
            OccupancyRate = occupancyRate,
            SecurityDepositsHeld = totalSecDeposits,
            TopPerformingProperty = topProperty,
            MonthlyProfitability = monthlyProfitability,
            PropertyPerformances = propertyPerformances,
            RentalTypePerformances = rentalTypePerformances,
            ExpenseBreakdown = expenseCategories,
            BookingSourceBreakdown = bookingSources,
            FinancialTransactions = transactions
        };
    }

    private static (string WhereSql, List<object> Params) BuildWhereClause(ReportFilterDto filter, string? dateCol, string propCol)
    {
        var clauses = new List<string>();
        var parameters = new List<object>();
        int pIndex = 0;

        if (!string.IsNullOrEmpty(dateCol))
        {
            if (filter.StartDate.HasValue)
            {
                clauses.Add($"{dateCol} >= @p{pIndex}");
                parameters.Add(new SqlParameter($"@p{pIndex}", filter.StartDate.Value));
                pIndex++;
            }

            if (filter.EndDate.HasValue)
            {
                clauses.Add($"{dateCol} <= @p{pIndex}");
                parameters.Add(new SqlParameter($"@p{pIndex}", filter.EndDate.Value));
                pIndex++;
            }
        }

        if (filter.PropertyId.HasValue)
        {
            clauses.Add($"{propCol} = @p{pIndex}");
            parameters.Add(new SqlParameter($"@p{pIndex}", filter.PropertyId.Value));
            pIndex++;
        }

        string whereSql = clauses.Any() ? " AND " + string.Join(" AND ", clauses) : string.Empty;
        return (whereSql, parameters);
    }

    private class FinSummaryTemp
    {
        public decimal? Revenue { get; set; }
        public decimal? Expenses { get; set; }
    }
}
