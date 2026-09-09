namespace JMP.Enterprises.Api.DTOs;

public class GuestDto
{
    public int GuestId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string? CompanyName { get; set; }
    public string DisplayName => !string.IsNullOrWhiteSpace(CompanyName) 
        ? $"{CompanyName} (Contact: {FullName})" 
        : FullName;
    public string? MobileNumber { get; set; }
    public string? EmailAddress { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
}

public class CreateGuestDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? MobileNumber { get; set; }
    public string? EmailAddress { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
}

public class UpdateGuestDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? MobileNumber { get; set; }
    public string? EmailAddress { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
}
