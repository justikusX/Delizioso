using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Delizioso.Models;

public class Category
{
    public int Id { get; set; }

    [MaxLength(50)]
    public string Name { get; set; } = "";

    public int SortOrder { get; set; }

    public List<Dish> Dishes { get; set; } = [];
}

public class Dish
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string Name { get; set; } = "";

    [MaxLength(500)]
    public string Description { get; set; } = "";

    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }

    /// <summary>Rating from 0 to 5 stars.</summary>
    public int Rating { get; set; }

    [MaxLength(200)]
    public string ImageUrl { get; set; } = "";

    public bool IsPopular { get; set; }

    /// <summary>Section on the Order online page: Pasta, Pizza, Mains, Salads, Desserts.</summary>
    [MaxLength(30)]
    public string Group { get; set; } = "";

    public int CategoryId { get; set; }
    public Category? Category { get; set; }
}

public class Chef
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string Name { get; set; } = "";

    [MaxLength(100)]
    public string Position { get; set; } = "";

    [MaxLength(200)]
    public string PhotoUrl { get; set; } = "";

    /// <summary>Card background colour behind the photo, e.g. "rgba(255,138,0,.2)".</summary>
    [MaxLength(50)]
    public string CardColor { get; set; } = "";

    public int SortOrder { get; set; }
}

public class Testimonial
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string AuthorName { get; set; } = "";

    [MaxLength(100)]
    public string AuthorPosition { get; set; } = "";

    [MaxLength(1000)]
    public string Text { get; set; } = "";

    [MaxLength(200)]
    public string PhotoUrl { get; set; } = "";

    public int SortOrder { get; set; }
}

public class Reservation
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string CustomerName { get; set; } = "";

    [MaxLength(30)]
    public string Phone { get; set; } = "";

    [MaxLength(100)]
    public string Email { get; set; } = "";

    public DateTime ReservedFor { get; set; }

    public int Guests { get; set; }

    [MaxLength(50)]
    public string Occasion { get; set; } = "";

    [MaxLength(1000)]
    public string SpecialRequest { get; set; } = "";

    /// <summary>Guest agreed to receive offers and news by email.</summary>
    public bool Newsletter { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Random code used in the confirmation / cancel links instead of the numeric id.</summary>
    [MaxLength(12)]
    public string Code { get; set; } = "";

    /// <summary>Set when the guest was logged in while booking.</summary>
    public int? UserId { get; set; }
    public User? User { get; set; }
}

public class User
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string FullName { get; set; } = "";

    [MaxLength(100)]
    public string Email { get; set; } = "";

    /// <summary>Empty for accounts that only sign in with Google.</summary>
    [MaxLength(200)]
    public string PasswordHash { get; set; } = "";

    [MaxLength(30)]
    public string Phone { get; set; } = "";

    /// <summary>Set after the link in the confirmation email was opened (or the account came from Google).</summary>
    public bool EmailConfirmed { get; set; }

    /// <summary>Google account id ("sub"), when the user signed in with Google.</summary>
    [MaxLength(100)]
    public string? GoogleId { get; set; }

    /// <summary>Changes when the password changes: invalidates old reset links and other sessions.</summary>
    [MaxLength(40)]
    public string SecurityStamp { get; set; } = Guid.NewGuid().ToString("N");

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }

    public List<Reservation> Reservations { get; set; } = [];
    public List<Order> Orders { get; set; } = [];
    public List<Address> Addresses { get; set; } = [];
}

/// <summary>Delivery address saved from a customer's previous orders.</summary>
public class Address
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    [MaxLength(300)]
    public string Text { get; set; } = "";

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public DateTime LastUsedAt { get; set; } = DateTime.UtcNow;
}

public class Order
{
    public int Id { get; set; }

    [MaxLength(12)]
    public string Code { get; set; } = "";

    [MaxLength(100)]
    public string CustomerName { get; set; } = "";

    [MaxLength(30)]
    public string Phone { get; set; } = "";

    [MaxLength(100)]
    public string Email { get; set; } = "";

    /// <summary>Delivery or TakeAway.</summary>
    [MaxLength(20)]
    public string Method { get; set; } = "Delivery";

    /// <summary>Cash, BcaVirtualAccount, CreditCard or BankTransfer.</summary>
    [MaxLength(30)]
    public string Payment { get; set; } = "Cash";

    [MaxLength(300)]
    public string Address { get; set; } = "";

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    /// <summary>Null means "order now".</summary>
    public DateTime? ScheduledFor { get; set; }

    [MaxLength(1000)]
    public string Note { get; set; } = "";

    [Column(TypeName = "decimal(10,2)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Tax { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Discount { get; set; }

    [MaxLength(30)]
    public string VoucherCode { get; set; } = "";

    [Column(TypeName = "decimal(10,2)")]
    public decimal Total { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "New";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? UserId { get; set; }
    public User? User { get; set; }

    public List<OrderItem> Items { get; set; } = [];
}

public class Voucher
{
    public int Id { get; set; }

    [MaxLength(30)]
    public string Code { get; set; } = "";

    [Column(TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    public bool IsActive { get; set; } = true;
}

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public int DishId { get; set; }
    public Dish? Dish { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal UnitPrice { get; set; }
}

public class ContactMessage
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string Name { get; set; } = "";

    [MaxLength(100)]
    public string Email { get; set; } = "";

    [MaxLength(200)]
    public string Subject { get; set; } = "";

    [MaxLength(2000)]
    public string Message { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
