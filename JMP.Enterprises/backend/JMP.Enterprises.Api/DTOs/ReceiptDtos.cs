using System;

namespace JMP.Enterprises.Api.Dtos;

public class ReceiptDto
{
    public int ReceiptId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public string ReceiptType { get; set; } = string.Empty;

    public int? ReservationId { get; set; }
    public int? PaymentId { get; set; }

    public DateTime ReceiptDate { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string AmountInWords { get; set; } = string.Empty;

    public string GuestName { get; set; } = string.Empty;
    public string? GuestCompanyName { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyCode { get; set; } = string.Empty;

    public string PaymentType { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public string Purpose { get; set; } = string.Empty;

    public string? RentalType { get; set; }
    public DateTime? CheckInDate { get; set; }
    public DateTime? CheckOutDate { get; set; }
    public string? ReservationStatus { get; set; }
    public decimal? ReservationFee { get; set; }

    // Rental Balance Tracking
    public decimal? AgreedRentalAmount { get; set; }
    public decimal? PreviouslyPaid { get; set; }
    public decimal? RemainingBalance { get; set; }

    // Checkout / Final Settlement Fields
    public decimal? TotalRentalAmount { get; set; }
    public decimal? TotalRentalPaymentsReceived { get; set; }
    public decimal? SecurityDepositReceived { get; set; }
    public decimal? AdditionalCharges { get; set; }
    public decimal? SecurityDepositReturned { get; set; }
    public decimal? OutstandingBalance { get; set; }
    public string? SettlementStatus { get; set; }

    public string? Notes { get; set; }
    public string IssuedBy { get; set; } = "JMP Rental Property";
    public bool IsVoided { get; set; }

    public DateTime CreatedDate { get; set; }
}

public class CreateReceiptDto
{
    public string ReceiptType { get; set; } = "Payment"; // Reservation | Payment | SecurityDeposit | Checkout | FinalSettlement | Other
    public int? ReservationId { get; set; }
    public int? PaymentId { get; set; }
    public DateTime? ReceiptDate { get; set; }
    public decimal? Amount { get; set; }
    public string? PaymentType { get; set; }
    public string? PaymentMethod { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }

    // Optional manual overrides for Checkout / Final Settlement
    public decimal? AdditionalCharges { get; set; }
    public decimal? SecurityDepositReturned { get; set; }
    public string? SettlementStatus { get; set; }
}

public class CheckoutSettlementDto
{
    public int ReservationId { get; set; }
    public decimal AdditionalCharges { get; set; }
    public decimal SecurityDepositReturned { get; set; }
    public string SettlementStatus { get; set; } = "PAID IN FULL";
    public string? Notes { get; set; }

    // Direct Payment Collection at Checkout
    public decimal PaymentAmount { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public string PaymentType { get; set; } = "Rental Payment";
    public string? ReferenceNumber { get; set; }
}
