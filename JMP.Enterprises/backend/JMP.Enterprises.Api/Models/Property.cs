namespace JMP.Enterprises.Api.Models;

/// <summary>
/// Represents a rental property unit.
/// Maps to the "Properties" table in SQL Server.
/// </summary>
public class Property
{
    public int PropertyId { get; set; }

    public string PropertyName { get; set; } = string.Empty;

    public string PropertyCode { get; set; } = string.Empty;

    public string? Location { get; set; }

    public string? Description { get; set; }

    public decimal DefaultMonthlyRate { get; set; }

    public decimal DefaultDailyRate { get; set; }

    /// <summary>
    /// Possible values: Available, Occupied, Maintenance, Inactive
    /// </summary>
    public string Status { get; set; } = "Available";

    /// <summary>
    /// Soft-delete flag. When false, the property is "deactivated" but still in the database.
    /// </summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public DateTime? UpdatedDate { get; set; }
}
