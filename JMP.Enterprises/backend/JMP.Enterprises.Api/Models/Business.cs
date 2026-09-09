using System;
using System.ComponentModel.DataAnnotations;

namespace JMP.Enterprises.Api.Models;

/// <summary>
/// Represents a business unit or module under JMP Enterprises (e.g. Rental, Laundry, Piso Print, Mini-Mart).
/// </summary>
public class Business
{
    [Key]
    public int BusinessId { get; set; }

    [Required]
    [MaxLength(30)]
    public string BusinessCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string BusinessName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(50)]
    public string? Icon { get; set; }

    [MaxLength(50)]
    public string? Route { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedDate { get; set; }
}
