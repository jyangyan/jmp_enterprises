using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace JMP.Enterprises.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiBusinessFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Businesses",
                columns: table => new
                {
                    BusinessId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BusinessCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    BusinessName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Route = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Businesses", x => x.BusinessId);
                });

            migrationBuilder.CreateTable(
                name: "UserBusinessAccesses",
                columns: table => new
                {
                    UserBusinessAccessId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BusinessId = table.Column<int>(type: "int", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CanAccess = table.Column<bool>(type: "bit", nullable: false),
                    CanView = table.Column<bool>(type: "bit", nullable: false),
                    CanCreate = table.Column<bool>(type: "bit", nullable: false),
                    CanEdit = table.Column<bool>(type: "bit", nullable: false),
                    CanDeleteOrVoid = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserBusinessAccesses", x => x.UserBusinessAccessId);
                    table.ForeignKey(
                        name: "FK_UserBusinessAccesses_Businesses_BusinessId",
                        column: x => x.BusinessId,
                        principalTable: "Businesses",
                        principalColumn: "BusinessId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Businesses",
                columns: new[] { "BusinessId", "BusinessCode", "BusinessName", "CreatedDate", "Description", "DisplayOrder", "Icon", "IsActive", "Route", "UpdatedDate" },
                values: new object[,]
                {
                    { 1, "RENTAL", "JMP Rental Property", new DateTime(2026, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Rental property management, reservations, and income tracking", 1, "Building2", true, "/rental", null },
                    { 2, "LAUNDRY", "JMP Laundry", new DateTime(2026, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Laundry shop management, orders, and services", 2, "Shirt", true, "/laundry", null },
                    { 3, "PRINT", "JMP Piso Print", new DateTime(2026, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Printing service management and jobs tracking", 3, "Printer", true, "/print", null },
                    { 4, "MINIMART", "JMP Mini-Mart", new DateTime(2026, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mini-mart, retail sales, and inventory management", 4, "ShoppingBag", true, "/minimart", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Businesses_BusinessCode",
                table: "Businesses",
                column: "BusinessCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserBusinessAccesses_BusinessId",
                table: "UserBusinessAccesses",
                column: "BusinessId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserBusinessAccesses");

            migrationBuilder.DropTable(
                name: "Businesses");
        }
    }
}
