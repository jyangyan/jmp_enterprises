using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Models;

namespace JMP.Enterprises.Api.Services;

public class GuestService
{
    private readonly ApplicationDbContext _context;

    public GuestService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<GuestDto>> GetAllGuestsAsync(bool includeInactive = false)
    {
        var query = _context.Guests.AsNoTracking();

        if (!includeInactive)
        {
            query = query.Where(g => g.IsActive);
        }

        return await query
            .OrderByDescending(g => g.CreatedDate)
            .Select(g => MapToDto(g))
            .ToListAsync();
    }

    public async Task<GuestDto?> GetGuestByIdAsync(int id)
    {
        var guest = await _context.Guests.FindAsync(id);
        return guest == null ? null : MapToDto(guest);
    }

    public async Task<GuestDto> CreateGuestAsync(CreateGuestDto dto)
    {
        var guest = new Guest
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            CompanyName = string.IsNullOrWhiteSpace(dto.CompanyName) ? null : dto.CompanyName.Trim(),
            MobileNumber = string.IsNullOrWhiteSpace(dto.MobileNumber) ? null : dto.MobileNumber.Trim(),
            EmailAddress = string.IsNullOrWhiteSpace(dto.EmailAddress) ? null : dto.EmailAddress.Trim(),
            Address = string.IsNullOrWhiteSpace(dto.Address) ? null : dto.Address.Trim(),
            Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim(),
            IsActive = true,
            CreatedDate = DateTime.Now
        };

        _context.Guests.Add(guest);
        await _context.SaveChangesAsync();

        return MapToDto(guest);
    }

    public async Task<GuestDto?> UpdateGuestAsync(int id, UpdateGuestDto dto)
    {
        var guest = await _context.Guests.FindAsync(id);
        if (guest == null) return null;

        guest.FirstName = dto.FirstName.Trim();
        guest.LastName = dto.LastName.Trim();
        guest.CompanyName = string.IsNullOrWhiteSpace(dto.CompanyName) ? null : dto.CompanyName.Trim();
        guest.MobileNumber = string.IsNullOrWhiteSpace(dto.MobileNumber) ? null : dto.MobileNumber.Trim();
        guest.EmailAddress = string.IsNullOrWhiteSpace(dto.EmailAddress) ? null : dto.EmailAddress.Trim();
        guest.Address = string.IsNullOrWhiteSpace(dto.Address) ? null : dto.Address.Trim();
        guest.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
        guest.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return MapToDto(guest);
    }

    public async Task<bool> DeactivateGuestAsync(int id)
    {
        var guest = await _context.Guests.FindAsync(id);
        if (guest == null) return false;

        guest.IsActive = false;
        guest.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<GuestDto?> ReactivateGuestAsync(int id)
    {
        var guest = await _context.Guests.FindAsync(id);
        if (guest == null) return null;

        guest.IsActive = true;
        guest.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return MapToDto(guest);
    }

    private static GuestDto MapToDto(Guest g) => new()
    {
        GuestId = g.GuestId,
        FirstName = g.FirstName,
        LastName = g.LastName,
        CompanyName = g.CompanyName,
        MobileNumber = g.MobileNumber,
        EmailAddress = g.EmailAddress,
        Address = g.Address,
        Notes = g.Notes,
        IsActive = g.IsActive,
        CreatedDate = g.CreatedDate,
        UpdatedDate = g.UpdatedDate
    };
}
