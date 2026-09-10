using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Services;

namespace JMP.Enterprises.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>
    /// GET: api/reports/dashboard
    /// High-level analytics overview for the interactive React dashboard.
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardReportOverviewDto>> GetDashboardOverview([FromQuery] ReportFilterDto filter)
    {
        var overview = await _reportService.GetDashboardOverviewAsync(filter);
        return Ok(overview);
    }

    /// <summary>
    /// GET: api/reports/financial-transactions
    /// Normalized stream of payments and expenses (Cash Basis).
    /// </summary>
    [HttpGet("financial-transactions")]
    public async Task<ActionResult<List<FinancialTransactionDto>>> GetFinancialTransactions([FromQuery] ReportFilterDto filter)
    {
        var transactions = await _reportService.GetFinancialTransactionsAsync(filter);
        return Ok(transactions);
    }

    /// <summary>
    /// GET: api/reports/monthly-profitability
    /// Revenue, Expenses, Net Profit & Margin grouped by month and property.
    /// </summary>
    [HttpGet("monthly-profitability")]
    public async Task<ActionResult<List<MonthlyProfitabilityDto>>> GetMonthlyProfitability([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetMonthlyProfitabilityAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// GET: api/reports/property-performance
    /// Comparative performance across Lily, Lala, Pamae.
    /// </summary>
    [HttpGet("property-performance")]
    public async Task<ActionResult<List<PropertyPerformanceDto>>> GetPropertyPerformance([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetPropertyPerformanceAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// GET: api/reports/demand-trends
    /// Booking velocity, cancellations, and occupied days over time.
    /// </summary>
    [HttpGet("demand-trends")]
    public async Task<ActionResult<List<DemandTrendDto>>> GetDemandTrends([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetDemandTrendsAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// GET: api/reports/rental-type-performance
    /// Short-Stay vs Long-Stay comparative revenue and direct expenses.
    /// </summary>
    [HttpGet("rental-type-performance")]
    public async Task<ActionResult<List<RentalTypePerformanceDto>>> GetRentalTypePerformance([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetRentalTypePerformanceAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// GET: api/reports/expense-analysis
    /// Categorized expense breakdown.
    /// </summary>
    [HttpGet("expense-analysis")]
    public async Task<ActionResult<List<ExpenseAnalysisDto>>> GetExpenseAnalysis([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetExpenseAnalysisAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// GET: api/reports/booking-sources
    /// Channel revenue distribution.
    /// </summary>
    [HttpGet("booking-sources")]
    public async Task<ActionResult<List<BookingSourcePerformanceDto>>> GetBookingSources([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetBookingSourcePerformanceAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// GET: api/reports/executive-report
    /// Full structured data package for generating printable PDF management reports.
    /// </summary>
    [HttpGet("executive-report")]
    public async Task<ActionResult<ExecutiveReportSummaryDto>> GetExecutiveReport([FromQuery] ReportFilterDto filter)
    {
        var report = await _reportService.GetExecutiveReportSummaryAsync(filter);
        return Ok(report);
    }
}
