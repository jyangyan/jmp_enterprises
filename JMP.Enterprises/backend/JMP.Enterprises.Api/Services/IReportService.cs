using System.Collections.Generic;
using System.Threading.Tasks;
using JMP.Enterprises.Api.DTOs;

namespace JMP.Enterprises.Api.Services;

public interface IReportService
{
    Task<DashboardReportOverviewDto> GetDashboardOverviewAsync(ReportFilterDto filter);
    Task<List<FinancialTransactionDto>> GetFinancialTransactionsAsync(ReportFilterDto filter);
    Task<List<MonthlyProfitabilityDto>> GetMonthlyProfitabilityAsync(ReportFilterDto filter);
    Task<List<PropertyPerformanceDto>> GetPropertyPerformanceAsync(ReportFilterDto filter);
    Task<List<DemandTrendDto>> GetDemandTrendsAsync(ReportFilterDto filter);
    Task<List<RentalTypePerformanceDto>> GetRentalTypePerformanceAsync(ReportFilterDto filter);
    Task<List<ExpenseAnalysisDto>> GetExpenseAnalysisAsync(ReportFilterDto filter);
    Task<List<BookingSourcePerformanceDto>> GetBookingSourcePerformanceAsync(ReportFilterDto filter);
    Task<ExecutiveReportSummaryDto> GetExecutiveReportSummaryAsync(ReportFilterDto filter);
}
