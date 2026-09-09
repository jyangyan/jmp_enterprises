using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Services;

namespace JMP.Enterprises.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinancialsController : ControllerBase
{
    private readonly IFinancialService _financialService;

    public FinancialsController(IFinancialService financialService)
    {
        _financialService = financialService;
    }

    /// <summary>
    /// GET: api/financials/summary?propertyId=1&startDate=...&endDate=...
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<FinancialSummaryDto>> GetFinancialSummary(
        [FromQuery] int? propertyId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var summary = await _financialService.GetFinancialSummaryAsync(propertyId, startDate, endDate);
        return Ok(summary);
    }
}
