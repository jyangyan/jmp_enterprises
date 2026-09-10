namespace JMP.Enterprises.Api.Models;

/// <summary>
/// Represents a monthly Statement of Account (SOA) for long-stay rental agreements.
/// Maps to "StatementsOfAccount" table in SQL Server.
/// </summary>
public class StatementOfAccount
{
    public int StatementOfAccountId { get; set; }

    /// <summary>
    /// Unique SOA reference number (e.g., JMP-SOA-202609-0001)
    /// </summary>
    public string SoaNumber { get; set; } = string.Empty;

    public int ReservationId { get; set; }
    public Reservation? Reservation { get; set; }

    public int RentalAgreementId { get; set; }
    public RentalAgreement? RentalAgreement { get; set; }

    public DateTime BillingPeriodStart { get; set; }

    public DateTime BillingPeriodEnd { get; set; }

    public DateTime DueDate { get; set; }

    public DateTime IssueDate { get; set; } = DateTime.Now;

    // Monthly Rent Charge
    public decimal MonthlyRentAmount { get; set; }

    // Electricity Submeter Details
    public decimal PreviousElectricityReading { get; set; } = 0;

    public decimal PresentElectricityReading { get; set; } = 0;

    public decimal ElectricityConsumptionKwh { get; set; } = 0;

    public decimal ElectricityRatePerKwh { get; set; } = 0;

    public decimal ElectricityAmount { get; set; } = 0;

    // Other Utilities
    public decimal WaterAmount { get; set; } = 0;

    public decimal InternetAmount { get; set; } = 0;

    public decimal AdditionalCharges { get; set; } = 0;

    public string? AdditionalChargesDescription { get; set; }

    // Balances & Calculations
    public decimal PreviousBalance { get; set; } = 0;

    public decimal TotalAmountDue { get; set; } = 0;

    public decimal AmountPaid { get; set; } = 0;

    public decimal BalanceRemaining { get; set; } = 0;

    /// <summary>
    /// Pending | PartiallyPaid | Paid | Overdue
    /// </summary>
    public string Status { get; set; } = "Pending";

    public string? Notes { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public DateTime? UpdatedDate { get; set; }
}
