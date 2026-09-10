using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JMP.Enterprises.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationFeePaymentDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH('Reservations', 'ReservationFeePaymentMethod') IS NULL
                BEGIN
                    ALTER TABLE [Reservations] ADD [ReservationFeePaymentMethod] nvarchar(50) NULL DEFAULT 'Cash';
                END

                IF COL_LENGTH('Reservations', 'ReservationFeeReferenceNumber') IS NULL
                BEGIN
                    ALTER TABLE [Reservations] ADD [ReservationFeeReferenceNumber] nvarchar(100) NULL;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH('Reservations', 'ReservationFeePaymentMethod') IS NOT NULL
                BEGIN
                    ALTER TABLE [Reservations] DROP COLUMN [ReservationFeePaymentMethod];
                END

                IF COL_LENGTH('Reservations', 'ReservationFeeReferenceNumber') IS NOT NULL
                BEGIN
                    ALTER TABLE [Reservations] DROP COLUMN [ReservationFeeReferenceNumber];
                END
            ");
        }
    }
}
