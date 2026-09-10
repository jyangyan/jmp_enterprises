using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JMP.Enterprises.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReportingViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Ensure ReservationId column exists on Expenses table
            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT 1 FROM sys.columns 
                    WHERE object_id = OBJECT_ID('Expenses') AND name = 'ReservationId'
                )
                BEGIN
                    ALTER TABLE Expenses ADD ReservationId INT NULL;
                    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Reservations')
                    BEGIN
                        ALTER TABLE Expenses ADD CONSTRAINT FK_Expenses_Reservations_ReservationId 
                        FOREIGN KEY (ReservationId) REFERENCES Reservations(ReservationId);
                    END
                END
            ");

            // VIEW 1: vw_rental_financial_transactions
            // Cash-basis normalized transaction stream (Payments & Expenses)
            // Rule: Excludes Security Deposit payments (not revenue) and voided items
            migrationBuilder.Sql(@"
                CREATE OR ALTER VIEW vw_rental_financial_transactions AS
                SELECT 
                    'PAY-' + CAST(p.PaymentId AS nvarchar(20)) AS TransactionId,
                    p.PaymentDate AS TransactionDate,
                    p.PropertyId,
                    pr.PropertyName,
                    pr.PropertyCode,
                    p.ReservationId,
                    r.RentalType,
                    r.BookingSource,
                    'Income' AS TransactionType,
                    p.PaymentType AS Category,
                    p.Amount,
                    p.Amount AS IncomeAmount,
                    0.00 AS ExpenseAmount,
                    YEAR(p.PaymentDate) AS Year,
                    MONTH(p.PaymentDate) AS Month,
                    FORMAT(p.PaymentDate, 'yyyy-MM') AS YearMonth
                FROM Payments p
                INNER JOIN Properties pr ON p.PropertyId = pr.PropertyId
                INNER JOIN Reservations r ON p.ReservationId = r.ReservationId
                WHERE p.PaymentType <> 'Security Deposit'

                UNION ALL

                SELECT 
                    'EXP-' + CAST(e.ExpenseId AS nvarchar(20)) AS TransactionId,
                    e.ExpenseDate AS TransactionDate,
                    e.PropertyId,
                    pr.PropertyName,
                    pr.PropertyCode,
                    e.ReservationId,
                    r.RentalType,
                    r.BookingSource,
                    'Expense' AS TransactionType,
                    e.Category,
                    e.Amount,
                    0.00 AS IncomeAmount,
                    e.Amount AS ExpenseAmount,
                    YEAR(e.ExpenseDate) AS Year,
                    MONTH(e.ExpenseDate) AS Month,
                    FORMAT(e.ExpenseDate, 'yyyy-MM') AS YearMonth
                FROM Expenses e
                INNER JOIN Properties pr ON e.PropertyId = pr.PropertyId
                LEFT JOIN Reservations r ON e.ReservationId = r.ReservationId;
            ");

            // VIEW 2: vw_rental_monthly_profitability
            migrationBuilder.Sql(@"
                CREATE OR ALTER VIEW vw_rental_monthly_profitability AS
                SELECT 
                    t.Year,
                    t.Month,
                    t.YearMonth,
                    t.PropertyId,
                    t.PropertyName,
                    t.RentalType,
                    SUM(t.IncomeAmount) AS Revenue,
                    SUM(t.ExpenseAmount) AS Expenses,
                    SUM(t.IncomeAmount) - SUM(t.ExpenseAmount) AS NetProfit,
                    CASE 
                        WHEN SUM(t.IncomeAmount) > 0 THEN 
                            ((SUM(t.IncomeAmount) - SUM(t.ExpenseAmount)) / SUM(t.IncomeAmount)) * 100.0
                        ELSE 0.0 
                    END AS ProfitMargin
                FROM vw_rental_financial_transactions t
                GROUP BY t.Year, t.Month, t.YearMonth, t.PropertyId, t.PropertyName, t.RentalType;
            ");

            // VIEW 3: vw_rental_property_performance
            migrationBuilder.Sql(@"
                CREATE OR ALTER VIEW vw_rental_property_performance AS
                SELECT 
                    pr.PropertyId,
                    pr.PropertyName,
                    pr.PropertyCode,
                    COALESCE(fin.Revenue, 0.00) AS Revenue,
                    COALESCE(fin.Expenses, 0.00) AS Expenses,
                    COALESCE(fin.NetProfit, 0.00) AS NetProfit,
                    CASE 
                        WHEN COALESCE(fin.Revenue, 0.00) > 0 THEN 
                            ((COALESCE(fin.Revenue, 0.00) - COALESCE(fin.Expenses, 0.00)) / fin.Revenue) * 100.0
                        ELSE 0.0 
                    END AS ProfitMargin,
                    COALESCE(res.ReservationCount, 0) AS ReservationCount,
                    COALESCE(res.ShortStayCount, 0) AS ShortStayCount,
                    COALESCE(res.LongStayCount, 0) AS LongStayCount,
                    COALESCE(res.OccupiedDays, 0) AS OccupiedDays
                FROM Properties pr
                LEFT JOIN (
                    SELECT 
                        PropertyId,
                        SUM(IncomeAmount) AS Revenue,
                        SUM(ExpenseAmount) AS Expenses,
                        SUM(IncomeAmount) - SUM(ExpenseAmount) AS NetProfit
                    FROM vw_rental_financial_transactions
                    GROUP BY PropertyId
                ) fin ON pr.PropertyId = fin.PropertyId
                LEFT JOIN (
                    SELECT 
                        PropertyId,
                        COUNT(*) AS ReservationCount,
                        SUM(CASE WHEN RentalType = 'ShortStay' THEN 1 ELSE 0 END) AS ShortStayCount,
                        SUM(CASE WHEN RentalType = 'LongStay' THEN 1 ELSE 0 END) AS LongStayCount,
                        SUM(DATEDIFF(day, CheckInDate, CheckOutDate)) AS OccupiedDays
                    FROM Reservations
                    WHERE ReservationStatus <> 'Cancelled'
                    GROUP BY PropertyId
                ) res ON pr.PropertyId = res.PropertyId;
            ");

            // VIEW 4: vw_rental_demand_trend
            migrationBuilder.Sql(@"
                CREATE OR ALTER VIEW vw_rental_demand_trend AS
                SELECT 
                    YEAR(r.CreatedDate) AS Year,
                    MONTH(r.CreatedDate) AS Month,
                    FORMAT(r.CreatedDate, 'yyyy-MM') AS YearMonth,
                    r.PropertyId,
                    pr.PropertyName,
                    r.RentalType,
                    COUNT(*) AS ReservationCount,
                    SUM(CASE WHEN r.ReservationStatus IN ('Confirmed', 'CheckedIn', 'CheckedOut') THEN 1 ELSE 0 END) AS ConfirmedReservationCount,
                    SUM(CASE WHEN r.ReservationStatus = 'Cancelled' THEN 1 ELSE 0 END) AS CancelledReservationCount,
                    SUM(CASE WHEN r.ReservationStatus <> 'Cancelled' THEN DATEDIFF(day, r.CheckInDate, r.CheckOutDate) ELSE 0 END) AS OccupiedDays,
                    AVG(CASE WHEN r.ReservationStatus <> 'Cancelled' THEN CAST(DATEDIFF(day, r.CheckInDate, r.CheckOutDate) AS float) ELSE 0 END) AS AverageLengthOfStay
                FROM Reservations r
                INNER JOIN Properties pr ON r.PropertyId = pr.PropertyId
                GROUP BY YEAR(r.CreatedDate), MONTH(r.CreatedDate), FORMAT(r.CreatedDate, 'yyyy-MM'), r.PropertyId, pr.PropertyName, r.RentalType;
            ");

            // VIEW 5: vw_rental_type_performance
            migrationBuilder.Sql(@"
                CREATE OR ALTER VIEW vw_rental_type_performance AS
                SELECT 
                    r.RentalType,
                    COUNT(DISTINCT r.ReservationId) AS ReservationCount,
                    COALESCE(SUM(p.Amount), 0.00) AS Revenue,
                    COALESCE(SUM(e_direct.Amount), 0.00) AS DirectExpenses,
                    COALESCE(SUM(p.Amount), 0.00) - COALESCE(SUM(e_direct.Amount), 0.00) AS NetProfitBeforeSharedExpenses,
                    AVG(CAST(DATEDIFF(day, r.CheckInDate, r.CheckOutDate) AS float)) AS AverageStayLength
                FROM Reservations r
                LEFT JOIN Payments p ON r.ReservationId = p.ReservationId AND p.PaymentType <> 'Security Deposit'
                LEFT JOIN Expenses e_direct ON r.ReservationId = e_direct.ReservationId
                WHERE r.ReservationStatus <> 'Cancelled'
                GROUP BY r.RentalType;
            ");

            // VIEW 6: vw_rental_expense_analysis
            migrationBuilder.Sql(@"
                CREATE OR ALTER VIEW vw_rental_expense_analysis AS
                SELECT 
                    e.Category AS ExpenseCategory,
                    e.PropertyId,
                    pr.PropertyName,
                    e.ReservationId,
                    r.RentalType,
                    SUM(e.Amount) AS TotalAmount,
                    YEAR(e.ExpenseDate) AS Year,
                    MONTH(e.ExpenseDate) AS Month,
                    FORMAT(e.ExpenseDate, 'yyyy-MM') AS YearMonth
                FROM Expenses e
                INNER JOIN Properties pr ON e.PropertyId = pr.PropertyId
                LEFT JOIN Reservations r ON e.ReservationId = r.ReservationId
                GROUP BY e.Category, e.PropertyId, pr.PropertyName, e.ReservationId, r.RentalType, YEAR(e.ExpenseDate), MONTH(e.ExpenseDate), FORMAT(e.ExpenseDate, 'yyyy-MM');
            ");

            // VIEW 7: vw_rental_booking_source_performance
            migrationBuilder.Sql(@"
                CREATE OR ALTER VIEW vw_rental_booking_source_performance AS
                SELECT 
                    r.BookingSource,
                    r.PropertyId,
                    pr.PropertyName,
                    r.RentalType,
                    COUNT(*) AS ReservationCount,
                    COALESCE(SUM(p.Amount), 0.00) AS Revenue,
                    CASE 
                        WHEN COUNT(*) > 0 THEN COALESCE(SUM(p.Amount), 0.00) / COUNT(*)
                        ELSE 0.00
                    END AS AverageReservationValue
                FROM Reservations r
                INNER JOIN Properties pr ON r.PropertyId = pr.PropertyId
                LEFT JOIN Payments p ON r.ReservationId = p.ReservationId AND p.PaymentType <> 'Security Deposit'
                WHERE r.ReservationStatus <> 'Cancelled'
                GROUP BY r.BookingSource, r.PropertyId, pr.PropertyName, r.RentalType;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS vw_rental_booking_source_performance;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS vw_rental_expense_analysis;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS vw_rental_type_performance;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS vw_rental_demand_trend;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS vw_rental_property_performance;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS vw_rental_monthly_profitability;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS vw_rental_financial_transactions;");
        }
    }
}
