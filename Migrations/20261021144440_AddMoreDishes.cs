using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Delizioso.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreDishes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Dishes",
                columns: new[] { "Id", "CategoryId", "Description", "ImageUrl", "IsPopular", "Name", "Price", "Rating" },
                values: new object[,]
                {
                    { 7, 2, "Penne with basil pesto, roasted cherry tomatoes and shaved parmesan.", "/img/dish-penne-pesto.webp", false, "Penne al Pesto", 11.50m, 5 },
                    { 8, 1, "Layers of fresh pasta, slow-cooked beef ragù, béchamel and mozzarella.", "/img/dish-lasagna.webp", false, "Lasagna Bolognese", 14.90m, 5 },
                    { 9, 2, "Neapolitan dough, San Marzano tomatoes, fior di latte and fresh basil.", "/img/dish-margherita.webp", false, "Pizza Margherita", 10.90m, 5 },
                    { 10, 1, "Creamy arborio rice with roasted mushrooms, parsley and parmesan.", "/img/dish-mushroom-risotto.webp", false, "Mushroom Risotto", 13.40m, 4 },
                    { 11, 1, "Salmon fillet with grilled asparagus, baby potatoes and lemon.", "/img/dish-salmon.webp", false, "Grilled Salmon", 18.50m, 5 },
                    { 12, 1, "Sliced grilled beef steak with roasted potatoes, cherry tomatoes and rosemary.", "/img/dish-steak.webp", false, "Tagliata di Manzo", 21.00m, 5 },
                    { 13, 2, "Romaine, grilled chicken, garlic croutons, parmesan and Caesar dressing.", "/img/dish-caesar.webp", false, "Caesar Salad", 9.80m, 4 },
                    { 14, 1, "Fettuccine in a rich parmesan cream sauce with grilled chicken breast.", "/img/dish-alfredo.webp", false, "Fettuccine Alfredo", 13.90m, 4 },
                    { 15, 1, "Spaghetti with crispy guanciale, egg yolk, pecorino and black pepper.", "/img/dish-carbonara.webp", false, "Spaghetti Carbonara", 12.90m, 5 },
                    { 16, 2, "Spaghetti in a light tomato sauce with feta cubes and fresh basil.", "/img/dish-spaghetti-pomodoro.webp", false, "Spaghetti Pomodoro", 10.50m, 4 },
                    { 17, 2, "Hand-made meat dumplings with melted butter, dill and sour cream.", "/img/dish-pelmeni.webp", false, "Pelmeni", 9.50m, 4 },
                    { 18, 3, "Golden cottage cheese pancakes with fresh berries, mint and sour cream.", "/img/dish-syrniki.webp", false, "Syrniki", 7.90m, 5 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Dishes",
                keyColumn: "Id",
                keyValue: 18);
        }
    }
}
