using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.Dtos;
using JMP.Enterprises.Api.Models;

namespace JMP.Enterprises.Api.Services;

public class ReceiptService : IReceiptService
{
    private readonly ApplicationDbContext _context;

    public ReceiptService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReceiptDto> CreateReceiptAsync(CreateReceiptDto dto)
    {
        Reservation? reservation = null;
        Payment? payment = null;

        if (dto.PaymentId.HasValue)
        {
            payment = await _context.Payments
                .Include(p => p.Reservation)
                    .ThenInclude(r => r!.Guest)
                .Include(p => p.Property)
                .FirstOrDefaultAsync(p => p.PaymentId == dto.PaymentId.Value);

            if (payment != null)
            {
                reservation = payment.Reservation;
            }
        }

        if (reservation == null && dto.ReservationId.HasValue)
        {
            reservation = await _context.Reservations
                .Include(r => r.Guest)
                .Include(r => r.Property)
                .FirstOrDefaultAsync(r => r.ReservationId == dto.ReservationId.Value);
        }

        if (reservation == null && payment == null)
        {
            throw new ArgumentException("A valid ReservationId or PaymentId is required to generate a receipt.");
        }

        var propertyName = payment?.Property?.PropertyName ?? reservation?.Property?.PropertyName ?? "Unknown";
        var propertyCode = payment?.Property?.PropertyCode ?? reservation?.Property?.PropertyCode ?? "UNK";

        string guestName = "";
        string? companyName = null;

        if (reservation?.Guest != null)
        {
            companyName = reservation.Guest.CompanyName;
            guestName = $"{reservation.Guest.FirstName} {reservation.Guest.LastName}".Trim();
            if (!string.IsNullOrWhiteSpace(companyName))
            {
                guestName = $"{companyName} (Contact Person: {guestName})";
            }
        }
        else
        {
            guestName = "Guest";
        }

        decimal amount = dto.Amount ?? payment?.Amount ?? 0;
        string paymentType = dto.PaymentType ?? payment?.PaymentType ?? "Rent Payment";
        string paymentMethod = dto.PaymentMethod ?? payment?.PaymentMethod ?? "Cash";
        string? refNum = dto.ReferenceNumber ?? payment?.ReferenceNumber;

        // Sequence generation
        int year = DateTime.Now.Year;
        string receiptNumber = await GenerateNextReceiptNumberAsync(year);

        var receipt = new Receipt
        {
            ReceiptNumber = receiptNumber,
            ReceiptType = dto.ReceiptType,
            ReservationId = reservation?.ReservationId,
            PaymentId = payment?.PaymentId,
            ReceiptDate = dto.ReceiptDate ?? DateTime.Now,
            PaymentDate = payment?.PaymentDate ?? DateTime.Now,
            Amount = amount,
            GuestName = guestName,
            GuestCompanyName = companyName,
            PropertyName = propertyName,
            PropertyCode = propertyCode,
            PaymentType = paymentType,
            PaymentMethod = paymentMethod,
            ReferenceNumber = refNum,
            RentalType = reservation?.RentalType,
            CheckInDate = reservation?.CheckInDate,
            CheckOutDate = reservation?.CheckOutDate,
            IssuedBy = "JMP Rental Property",
            IsVoided = false,
            CreatedDate = DateTime.Now
        };

        // Determine purpose & balances based on PaymentType
        if (paymentType.Equals("Security Deposit", StringComparison.OrdinalIgnoreCase))
        {
            receipt.ReceiptType = "SecurityDeposit";
            receipt.Purpose = dto.Purpose ?? $"Security Deposit – {propertyName}";
            receipt.Notes = dto.Notes ?? "Security Deposit – This amount is tracked separately from rental income and is subject to the applicable rental agreement and checkout settlement.";
        }
        else if (paymentType.Equals("Reservation Fee", StringComparison.OrdinalIgnoreCase))
        {
            receipt.ReceiptType = "Reservation";
            receipt.Purpose = dto.Purpose ?? $"Reservation Fee – {propertyName}";
            receipt.AgreedRentalAmount = reservation?.AgreedRentalAmount;
            
            // Previously paid rental payments
            decimal prevPaid = 0;
            if (reservation != null)
            {
                prevPaid = await _context.Payments
                    .Where(p => p.ReservationId == reservation.ReservationId && p.PaymentType != "Security Deposit" && (payment == null || p.PaymentId != payment.PaymentId))
                    .SumAsync(p => (decimal?)p.Amount) ?? 0;
            }
            receipt.PreviouslyPaid = prevPaid;
            receipt.RemainingBalance = (reservation?.AgreedRentalAmount ?? 0) - prevPaid - amount;
            receipt.Notes = dto.Notes ?? "Reservation fee is deductible from the total rental amount.";
        }
        else
        {
            // Normal Rent Payment / Advance Payment / Balance Payment
            receipt.Purpose = dto.Purpose ?? $"{paymentType} – {propertyName}";
            if (reservation != null)
            {
                receipt.AgreedRentalAmount = reservation.AgreedRentalAmount;
                // Exclude Security Deposits from previously paid rental amounts!
                decimal prevPaid = await _context.Payments
                    .Where(p => p.ReservationId == reservation.ReservationId 
                                && p.PaymentType != "Security Deposit" 
                                && (payment == null || p.PaymentId != payment.PaymentId))
                    .SumAsync(p => (decimal?)p.Amount) ?? 0;

                receipt.PreviouslyPaid = prevPaid;
                receipt.RemainingBalance = reservation.AgreedRentalAmount - prevPaid - amount;
            }
            receipt.Notes = dto.Notes ?? $"Received as payment for {propertyName} rental.";
        }

        _context.Receipts.Add(receipt);
        await _context.SaveChangesAsync();

        return MapToDto(receipt, reservation);
    }

