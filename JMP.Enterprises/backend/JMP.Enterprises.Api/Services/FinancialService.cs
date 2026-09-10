using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.DTOs;

namespace JMP.Enterprises.Api.Services;

public class FinancialService : IFinancialService
{
    private readonly ApplicationDbContext _context;
    private readonly IExpenseService _expenseService;

    public FinancialService(ApplicationDbContext context, IExpenseService expenseService)
    {
        _context = context;
        _expenseService = expenseService;
    }

    public async Task<FinancialSummaryDto> GetFinancialSummaryAsync(
        int? propertyId = null, 
        DateTime? startDate = null, 
        DateTime? endDate = null)
    {
        // 1. Payments / Revenue Query
        var paymentsQuery = _context.Payments.Include(p => p.Property).AsNoTracking();
        var expensesQuery = _context.Expenses.Include(e => e.Property).AsNoTracking();

        if (propertyId.HasValue)
        {
            paymentsQuery = paymentsQuery.Where(p => p.PropertyId == propertyId.Value);
            expensesQuery = expensesQuery.Where(e => e.PropertyId == propertyId.Value);
        }

        if (startDate.HasValue)
        {
            paymentsQuery = paymentsQuery.Where(p => p.PaymentDate >= startDate.Value.Date);
            expensesQuery = expensesQuery.Where(e => e.ExpenseDate >= startDate.Value.Date);
        }

        if (endDate.HasValue)
        {
            var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
            paymentsQuery = paymentsQuery.Where(p => p.PaymentDate <= endOfDay);
            expensesQuery = expensesQuery.Where(e => e.ExpenseDate <= endOfDay);
        }

        var payments = await paymentsQuery.ToListAsync();
        var expenses = await expensesQuery.ToListAsync();

        decimal totalRevenue = payments.Sum(p => p.Amount);
        decimal totalExpenses = expenses.Sum(e => e.Amount);
        decimal netProfit = totalRevenue - totalExpenses;
        double profitMargin = totalRevenue > 0 ? (double)(netProfit / totalRevenue * 100) : 0;

        // 2. Breakdown per Property
        var properties = await _context.Properties.Where(p => p.IsActive).AsNoTracking().ToListAsync();
        var propertyBreakdowns = new List<PropertyFinancialBreakdownDto>();

        foreach (var prop in properties)
        {
            // Skip property filter if specific property requested and doesn't match
            if (propertyId.HasValue && prop.PropertyId != propertyId.Value)
                continue;

            decimal propRev = payments.Where(p => p.PropertyId == prop.PropertyId).Sum(p => p.Amount);
            decimal propExp = expenses.Where(e => e.PropertyId == prop.PropertyId).Sum(e => e.Amount);
            decimal propNet = propRev - propExp;
            double propMargin = propRev > 0 ? (double)(propNet / propRev * 100) : 0;

            propertyBreakdowns.Add(new PropertyFinancialBreakdownDto
            {
                PropertyId = prop.PropertyId,
                PropertyName = prop.PropertyName,
                PropertyCode = prop.PropertyCode,
                Revenue = propRev,
                Expenses = propExp,
                NetProfit = propNet,
                ProfitMarginPercentage = Math.Round(propMargin, 1)
            });
        }

        // 3. Category Summaries
        var catSummaries = (await _expenseService.GetExpenseCategorySummariesAsync(propertyId, startDate, endDate)).ToList();

        // 4. Monthly Trends (Last 6 Months or Range)
        var monthlyTrends = GetMonthlyTrends(payments, expenses);
        var propertyMonthlyTrends = GetPropertyMonthlyTrends(properties, payments, expenses);

        return new FinancialSummaryDto
        {
            TotalRevenue = totalRevenue,
            TotalExpenses = totalExpenses,
            NetProfit = netProfit,
            ProfitMarginPercentage = Math.Round(profitMargin, 1),
            TotalPaymentsCount = payments.Count,
            TotalExpensesCount = expenses.Count,
            PropertyBreakdowns = propertyBreakdowns,
            ExpenseCategorySummaries = catSummaries,
            MonthlyTrends = monthlyTrends,
            PropertyMonthlyTrends = propertyMonthlyTrends
        };
    }

