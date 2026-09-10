namespace JMP.Enterprises.Api.Models;

/// <summary>
/// Represents a formal long-stay rental agreement / contract.
/// Maps to "RentalAgreements" table in SQL Server.
/// </summary>
public class RentalAgreement
{
    public int RentalAgreementId { get; set; }

    /// <summary>
    /// Unique contract reference number (e.g., JMP-RA-2026-00001)
    /// </summary>
    public string AgreementNumber { get; set; } = string.Empty;

    public int ReservationId { get; set; }
    public Reservation? Reservation { get; set; }

    public DateTime AgreementDate { get; set; } = DateTime.Now;

    public DateTime RentalStartDate { get; set; }

    public DateTime RentalEndDate { get; set; }

    public int NumberOfMonths { get; set; } = 1;

    public decimal MonthlyRent { get; set; }

    public decimal ReservationFee { get; set; } = 0;

    public bool IsReservationFeeDeductible { get; set; } = true;

    public decimal SecurityDeposit { get; set; } = 0;

    public decimal AdvancePayment { get; set; } = 0;

    public bool HasPet { get; set; } = false;

    public string? PetDescription { get; set; }

    public int MaximumOccupants { get; set; } = 2;

    /// <summary>
    /// Tenant | JMP Rental Property | Included in Rent | Not Applicable
    /// </summary>
    public string ElectricityResponsibility { get; set; } = "Tenant";

    public string WaterResponsibility { get; set; } = "Tenant";

    public string InternetResponsibility { get; set; } = "Tenant";

    /// <summary>
    /// Draft | Finalized | Cancelled
    /// </summary>
    public string AgreementStatus { get; set; } = "Draft";

    public string? AdditionalTerms { get; set; }

    public string? EarlyTerminationTerms { get; set; }

    // Immutable snapshot details preserved upon creation / finalization
    public string TenantName { get; set; } = string.Empty;

    public string? TenantCompanyName { get; set; }

    public string? TenantMobile { get; set; }

    public string PropertyName { get; set; } = string.Empty;

    public string PropertyCode { get; set; } = string.Empty;

    public DateTime? FinalizedDate { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public DateTime? UpdatedDate { get; set; }
}
