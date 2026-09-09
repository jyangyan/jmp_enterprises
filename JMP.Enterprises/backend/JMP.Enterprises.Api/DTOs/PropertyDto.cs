namespace JMP.Enterprises.Api.DTOs;

/// <summary>
/// DTO returned by GET endpoints — represents a property as the frontend sees it.
/// </summary>
public class PropertyDto
{
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyCode { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? Description { get; set; }
    public decimal DefaultMonthlyRate { get; set; }
    public decimal DefaultDailyRate { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
}

/// <summary>
/// DTO for creating a new property (POST /api/properties).
/// </summary>
public class CreatePropertyDto
{
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyCode { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? Description { get; set; }
    public decimal DefaultMonthlyRate { get; set; }
    public decimal DefaultDailyRate { get; set; }
    public string Status { get; set; } = "Available";
}

/// <summary>
/// DTO for updating an existing property (PUT /api/properties/{id}).
/// </summary>
public class UpdatePropertyDto
{
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyCode { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? Description { get; set; }
    public decimal DefaultMonthlyRate { get; set; }
    public decimal DefaultDailyRate { get; set; }
    public string Status { get; set; } = "Available";
}
