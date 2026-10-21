using Delizioso.Models;
using Microsoft.EntityFrameworkCore;

namespace Delizioso.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Dish> Dishes => Set<Dish>();
    public DbSet<Chef> Chefs => Set<Chef>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<Address> Addresses => Set<Address>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>().HasIndex(u => u.Email).IsUnique();
        b.Entity<Reservation>().HasIndex(r => r.Code).IsUnique();
        b.Entity<Order>().HasIndex(o => o.Code).IsUnique();
        b.Entity<Order>().HasOne(o => o.User).WithMany(u => u.Orders).OnDelete(DeleteBehavior.SetNull);
        b.Entity<User>().HasIndex(u => u.GoogleId).IsUnique().HasFilter("[GoogleId] IS NOT NULL");
        b.Entity<Address>().HasOne(a => a.User).WithMany(u => u.Addresses).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Voucher>().HasIndex(v => v.Code).IsUnique();
        b.Entity<Voucher>().HasData(new Voucher { Id = 1, Code = "FREETOEAT", Amount = 5m });
        b.Entity<Reservation>().HasOne(r => r.User).WithMany(u => u.Reservations).OnDelete(DeleteBehavior.SetNull);

        const string lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas consequat mi eget auctor aliquam, diam.";
        const string review = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Facilisis ultricies at eleifend proin. Congue nibh nulla malesuada ultricies nec quam";

        b.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Dinner", SortOrder = 1 },
            new Category { Id = 2, Name = "Lunch", SortOrder = 2 },
            new Category { Id = 3, Name = "Dessert", SortOrder = 3 },
            new Category { Id = 4, Name = "Drink", SortOrder = 4 });

        b.Entity<Dish>().HasData(
            new Dish { Id = 1, Group = "Pasta", Name = "Spaghetti", Description = lorem, Price = 12.05m, Rating = 4, ImageUrl = "/img/dish-spaghetti.png", IsPopular = true, CategoryId = 1 },
            new Dish { Id = 2, Group = "Pasta", Name = "Gnocchi", Description = lorem, Price = 12.05m, Rating = 4, ImageUrl = "/img/dish-gnocchi.png", IsPopular = true, CategoryId = 2 },
            new Dish { Id = 3, Group = "Pasta", Name = "Rovioli", Description = lorem, Price = 12.05m, Rating = 4, ImageUrl = "/img/dish-ravioli.png", IsPopular = true, CategoryId = 1 },
            new Dish { Id = 4, Group = "Pasta", Name = "Penne Alla Vodak", Description = lorem, Price = 12.05m, Rating = 4, ImageUrl = "/img/dish-penne.png", IsPopular = true, CategoryId = 2 },
            new Dish { Id = 5, Group = "Mains", Name = "Risoto", Description = lorem, Price = 12.05m, Rating = 4, ImageUrl = "/img/dish-risotto.png", IsPopular = true, CategoryId = 1 },
            new Dish { Id = 6, Group = "Pizza", Name = "Splitza Signature", Description = lorem, Price = 12.05m, Rating = 4, ImageUrl = "/img/dish-pizza.png", IsPopular = true, CategoryId = 2 },
            new Dish { Id = 7, Group = "Pasta", Name = "Penne al Pesto", Description = "Penne with basil pesto, roasted cherry tomatoes and shaved parmesan.", Price = 11.50m, Rating = 5, ImageUrl = "/img/dish-penne-pesto.webp", CategoryId = 2 },
            new Dish { Id = 8, Group = "Pasta", Name = "Lasagna Bolognese", Description = "Layers of fresh pasta, slow-cooked beef ragù, béchamel and mozzarella.", Price = 14.90m, Rating = 5, ImageUrl = "/img/dish-lasagna.webp", CategoryId = 1 },
            new Dish { Id = 9, Group = "Pizza", Name = "Pizza Margherita", Description = "Neapolitan dough, San Marzano tomatoes, fior di latte and fresh basil.", Price = 10.90m, Rating = 5, ImageUrl = "/img/dish-margherita.webp", CategoryId = 2 },
            new Dish { Id = 10, Group = "Mains", Name = "Mushroom Risotto", Description = "Creamy arborio rice with roasted mushrooms, parsley and parmesan.", Price = 13.40m, Rating = 4, ImageUrl = "/img/dish-mushroom-risotto.webp", CategoryId = 1 },
            new Dish { Id = 11, Group = "Mains", Name = "Grilled Salmon", Description = "Salmon fillet with grilled asparagus, baby potatoes and lemon.", Price = 18.50m, Rating = 5, ImageUrl = "/img/dish-salmon.webp", CategoryId = 1 },
            new Dish { Id = 12, Group = "Mains", Name = "Tagliata di Manzo", Description = "Sliced grilled beef steak with roasted potatoes, cherry tomatoes and rosemary.", Price = 21.00m, Rating = 5, ImageUrl = "/img/dish-steak.webp", CategoryId = 1 },
            new Dish { Id = 13, Group = "Salads", Name = "Caesar Salad", Description = "Romaine, grilled chicken, garlic croutons, parmesan and Caesar dressing.", Price = 9.80m, Rating = 4, ImageUrl = "/img/dish-caesar.webp", CategoryId = 2 },
            new Dish { Id = 14, Group = "Pasta", Name = "Fettuccine Alfredo", Description = "Fettuccine in a rich parmesan cream sauce with grilled chicken breast.", Price = 13.90m, Rating = 4, ImageUrl = "/img/dish-alfredo.webp", CategoryId = 1 },
            new Dish { Id = 15, Group = "Pasta", Name = "Spaghetti Carbonara", Description = "Spaghetti with crispy guanciale, egg yolk, pecorino and black pepper.", Price = 12.90m, Rating = 5, ImageUrl = "/img/dish-carbonara.webp", CategoryId = 1 },
            new Dish { Id = 16, Group = "Pasta", Name = "Spaghetti Pomodoro", Description = "Spaghetti in a light tomato sauce with feta cubes and fresh basil.", Price = 10.50m, Rating = 4, ImageUrl = "/img/dish-spaghetti-pomodoro.webp", CategoryId = 2 },
            new Dish { Id = 17, Group = "Pasta", Name = "Pelmeni", Description = "Hand-made meat dumplings with melted butter, dill and sour cream.", Price = 9.50m, Rating = 4, ImageUrl = "/img/dish-pelmeni.webp", CategoryId = 2 },
            new Dish { Id = 18, Group = "Desserts", Name = "Syrniki", Description = "Golden cottage cheese pancakes with fresh berries, mint and sour cream.", Price = 7.90m, Rating = 5, ImageUrl = "/img/dish-syrniki.webp", CategoryId = 3 });

        b.Entity<Chef>().HasData(
            new Chef { Id = 1, Name = "Betran Komar", Position = "Head chef", PhotoUrl = "/img/chef-1.png", CardColor = "rgba(27,22,29,.2)", SortOrder = 1 },
            new Chef { Id = 2, Name = "Ferry Sauwi", Position = "Chef", PhotoUrl = "/img/chef-2.png", CardColor = "rgba(255,138,0,.2)", SortOrder = 2 },
            new Chef { Id = 3, Name = "Iswan Dracho", Position = "Chef", PhotoUrl = "/img/chef-3.png", CardColor = "rgba(157,101,66,.2)", SortOrder = 3 });

        b.Entity<Testimonial>().HasData(
            new Testimonial { Id = 1, AuthorName = "Starla Virgoun", AuthorPosition = "Financial advisor", Text = review, PhotoUrl = "/img/customer-main.png", SortOrder = 4 },
            new Testimonial { Id = 2, AuthorName = "Amira Hassan", AuthorPosition = "Designer", Text = review, PhotoUrl = "/img/customer-5.png", SortOrder = 1 },
            new Testimonial { Id = 3, AuthorName = "Naomi Brooks", AuthorPosition = "Photographer", Text = review, PhotoUrl = "/img/customer-2.png", SortOrder = 2 },
            new Testimonial { Id = 4, AuthorName = "Lena Morales", AuthorPosition = "Teacher", Text = review, PhotoUrl = "/img/customer-1.png", SortOrder = 3 },
            new Testimonial { Id = 5, AuthorName = "Jake Turner", AuthorPosition = "Developer", Text = review, PhotoUrl = "/img/customer-6.png", SortOrder = 5 },
            new Testimonial { Id = 6, AuthorName = "Zoe Adebayo", AuthorPosition = "Musician", Text = review, PhotoUrl = "/img/customer-3.png", SortOrder = 6 },
            new Testimonial { Id = 7, AuthorName = "Maya Collins", AuthorPosition = "Marketing manager", Text = review, PhotoUrl = "/img/customer-4.png", SortOrder = 7 });
    }
}
