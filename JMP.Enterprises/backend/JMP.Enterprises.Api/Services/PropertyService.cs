using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Models;

namespace JMP.Enterprises.Api.Services;

/// <summary>
/// Handles all property-related business logic and database operations.
/// Keeps the controller thin — all the real work happens here.
/// </summary>
public class PropertyService
{
    private readonly ApplicationDbContext _context;

    public PropertyService(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all active properties.
    /// </summary>
    public async Task<List<PropertyDto>> GetActivePropertiesAsync()
    {
        return await _context.Properties
            .Where(p => p.IsActive)
            .OrderBy(p => p.PropertyName)
            .Select(p => MapToDto(p))
            .ToListAsync();
    }

    /// <summary>
    /// Get all properties including inactive ones (for admin/settings use).
    /// </summary>
    public async Task<List<PropertyDto>> GetAllPropertiesAsync()
    {
        return await _context.Properties
            .OrderBy(p => p.PropertyName)
            .Select(p => MapToDto(p))
            .ToListAsync();
    }

    /// <summary>
    /// Get a single property by ID.
    /// </summary>
    public async Task<PropertyDto?> GetPropertyByIdAsync(int id)
    {
        var property = await _context.Properties.FindAsync(id);
        if (property == null) return null;
        return MapToDto(property);
    }

    /// <summary>
    /// Create a new property.
    /// </summary>
    public async Task<PropertyDto> CreatePropertyAsync(CreatePropertyDto dto)
    {
        var property = new Property
        {
            PropertyName = dto.PropertyName,
            PropertyCode = dto.PropertyCode,
            Location = dto.Location,
            Description = dto.Description,
            DefaultMonthlyRate = dto.DefaultMonthlyRate,
            DefaultDailyRate = dto.DefaultDailyRate,
            Status = dto.Status,
            IsActive = true,
            CreatedDate = DateTime.Now
        };

        _context.Properties.Add(property);
        await _context.SaveChangesAsync();

        return MapToDto(property);
    }

    /// <summary>
    /// Update an existing property.
    /// </summary>
    public async Task<PropertyDto?> UpdatePropertyAsync(int id, UpdatePropertyDto dto)
    {
        var property = await _context.Properties.FindAsync(id);
        if (property == null) return null;

        property.PropertyName = dto.PropertyName;
        property.PropertyCode = dto.PropertyCode;
        property.Location = dto.Location;
        property.Description = dto.Description;
        property.DefaultMonthlyRate = dto.DefaultMonthlyRate;
        property.DefaultDailyRate = dto.DefaultDailyRate;
        property.Status = dto.Status;
        property.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();

        return MapToDto(property);
    }

    /// <summary>
    /// Soft-delete: sets IsActive to false and Status to "Inactive".
    /// The record stays in the database.
    /// </summary>
    public async Task<bool> DeactivatePropertyAsync(int id)
    {
        var property = await _context.Properties.FindAsync(id);
        if (property == null) return false;

        property.IsActive = false;
        property.Status = "Inactive";
        property.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Maps a Property entity to a PropertyDto.
    /// </summary>
    private static PropertyDto MapToDto(Property p)
    {
        return new PropertyDto
        {
            PropertyId = p.PropertyId,
            PropertyName = p.PropertyName,
            PropertyCode = p.PropertyCode,
            Location = p.Location,
            Description = p.Description,
            DefaultMonthlyRate = p.DefaultMonthlyRate,
            DefaultDailyRate = p.DefaultDailyRate,
            Status = p.Status,
            IsActive = p.IsActive,
            CreatedDate = p.CreatedDate,
            UpdatedDate = p.UpdatedDate
        };
    }
}
