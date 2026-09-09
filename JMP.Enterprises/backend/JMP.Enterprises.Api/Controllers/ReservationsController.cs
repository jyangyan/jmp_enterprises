using Microsoft.AspNetCore.Mvc;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Services;

namespace JMP.Enterprises.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly ReservationService _reservationService;

    public ReservationsController(ReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    /// <summary>
    /// GET /api/reservations — Returns list of reservations with optional filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservationDto>>> GetReservations(
        [FromQuery] int? propertyId = null,
        [FromQuery] string? rentalType = null,
        [FromQuery] string? status = null)
    {
        var list = await _reservationService.GetAllReservationsAsync(propertyId, rentalType, status);
        return Ok(list);
    }

    /// <summary>
    /// GET /api/reservations/{id} — Returns single reservation by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ReservationDto>> GetReservation(int id)
    {
        var reservation = await _reservationService.GetReservationByIdAsync(id);
        if (reservation == null) return NotFound(new { message = $"Reservation #{id} not found." });
        return Ok(reservation);
    }

    /// <summary>
    /// GET /api/reservations/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD — Checks property availability for a date range
    /// </summary>
    [HttpGet("availability")]
    public async Task<ActionResult<IEnumerable<PropertyAvailabilityDto>>> CheckAvailability(
        [FromQuery] DateTime checkIn, 
        [FromQuery] DateTime checkOut)
    {
        if (checkOut <= checkIn)
        {
            return BadRequest(new { message = "Check-Out Date must be later than Check-In Date." });
        }

        var list = await _reservationService.CheckAvailabilityAsync(checkIn, checkOut);
        return Ok(list);
    }

    /// <summary>
    /// POST /api/reservations — Creates a new reservation with double booking validation
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ReservationDto>> CreateReservation([FromBody] CreateReservationDto dto)
    {
        try
        {
            var created = await _reservationService.CreateReservationAsync(dto);
            return CreatedAtAction(nameof(GetReservation), new { id = created.ReservationId }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// PUT /api/reservations/{id} — Updates reservation details with conflict validation
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ReservationDto>> UpdateReservation(int id, [FromBody] UpdateReservationDto dto)
    {
        try
        {
            var updated = await _reservationService.UpdateReservationAsync(id, dto);
            if (updated == null) return NotFound(new { message = $"Reservation #{id} not found." });

            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// DELETE /api/reservations/{id} — Soft cancels a reservation (ReservationStatus = "Cancelled")
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> CancelReservation(int id)
    {
        var success = await _reservationService.CancelReservationAsync(id);
        if (!success) return NotFound(new { message = $"Reservation #{id} not found." });

        return Ok(new { message = "Reservation cancelled successfully." });
    }
}
