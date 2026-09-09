using Microsoft.AspNetCore.Mvc;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Services;

namespace JMP.Enterprises.Api.Controllers;

/// <summary>
/// API controller for managing rental properties.
/// Base route: /api/properties
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PropertiesController : ControllerBase
{
    private readonly PropertyService _propertyService;

    public PropertiesController(PropertyService propertyService)
    {
        _propertyService = propertyService;
    }

    /// <summary>
    /// GET /api/properties
    /// Returns all active properties.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<PropertyDto>>> GetProperties()
    {
        var properties = await _propertyService.GetActivePropertiesAsync();
        return Ok(properties);
    }

    /// <summary>
    /// GET /api/properties/all
    /// Returns all properties including inactive ones (admin use).
    /// </summary>
    [HttpGet("all")]
    public async Task<ActionResult<List<PropertyDto>>> GetAllProperties()
    {
        var properties = await _propertyService.GetAllPropertiesAsync();
        return Ok(properties);
    }

    /// <summary>
    /// GET /api/properties/{id}
    /// Returns a single property by ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PropertyDto>> GetProperty(int id)
    {
        var property = await _propertyService.GetPropertyByIdAsync(id);

        if (property == null)
            return NotFound(new { message = $"Property with ID {id} not found." });

        return Ok(property);
    }

    /// <summary>
    /// POST /api/properties
    /// Creates a new property.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PropertyDto>> CreateProperty(CreatePropertyDto dto)
    {
        // Basic validation
        if (string.IsNullOrWhiteSpace(dto.PropertyName))
            return BadRequest(new { message = "Property Name is required." });

        if (string.IsNullOrWhiteSpace(dto.PropertyCode))
            return BadRequest(new { message = "Property Code is required." });

        try
        {
            var property = await _propertyService.CreatePropertyAsync(dto);
            return CreatedAtAction(nameof(GetProperty), new { id = property.PropertyId }, property);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException)
        {
            return BadRequest(new { message = "A property with this code already exists." });
        }
    }

    /// <summary>
    /// PUT /api/properties/{id}
    /// Updates an existing property.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<PropertyDto>> UpdateProperty(int id, UpdatePropertyDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.PropertyName))
            return BadRequest(new { message = "Property Name is required." });

        if (string.IsNullOrWhiteSpace(dto.PropertyCode))
            return BadRequest(new { message = "Property Code is required." });

        try
        {
            var property = await _propertyService.UpdatePropertyAsync(id, dto);

            if (property == null)
                return NotFound(new { message = $"Property with ID {id} not found." });

            return Ok(property);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException)
        {
            return BadRequest(new { message = "A property with this code already exists." });
        }
    }

    /// <summary>
    /// DELETE /api/properties/{id}
    /// Soft-deletes a property (sets IsActive = false, Status = "Inactive").
    /// The record remains in the database.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeactivateProperty(int id)
    {
        var result = await _propertyService.DeactivatePropertyAsync(id);

        if (!result)
            return NotFound(new { message = $"Property with ID {id} not found." });

        return Ok(new { message = "Property deactivated successfully." });
    }
}
