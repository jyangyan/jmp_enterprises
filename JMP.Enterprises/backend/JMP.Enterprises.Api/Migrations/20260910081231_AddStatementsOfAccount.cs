using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JMP.Enterprises.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStatementsOfAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StatementsOfAccount",
                columns: table => new
                {
                    StatementOfAccountId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SoaNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReservationId = table.Column<int>(type: "int", nullable: false),
                    RentalAgreementId = table.Column<int>(type: "int", nullable: false),
                    BillingPeriodStart = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BillingPeriodEnd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IssueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MonthlyRentAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PreviousElectricityReading = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PresentElectricityReading = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ElectricityConsumptionKwh = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ElectricityRatePerKwh = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ElectricityAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    WaterAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InternetAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdditionalCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdditionalChargesDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PreviousBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmountDue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BalanceRemaining = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StatementsOfAccount", x => x.StatementOfAccountId);
                    table.ForeignKey(
                        name: "FK_StatementsOfAccount_RentalAgreements_RentalAgreementId",
                        column: x => x.RentalAgreementId,
                        principalTable: "RentalAgreements",
                        principalColumn: "RentalAgreementId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StatementsOfAccount_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalTable: "Reservations",
                        principalColumn: "ReservationId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StatementsOfAccount_RentalAgreementId",
                table: "StatementsOfAccount",
                column: "RentalAgreementId");

            migrationBuilder.CreateIndex(
                name: "IX_StatementsOfAccount_ReservationId",
                table: "StatementsOfAccount",
                column: "ReservationId");

            migrationBuilder.CreateIndex(
                name: "IX_StatementsOfAccount_SoaNumber",
                table: "StatementsOfAccount",
                column: "SoaNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StatementsOfAccount");
        }
    }
}