    public async Task<ReceiptDto> GenerateCheckoutReceiptAsync(CheckoutSettlementDto dto)
    {
        var reservation = await _context.Reservations
            .Include(r => r.Guest)
            .Include(r => r.Property)
            .FirstOrDefaultAsync(r => r.ReservationId == dto.ReservationId);

        if (reservation == null)
        {
            throw new ArgumentException("Reservation not found.");
        }

        var payments = await _context.Payments
            .Where(p => p.ReservationId == dto.ReservationId)
            .ToListAsync();

        // Calculate rental payments (EXCLUDING Security Deposit)
        decimal totalRentalReceived = payments
            .Where(p => p.PaymentType != "Security Deposit")
            .Sum(p => p.Amount);

        // Security Deposit Received
        decimal securityDepositReceived = payments
            .Where(p => p.PaymentType == "Security Deposit")
            .Sum(p => p.Amount);

        if (securityDepositReceived == 0)
        {
            securityDepositReceived = reservation.SecurityDeposit;
        }

        decimal totalRentalAmount = reservation.AgreedRentalAmount;
        decimal outstandingBalance = Math.Max(0, totalRentalAmount + dto.AdditionalCharges - totalRentalReceived);
        decimal finalAmountPaid = totalRentalReceived;

        int year = DateTime.Now.Year;
        string receiptNumber = await GenerateNextReceiptNumberAsync(year);

        string guestName = $"{reservation.Guest.FirstName} {reservation.Guest.LastName}".Trim();
        if (!string.IsNullOrWhiteSpace(reservation.Guest.CompanyName))
        {
            guestName = $"{reservation.Guest.CompanyName} (Contact Person: {guestName})";
        }

        var receipt = new Receipt
        {
            ReceiptNumber = receiptNumber,
            ReceiptType = "Checkout",
            ReservationId = reservation.ReservationId,
            ReceiptDate = DateTime.Now,
            PaymentDate = DateTime.Now,
            Amount = finalAmountPaid,
            GuestName = guestName,
            GuestCompanyName = reservation.Guest.CompanyName,
            PropertyName = reservation.Property.PropertyName,
            PropertyCode = reservation.Property.PropertyCode,
            PaymentType = "Checkout / Final Settlement",
            PaymentMethod = "N/A",
            Purpose = $"Final Rental Settlement – {reservation.Property.PropertyName}",
            RentalType = reservation.RentalType,
            CheckInDate = reservation.CheckInDate,
            CheckOutDate = reservation.CheckOutDate,
            TotalRentalAmount = totalRentalAmount,
            TotalRentalPaymentsReceived = totalRentalReceived,
            SecurityDepositReceived = securityDepositReceived,
            AdditionalCharges = dto.AdditionalCharges,
            SecurityDepositReturned = dto.SecurityDepositReturned,
            OutstandingBalance = outstandingBalance,
            SettlementStatus = dto.SettlementStatus,
            Notes = dto.Notes ?? "Checkout and final settlement receipt.",
            IssuedBy = "JMP Rental Property",
            IsVoided = false,
            CreatedDate = DateTime.Now
        };

        _context.Receipts.Add(receipt);
        await _context.SaveChangesAsync();

        return MapToDto(receipt, reservation);
    }

    public async Task<ReceiptDto?> GetReceiptByIdAsync(int id)
    {
        var receipt = await _context.Receipts
            .Include(r => r.Reservation)
            .FirstOrDefaultAsync(r => r.ReceiptId == id);

        if (receipt == null) return null;
        return MapToDto(receipt, receipt.Reservation);
    }

    public async Task<IEnumerable<ReceiptDto>> GetReceiptsAsync(int? reservationId = null, int? paymentId = null)
    {
        var query = _context.Receipts
            .Include(r => r.Reservation)
            .AsQueryable();

        if (reservationId.HasValue)
        {
            query = query.Where(r => r.ReservationId == reservationId.Value);
        }

        if (paymentId.HasValue)
        {
            query = query.Where(r => r.PaymentId == paymentId.Value);
        }

        var receipts = await query
            .OrderByDescending(r => r.ReceiptDate)
            .ThenByDescending(r => r.ReceiptId)
            .ToListAsync();

        return receipts.Select(r => MapToDto(r, r.Reservation));
    }

