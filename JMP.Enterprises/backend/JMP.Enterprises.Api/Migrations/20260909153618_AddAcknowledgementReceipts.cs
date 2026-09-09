using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JMP.Enterprises.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAcknowledgementReceipts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Receipts",
                columns: table => new
                {
                    ReceiptId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReceiptNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReceiptType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ReservationId = table.Column<int>(type: "int", nullable: true),
                    PaymentId = table.Column<int>(type: "int", nullable: true),
                    ReceiptDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GuestName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    GuestCompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PropertyName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PropertyCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PaymentType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Purpose = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RentalType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CheckInDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckOutDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AgreedRentalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PreviouslyPaid = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RemainingBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalRentalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalRentalPaymentsReceived = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SecurityDepositReceived = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    AdditionalCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SecurityDepositReturned = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OutstandingBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SettlementStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IssuedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsVoided = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Receipts", x => x.ReceiptId);
                    table.ForeignKey(
                        name: "FK_Receipts_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalTable: "Payments",
                        principalColumn: "PaymentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Receipts_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalTable: "Reservations",
                        principalColumn: "ReservationId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Receipts_PaymentId",
                table: "Receipts",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_Receipts_ReceiptNumber",
                table: "Receipts",
                column: "ReceiptNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Receipts_ReservationId",
                table: "Receipts",
                column: "ReservationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Receipts");
        }
    }
}
