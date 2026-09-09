using System;

namespace JMP.Enterprises.Api.Models;

/// <summary>
/// Represents an expense / operational cost incurred for a property or general operation.
/// Maps to "Expenses" table in SQL Server.
/// </summary>
public class Expense
{
    public int ExpenseId { get; set; }

    public int? PropertyId { get; set; }
    public Property? Property { get; set; }

    public DateTime ExpenseDate { get; set; } = DateTime.Now;

    /// <summary>
    /// Maintenance | Utilities | Cleaning | HOA Fees | Taxes | Supplies | Other
    /// </summary>
    public string Category { get; set; } = "Maintenance";

    public decimal Amount { get; set; }

    public string? VendorPayee { get; set; }

    public string Description { get; set; } = string.Empty;

    public string? ReceiptReference { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.Now;
}
