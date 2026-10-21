using System.ComponentModel.DataAnnotations;

namespace Delizioso.Models;

/// <summary>Step 1: "Book a table" — date, time, party size.</summary>
public class BookTableViewModel
{
    [Required(ErrorMessage = "Choose a date")]
    public DateOnly? Date { get; set; }

    [Required(ErrorMessage = "Choose a time")]
    public TimeOnly? Time { get; set; }

    [Required(ErrorMessage = "Choose the party size")]
    [Range(1, ReservationRules.MaxGuests, ErrorMessage = "Choose the party size")]
    public int? Guests { get; set; }

    /// <summary>Code of an existing reservation being modified, if any.</summary>
    public string? Modify { get; set; }
}

/// <summary>Step 2: contact details for the chosen slot.</summary>
public class ConfirmReservationViewModel : BookTableViewModel
{
    [Required(ErrorMessage = "Enter your first name")]
    [MaxLength(50)]
    public string FirstName { get; set; } = "";

    [MaxLength(50)]
    public string LastName { get; set; } = "";

    public string PhoneCode { get; set; } = FormOptions.PhoneCodes[0].Code;

    [Required(ErrorMessage = "Enter your phone number")]
    [RegularExpression(@"^[0-9 ()\-]{5,20}$", ErrorMessage = "Enter a valid phone number")]
    public string Phone { get; set; } = "";

    [Required(ErrorMessage = "Enter your email")]
    [EmailAddress(ErrorMessage = "Enter a valid email")]
    [MaxLength(100)]
    public string Email { get; set; } = "";

    [MaxLength(50)]
    public string? Occasion { get; set; }

    [MaxLength(1000)]
    public string? SpecialRequest { get; set; }

    public bool Newsletter { get; set; }
}

public class ReservationNotesViewModel
{
    [MaxLength(50)]
    public string? Occasion { get; set; }

    [MaxLength(1000)]
    public string? SpecialRequest { get; set; }
}

public static class ReservationRules
{
    public const int MaxGuests = 10;
    public const int DaysAhead = 30;

    /// <summary>How long the confirm page "holds" the table (shown as a countdown).</summary>
    public const int HoldMinutes = 5;

    /// <summary>Bookable slots, matching the opening hours on the homepage (lunch 11–14, dinner 16–21).</summary>
    public static readonly TimeOnly[] Slots =
        Enumerable.Range(0, 6).Select(i => new TimeOnly(11, 0).AddMinutes(30 * i))
            .Concat(Enumerable.Range(0, 10).Select(i => new TimeOnly(16, 0).AddMinutes(30 * i)))
            .ToArray();

    public static IEnumerable<DateOnly> Dates(DateOnly today) =>
        Enumerable.Range(0, DaysAhead).Select(today.AddDays);

    /// <summary>Returns an error message, or null when the slot can be booked.</summary>
    public static string? Validate(DateOnly date, TimeOnly time, int guests, DateTime now)
    {
        var today = DateOnly.FromDateTime(now);
        if (date < today || date >= today.AddDays(DaysAhead)) return "Choose a date within the next 30 days";
        if (!Slots.Contains(time)) return "Choose one of the available times";
        if (date.ToDateTime(time) <= now) return "This time has already passed, choose a later one";
        if (guests < 1 || guests > MaxGuests) return "Choose the party size";
        return null;
    }
}

/// <summary>Choices shared by the reservation, checkout and contact forms.</summary>
public static class FormOptions
{
    public record PhoneCode(string Code, string Country);

    public static readonly PhoneCode[] PhoneCodes =
    [
        new("+1", "US"), new("+44", "UK"), new("+49", "DE"), new("+33", "FR"), new("+39", "IT"),
        new("+62", "ID"), new("+7", "RU"), new("+380", "UA"), new("+375", "BY"), new("+77", "KZ"),
    ];

    public static readonly string[] Occasions =
        ["Birthday", "Anniversary", "Date night", "Business meal", "Family gathering", "Special celebration"];

    public static string JoinPhone(string code, string number) =>
        $"{code} {number.Trim()}";

    /// <summary>Splits "+49 123 456" back into the dial code and the rest.</summary>
    public static (string Code, string Number) SplitPhone(string phone)
    {
        var match = PhoneCodes.Select(p => p.Code).OrderByDescending(c => c.Length)
            .FirstOrDefault(c => phone.StartsWith(c + " "));
        return match == null ? (PhoneCodes[0].Code, phone) : (match, phone[(match.Length + 1)..]);
    }

    public static (string First, string Last) SplitName(string name)
    {
        var i = name.IndexOf(' ');
        return i < 0 ? (name, "") : (name[..i], name[(i + 1)..]);
    }
}
