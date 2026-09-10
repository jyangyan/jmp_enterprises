namespace JMP.Enterprises.Api.Models;

/// <summary>
/// Represents a property reservation / booking (Short Stay or Long Stay).
/// Maps to "Reservations" table in SQL Server.
/// </summary>
public class Reservation
{
    public int ReservationId { get; set; }

    public int PropertyId { get; set; }
    public Property? Property { get; set; }

    public int GuestId { get; set; }
    public Guest? Guest { get; set; }

    /// <summary>
    /// ShortStay | LongStay
    /// </summary>
    public string RentalType { get; set; } = "ShortStay";

    /// <summary>
    /// Direct | Airbnb | Facebook | Referral | Other
    /// </summary>
    public string BookingSource { get; set; } = "Direct";

    public DateTime CheckInDate { get; set; }

    public DateTime CheckOutDate { get; set; }

    public decimal DailyRate { get; set; }

    public decimal MonthlyRate { get; set; }

    public decimal AgreedRentalAmount { get; set; }

    public decimal SecurityDeposit { get; set; } = 0;

    public decimal ReservationFee { get; set; } = 0;

    public string? ReservationFeePaymentMethod { get; set; } = "Cash";

    public string? ReservationFeeReferenceNumber { get; set; }

    /// <summary>
    /// Inquiry | Reserved | Confirmed | CheckedIn | CheckedOut | Cancelled
    /// </summary>
    public string ReservationStatus { get; set; } = "Confirmed";

    public string? Notes { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public DateTime? UpdatedDate { get; set; }
}
