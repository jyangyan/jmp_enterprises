using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JMP.Enterprises.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RentalAgreementsController : ControllerBase
{
    private readonly IRentalAgreementService _agreementService;

    public RentalAgreementsController(IRentalAgreementService agreementService)
    {
        _agreementService = agreementService;
    }

    /// <summary>
    /// Gets rental agreement by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<RentalAgreementDto>> GetById(int id)
    {
        var agreement = await _agreementService.GetByIdAsync(id);
        if (agreement == null)
        {
            return NotFound(new { message = $"Rental Agreement #{id} not found." });
        }
        return Ok(agreement);
    }

    /// <summary>
    /// Gets active/latest agreement for a reservation
    /// </summary>
    [HttpGet("reservation/{reservationId}")]
    public async Task<ActionResult<RentalAgreementDto>> GetByReservationId(int reservationId)
    {
        var agreement = await _agreementService.GetByReservationIdAsync(reservationId);
        if (agreement == null)
        {
            return NotFound(new { message = $"No active rental agreement found for Reservation #{reservationId}." });
        }
        return Ok(agreement);
    }

    /// <summary>
    /// Generates a draft rental agreement pre-populated from reservation, guest, and property
    /// </summary>
    [HttpPost("generate-draft/{reservationId}")]
    public async Task<ActionResult<RentalAgreementDto>> GenerateDraft(int reservationId, [FromBody] CreateRentalAgreementDto? customDto)
    {
        try
        {
            var agreement = await _agreementService.CreateDraftAsync(reservationId, customDto);
            return Ok(agreement);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Updates a draft rental agreement
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<RentalAgreementDto>> UpdateDraft(int id, [FromBody] UpdateRentalAgreementDto dto)
    {
        try
        {
            var agreement = await _agreementService.UpdateDraftAsync(id, dto);
            return Ok(agreement);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Finalizes a draft rental agreement (marks terms as official immutable snapshot)
    /// </summary>
    [HttpPost("{id}/finalize")]
    public async Task<ActionResult<RentalAgreementDto>> Finalize(int id)
    {
        try
        {
            var agreement = await _agreementService.FinalizeAsync(id);
            return Ok(agreement);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cancels a rental agreement
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<RentalAgreementDto>> Cancel(int id)
    {
        try
        {
            var agreement = await _agreementService.CancelAsync(id);
            return Ok(agreement);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
