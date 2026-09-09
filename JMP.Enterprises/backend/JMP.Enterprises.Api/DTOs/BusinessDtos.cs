using System.Collections.Generic;

namespace JMP.Enterprises.Api.DTOs;

public class BusinessDto
{
    public int BusinessId { get; set; }
    public string BusinessCode { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Route { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsImplemented { get; set; }
}

public class UserBusinessAccessDto
{
    public int UserBusinessAccessId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int BusinessId { get; set; }
    public string BusinessCode { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool CanAccess { get; set; }
    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDeleteOrVoid { get; set; }
}

public class UpdateUserBusinessAccessDto
{
    public string UserId { get; set; } = string.Empty;
    public string Role { get; set; } = "Staff";
    public List<int> AllowedBusinessIds { get; set; } = new();
}
