using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Models;

namespace JMP.Enterprises.Api.Services;

public class ExpenseService : IExpenseService
{
    private readonly ApplicationDbContext _context;

    public ExpenseService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync(
        int? propertyId = null, 
        string? category = null, 
        DateTime? startDate = null, 
        DateTime? endDate = null)
    {
        var query = _context.Expenses
            .Include(e => e.Property)
            .AsNoTracking();

        if (propertyId.HasValue)
        {
            query = query.Where(e => e.PropertyId == propertyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(e => e.Category == category);
        }

        if (startDate.HasValue)
        {
            query = query.Where(e => e.ExpenseDate >= startDate.Value.Date);
        }

        if (endDate.HasValue)
        {
            query = query.Where(e => e.ExpenseDate <= endDate.Value.Date.AddDays(1).AddTicks(-1));
        }

        var expenses = await query
            .OrderByDescending(e => e.ExpenseDate)
            .ThenByDescending(e => e.ExpenseId)
            .ToListAsync();

        return expenses.Select(MapToDto);
    }

    public async Task<ExpenseDto?> GetExpenseByIdAsync(int id)
    {
        var expense = await _context.Expenses
            .Include(e => e.Property)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.ExpenseId == id);

        return expense != null ? MapToDto(expense) : null;
    }

    public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto)
    {
        if (dto.PropertyId.HasValue)
        {
            var exists = await _context.Properties.AnyAsync(p => p.PropertyId == dto.PropertyId.Value);
            if (!exists)
            {
                throw new ArgumentException($"Property ID {dto.PropertyId.Value} not found.");
            }
        }

        var expense = new Expense
        {
            PropertyId = dto.PropertyId,
            ReservationId = dto.ReservationId,
            ExpenseDate = dto.ExpenseDate,
            Category = dto.Category,
            Amount = dto.Amount,
            VendorPayee = dto.VendorPayee,
            Description = dto.Description,
            ReceiptReference = dto.ReceiptReference,
            CreatedDate = DateTime.Now
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return (await GetExpenseByIdAsync(expense.ExpenseId))!;
    }

    public async Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto)
    {
        var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.ExpenseId == id);
        if (expense == null) return null;

        if (dto.PropertyId.HasValue)
        {
            var exists = await _context.Properties.AnyAsync(p => p.PropertyId == dto.PropertyId.Value);
            if (!exists)
            {
                throw new ArgumentException($"Property ID {dto.PropertyId.Value} not found.");
            }
        }

        expense.PropertyId = dto.PropertyId;
        expense.ReservationId = dto.ReservationId;
        expense.ExpenseDate = dto.ExpenseDate;
        expense.Category = dto.Category;
        expense.Amount = dto.Amount;
        expense.VendorPayee = dto.VendorPayee;
        expense.Description = dto.Description;
        expense.ReceiptReference = dto.ReceiptReference;

        await _context.SaveChangesAsync();

        return await GetExpenseByIdAsync(id);
    }

    public async Task<bool> DeleteExpenseAsync(int id)
    {
        var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.ExpenseId == id);
        if (expense == null) return false;

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<ExpenseCategorySummaryDto>> GetExpenseCategorySummariesAsync(
        int? propertyId = null, 
        DateTime? startDate = null, 
        DateTime? endDate = null)
    {
        var query = _context.Expenses.AsNoTracking();

        if (propertyId.HasValue)
        {
            query = query.Where(e => e.PropertyId == propertyId.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(e => e.ExpenseDate >= startDate.Value.Date);
        }

        if (endDate.HasValue)
        {
            query = query.Where(e => e.ExpenseDate <= endDate.Value.Date.AddDays(1).AddTicks(-1));
        }

        var expenses = await query.ToListAsync();

        decimal totalAll = expenses.Sum(e => e.Amount);

        var grouped = expenses
            .GroupBy(e => e.Category)
            .Select(g =>
            {
                decimal totalCategory = g.Sum(e => e.Amount);
                double pct = totalAll > 0 ? (double)(totalCategory / totalAll * 100) : 0;
                return new ExpenseCategorySummaryDto
                {
                    Category = g.Key,
                    TotalAmount = totalCategory,
                    ExpenseCount = g.Count(),
                    Percentage = Math.Round(pct, 1)
                };
            })
            .OrderByDescending(s => s.TotalAmount)
            .ToList();

        return grouped;
    }

    private static ExpenseDto MapToDto(Expense expense)
    {
        return new ExpenseDto
        {
            ExpenseId = expense.ExpenseId,
            PropertyId = expense.PropertyId,
            PropertyName = expense.Property != null ? expense.Property.PropertyName : "General / Overhead",
            ReservationId = expense.ReservationId,
            ExpenseDate = expense.ExpenseDate,
            Category = expense.Category,
            Amount = expense.Amount,
            VendorPayee = expense.VendorPayee,
            Description = expense.Description,
            ReceiptReference = expense.ReceiptReference,
            CreatedDate = expense.CreatedDate
        };
    }
}
