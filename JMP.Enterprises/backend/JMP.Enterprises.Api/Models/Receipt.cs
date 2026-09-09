using System;

namespace JMP.Enterprises.Api.Models;

public class Receipt
{
    public int ReceiptId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty; // e.g. JMP-AR-2026-00001
    public string ReceiptType { get; set; } = "Payment"; // Reservation | Payment | SecurityDeposit | Checkout | FinalSettlement | Other

    public int? ReservationId { get; set; }
    public Reservation? Reservation { get; set; }

    public int? PaymentId { get; set; }
    public Payment? Payment { get; set; }

    public DateTime ReceiptDate { get; set; } = DateTime.Now;
    public DateTime PaymentDate { get; set; } = DateTime.Now;
    public decimal Amount { get; set; }

    public string GuestName { get; set; } = string.Empty;
    public string? GuestCompanyName { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyCode { get; set; } = string.Empty;

    public string PaymentType { get; set; } = "Rent Payment"; // Reservation Fee | Advance Payment | Rent Payment | Security Deposit | Balance Payment | Final Settlement | Other
    public string PaymentMethod { get; set; } = "Cash"; // Cash | GCash | Maya | Bank Transfer | Other
    public string? ReferenceNumber { get; set; }
    public string Purpose { get; set; } = string.Empty;

    public string? RentalType { get; set; } // ShortStay | LongStay
    public DateTime? CheckInDate { get; set; }
    public DateTime? CheckOutDate { get; set; }

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
    public string? SettlementStatus { get; set; } // PAID IN FULL | BALANCE REMAINING | SECURITY DEPOSIT RETURNED | SECURITY DEPOSIT PARTIALLY APPLIED

    public string? Notes { get; set; }
    public string IssuedBy { get; set; } = "JMP Rental Property";
    public bool IsVoided { get; set; } = false;

    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public DateTime? UpdatedDate { get; set; }
}
