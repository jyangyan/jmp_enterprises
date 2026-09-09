using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JMP.Enterprises.Api.DTOs;

namespace JMP.Enterprises.Api.Services;

public interface IExpenseService
{
    Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync(int? propertyId = null, string? category = null, DateTime? startDate = null, DateTime? endDate = null);
    Task<ExpenseDto?> GetExpenseByIdAsync(int id);
    Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto);
    Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto);
    Task<bool> DeleteExpenseAsync(int id);
    Task<IEnumerable<ExpenseCategorySummaryDto>> GetExpenseCategorySummariesAsync(int? propertyId = null, DateTime? startDate = null, DateTime? endDate = null);
}
