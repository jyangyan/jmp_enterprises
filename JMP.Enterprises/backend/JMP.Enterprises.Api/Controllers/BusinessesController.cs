using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.Models;
using JMP.Enterprises.Api.DTOs;

namespace JMP.Enterprises.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BusinessesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BusinessesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets all registered businesses under JMP Enterprises.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BusinessDto>>> GetBusinesses()
    {
        var businesses = await _context.Businesses
            .OrderBy(b => b.DisplayOrder)
            .Select(b => new BusinessDto
            {
                BusinessId = b.BusinessId,
                BusinessCode = b.BusinessCode,
                BusinessName = b.BusinessName,
                Description = b.Description,
                Icon = b.Icon,
                Route = b.Route,
                IsActive = b.IsActive,
                DisplayOrder = b.DisplayOrder,
                IsImplemented = b.BusinessCode == "RENTAL" // Currently Rental is fully functional
            })
            .ToListAsync();

        return Ok(businesses);
    }

    /// <summary>
    /// Gets access permissions for a specific user.
    /// </summary>
    [HttpGet("access/{userId}")]
    public async Task<ActionResult<IEnumerable<UserBusinessAccessDto>>> GetUserAccess(string userId)
    {
        var accessList = await _context.UserBusinessAccesses
            .Include(u => u.Business)
            .Where(u => u.UserId.ToLower() == userId.ToLower())
            .Select(u => new UserBusinessAccessDto
            {
                UserBusinessAccessId = u.UserBusinessAccessId,
                UserId = u.UserId,
                BusinessId = u.BusinessId,
                BusinessCode = u.Business != null ? u.Business.BusinessCode : string.Empty,
                BusinessName = u.Business != null ? u.Business.BusinessName : string.Empty,
                Role = u.Role,
                CanAccess = u.CanAccess,
                CanView = u.CanView,
                CanCreate = u.CanCreate,
                CanEdit = u.CanEdit,
                CanDeleteOrVoid = u.CanDeleteOrVoid
            })
            .ToListAsync();

        return Ok(accessList);
    }

    /// <summary>
    /// Updates user business permissions.
    /// </summary>
    [HttpPost("access")]
    public async Task<IActionResult> UpdateUserAccess([FromBody] UpdateUserBusinessAccessDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.UserId))
        {
            return BadRequest("UserId is required.");
        }

        var existingAccess = await _context.UserBusinessAccesses
            .Where(u => u.UserId.ToLower() == dto.UserId.ToLower())
            .ToListAsync();

        _context.UserBusinessAccesses.RemoveRange(existingAccess);

        var newAccess = dto.AllowedBusinessIds.Select(bId => new UserBusinessAccess
        {
            UserId = dto.UserId,
            BusinessId = bId,
            Role = dto.Role,
            CanAccess = true,
            CanView = true,
            CanCreate = dto.Role != "Viewer",
            CanEdit = dto.Role != "Viewer",
            CanDeleteOrVoid = dto.Role == "SuperAdmin" || dto.Role == "Owner"
        }).ToList();

        await _context.UserBusinessAccesses.AddRangeAsync(newAccess);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User business access updated successfully." });
    }
}
