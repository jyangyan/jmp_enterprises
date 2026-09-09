using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Models;

namespace JMP.Enterprises.Api.Services;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;

    public PaymentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync(
        int? propertyId = null, 
        int? reservationId = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var query = _context.Payments
            .Include(p => p.Property)
            .Include(p => p.Reservation)
                .ThenInclude(r => r!.Guest)
            .AsNoTracking();

        if (propertyId.HasValue)
        {
            query = query.Where(p => p.PropertyId == propertyId.Value);
        }

        if (reservationId.HasValue)
        {
            query = query.Where(p => p.ReservationId == reservationId.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(p => p.PaymentDate >= startDate.Value.Date);
        }

        if (endDate.HasValue)
        {
            query = query.Where(p => p.PaymentDate <= endDate.Value.Date.AddDays(1).AddTicks(-1));
        }

        var payments = await query
            .OrderByDescending(p => p.PaymentDate)
            .ThenByDescending(p => p.PaymentId)
            .ToListAsync();

        return payments.Select(MapToDto);
    }

    public async Task<PaymentDto?> GetPaymentByIdAsync(int id)
    {
        var payment = await _context.Payments
            .Include(p => p.Property)
            .Include(p => p.Reservation)
                .ThenInclude(r => r!.Guest)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PaymentId == id);

        return payment != null ? MapToDto(payment) : null;
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByReservationIdAsync(int reservationId)
    {
        return await GetAllPaymentsAsync(reservationId: reservationId);
    }

    public async Task<ReservationPaymentSummaryDto?> GetReservationPaymentSummaryAsync(int reservationId)
    {
        var reservation = await _context.Reservations
            .Include(r => r.Property)
            .Include(r => r.Guest)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.ReservationId == reservationId);

        if (reservation == null) return null;

        var totalPaid = await _context.Payments
            .Where(p => p.ReservationId == reservationId)
            .SumAsync(p => (decimal?)p.Amount) ?? 0m;

        decimal totalCost = reservation.AgreedRentalAmount + reservation.SecurityDeposit + reservation.ReservationFee;
        decimal balanceDue = totalCost - totalPaid;

        string status;
        if (totalPaid >= totalCost && totalCost > 0)
        {
            status = totalPaid > totalCost ? "Overpaid" : "FullyPaid";
        }
        else if (totalPaid > 0)
        {
            status = "Partial";
        }
        else
        {
            status = "Unpaid";
        }

        string guestName = reservation.Guest != null 
            ? (!string.IsNullOrWhiteSpace(reservation.Guest.CompanyName) 
                ? $"{reservation.Guest.FirstName} {reservation.Guest.LastName} ({reservation.Guest.CompanyName})"
                : $"{reservation.Guest.FirstName} {reservation.Guest.LastName}")
            : "Unknown Guest";

        return new ReservationPaymentSummaryDto
        {
            ReservationId = reservation.ReservationId,
            PropertyName = reservation.Property?.PropertyName ?? "Unknown Property",
            GuestName = guestName,
            TotalCost = totalCost,
            TotalPaid = totalPaid,
            BalanceDue = balanceDue,
            Status = status
        };
    }

    public async Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto)
    {
        var reservation = await _context.Reservations
            .Include(r => r.Property)
            .Include(r => r.Guest)
            .FirstOrDefaultAsync(r => r.ReservationId == dto.ReservationId);

        if (reservation == null)
        {
            throw new ArgumentException($"Reservation ID {dto.ReservationId} not found.");
        }

        var payment = new Payment
        {
            ReservationId = dto.ReservationId,
            PropertyId = reservation.PropertyId,
            PaymentDate = dto.PaymentDate,
            Amount = dto.Amount,
            PaymentType = dto.PaymentType,
            PaymentMethod = dto.PaymentMethod,
            ReferenceNumber = dto.ReferenceNumber,
            Notes = dto.Notes,
            CreatedDate = DateTime.Now
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        // Reload with relationships
        return (await GetPaymentByIdAsync(payment.PaymentId))!;
    }

    public async Task<PaymentDto?> UpdatePaymentAsync(int id, UpdatePaymentDto dto)
    {
        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.PaymentId == id);
        if (payment == null) return null;

        payment.PaymentDate = dto.PaymentDate;
        payment.Amount = dto.Amount;
        payment.PaymentType = dto.PaymentType;
        payment.PaymentMethod = dto.PaymentMethod;
        payment.ReferenceNumber = dto.ReferenceNumber;
        payment.Notes = dto.Notes;

        await _context.SaveChangesAsync();

        return await GetPaymentByIdAsync(id);
    }

    public async Task<bool> DeletePaymentAsync(int id)
    {
        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.PaymentId == id);
        if (payment == null) return false;

        _context.Payments.Remove(payment);
        await _context.SaveChangesAsync();
        return true;
    }

    private static PaymentDto MapToDto(Payment payment)
    {
        string guestName = "Unknown Guest";
        int guestId = 0;

        if (payment.Reservation?.Guest != null)
        {
            guestId = payment.Reservation.Guest.GuestId;
            var g = payment.Reservation.Guest;
            guestName = !string.IsNullOrWhiteSpace(g.CompanyName)
                ? $"{g.FirstName} {g.LastName} ({g.CompanyName})"
                : $"{g.FirstName} {g.LastName}";
        }

        return new PaymentDto
        {
            PaymentId = payment.PaymentId,
            ReservationId = payment.ReservationId,
            PropertyId = payment.PropertyId,
            PropertyName = payment.Property?.PropertyName ?? "Unknown Property",
            GuestId = guestId,
            GuestName = guestName,
            PaymentDate = payment.PaymentDate,
            Amount = payment.Amount,
            PaymentType = payment.PaymentType,
            PaymentMethod = payment.PaymentMethod,
            ReferenceNumber = payment.ReferenceNumber,
            Notes = payment.Notes,
            CreatedDate = payment.CreatedDate
        };
    }
}
