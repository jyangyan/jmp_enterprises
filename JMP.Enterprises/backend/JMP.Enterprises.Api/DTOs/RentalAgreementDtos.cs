namespace JMP.Enterprises.Api.DTOs;

public class RentalAgreementDto
{
    public int RentalAgreementId { get; set; }
    public string AgreementNumber { get; set; } = string.Empty;
    public int ReservationId { get; set; }
    public DateTime AgreementDate { get; set; }
    public DateTime RentalStartDate { get; set; }
    public DateTime RentalEndDate { get; set; }
    public int NumberOfMonths { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal ReservationFee { get; set; }
    public bool IsReservationFeeDeductible { get; set; }
    public decimal SecurityDeposit { get; set; }
    public decimal AdvancePayment { get; set; }
    public bool HasPet { get; set; }
    public string? PetDescription { get; set; }
    public int MaximumOccupants { get; set; }
    public string ElectricityResponsibility { get; set; } = "Tenant";
    public string WaterResponsibility { get; set; } = "Tenant";
    public string InternetResponsibility { get; set; } = "Tenant";
    public string AgreementStatus { get; set; } = "Draft";
    public string? AdditionalTerms { get; set; }
    public string? EarlyTerminationTerms { get; set; }

    public string TenantName { get; set; } = string.Empty;
    public string? TenantCompanyName { get; set; }
    public string? TenantMobile { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyCode { get; set; } = string.Empty;

    public DateTime? FinalizedDate { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
}

public class CreateRentalAgreementDto
{
    public int ReservationId { get; set; }
    public DateTime? AgreementDate { get; set; }
    public decimal? AdvancePayment { get; set; }
    public bool? HasPet { get; set; }
    public string? PetDescription { get; set; }
    public int? MaximumOccupants { get; set; }
    public string? ElectricityResponsibility { get; set; }
    public string? WaterResponsibility { get; set; }
    public string? InternetResponsibility { get; set; }
    public string? AdditionalTerms { get; set; }
    public string? EarlyTerminationTerms { get; set; }
}

public class UpdateRentalAgreementDto
{
    public DateTime AgreementDate { get; set; }
    public DateTime RentalStartDate { get; set; }
    public DateTime RentalEndDate { get; set; }
    public int NumberOfMonths { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal ReservationFee { get; set; }
    public bool IsReservationFeeDeductible { get; set; }
    public decimal SecurityDeposit { get; set; }
    public decimal AdvancePayment { get; set; }
    public bool HasPet { get; set; }
    public string? PetDescription { get; set; }
    public int MaximumOccupants { get; set; }
    public string ElectricityResponsibility { get; set; } = "Tenant";
    public string WaterResponsibility { get; set; } = "Tenant";
    public string InternetResponsibility { get; set; } = "Tenant";
    public string? AdditionalTerms { get; set; }
    public string? EarlyTerminationTerms { get; set; }
}
