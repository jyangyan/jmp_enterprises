using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Services;

namespace JMP.Enterprises.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    /// <summary>
    /// GET: api/expenses?propertyId=1&category=Maintenance&startDate=...&endDate=...
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpenses(
        [FromQuery] int? propertyId,
        [FromQuery] string? category,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var expenses = await _expenseService.GetAllExpensesAsync(propertyId, category, startDate, endDate);
        return Ok(expenses);
    }

    /// <summary>
    /// GET: api/expenses/5
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseDto>> GetExpense(int id)
    {
        var expense = await _expenseService.GetExpenseByIdAsync(id);
        if (expense == null) return NotFound();
        return Ok(expense);
    }

    /// <summary>
    /// GET: api/expenses/categories/summary
    /// </summary>
    [HttpGet("categories/summary")]
    public async Task<ActionResult<IEnumerable<ExpenseCategorySummaryDto>>> GetCategorySummaries(
        [FromQuery] int? propertyId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var summaries = await _expenseService.GetExpenseCategorySummariesAsync(propertyId, startDate, endDate);
        return Ok(summaries);
    }

    /// <summary>
    /// POST: api/expenses
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense([FromBody] CreateExpenseDto dto)
    {
        try
        {
            var expense = await _expenseService.CreateExpenseAsync(dto);
            return CreatedAtAction(nameof(GetExpense), new { id = expense.ExpenseId }, expense);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// PUT: api/expenses/5
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(int id, [FromBody] UpdateExpenseDto dto)
    {
        try
        {
            var updated = await _expenseService.UpdateExpenseAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// DELETE: api/expenses/5
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        var deleted = await _expenseService.DeleteExpenseAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
