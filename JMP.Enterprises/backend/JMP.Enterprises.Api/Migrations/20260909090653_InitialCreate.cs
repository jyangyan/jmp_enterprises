using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace JMP.Enterprises.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Properties",
                columns: table => new
                {
                    PropertyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PropertyName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PropertyCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DefaultMonthlyRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DefaultDailyRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Properties", x => x.PropertyId);
                });

            migrationBuilder.InsertData(
                table: "Properties",
                columns: new[] { "PropertyId", "CreatedDate", "DefaultDailyRate", "DefaultMonthlyRate", "Description", "IsActive", "Location", "PropertyCode", "PropertyName", "Status", "UpdatedDate" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 9, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 0m, 0m, null, true, null, "LILY", "Lily", "Available", null },
                    { 2, new DateTime(2026, 9, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 0m, 0m, null, true, null, "LALA", "Lala", "Available", null },
                    { 3, new DateTime(2026, 9, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 0m, 0m, null, true, null, "PAMAE", "Pamae", "Available", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Properties_PropertyCode",
                table: "Properties",
                column: "PropertyCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Properties");
        }
    }
}
