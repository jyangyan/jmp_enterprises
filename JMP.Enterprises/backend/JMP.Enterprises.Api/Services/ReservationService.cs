using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Dtos;
using JMP.Enterprises.Api.Models;

namespace JMP.Enterprises.Api.Services;

public class ReservationService
{
    private readonly ApplicationDbContext _context;
    private readonly IReceiptService _receiptService;

    public ReservationService(ApplicationDbContext context, IReceiptService receiptService)
    {
        _context = context;
        _receiptService = receiptService;
    }

    public async Task<IEnumerable<ReservationDto>> GetAllReservationsAsync(
        int? propertyId = null, 
        string? rentalType = null, 
        string? status = null)
    {
        var query = _context.Reservations
            .Include(r => r.Property)
            .Include(r => r.Guest)
            .AsNoTracking();

        if (propertyId.HasValue)
        {
            query = query.Where(r => r.PropertyId == propertyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(rentalType) && rentalType != "All")
        {
            query = query.Where(r => r.RentalType == rentalType);
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(r => r.ReservationStatus == status);
        }

        var list = await query
            .OrderByDescending(r => r.CheckInDate)
            .ToListAsync();

        return list.Select(MapToDto);
    }

    public async Task<ReservationDto?> GetReservationByIdAsync(int id)
    {
        var reservation = await _context.Reservations
            .Include(r => r.Property)
            .Include(r => r.Guest)
            .FirstOrDefaultAsync(r => r.ReservationId == id);

        return reservation == null ? null : MapToDto(reservation);
    }

    /// <summary>
    /// Checks if a property has an overlapping active reservation.
    /// Conflict Rule: NewCheckIn < ExistingCheckOut AND NewCheckOut > ExistingCheckIn
    /// </summary>
    public async Task<(bool HasConflict, string? ConflictingPropertyName)> CheckDoubleBookingConflictAsync(
        int propertyId, 
        DateTime checkIn, 
        DateTime checkOut, 
        int? excludeReservationId = null)
    {
        var property = await _context.Properties.FindAsync(propertyId);
        string propertyName = property?.PropertyName ?? $"Property #{propertyId}";

        var query = _context.Reservations
            .Where(r => r.PropertyId == propertyId 
                     && r.ReservationStatus != "Cancelled" 
                     && r.ReservationStatus != "CheckedOut");

        if (excludeReservationId.HasValue)
        {
            query = query.Where(r => r.ReservationId != excludeReservationId.Value);
        }

        // Overlap rule: NewCheckIn < ExistingCheckOut AND NewCheckOut > ExistingCheckIn
        bool conflictExists = await query.AnyAsync(r => 
            checkIn.Date < r.CheckOutDate.Date && checkOut.Date > r.CheckInDate.Date
        );

        return (conflictExists, propertyName);
    }

    public async Task<ReservationDto> CreateReservationAsync(CreateReservationDto dto)
    {
        if (dto.CheckOutDate <= dto.CheckInDate)
        {
            throw new ArgumentException("Check-Out Date must be later than Check-In Date.");
        }

        if (dto.ReservationStatus == "CheckedIn" && dto.CheckInDate.Date > DateTime.Today)
        {
            throw new InvalidOperationException("Cannot set status to 'CheckedIn' for a future check-in date. Status for future dates must be 'Confirmed' or 'Reserved'.");
        }

        var (hasConflict, propertyName) = await CheckDoubleBookingConflictAsync(dto.PropertyId, dto.CheckInDate, dto.CheckOutDate);
        if (hasConflict)
        {
            throw new InvalidOperationException($"{propertyName} is already reserved for the selected dates.");
        }

        string paymentMethod = string.IsNullOrWhiteSpace(dto.ReservationFeePaymentMethod) ? "Cash" : dto.ReservationFeePaymentMethod.Trim();
        string? referenceNumber = string.IsNullOrWhiteSpace(dto.ReservationFeeReferenceNumber) ? null : dto.ReservationFeeReferenceNumber.Trim();

        var reservation = new Reservation
        {
            PropertyId = dto.PropertyId,
            GuestId = dto.GuestId,
            RentalType = dto.RentalType,
            BookingSource = dto.BookingSource,
            CheckInDate = dto.CheckInDate.Date,
            CheckOutDate = dto.CheckOutDate.Date,
            DailyRate = dto.DailyRate,
            MonthlyRate = dto.MonthlyRate,
            AgreedRentalAmount = dto.AgreedRentalAmount,
            SecurityDeposit = dto.SecurityDeposit,
            ReservationFee = dto.ReservationFee,
            ReservationFeePaymentMethod = paymentMethod,
            ReservationFeeReferenceNumber = referenceNumber,
            ReservationStatus = dto.ReservationStatus,
            Notes = dto.Notes,
            CreatedDate = DateTime.Now
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        // If a reservation fee is paid (> 0), automatically record Payment and generate Acknowledgement Receipt
        if (dto.ReservationFee > 0)
        {
            var property = await _context.Properties.FindAsync(dto.PropertyId);
            string propName = property?.PropertyName ?? "Rental Unit";

            var payment = new Payment
            {
                PropertyId = reservation.PropertyId,
                ReservationId = reservation.ReservationId,
                Amount = dto.ReservationFee,
                PaymentType = "Reservation Fee",
                PaymentMethod = paymentMethod,
                ReferenceNumber = referenceNumber,
                PaymentDate = DateTime.Now,
                Notes = $"Reservation fee for {propName}{(referenceNumber != null ? $" (Ref: {referenceNumber})" : "")}",
                CreatedDate = DateTime.Now
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            await _receiptService.CreateReceiptAsync(new CreateReceiptDto
            {
                ReceiptType = "Reservation",
                ReservationId = reservation.ReservationId,
                PaymentId = payment.PaymentId,
                Amount = dto.ReservationFee,
                PaymentType = "Reservation Fee",
                PaymentMethod = paymentMethod,
                ReferenceNumber = referenceNumber,
                Purpose = $"Reservation Fee – {propName}",
                Notes = "Reservation fee is deductible from the total rental amount."
            });
        }

        return (await GetReservationByIdAsync(reservation.ReservationId))!;
    }

    public async Task<ReservationDto?> UpdateReservationAsync(int id, UpdateReservationDto dto)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null) return null;

        if (dto.CheckOutDate <= dto.CheckInDate)
        {
            throw new ArgumentException("Check-Out Date must be later than Check-In Date.");
        }

        if (dto.ReservationStatus == "CheckedIn" && dto.CheckInDate.Date > DateTime.Today)
        {
            throw new InvalidOperationException("Cannot set status to 'CheckedIn' for a future check-in date. Status for future dates must be 'Confirmed' or 'Reserved'.");
        }

        var (hasConflict, propertyName) = await CheckDoubleBookingConflictAsync(dto.PropertyId, dto.CheckInDate, dto.CheckOutDate, excludeReservationId: id);
        if (hasConflict)
        {
            throw new InvalidOperationException($"{propertyName} is already reserved for the selected dates.");
        }

        string paymentMethod = string.IsNullOrWhiteSpace(dto.ReservationFeePaymentMethod) ? "Cash" : dto.ReservationFeePaymentMethod.Trim();
        string? referenceNumber = string.IsNullOrWhiteSpace(dto.ReservationFeeReferenceNumber) ? null : dto.ReservationFeeReferenceNumber.Trim();

        reservation.PropertyId = dto.PropertyId;
        reservation.GuestId = dto.GuestId;
        reservation.RentalType = dto.RentalType;
        reservation.BookingSource = dto.BookingSource;
        reservation.CheckInDate = dto.CheckInDate.Date;
        reservation.CheckOutDate = dto.CheckOutDate.Date;
        reservation.DailyRate = dto.DailyRate;
        reservation.MonthlyRate = dto.MonthlyRate;
        reservation.AgreedRentalAmount = dto.AgreedRentalAmount;
        reservation.SecurityDeposit = dto.SecurityDeposit;
        reservation.ReservationFee = dto.ReservationFee;
        reservation.ReservationFeePaymentMethod = paymentMethod;
        reservation.ReservationFeeReferenceNumber = referenceNumber;
        reservation.ReservationStatus = dto.ReservationStatus;
        reservation.Notes = dto.Notes;
        reservation.UpdatedDate = DateTime.Now;

        // Sync or create corresponding Payment and Receipt
        var existingFeePayment = await _context.Payments
            .FirstOrDefaultAsync(p => p.ReservationId == id && p.PaymentType == "Reservation Fee");

        if (existingFeePayment != null)
        {
            existingFeePayment.Amount = dto.ReservationFee;
            existingFeePayment.PaymentMethod = paymentMethod;
            existingFeePayment.ReferenceNumber = referenceNumber;
            existingFeePayment.PropertyId = dto.PropertyId;

            var existingReceipt = await _context.Receipts
                .FirstOrDefaultAsync(r => r.PaymentId == existingFeePayment.PaymentId || (r.ReservationId == id && r.PaymentType == "Reservation Fee"));
            if (existingReceipt != null)
            {
                existingReceipt.Amount = dto.ReservationFee;
                existingReceipt.PaymentMethod = paymentMethod;
                existingReceipt.ReferenceNumber = referenceNumber;
            }
        }
        else if (dto.ReservationFee > 0)
        {
            var property = await _context.Properties.FindAsync(dto.PropertyId);
            string propName = property?.PropertyName ?? "Rental Unit";

            var payment = new Payment
            {
                PropertyId = reservation.PropertyId,
                ReservationId = reservation.ReservationId,
                Amount = dto.ReservationFee,
                PaymentType = "Reservation Fee",
                PaymentMethod = paymentMethod,
                ReferenceNumber = referenceNumber,
                PaymentDate = DateTime.Now,
                Notes = $"Reservation fee for {propName}{(referenceNumber != null ? $" (Ref: {referenceNumber})" : "")}",
                CreatedDate = DateTime.Now
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            await _receiptService.CreateReceiptAsync(new CreateReceiptDto
            {
                ReceiptType = "Reservation",
                ReservationId = reservation.ReservationId,
                PaymentId = payment.PaymentId,
                Amount = dto.ReservationFee,
                PaymentType = "Reservation Fee",
                PaymentMethod = paymentMethod,
                ReferenceNumber = referenceNumber,
                Purpose = $"Reservation Fee – {propName}",
                Notes = "Reservation fee is deductible from the total rental amount."
            });
        }

        await _context.SaveChangesAsync();
        return await GetReservationByIdAsync(id);
    }

    public async Task<bool> CancelReservationAsync(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null) return false;

        reservation.ReservationStatus = "Cancelled";
        reservation.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<PropertyAvailabilityDto>> CheckAvailabilityAsync(DateTime checkIn, DateTime checkOut)
    {
        var activeProperties = await _context.Properties
            .Where(p => p.IsActive)
            .OrderBy(p => p.PropertyCode)
            .ToListAsync();

        var activeReservations = await _context.Reservations
            .Include(r => r.Guest)
            .Where(r => r.ReservationStatus != "Cancelled" && r.ReservationStatus != "CheckedOut")
            .Where(r => checkIn.Date < r.CheckOutDate.Date && checkOut.Date > r.CheckInDate.Date)
            .ToListAsync();

        var result = new List<PropertyAvailabilityDto>();

        foreach (var p in activeProperties)
        {
            var conflict = activeReservations.FirstOrDefault(r => r.PropertyId == p.PropertyId);

            string? guestDisplay = null;
            if (conflict?.Guest != null)
            {
                guestDisplay = !string.IsNullOrWhiteSpace(conflict.Guest.CompanyName)
                    ? $"{conflict.Guest.CompanyName} ({conflict.Guest.FirstName} {conflict.Guest.LastName})"
                    : $"{conflict.Guest.FirstName} {conflict.Guest.LastName}";
            }

            result.Add(new PropertyAvailabilityDto
            {
                PropertyId = p.PropertyId,
                PropertyName = p.PropertyName,
                PropertyCode = p.PropertyCode,
                IsAvailable = conflict == null,
                CurrentReservationGuest = guestDisplay,
                ConflictCheckIn = conflict?.CheckInDate,
                ConflictCheckOut = conflict?.CheckOutDate
            });
        }

        return result;
    }

    private static ReservationDto MapToDto(Reservation r)
    {
        string guestName = r.Guest != null ? $"{r.Guest.FirstName} {r.Guest.LastName}".Trim() : string.Empty;

        return new ReservationDto
        {
            ReservationId = r.ReservationId,
            PropertyId = r.PropertyId,
            PropertyName = r.Property?.PropertyName ?? string.Empty,
            PropertyCode = r.Property?.PropertyCode ?? string.Empty,
            GuestId = r.GuestId,
            GuestName = guestName,
            GuestCompanyName = r.Guest?.CompanyName,
            GuestMobileNumber = r.Guest?.MobileNumber,
            RentalType = r.RentalType,
            BookingSource = r.BookingSource,
            CheckInDate = r.CheckInDate,
            CheckOutDate = r.CheckOutDate,
            DailyRate = r.DailyRate,
            MonthlyRate = r.MonthlyRate,
            AgreedRentalAmount = r.AgreedRentalAmount,
            SecurityDeposit = r.SecurityDeposit,
            ReservationFee = r.ReservationFee,
            ReservationFeePaymentMethod = r.ReservationFeePaymentMethod ?? "Cash",
            ReservationFeeReferenceNumber = r.ReservationFeeReferenceNumber,
            ReservationStatus = r.ReservationStatus,
            Notes = r.Notes,
            CreatedDate = r.CreatedDate,
            UpdatedDate = r.UpdatedDate
        };
    }
}
