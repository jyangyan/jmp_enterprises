using System;
using System.Collections.Generic;

namespace JMP.Enterprises.Api.DTOs;

public class FinancialSummaryDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit { get; set; }
    public double ProfitMarginPercentage { get; set; }
    public int TotalPaymentsCount { get; set; }
    public int TotalExpensesCount { get; set; }
    public List<PropertyFinancialBreakdownDto> PropertyBreakdowns { get; set; } = new();
    public List<ExpenseCategorySummaryDto> ExpenseCategorySummaries { get; set; } = new();
    public List<MonthlyFinancialTrendDto> MonthlyTrends { get; set; } = new();
    public List<PropertyMonthlyTrendDto> PropertyMonthlyTrends { get; set; } = new();
}

public class PropertyFinancialBreakdownDto
{
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyCode { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
    public decimal NetProfit { get; set; }
    public double ProfitMarginPercentage { get; set; }
}

public class MonthlyFinancialTrendDto
{
    public string MonthYear { get; set; } = string.Empty; // e.g. "Sep 2026"
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
    public decimal NetProfit { get; set; }
}

public class PropertyMonthlyTrendDto
{
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string MonthYear { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
    public decimal NetProfit { get; set; }
}
