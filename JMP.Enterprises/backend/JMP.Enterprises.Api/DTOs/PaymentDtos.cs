using System;

namespace JMP.Enterprises.Api.DTOs;

public class PaymentDto
{
    public int PaymentId { get; set; }
    public int ReservationId { get; set; }
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public int GuestId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string PaymentType { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class CreatePaymentDto
{
    public int ReservationId { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.Now;
    public decimal Amount { get; set; }
    public string PaymentType { get; set; } = "Rent";
    public string PaymentMethod { get; set; } = "Cash";
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}

public class UpdatePaymentDto
{
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string PaymentType { get; set; } = "Rent";
    public string PaymentMethod { get; set; } = "Cash";
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}

public class ReservationPaymentSummaryDto
{
    public int ReservationId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string GuestName { get; set; } = string.Empty;
    public decimal TotalCost { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal BalanceDue { get; set; }
    public string Status { get; set; } = "Unpaid"; // FullyPaid | Partial | Unpaid | Overpaid
}
