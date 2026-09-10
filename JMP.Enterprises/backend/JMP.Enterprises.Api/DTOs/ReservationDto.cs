namespace JMP.Enterprises.Api.DTOs;

public class ReservationDto
{
    public int ReservationId { get; set; }
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyCode { get; set; } = string.Empty;

    public int GuestId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string? GuestCompanyName { get; set; }
    public string? GuestMobileNumber { get; set; }

    public string RentalType { get; set; } = "ShortStay"; // ShortStay | LongStay
    public string BookingSource { get; set; } = "Direct";

    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }

    public int NumberOfNights => (CheckOutDate.Date - CheckInDate.Date).Days;

    public decimal DailyRate { get; set; }
    public decimal MonthlyRate { get; set; }
    public decimal AgreedRentalAmount { get; set; }
    public decimal SecurityDeposit { get; set; }
    public decimal ReservationFee { get; set; }
    public string? ReservationFeePaymentMethod { get; set; } = "Cash";
    public string? ReservationFeeReferenceNumber { get; set; }

    public string ReservationStatus { get; set; } = "Confirmed";
    public string? Notes { get; set; }

    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
}

public class CreateReservationDto
{
    public int PropertyId { get; set; }
    public int GuestId { get; set; }
    public string RentalType { get; set; } = "ShortStay";
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
    public string ReservationStatus { get; set; } = "Confirmed";
    public string? Notes { get; set; }
}

public class UpdateReservationDto
{
    public int PropertyId { get; set; }
    public int GuestId { get; set; }
    public string RentalType { get; set; } = "ShortStay";
    public string BookingSource { get; set; } = "Direct";
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public decimal DailyRate { get; set; }
    public decimal MonthlyRate { get; set; }
    public decimal AgreedRentalAmount { get; set; }
    public decimal SecurityDeposit { get; set; }
    public decimal ReservationFee { get; set; }
    public string? ReservationFeePaymentMethod { get; set; } = "Cash";
    public string? ReservationFeeReferenceNumber { get; set; }
    public string ReservationStatus { get; set; } = "Confirmed";
    public string? Notes { get; set; }
}

public class PropertyAvailabilityDto
{
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyCode { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string? CurrentReservationGuest { get; set; }
    public DateTime? ConflictCheckIn { get; set; }
    public DateTime? ConflictCheckOut { get; set; }
}
