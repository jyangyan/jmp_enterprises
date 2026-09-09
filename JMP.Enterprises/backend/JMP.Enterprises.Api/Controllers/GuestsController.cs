using Microsoft.AspNetCore.Mvc;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Services;

namespace JMP.Enterprises.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GuestsController : ControllerBase
{
    private readonly GuestService _guestService;

    public GuestsController(GuestService guestService)
    {
        _guestService = guestService;
    }

    /// <summary>
    /// GET /api/guests — Returns list of guests/tenants
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GuestDto>>> GetGuests([FromQuery] bool includeInactive = false)
    {
        var guests = await _guestService.GetAllGuestsAsync(includeInactive);
        return Ok(guests);
    }

    /// <summary>
    /// GET /api/guests/{id} — Returns single guest by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<GuestDto>> GetGuest(int id)
    {
        var guest = await _guestService.GetGuestByIdAsync(id);
        if (guest == null) return NotFound(new { message = $"Guest #{id} not found." });
        return Ok(guest);
    }

    /// <summary>
    /// POST /api/guests — Creates a new guest or corporate tenant
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<GuestDto>> CreateGuest([FromBody] CreateGuestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
        {
            return BadRequest(new { message = "FirstName and LastName are required." });
        }

        var created = await _guestService.CreateGuestAsync(dto);
        return CreatedAtAction(nameof(GetGuest), new { id = created.GuestId }, created);
    }

    /// <summary>
    /// PUT /api/guests/{id} — Updates guest details
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<GuestDto>> UpdateGuest(int id, [FromBody] UpdateGuestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
        {
            return BadRequest(new { message = "FirstName and LastName are required." });
        }

        var updated = await _guestService.UpdateGuestAsync(id, dto);
        if (updated == null) return NotFound(new { message = $"Guest #{id} not found." });

        return Ok(updated);
    }

    /// <summary>
    /// DELETE /api/guests/{id} — Soft deactivates guest
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeactivateGuest(int id)
    {
        var success = await _guestService.DeactivateGuestAsync(id);
        if (!success) return NotFound(new { message = $"Guest #{id} not found." });

        return Ok(new { message = "Guest deactivated successfully." });
    }

    /// <summary>
    /// PATCH /api/guests/{id}/reactivate — Reactivates inactive guest
    /// </summary>
    [HttpPatch("{id}/reactivate")]
    public async Task<ActionResult<GuestDto>> ReactivateGuest(int id)
    {
        var reactivated = await _guestService.ReactivateGuestAsync(id);
        if (reactivated == null) return NotFound(new { message = $"Guest #{id} not found." });

        return Ok(reactivated);
    }
}
