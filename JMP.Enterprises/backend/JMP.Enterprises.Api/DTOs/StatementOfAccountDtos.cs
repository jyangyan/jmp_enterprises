namespace JMP.Enterprises.Api.DTOs;

public class CreateStatementOfAccountDto
{
    public int ReservationId { get; set; }

    public int RentalAgreementId { get; set; }

    public DateTime BillingPeriodStart { get; set; }

    public DateTime BillingPeriodEnd { get; set; }

    public DateTime DueDate { get; set; }

    public decimal MonthlyRentAmount { get; set; }

    public decimal PreviousElectricityReading { get; set; }

    public decimal PresentElectricityReading { get; set; }

    public decimal ElectricityRatePerKwh { get; set; }

    public decimal WaterAmount { get; set; }

    public decimal InternetAmount { get; set; }

    public decimal AdditionalCharges { get; set; }

    public string? AdditionalChargesDescription { get; set; }

    public decimal PreviousBalance { get; set; }

    public string? Notes { get; set; }
}

public class UpdateStatementOfAccountDto
{
    public DateTime BillingPeriodStart { get; set; }

    public DateTime BillingPeriodEnd { get; set; }

    public DateTime DueDate { get; set; }

    public decimal MonthlyRentAmount { get; set; }

    public decimal PreviousElectricityReading { get; set; }

    public decimal PresentElectricityReading { get; set; }

    public decimal ElectricityRatePerKwh { get; set; }

    public decimal WaterAmount { get; set; }

    public decimal InternetAmount { get; set; }

    public decimal AdditionalCharges { get; set; }

    public string? AdditionalChargesDescription { get; set; }

    public decimal PreviousBalance { get; set; }

    public string Status { get; set; } = "Pending";

    public string? Notes { get; set; }
}

public class RecordSoaPaymentDto
{
    public decimal PaymentAmount { get; set; }

    public string PaymentMethod { get; set; } = "Cash";

    public string? ReferenceNumber { get; set; }

    public string? Notes { get; set; }
}

public class StatementOfAccountResponseDto
{
    public int StatementOfAccountId { get; set; }

    public string SoaNumber { get; set; } = string.Empty;

    public int ReservationId { get; set; }

    public int RentalAgreementId { get; set; }

    public string AgreementNumber { get; set; } = string.Empty;

    public string TenantName { get; set; } = string.Empty;

    public string? TenantCompanyName { get; set; }

    public string PropertyName { get; set; } = string.Empty;

    public string PropertyCode { get; set; } = string.Empty;

    public DateTime BillingPeriodStart { get; set; }

    public DateTime BillingPeriodEnd { get; set; }

    public DateTime DueDate { get; set; }

    public DateTime IssueDate { get; set; }

    public decimal MonthlyRentAmount { get; set; }

    public decimal PreviousElectricityReading { get; set; }

    public decimal PresentElectricityReading { get; set; }

    public decimal ElectricityConsumptionKwh { get; set; }

    public decimal ElectricityRatePerKwh { get; set; }

    public decimal ElectricityAmount { get; set; }

    public decimal WaterAmount { get; set; }

    public decimal InternetAmount { get; set; }

    public decimal AdditionalCharges { get; set; }

    public string? AdditionalChargesDescription { get; set; }

    public decimal PreviousBalance { get; set; }

    public decimal TotalAmountDue { get; set; }

    public decimal AmountPaid { get; set; }

    public decimal BalanceRemaining { get; set; }

    public string Status { get; set; } = "Pending";

    public string? Notes { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? UpdatedDate { get; set; }
}
