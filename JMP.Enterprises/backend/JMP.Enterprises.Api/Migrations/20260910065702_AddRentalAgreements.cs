using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JMP.Enterprises.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalAgreements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RentalAgreements",
                columns: table => new
                {
                    RentalAgreementId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AgreementNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReservationId = table.Column<int>(type: "int", nullable: false),
                    AgreementDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RentalStartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RentalEndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NumberOfMonths = table.Column<int>(type: "int", nullable: false),
                    MonthlyRent = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReservationFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsReservationFeeDeductible = table.Column<bool>(type: "bit", nullable: false),
                    SecurityDeposit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdvancePayment = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HasPet = table.Column<bool>(type: "bit", nullable: false),
                    PetDescription = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    MaximumOccupants = table.Column<int>(type: "int", nullable: false),
                    ElectricityResponsibility = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WaterResponsibility = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    InternetResponsibility = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AgreementStatus = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    AdditionalTerms = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    EarlyTerminationTerms = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TenantName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TenantCompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TenantMobile = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PropertyName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PropertyCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FinalizedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalAgreements", x => x.RentalAgreementId);
                    table.ForeignKey(
                        name: "FK_RentalAgreements_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalTable: "Reservations",
                        principalColumn: "ReservationId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RentalAgreements_AgreementNumber",
                table: "RentalAgreements",
                column: "AgreementNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RentalAgreements_ReservationId",
                table: "RentalAgreements",
                column: "ReservationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RentalAgreements");
        }
    }
}
