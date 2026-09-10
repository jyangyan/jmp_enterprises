using JMP.Enterprises.Api.Data;
using JMP.Enterprises.Api.DTOs;
using JMP.Enterprises.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JMP.Enterprises.Api.Services;

public class RentalAgreementService : IRentalAgreementService
{
    private readonly ApplicationDbContext _context;

    public RentalAgreementService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RentalAgreementDto?> GetByIdAsync(int id)
    {
        var agreement = await _context.RentalAgreements
            .Include(a => a.Reservation)
                .ThenInclude(r => r!.Guest)
            .Include(a => a.Reservation)
                .ThenInclude(r => r!.Property)
            .FirstOrDefaultAsync(a => a.RentalAgreementId == id);

        return agreement != null ? MapToDto(agreement) : null;
    }

    public async Task<RentalAgreementDto?> GetByReservationIdAsync(int reservationId)
    {
        var agreement = await _context.RentalAgreements
            .Include(a => a.Reservation)
                .ThenInclude(r => r!.Guest)
            .Include(a => a.Reservation)
                .ThenInclude(r => r!.Property)
            .Where(a => a.ReservationId == reservationId && a.AgreementStatus != "Cancelled")
            .OrderByDescending(a => a.RentalAgreementId)
            .FirstOrDefaultAsync();

        return agreement != null ? MapToDto(agreement) : null;
    }

    public async Task<RentalAgreementDto> CreateDraftAsync(int reservationId, CreateRentalAgreementDto? customDto = null)
    {
        // Check if an active/draft agreement already exists for this reservation
        var existing = await _context.RentalAgreements
            .Include(a => a.Reservation)
                .ThenInclude(r => r!.Guest)
            .Include(a => a.Reservation)
                .ThenInclude(r => r!.Property)
            .Where(a => a.ReservationId == reservationId && a.AgreementStatus != "Cancelled")
            .OrderByDescending(a => a.RentalAgreementId)
            .FirstOrDefaultAsync();

        if (existing != null)
        {
            return MapToDto(existing);
        }

        var reservation = await _context.Reservations
            .Include(r => r.Guest)
            .Include(r => r.Property)
            .FirstOrDefaultAsync(r => r.ReservationId == reservationId);

        if (reservation == null)
        {
            throw new InvalidOperationException($"Reservation #{reservationId} was not found.");
        }

        // Calculate duration in months
        int months = CalculateMonths(reservation.CheckInDate, reservation.CheckOutDate);

        // Generate Agreement Number: JMP-RA-YYYY-XXXXX
        string agreementNumber = await GenerateAgreementNumberAsync();

        string tenantName = $"{reservation.Guest?.FirstName} {reservation.Guest?.LastName}".Trim();
        if (string.IsNullOrWhiteSpace(tenantName)) tenantName = "Registered Tenant";

        var agreement = new RentalAgreement
        {
            AgreementNumber = agreementNumber,
            ReservationId = reservation.ReservationId,
            AgreementDate = customDto?.AgreementDate ?? DateTime.Now,
            RentalStartDate = reservation.CheckInDate,
            RentalEndDate = reservation.CheckOutDate,
            NumberOfMonths = months,
            MonthlyRent = reservation.MonthlyRate > 0 ? reservation.MonthlyRate : reservation.AgreedRentalAmount,
            ReservationFee = reservation.ReservationFee,
            IsReservationFeeDeductible = true,
            SecurityDeposit = reservation.SecurityDeposit,
            AdvancePayment = customDto?.AdvancePayment ?? 0,
            HasPet = customDto?.HasPet ?? false,
            PetDescription = customDto?.PetDescription,
            MaximumOccupants = customDto?.MaximumOccupants ?? 2,
            ElectricityResponsibility = customDto?.ElectricityResponsibility ?? "Tenant",
            WaterResponsibility = customDto?.WaterResponsibility ?? "Tenant",
            InternetResponsibility = customDto?.InternetResponsibility ?? "Tenant",
            AgreementStatus = "Draft",
            AdditionalTerms = customDto?.AdditionalTerms,
            EarlyTerminationTerms = customDto?.EarlyTerminationTerms ?? "Early termination of the rental agreement shall be subject to prior notice and mutual agreement between the Lessor and Lessee.",
            TenantName = tenantName,
            TenantCompanyName = reservation.Guest?.CompanyName,
            TenantMobile = reservation.Guest?.MobileNumber,
            PropertyName = reservation.Property?.PropertyName ?? "Rental Unit",
            PropertyCode = reservation.Property?.PropertyCode ?? "JMP",
            CreatedDate = DateTime.Now
        };

        _context.RentalAgreements.Add(agreement);
        await _context.SaveChangesAsync();

        return MapToDto(agreement);
    }