    public async Task<IEnumerable<ReceiptDto>> GetReservationReceiptsAsync(int reservationId)
    {
        return await GetReceiptsAsync(reservationId, null);
    }

    public async Task<ReceiptDto?> GetPaymentReceiptAsync(int paymentId)
    {
        var receipts = await GetReceiptsAsync(null, paymentId);
        return receipts.FirstOrDefault();
    }

    public async Task<ReceiptDto?> VoidReceiptAsync(int id)
    {
        var receipt = await _context.Receipts
            .Include(r => r.Reservation)
            .FirstOrDefaultAsync(r => r.ReceiptId == id);

        if (receipt == null) return null;

        receipt.IsVoided = true;
        receipt.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();

        return MapToDto(receipt, receipt.Reservation);
    }

    private async Task<string> GenerateNextReceiptNumberAsync(int year)
    {
        string prefix = $"JMP-AR-{year}-";
        
        var existingNumbers = await _context.Receipts
            .Where(r => r.ReceiptNumber.StartsWith(prefix))
            .Select(r => r.ReceiptNumber)
            .ToListAsync();

        int maxSeq = 0;
        foreach (var num in existingNumbers)
        {
            var parts = num.Split('-');
            if (parts.Length == 4 && int.TryParse(parts[3], out int seq))
            {
                if (seq > maxSeq) maxSeq = seq;
            }
        }

        int nextSeq = maxSeq + 1;
        return $"{prefix}{nextSeq:D5}";
    }

    private static ReceiptDto MapToDto(Receipt r, Reservation? reservation)
    {
        return new ReceiptDto
        {
            ReceiptId = r.ReceiptId,
            ReceiptNumber = r.ReceiptNumber,
            ReceiptType = r.ReceiptType,
            ReservationId = r.ReservationId,
            PaymentId = r.PaymentId,
            ReceiptDate = r.ReceiptDate,
            PaymentDate = r.PaymentDate,
            Amount = r.Amount,
            AmountInWords = ConvertAmountToWords(r.Amount),
            GuestName = r.GuestName,
            GuestCompanyName = r.GuestCompanyName,
            PropertyName = r.PropertyName,
            PropertyCode = r.PropertyCode,
            PaymentType = r.PaymentType,
            PaymentMethod = r.PaymentMethod,
            ReferenceNumber = r.ReferenceNumber,
            Purpose = r.Purpose,
            RentalType = r.RentalType,
            CheckInDate = r.CheckInDate,
            CheckOutDate = r.CheckOutDate,
            ReservationStatus = reservation?.ReservationStatus,
            ReservationFee = reservation?.ReservationFee,
            AgreedRentalAmount = r.AgreedRentalAmount,
            PreviouslyPaid = r.PreviouslyPaid,
            RemainingBalance = r.RemainingBalance,
            TotalRentalAmount = r.TotalRentalAmount,
            TotalRentalPaymentsReceived = r.TotalRentalPaymentsReceived,
            SecurityDepositReceived = r.SecurityDepositReceived,
            AdditionalCharges = r.AdditionalCharges,
            SecurityDepositReturned = r.SecurityDepositReturned,
            OutstandingBalance = r.OutstandingBalance,
            SettlementStatus = r.SettlementStatus,
            Notes = r.Notes,
            IssuedBy = r.IssuedBy,
            IsVoided = r.IsVoided,
            CreatedDate = r.CreatedDate
        };
    }

    public static string ConvertAmountToWords(decimal amount)
    {
        if (amount <= 0) return "Zero Pesos Only";

        long pesos = (long)Math.Floor(amount);
        int centavos = (int)Math.Round((amount - pesos) * 100);

        string pesosWords = NumberToWords(pesos);
        string result = $"{pesosWords} Pesos";

        if (centavos > 0)
        {
            string centavosWords = NumberToWords(centavos);
            result += $" and {centavosWords} Centavos";
        }

        return $"{result} Only";
    }

    private static string NumberToWords(long number)
    {
        if (number == 0) return "Zero";

        if (number < 0) return "Minus " + NumberToWords(Math.Abs(number));

        string words = "";

        if ((number / 1000000) > 0)
        {
            words += NumberToWords(number / 1000000) + " Million ";
            number %= 1000000;
        }

        if ((number / 1000) > 0)
        {
            words += NumberToWords(number / 1000) + " Thousand ";
            number %= 1000;
        }

        if ((number / 100) > 0)
        {
            words += NumberToWords(number / 100) + " Hundred ";
            number %= 100;
        }

        if (number > 0)
        {
            var unitsMap = new[] { "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen" };
            var tensMap = new[] { "Zero", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };

            if (number < 20)
                words += unitsMap[number];
            else
            {
                words += tensMap[number / 10];
                if ((number % 10) > 0)
                    words += "-" + unitsMap[number % 10];
            }
        }

        return words.Trim();
    }
}
