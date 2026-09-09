using System.Text.Json.Serialization;

namespace JMP.Enterprises.Api.Models;

/// <summary>
/// Represents a guest or tenant (individual or corporate).
/// Maps to "Guests" table in SQL Server.
/// </summary>
public class Guest
{
    public int GuestId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? CompanyName { get; set; }

    public string? MobileNumber { get; set; }

    public string? EmailAddress { get; set; }

    public string? Address { get; set; }

    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public DateTime? UpdatedDate { get; set; }

    [JsonIgnore]
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