    public async Task<RentalAgreementDto> UpdateDraftAsync(int id, UpdateRentalAgreementDto dto)
    {
        var agreement = await _context.RentalAgreements
            .FirstOrDefaultAsync(a => a.RentalAgreementId == id);

        if (agreement == null)
        {
            throw new KeyNotFoundException($"Rental Agreement #{id} was not found.");
        }

        if (agreement.AgreementStatus != "Draft")
        {
            throw new InvalidOperationException($"Only Draft agreements can be modified. Current status: {agreement.AgreementStatus}");
        }

        agreement.AgreementDate = dto.AgreementDate;
        agreement.RentalStartDate = dto.RentalStartDate;
        agreement.RentalEndDate = dto.RentalEndDate;
        agreement.NumberOfMonths = dto.NumberOfMonths > 0 ? dto.NumberOfMonths : CalculateMonths(dto.RentalStartDate, dto.RentalEndDate);
        agreement.MonthlyRent = dto.MonthlyRent;
        agreement.ReservationFee = dto.ReservationFee;
        agreement.IsReservationFeeDeductible = dto.IsReservationFeeDeductible;
        agreement.SecurityDeposit = dto.SecurityDeposit;
        agreement.AdvancePayment = dto.AdvancePayment;
        agreement.HasPet = dto.HasPet;
        agreement.PetDescription = dto.HasPet ? dto.PetDescription : null;
        agreement.MaximumOccupants = dto.MaximumOccupants;
        agreement.ElectricityResponsibility = dto.ElectricityResponsibility;
        agreement.WaterResponsibility = dto.WaterResponsibility;
        agreement.InternetResponsibility = dto.InternetResponsibility;
        agreement.AdditionalTerms = dto.AdditionalTerms;
        agreement.EarlyTerminationTerms = dto.EarlyTerminationTerms;
        agreement.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();

        return MapToDto(agreement);
    }

    public async Task<RentalAgreementDto> FinalizeAsync(int id)
    {
        var agreement = await _context.RentalAgreements
            .FirstOrDefaultAsync(a => a.RentalAgreementId == id);

        if (agreement == null)
        {
            throw new KeyNotFoundException($"Rental Agreement #{id} was not found.");
        }

        if (agreement.AgreementStatus == "Finalized")
        {
            return MapToDto(agreement);
        }

        agreement.AgreementStatus = "Finalized";
        agreement.FinalizedDate = DateTime.Now;
        agreement.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();

        return MapToDto(agreement);
    }

    public async Task<RentalAgreementDto> CancelAsync(int id)
    {
        var agreement = await _context.RentalAgreements
            .FirstOrDefaultAsync(a => a.RentalAgreementId == id);

        if (agreement == null)
        {
            throw new KeyNotFoundException($"Rental Agreement #{id} was not found.");
        }

        agreement.AgreementStatus = "Cancelled";
        agreement.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();

        return MapToDto(agreement);
    }

    private async Task<string> GenerateAgreementNumberAsync()
    {
        int year = DateTime.Now.Year;
        string prefix = $"JMP-RA-{year}-";

        var latestAgreement = await _context.RentalAgreements
            .Where(a => a.AgreementNumber.StartsWith(prefix))
            .OrderByDescending(a => a.AgreementNumber)
            .FirstOrDefaultAsync();

        int sequence = 1;
        if (latestAgreement != null)
        {
            string seqStr = latestAgreement.AgreementNumber.Substring(prefix.Length);
            if (int.TryParse(seqStr, out int lastSeq))
            {
                sequence = lastSeq + 1;
            }
        }

        return $"{prefix}{sequence:D5}";
    }

    private static int CalculateMonths(DateTime start, DateTime end)
    {
        int months = (end.Year - start.Year) * 12 + end.Month - start.Month;
        if (end.Day > start.Day)
        {
            months += 1;
        }
        return Math.Max(1, months);
    }

    private static RentalAgreementDto MapToDto(RentalAgreement a)
    {
        return new RentalAgreementDto
        {
            RentalAgreementId = a.RentalAgreementId,
            AgreementNumber = a.AgreementNumber,
            ReservationId = a.ReservationId,
            AgreementDate = a.AgreementDate,
            RentalStartDate = a.RentalStartDate,
            RentalEndDate = a.RentalEndDate,
            NumberOfMonths = a.NumberOfMonths,
            MonthlyRent = a.MonthlyRent,
            ReservationFee = a.ReservationFee,
            IsReservationFeeDeductible = a.IsReservationFeeDeductible,
            SecurityDeposit = a.SecurityDeposit,
            AdvancePayment = a.AdvancePayment,
            HasPet = a.HasPet,
            PetDescription = a.PetDescription,
            MaximumOccupants = a.MaximumOccupants,
            ElectricityResponsibility = a.ElectricityResponsibility,
            WaterResponsibility = a.WaterResponsibility,
            InternetResponsibility = a.InternetResponsibility,
            AgreementStatus = a.AgreementStatus,
            AdditionalTerms = a.AdditionalTerms,
            EarlyTerminationTerms = a.EarlyTerminationTerms,
            TenantName = a.TenantName,
            TenantCompanyName = a.TenantCompanyName,
            TenantMobile = a.TenantMobile,
            PropertyName = a.PropertyName,
            PropertyCode = a.PropertyCode,
            FinalizedDate = a.FinalizedDate,
            CreatedDate = a.CreatedDate,
            UpdatedDate = a.UpdatedDate
        };
    }
}
