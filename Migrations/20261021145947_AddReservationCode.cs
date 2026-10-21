using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Delizioso.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Reservations",
                type: "nvarchar(12)",
                maxLength: 12,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_Code",
                table: "Reservations",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_Code",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "Reservations");
        }
    }
}
