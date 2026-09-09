using System;
using System.ComponentModel.DataAnnotations;

namespace JMP.Enterprises.Api.Models;

/// <summary>
/// Defines user and role permissions for accessing specific businesses under JMP Enterprises.
/// </summary>
public class UserBusinessAccess
{
    [Key]
    public int UserBusinessAccessId { get; set; }

    [Required]
    [MaxLength(100)]
    public string UserId { get; set; } = string.Empty; // Username or User Identifier

    public int BusinessId { get; set; }

    public Business? Business { get; set; }

    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = "Staff"; // SuperAdmin, Owner, Manager, Staff, Viewer

    public bool CanAccess { get; set; } = true;

    public bool CanView { get; set; } = true;

    public bool CanCreate { get; set; } = true;

    public bool CanEdit { get; set; } = true;

    public bool CanDeleteOrVoid { get; set; } = true;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedDate { get; set; }
}
