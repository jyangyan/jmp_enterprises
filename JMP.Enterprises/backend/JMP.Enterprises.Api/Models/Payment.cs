using System;

namespace JMP.Enterprises.Api.Models;

/// <summary>
/// Represents a rental payment recorded against a reservation or property.
/// Maps to "Payments" table in SQL Server.
/// </summary>
public class Payment
{
    public int PaymentId { get; set; }

    public int ReservationId { get; set; }
    public Reservation? Reservation { get; set; }

    public int PropertyId { get; set; }
    public Property? Property { get; set; }

    public DateTime PaymentDate { get; set; } = DateTime.Now;

    public decimal Amount { get; set; }

    /// <summary>
    /// Rent | SecurityDeposit | ReservationFee | Utility | Other
    /// </summary>
    public string PaymentType { get; set; } = "Rent";

    /// <summary>
    /// Cash | GCash | BankTransfer | Check | Other
    /// </summary>
    public string PaymentMethod { get; set; } = "Cash";

    /// <summary>
    /// Optional reference / transaction number
    /// </summary>
    public string? ReferenceNumber { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.Now;
}
