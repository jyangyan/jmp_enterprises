using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Models;

namespace JMP.Enterprises.Api.Services;

public class StatementOfAccountService : IStatementOfAccountService
{
    private readonly ApplicationDbContext _context;

    public StatementOfAccountService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StatementOfAccountResponseDto>> GetAllAsync(string? status = null)
    {
        var query = _context.StatementsOfAccount
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Property)
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Guest)
            .Include(s => s.RentalAgreement)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(s => s.Status == status);
        }

        var list = await query
            .OrderByDescending(s => s.IssueDate)
            .ToListAsync();

        return list.Select(MapToResponseDto);
    }

    public async Task<StatementOfAccountResponseDto?> GetByIdAsync(int id)
    {
        var soa = await _context.StatementsOfAccount
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Property)
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Guest)
            .Include(s => s.RentalAgreement)
            .FirstOrDefaultAsync(s => s.StatementOfAccountId == id);

        return soa != null ? MapToResponseDto(soa) : null;
    }

    public async Task<IEnumerable<StatementOfAccountResponseDto>> GetByReservationIdAsync(int reservationId)
    {
        var list = await _context.StatementsOfAccount
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Property)
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Guest)
            .Include(s => s.RentalAgreement)
            .Where(s => s.ReservationId == reservationId)
            .OrderByDescending(s => s.IssueDate)
            .ToListAsync();

        return list.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<StatementOfAccountResponseDto>> GetByAgreementIdAsync(int agreementId)
    {
        var list = await _context.StatementsOfAccount
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Property)
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Guest)
            .Include(s => s.RentalAgreement)
            .Where(s => s.RentalAgreementId == agreementId)
            .OrderByDescending(s => s.IssueDate)
            .ToListAsync();

        return list.Select(MapToResponseDto);
    }

    public async Task<decimal> GetLatestMeterReadingForPropertyAsync(int propertyId)
    {
        var latestSoa = await _context.StatementsOfAccount
            .Include(s => s.Reservation)
            .Where(s => s.Reservation != null && s.Reservation.PropertyId == propertyId)
            .OrderByDescending(s => s.IssueDate)
            .FirstOrDefaultAsync();

        return latestSoa?.PresentElectricityReading ?? 0;
    }

    public async Task<StatementOfAccountResponseDto> CreateAsync(CreateStatementOfAccountDto dto)
    {
        var agreement = await _context.RentalAgreements
            .Include(a => a.Reservation)
                .ThenInclude(r => r!.Property)
            .Include(a => a.Reservation)
                .ThenInclude(r => r!.Guest)
            .FirstOrDefaultAsync(a => a.RentalAgreementId == dto.RentalAgreementId);

        if (agreement == null)
        {
            throw new KeyNotFoundException($"Rental Agreement with ID {dto.RentalAgreementId} was not found.");
        }

        // Calculate electricity
        var consumption = Math.Max(0, dto.PresentElectricityReading - dto.PreviousElectricityReading);
        var electricityAmount = Math.Round(consumption * dto.ElectricityRatePerKwh, 2);

        // Total amount due
        var totalAmountDue = Math.Round(
            dto.MonthlyRentAmount +
            electricityAmount +
            dto.WaterAmount +
            dto.InternetAmount +
            dto.AdditionalCharges +
            dto.PreviousBalance, 2);

        var count = await _context.StatementsOfAccount.CountAsync() + 1;
        var datePrefix = DateTime.Now.ToString("yyyyMM");
        var soaNumber = $"JMP-SOA-{datePrefix}-{count:D4}";

        var soa = new StatementOfAccount
        {
            SoaNumber = soaNumber,
            ReservationId = agreement.ReservationId,
            RentalAgreementId = agreement.RentalAgreementId,
            BillingPeriodStart = dto.BillingPeriodStart,
            BillingPeriodEnd = dto.BillingPeriodEnd,
            DueDate = dto.DueDate,
            IssueDate = DateTime.Now,
            MonthlyRentAmount = dto.MonthlyRentAmount,
            PreviousElectricityReading = dto.PreviousElectricityReading,
            PresentElectricityReading = dto.PresentElectricityReading,
            ElectricityConsumptionKwh = consumption,
            ElectricityRatePerKwh = dto.ElectricityRatePerKwh,
            ElectricityAmount = electricityAmount,
            WaterAmount = dto.WaterAmount,
            InternetAmount = dto.InternetAmount,
            AdditionalCharges = dto.AdditionalCharges,
            AdditionalChargesDescription = dto.AdditionalChargesDescription,
            PreviousBalance = dto.PreviousBalance,
            TotalAmountDue = totalAmountDue,
            AmountPaid = 0,
            BalanceRemaining = totalAmountDue,
            Status = "Pending",
            Notes = dto.Notes,
            CreatedDate = DateTime.Now
        };

        _context.StatementsOfAccount.Add(soa);
        await _context.SaveChangesAsync();

        // Reload relationships for DTO mapping
        soa.RentalAgreement = agreement;
        soa.Reservation = agreement.Reservation;

        return MapToResponseDto(soa);
    }

    public async Task<StatementOfAccountResponseDto> UpdateAsync(int id, UpdateStatementOfAccountDto dto)
    {
        var soa = await _context.StatementsOfAccount
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Property)
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Guest)
            .Include(s => s.RentalAgreement)
            .FirstOrDefaultAsync(s => s.StatementOfAccountId == id);

        if (soa == null)
        {
            throw new KeyNotFoundException($"Statement of Account with ID {id} was not found.");
        }

        var consumption = Math.Max(0, dto.PresentElectricityReading - dto.PreviousElectricityReading);
        var electricityAmount = Math.Round(consumption * dto.ElectricityRatePerKwh, 2);

        var totalAmountDue = Math.Round(
            dto.MonthlyRentAmount +
            electricityAmount +
            dto.WaterAmount +
            dto.InternetAmount +
            dto.AdditionalCharges +
            dto.PreviousBalance, 2);

        soa.BillingPeriodStart = dto.BillingPeriodStart;
        soa.BillingPeriodEnd = dto.BillingPeriodEnd;
        soa.DueDate = dto.DueDate;
        soa.MonthlyRentAmount = dto.MonthlyRentAmount;
        soa.PreviousElectricityReading = dto.PreviousElectricityReading;
        soa.PresentElectricityReading = dto.PresentElectricityReading;
        soa.ElectricityConsumptionKwh = consumption;
        soa.ElectricityRatePerKwh = dto.ElectricityRatePerKwh;
        soa.ElectricityAmount = electricityAmount;
        soa.WaterAmount = dto.WaterAmount;
        soa.InternetAmount = dto.InternetAmount;
        soa.AdditionalCharges = dto.AdditionalCharges;
        soa.AdditionalChargesDescription = dto.AdditionalChargesDescription;
        soa.PreviousBalance = dto.PreviousBalance;
        soa.TotalAmountDue = totalAmountDue;
        soa.BalanceRemaining = Math.Max(0, totalAmountDue - soa.AmountPaid);

        if (soa.BalanceRemaining == 0 && totalAmountDue > 0)
        {
            soa.Status = "Paid";
        }
        else if (soa.AmountPaid > 0)
        {
            soa.Status = "PartiallyPaid";
        }
        else
        {
            soa.Status = dto.Status;
        }

        soa.Notes = dto.Notes;
        soa.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return MapToResponseDto(soa);
    }

    public async Task<StatementOfAccountResponseDto> RecordPaymentAsync(int id, RecordSoaPaymentDto dto)
    {
        var soa = await _context.StatementsOfAccount
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Property)
            .Include(s => s.Reservation)
                .ThenInclude(r => r!.Guest)
            .Include(s => s.RentalAgreement)
            .FirstOrDefaultAsync(s => s.StatementOfAccountId == id);

        if (soa == null)
        {
            throw new KeyNotFoundException($"Statement of Account with ID {id} was not found.");
        }

        soa.AmountPaid += dto.PaymentAmount;
        soa.BalanceRemaining = Math.Max(0, soa.TotalAmountDue - soa.AmountPaid);

        if (soa.BalanceRemaining == 0)
        {
            soa.Status = "Paid";
        }
        else
        {
            soa.Status = "PartiallyPaid";
        }

        // Also record in central Payments table & issue a Receipt
        var payment = new Payment
        {
            ReservationId = soa.ReservationId,
            PropertyId = soa.Reservation?.PropertyId ?? 0,
            Amount = dto.PaymentAmount,
            PaymentDate = DateTime.Now,
            PaymentType = "Monthly Rent / Utilities",
            PaymentMethod = dto.PaymentMethod,
            ReferenceNumber = dto.ReferenceNumber,
            Notes = $"SOA: {soa.SoaNumber}. {dto.Notes}".Trim(),
            CreatedDate = DateTime.Now
        };
        _context.Payments.Add(payment);

        soa.UpdatedDate = DateTime.Now;
        await _context.SaveChangesAsync();

        return MapToResponseDto(soa);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var soa = await _context.StatementsOfAccount.FindAsync(id);
        if (soa == null) return false;

        _context.StatementsOfAccount.Remove(soa);
        await _context.SaveChangesAsync();
        return true;
    }

    private static StatementOfAccountResponseDto MapToResponseDto(StatementOfAccount s)
    {
        var tenantName = s.RentalAgreement?.TenantName ??
            (s.Reservation?.Guest != null ? $"{s.Reservation.Guest.FirstName} {s.Reservation.Guest.LastName}".Trim() : "N/A");

        var tenantCompany = s.RentalAgreement?.TenantCompanyName ?? s.Reservation?.Guest?.CompanyName;
        var propName = s.RentalAgreement?.PropertyName ?? s.Reservation?.Property?.PropertyName ?? "N/A";
        var propCode = s.RentalAgreement?.PropertyCode ?? s.Reservation?.Property?.PropertyCode ?? "N/A";

        return new StatementOfAccountResponseDto
        {
            StatementOfAccountId = s.StatementOfAccountId,
            SoaNumber = s.SoaNumber,
            ReservationId = s.ReservationId,
            RentalAgreementId = s.RentalAgreementId,
            AgreementNumber = s.RentalAgreement?.AgreementNumber ?? "N/A",
            TenantName = tenantName,
            TenantCompanyName = tenantCompany,
            PropertyName = propName,
            PropertyCode = propCode,
            BillingPeriodStart = s.BillingPeriodStart,
            BillingPeriodEnd = s.BillingPeriodEnd,
            DueDate = s.DueDate,
            IssueDate = s.IssueDate,
            MonthlyRentAmount = s.MonthlyRentAmount,
            PreviousElectricityReading = s.PreviousElectricityReading,
            PresentElectricityReading = s.PresentElectricityReading,
            ElectricityConsumptionKwh = s.ElectricityConsumptionKwh,
            ElectricityRatePerKwh = s.ElectricityRatePerKwh,
            ElectricityAmount = s.ElectricityAmount,
            WaterAmount = s.WaterAmount,
            InternetAmount = s.InternetAmount,
            AdditionalCharges = s.AdditionalCharges,
            AdditionalChargesDescription = s.AdditionalChargesDescription,
            PreviousBalance = s.PreviousBalance,
            TotalAmountDue = s.TotalAmountDue,
            AmountPaid = s.AmountPaid,
            BalanceRemaining = s.BalanceRemaining,
            Status = s.Status,
            Notes = s.Notes,
            CreatedDate = s.CreatedDate,
            UpdatedDate = s.UpdatedDate
        };
    }
}
