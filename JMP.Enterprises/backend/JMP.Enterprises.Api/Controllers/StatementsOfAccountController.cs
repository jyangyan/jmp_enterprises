using Microsoft.AspNetCore.Mvc;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Services;

namespace JMP.Enterprises.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatementsOfAccountController : ControllerBase
{
    private readonly IStatementOfAccountService _soaService;

    public StatementsOfAccountController(IStatementOfAccountService soaService)
    {
        _soaService = soaService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StatementOfAccountResponseDto>>> GetAll([FromQuery] string? status)
    {
        var list = await _soaService.GetAllAsync(status);
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StatementOfAccountResponseDto>> GetById(int id)
    {
        var soa = await _soaService.GetByIdAsync(id);
        if (soa == null) return NotFound(new { message = $"Statement of Account with ID {id} was not found." });
        return Ok(soa);
    }

    [HttpGet("reservation/{reservationId}")]
    public async Task<ActionResult<IEnumerable<StatementOfAccountResponseDto>>> GetByReservation(int reservationId)
    {
        var list = await _soaService.GetByReservationIdAsync(reservationId);
        return Ok(list);
    }

    [HttpGet("agreement/{agreementId}")]
    public async Task<ActionResult<IEnumerable<StatementOfAccountResponseDto>>> GetByAgreement(int agreementId)
    {
        var list = await _soaService.GetByAgreementIdAsync(agreementId);
        return Ok(list);
    }

    [HttpGet("latest-reading/{propertyId}")]
    public async Task<ActionResult<decimal>> GetLatestMeterReading(int propertyId)
    {
        var reading = await _soaService.GetLatestMeterReadingForPropertyAsync(propertyId);
        return Ok(reading);
    }

    [HttpPost]
    public async Task<ActionResult<StatementOfAccountResponseDto>> Create([FromBody] CreateStatementOfAccountDto dto)
    {
        try
        {
            var created = await _soaService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.StatementOfAccountId }, created);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<StatementOfAccountResponseDto>> Update(int id, [FromBody] UpdateStatementOfAccountDto dto)
    {
        try
        {
            var updated = await _soaService.UpdateAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/record-payment")]
    public async Task<ActionResult<StatementOfAccountResponseDto>> RecordPayment(int id, [FromBody] RecordSoaPaymentDto dto)
    {
        try
        {
            var updated = await _soaService.RecordPaymentAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _soaService.DeleteAsync(id);
        if (!success) return NotFound(new { message = $"Statement of Account with ID {id} was not found." });
        return NoContent();
    }
}
