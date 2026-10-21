using System.ComponentModel.DataAnnotations;

namespace Delizioso.Models;

public class OrderPageViewModel
{
    public List<Category> Categories { get; set; } = [];
    public List<Dish> Dishes { get; set; } = [];
}

public class CheckoutViewModel
{
    [Required(ErrorMessage = "Enter your first name")]
    [MaxLength(50)]
    public string FirstName { get; set; } = "";

    [MaxLength(50)]
    public string? LastName { get; set; }

    public string PhoneCode { get; set; } = FormOptions.PhoneCodes[0].Code;

    [Required(ErrorMessage = "Enter your phone number")]
    [RegularExpression(@"^[0-9 ()\-]{5,20}$", ErrorMessage = "Enter a valid phone number")]
    public string Phone { get; set; } = "";

    [Required(ErrorMessage = "Enter your email")]
    [EmailAddress(ErrorMessage = "Enter a valid email")]
    [MaxLength(100)]
    public string Email { get; set; } = "";

    [MaxLength(1000)]
    public string? Note { get; set; }

    /// <summary>"now" or "later".</summary>
    public string OrderTime { get; set; } = "now";

    /// <summary>Chosen time when OrderTime is "later", as yyyy-MM-ddTHH:mm.</summary>
    public string? LaterAt { get; set; }

    /// <summary>Delivery or TakeAway.</summary>
    public string Method { get; set; } = "Delivery";

    public string Payment { get; set; } = "Cash";

    [MaxLength(300)]
    public string? Address { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    [MaxLength(30)]
    public string? VoucherCode { get; set; }

    /// <summary>Cart from the browser: JSON object { "dishId": quantity }.</summary>
    public string? CartJson { get; set; }

    public bool AcceptTerms { get; set; }
}

public static class OrderRules
{
    /// <summary>Tax added on top of the subtotal (matches the mockup: $3.5 on $78.3).</summary>
    public const decimal TaxRate = 0.045m;

    public const int MaxQuantity = 20;

    public static readonly (string Value, string Label)[] Methods = [("Delivery", "Delivery"), ("TakeAway", "Take a way")];

    public static readonly (string Value, string Label)[] Payments =
        [("Cash", "Cash On Delivery"), ("BcaVirtualAccount", "BCA Virtual Account"), ("CreditCard", "Credit Card"), ("BankTransfer", "Transfer Bank")];

    public static readonly string[] Groups = ["Pasta", "Pizza", "Mains", "Salads", "Desserts"];

    /// <summary>"Order later" choices: the next free slots today and tomorrow (same hours as reservations).</summary>
    public static IEnumerable<DateTime> LaterSlots(DateTime now)
    {
        var today = DateOnly.FromDateTime(now);
        return new[] { today, today.AddDays(1) }
            .SelectMany(d => ReservationRules.Slots.Select(t => d.ToDateTime(t)))
            .Where(t => t > now.AddMinutes(45));
    }

    public static decimal Tax(decimal subtotal) => Math.Round(subtotal * TaxRate, 2);
}