    private static List<MonthlyFinancialTrendDto> GetMonthlyTrends(
        List<Models.Payment> payments, 
        List<Models.Expense> expenses)
    {
        var trends = new List<MonthlyFinancialTrendDto>();

        // Always include at least the last 6 months rolling timeline
        var now = DateTime.Now;
        var monthDict = new Dictionary<(int Year, int Month), (int Year, int Month)>();
        for (int i = 5; i >= 0; i--)
        {
            var d = now.AddMonths(-i);
            monthDict[(d.Year, d.Month)] = (d.Year, d.Month);
        }

        foreach (var p in payments) monthDict[(p.PaymentDate.Year, p.PaymentDate.Month)] = (p.PaymentDate.Year, p.PaymentDate.Month);
        foreach (var e in expenses) monthDict[(e.ExpenseDate.Year, e.ExpenseDate.Month)] = (e.ExpenseDate.Year, e.ExpenseDate.Month);

        var months = monthDict.Values.OrderBy(m => m.Year).ThenBy(m => m.Month).ToList();

        foreach (var m in months)
        {
            decimal rev = payments
                .Where(p => p.PaymentDate.Year == m.Year && p.PaymentDate.Month == m.Month)
                .Sum(p => p.Amount);

            decimal exp = expenses
                .Where(e => e.ExpenseDate.Year == m.Year && e.ExpenseDate.Month == m.Month)
                .Sum(e => e.Amount);

            string monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(m.Month);

            trends.Add(new MonthlyFinancialTrendDto
            {
                MonthYear = $"{monthName} {m.Year}",
                Year = m.Year,
                Month = m.Month,
                Revenue = rev,
                Expenses = exp,
                NetProfit = rev - exp
            });
        }

        return trends;
    }

    private static List<PropertyMonthlyTrendDto> GetPropertyMonthlyTrends(
        List<Models.Property> properties,
        List<Models.Payment> payments,
        List<Models.Expense> expenses)
    {
        var result = new List<PropertyMonthlyTrendDto>();

        var now = DateTime.Now;
        var monthDict = new Dictionary<(int Year, int Month), (int Year, int Month)>();
        for (int i = 5; i >= 0; i--)
        {
            var d = now.AddMonths(-i);
            monthDict[(d.Year, d.Month)] = (d.Year, d.Month);
        }

        foreach (var p in payments) monthDict[(p.PaymentDate.Year, p.PaymentDate.Month)] = (p.PaymentDate.Year, p.PaymentDate.Month);
        foreach (var e in expenses) monthDict[(e.ExpenseDate.Year, e.ExpenseDate.Month)] = (e.ExpenseDate.Year, e.ExpenseDate.Month);

        var months = monthDict.Values.OrderBy(m => m.Year).ThenBy(m => m.Month).ToList();

        foreach (var prop in properties)
        {
            foreach (var m in months)
            {
                decimal rev = payments
                    .Where(p => p.PropertyId == prop.PropertyId && p.PaymentDate.Year == m.Year && p.PaymentDate.Month == m.Month)
                    .Sum(p => p.Amount);

                decimal exp = expenses
                    .Where(e => e.PropertyId == prop.PropertyId && e.ExpenseDate.Year == m.Year && e.ExpenseDate.Month == m.Month)
                    .Sum(e => e.Amount);

                string monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(m.Month);

                result.Add(new PropertyMonthlyTrendDto
                {
                    PropertyId = prop.PropertyId,
                    PropertyName = prop.PropertyName,
                    MonthYear = $"{monthName} {m.Year}",
                    Year = m.Year,
                    Month = m.Month,
                    Revenue = rev,
                    Expenses = exp,
                    NetProfit = rev - exp
                });
            }
        }

        return result;
    }
}
