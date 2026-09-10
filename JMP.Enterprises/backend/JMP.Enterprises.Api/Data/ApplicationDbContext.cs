using Microsoft.EntityFrameworkCore;
using JMP.Enterprises.Api.Models;

namespace JMP.Enterprises.Api.Data;

/// <summary>
/// The main database context for JMP Enterprises.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Property> Properties { get; set; }
    public DbSet<Guest> Guests { get; set; }
    public DbSet<Reservation> Reservations { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    public DbSet<Receipt> Receipts { get; set; }
    public DbSet<Business> Businesses { get; set; }
    public DbSet<UserBusinessAccess> UserBusinessAccesses { get; set; }

    public DbSet<RentalAgreement> RentalAgreements { get; set; }
    public DbSet<StatementOfAccount> StatementsOfAccount { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ===== Receipt Entity Configuration =====
        modelBuilder.Entity<Receipt>(entity =>
        {
            entity.HasKey(r => r.ReceiptId);

            entity.Property(r => r.ReceiptNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(r => r.ReceiptNumber)
                .IsUnique();

            entity.Property(r => r.ReceiptType)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(r => r.Amount)
                .HasColumnType("decimal(18,2)");

            entity.Property(r => r.GuestName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(r => r.GuestCompanyName)
                .HasMaxLength(200);

            entity.Property(r => r.PropertyName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(r => r.PropertyCode)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(r => r.PaymentType)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(r => r.PaymentMethod)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(r => r.ReferenceNumber)
                .HasMaxLength(100);

            entity.Property(r => r.Purpose)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(r => r.AgreedRentalAmount).HasColumnType("decimal(18,2)");
            entity.Property(r => r.PreviouslyPaid).HasColumnType("decimal(18,2)");
            entity.Property(r => r.RemainingBalance).HasColumnType("decimal(18,2)");
            entity.Property(r => r.TotalRentalAmount).HasColumnType("decimal(18,2)");
            entity.Property(r => r.TotalRentalPaymentsReceived).HasColumnType("decimal(18,2)");
            entity.Property(r => r.SecurityDepositReceived).HasColumnType("decimal(18,2)");
            entity.Property(r => r.AdditionalCharges).HasColumnType("decimal(18,2)");
            entity.Property(r => r.SecurityDepositReturned).HasColumnType("decimal(18,2)");
            entity.Property(r => r.OutstandingBalance).HasColumnType("decimal(18,2)");

            entity.Property(r => r.SettlementStatus)
                .HasMaxLength(50);

            entity.Property(r => r.Notes)
                .HasMaxLength(1000);

            entity.Property(r => r.IssuedBy)
                .HasMaxLength(100);

            entity.HasOne(r => r.Reservation)
                .WithMany()
                .HasForeignKey(r => r.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Payment)
                .WithMany()
                .HasForeignKey(r => r.PaymentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== Property Entity Configuration =====
        modelBuilder.Entity<Property>(entity =>
        {
            entity.HasKey(p => p.PropertyId);

            entity.Property(p => p.PropertyName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(p => p.PropertyCode)
                .IsRequired()
                .HasMaxLength(20);

            entity.HasIndex(p => p.PropertyCode)
                .IsUnique();

            entity.Property(p => p.Location)
                .HasMaxLength(250);

            entity.Property(p => p.Description)
                .HasMaxLength(500);

            entity.Property(p => p.DefaultMonthlyRate)
                .HasColumnType("decimal(18,2)");

            entity.Property(p => p.DefaultDailyRate)
                .HasColumnType("decimal(18,2)");

            entity.Property(p => p.Status)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(p => p.IsActive)
                .HasDefaultValue(true);

            // Seed data: Lily, Lala, Pamae
            entity.HasData(
                new Property
                {
                    PropertyId = 1,
                    PropertyName = "Lily",
                    PropertyCode = "LILY",
                    Status = "Available",
                    IsActive = true,
                    DefaultMonthlyRate = 0,
                    DefaultDailyRate = 0,
                    CreatedDate = new DateTime(2026, 9, 9)
                },
                new Property
                {
                    PropertyId = 2,
                    PropertyName = "Lala",
                    PropertyCode = "LALA",
                    Status = "Available",
                    IsActive = true,
                    DefaultMonthlyRate = 0,
                    DefaultDailyRate = 0,
                    CreatedDate = new DateTime(2026, 9, 9)
                },
                new Property
                {
                    PropertyId = 3,
                    PropertyName = "Pamae",
                    PropertyCode = "PAMAE",
                    Status = "Available",
                    IsActive = true,
                    DefaultMonthlyRate = 0,
                    DefaultDailyRate = 0,
                    CreatedDate = new DateTime(2026, 9, 9)
                }
            );
        });

        // ===== Guest Entity Configuration =====
        modelBuilder.Entity<Guest>(entity =>
        {
            entity.HasKey(g => g.GuestId);

            entity.Property(g => g.FirstName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(g => g.LastName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(g => g.CompanyName)
                .HasMaxLength(200);

            entity.Property(g => g.MobileNumber)
                .HasMaxLength(50);

            entity.Property(g => g.EmailAddress)
                .HasMaxLength(150);

            entity.Property(g => g.Address)
                .HasMaxLength(500);

            entity.Property(g => g.Notes)
                .HasMaxLength(1000);

            entity.Property(g => g.IsActive)
                .HasDefaultValue(true);
        });

        // ===== Reservation Entity Configuration =====
        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(r => r.ReservationId);

            entity.Property(r => r.RentalType)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(r => r.BookingSource)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(r => r.DailyRate)
                .HasColumnType("decimal(18,2)");

            entity.Property(r => r.MonthlyRate)
                .HasColumnType("decimal(18,2)");

            entity.Property(r => r.AgreedRentalAmount)
                .HasColumnType("decimal(18,2)");

            entity.Property(r => r.SecurityDeposit)
                .HasColumnType("decimal(18,2)")
                .HasDefaultValue(0);

            entity.Property(r => r.ReservationFee)
                .HasColumnType("decimal(18,2)")
                .HasDefaultValue(0);

            entity.Property(r => r.ReservationStatus)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(r => r.Notes)
                .HasMaxLength(1000);

            // Relationships
            entity.HasOne(r => r.Property)
                .WithMany()
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Guest)
                .WithMany(g => g.Reservations)
                .HasForeignKey(r => r.GuestId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== Payment Entity Configuration =====
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(p => p.PaymentId);

            entity.Property(p => p.Amount)
                .HasColumnType("decimal(18,2)");

            entity.Property(p => p.PaymentType)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(p => p.PaymentMethod)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(p => p.ReferenceNumber)
                .HasMaxLength(100);

            entity.Property(p => p.Notes)
                .HasMaxLength(1000);

            entity.HasOne(p => p.Reservation)
                .WithMany()
                .HasForeignKey(p => p.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Property)
                .WithMany()
                .HasForeignKey(p => p.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== Expense Entity Configuration =====
        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.ExpenseId);

            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.Category)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.VendorPayee)
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(e => e.ReceiptReference)
                .HasMaxLength(100);

            entity.HasOne(e => e.Property)
                .WithMany()
                .HasForeignKey(e => e.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Reservation)
                .WithMany()
                .HasForeignKey(e => e.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== Business Entity Configuration & Seeding =====
        modelBuilder.Entity<Business>(entity =>
        {
            entity.HasKey(b => b.BusinessId);

            entity.Property(b => b.BusinessCode)
                .IsRequired()
                .HasMaxLength(30);

            entity.HasIndex(b => b.BusinessCode)
                .IsUnique();

            entity.Property(b => b.BusinessName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(b => b.Description)
                .HasMaxLength(500);

            entity.Property(b => b.Icon)
                .HasMaxLength(50);

            entity.Property(b => b.Route)
                .HasMaxLength(50);

            entity.Property(b => b.IsActive)
                .HasDefaultValue(true);

            entity.HasData(
                new Business
                {
                    BusinessId = 1,
                    BusinessCode = "RENTAL",
                    BusinessName = "JMP Rental Property",
                    Description = "Rental property management, reservations, and income tracking",
                    Icon = "Building2",
                    Route = "/rental",
                    IsActive = true,
                    DisplayOrder = 1,
                    CreatedDate = new DateTime(2026, 9, 10)
                },
                new Business
                {
                    BusinessId = 2,
                    BusinessCode = "LAUNDRY",
                    BusinessName = "JMP Laundry",
                    Description = "Laundry shop management, orders, and services",
                    Icon = "Shirt",
                    Route = "/laundry",
                    IsActive = true,
                    DisplayOrder = 2,
                    CreatedDate = new DateTime(2026, 9, 10)
                },
                new Business
                {
                    BusinessId = 3,
                    BusinessCode = "PRINT",
                    BusinessName = "JMP Piso Print",
                    Description = "Printing service management and jobs tracking",
                    Icon = "Printer",
                    Route = "/print",
                    IsActive = true,
                    DisplayOrder = 3,
                    CreatedDate = new DateTime(2026, 9, 10)
                },
                new Business
                {
                    BusinessId = 4,
                    BusinessCode = "MINIMART",
                    BusinessName = "JMP Mini-Mart",
                    Description = "Mini-mart, retail sales, and inventory management",
                    Icon = "ShoppingBag",
                    Route = "/minimart",
                    IsActive = true,
                    DisplayOrder = 4,
                    CreatedDate = new DateTime(2026, 9, 10)
                }
            );
        });

        // ===== UserBusinessAccess Entity Configuration =====
        modelBuilder.Entity<UserBusinessAccess>(entity =>
        {
            entity.HasKey(u => u.UserBusinessAccessId);

            entity.Property(u => u.UserId)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(u => u.Role)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasOne(u => u.Business)
                .WithMany()
                .HasForeignKey(u => u.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== RentalAgreement Entity Configuration =====
        modelBuilder.Entity<RentalAgreement>(entity =>
        {
            entity.HasKey(a => a.RentalAgreementId);

            entity.Property(a => a.AgreementNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(a => a.AgreementNumber)
                .IsUnique();

            entity.Property(a => a.MonthlyRent).HasColumnType("decimal(18,2)");
            entity.Property(a => a.ReservationFee).HasColumnType("decimal(18,2)");
            entity.Property(a => a.SecurityDeposit).HasColumnType("decimal(18,2)");
            entity.Property(a => a.AdvancePayment).HasColumnType("decimal(18,2)");

            entity.Property(a => a.ElectricityResponsibility).IsRequired().HasMaxLength(50);
            entity.Property(a => a.WaterResponsibility).IsRequired().HasMaxLength(50);
            entity.Property(a => a.InternetResponsibility).IsRequired().HasMaxLength(50);

            entity.Property(a => a.AgreementStatus).IsRequired().HasMaxLength(30);

            entity.Property(a => a.TenantName).IsRequired().HasMaxLength(200);
            entity.Property(a => a.TenantCompanyName).HasMaxLength(200);
            entity.Property(a => a.TenantMobile).HasMaxLength(50);
            entity.Property(a => a.PropertyName).IsRequired().HasMaxLength(100);
            entity.Property(a => a.PropertyCode).IsRequired().HasMaxLength(20);

            entity.Property(a => a.PetDescription).HasMaxLength(250);
            entity.Property(a => a.AdditionalTerms).HasMaxLength(2000);
            entity.Property(a => a.EarlyTerminationTerms).HasMaxLength(1000);

            entity.HasOne(a => a.Reservation)
                .WithMany()
                .HasForeignKey(a => a.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== StatementOfAccount Entity Configuration =====
        modelBuilder.Entity<StatementOfAccount>(entity =>
        {
            entity.HasKey(s => s.StatementOfAccountId);

            entity.Property(s => s.SoaNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(s => s.SoaNumber)
                .IsUnique();

            entity.Property(s => s.MonthlyRentAmount).HasColumnType("decimal(18,2)");
            entity.Property(s => s.PreviousElectricityReading).HasColumnType("decimal(18,2)");
            entity.Property(s => s.PresentElectricityReading).HasColumnType("decimal(18,2)");
            entity.Property(s => s.ElectricityConsumptionKwh).HasColumnType("decimal(18,2)");
            entity.Property(s => s.ElectricityRatePerKwh).HasColumnType("decimal(18,2)");
            entity.Property(s => s.ElectricityAmount).HasColumnType("decimal(18,2)");
            entity.Property(s => s.WaterAmount).HasColumnType("decimal(18,2)");
            entity.Property(s => s.InternetAmount).HasColumnType("decimal(18,2)");
            entity.Property(s => s.AdditionalCharges).HasColumnType("decimal(18,2)");
            entity.Property(s => s.PreviousBalance).HasColumnType("decimal(18,2)");
            entity.Property(s => s.TotalAmountDue).HasColumnType("decimal(18,2)");
            entity.Property(s => s.AmountPaid).HasColumnType("decimal(18,2)");
            entity.Property(s => s.BalanceRemaining).HasColumnType("decimal(18,2)");

            entity.Property(s => s.Status).IsRequired().HasMaxLength(30);
            entity.Property(s => s.AdditionalChargesDescription).HasMaxLength(500);
            entity.Property(s => s.Notes).HasMaxLength(1000);

            entity.HasOne(s => s.Reservation)
                .WithMany()
                .HasForeignKey(s => s.ReservationId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(s => s.RentalAgreement)
                .WithMany()
                .HasForeignKey(s => s.RentalAgreementId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
