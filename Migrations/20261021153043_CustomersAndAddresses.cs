using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Delizioso.Migrations
{
    /// <inheritdoc />
    public partial class CustomersAndAddresses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EmailConfirmed",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "GoogleId",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Users",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SecurityStamp",
                table: "Users",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Addresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Addresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_GoogleId",
                table: "Users",
                column: "GoogleId",
                unique: true,
                filter: "[GoogleId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_UserId",
                table: "Addresses",
                column: "UserId");

            // Read-only reports for SQL Server Management Studio (Views folder of the Delizioso database).
            migrationBuilder.Sql(@"
CREATE VIEW dbo.vw_Customers AS
WITH People AS (
    SELECT LOWER(Email) AS Email, FullName AS Name, Phone, CreatedAt FROM dbo.Users
    UNION ALL SELECT LOWER(Email), CustomerName, Phone, CreatedAt FROM dbo.Orders
    UNION ALL SELECT LOWER(Email), CustomerName, Phone, CreatedAt FROM dbo.Reservations
)
SELECT
    p.Email,
    COALESCE(u.FullName, MAX(p.Name)) AS Name,
    COALESCE(NULLIF(u.Phone, ''), MAX(NULLIF(p.Phone, ''))) AS Phone,
    CASE WHEN u.Id IS NULL THEN 'Guest' WHEN u.GoogleId IS NOT NULL THEN 'Google' ELSE 'Email' END AS AccountType,
    u.EmailConfirmed,
    (SELECT COUNT(*) FROM dbo.Orders o WHERE LOWER(o.Email) = p.Email) AS Orders,
    (SELECT ISNULL(SUM(o.Total), 0) FROM dbo.Orders o WHERE LOWER(o.Email) = p.Email) AS TotalSpent,
    (SELECT TOP 1 o.Address FROM dbo.Orders o WHERE LOWER(o.Email) = p.Email AND o.Address <> '' ORDER BY o.CreatedAt DESC) AS LastAddress,
    (SELECT COUNT(*) FROM dbo.Reservations r WHERE LOWER(r.Email) = p.Email) AS Reservations,
    MIN(p.CreatedAt) AS FirstSeen,
    MAX(p.CreatedAt) AS LastSeen
FROM People p
LEFT JOIN dbo.Users u ON LOWER(u.Email) = p.Email
WHERE p.Email <> ''
GROUP BY p.Email, u.Id, u.FullName, u.Phone, u.GoogleId, u.EmailConfirmed;");

            migrationBuilder.Sql(@"
CREATE VIEW dbo.vw_OrderDetails AS
SELECT
    o.Code AS OrderCode, o.CreatedAt, o.Status,
    o.CustomerName, o.Email, o.Phone,
    CASE WHEN o.UserId IS NULL THEN 'Guest' ELSE 'Account' END AS Customer,
    o.Method, o.Address, o.Latitude, o.Longitude, o.ScheduledFor, o.Note,
    d.Name AS Dish, i.Quantity, i.UnitPrice, i.Quantity * i.UnitPrice AS LineTotal,
    o.Subtotal, o.Tax, o.Discount, o.VoucherCode, o.Total AS OrderTotal, o.Payment
FROM dbo.Orders o
JOIN dbo.OrderItems i ON i.OrderId = o.Id
JOIN dbo.Dishes d ON d.Id = i.DishId;");

            migrationBuilder.Sql(@"
CREATE VIEW dbo.vw_ReservationDetails AS
SELECT
    r.Code AS BookingCode, r.ReservedFor, r.Guests, r.Status,
    r.CustomerName, r.Email, r.Phone,
    CASE WHEN r.UserId IS NULL THEN 'Guest' ELSE 'Account' END AS Customer,
    r.Occasion, r.SpecialRequest, r.Newsletter, r.CreatedAt
FROM dbo.Reservations r;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS dbo.vw_ReservationDetails;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS dbo.vw_OrderDetails;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS dbo.vw_Customers;");

            migrationBuilder.DropTable(
                name: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Users_GoogleId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmailConfirmed",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "GoogleId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SecurityStamp",
                table: "Users");
        }
    }
}
