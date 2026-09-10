using System;

namespace JMP.Enterprises.Api.DTOs;

public class ExpenseDto
{
    public int ExpenseId { get; set; }
    public int? PropertyId { get; set; }
    public string? PropertyName { get; set; }
    public int? ReservationId { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? VendorPayee { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ReceiptReference { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class CreateExpenseDto
{
    public int? PropertyId { get; set; }
    public int? ReservationId { get; set; }
    public DateTime ExpenseDate { get; set; } = DateTime.Now;
    public string Category { get; set; } = "Maintenance";
    public decimal Amount { get; set; }
    public string? VendorPayee { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ReceiptReference { get; set; }
}

public class UpdateExpenseDto
{
    public int? PropertyId { get; set; }
    public int? ReservationId { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string Category { get; set; } = "Maintenance";
    public decimal Amount { get; set; }
    public string? VendorPayee { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ReceiptReference { get; set; }
}

public class ExpenseCategorySummaryDto
{
    public string Category { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int ExpenseCount { get; set; }
    public double Percentage { get; set; }
}
