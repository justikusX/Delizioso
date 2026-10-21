using System.ComponentModel.DataAnnotations;

namespace Delizioso.Models;

public class LoginViewModel
{
    [Required(ErrorMessage = "Enter your email")]
    [EmailAddress(ErrorMessage = "Enter a valid email")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Enter your password")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = "";

    public bool RememberMe { get; set; }

    public string? ReturnUrl { get; set; }
}

public class RegisterViewModel
{
    [Required(ErrorMessage = "Enter your full name")]
    [MaxLength(100)]
    public string FullName { get; set; } = "";

    [Required(ErrorMessage = "Enter your email")]
    [EmailAddress(ErrorMessage = "Enter a valid email")]
    [MaxLength(100)]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Enter a password")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = "";

    public bool RememberMe { get; set; }

    public string? ReturnUrl { get; set; }
}

public class ForgotPasswordViewModel
{
    [Required(ErrorMessage = "Enter your email")]
    [EmailAddress(ErrorMessage = "Enter a valid email")]
    public string Email { get; set; } = "";
}

public class ResetPasswordViewModel
{
    public string Token { get; set; } = "";

    [Required(ErrorMessage = "Enter a new password")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = "";

    [Compare(nameof(Password), ErrorMessage = "Passwords don't match")]
    [DataType(DataType.Password)]
    public string ConfirmPassword { get; set; } = "";
}

public class ProfileViewModel
{
    [Required(ErrorMessage = "Enter your full name")]
    [MaxLength(100)]
    public string FullName { get; set; } = "";

    public string PhoneCode { get; set; } = FormOptions.PhoneCodes[0].Code;

    [RegularExpression(@"^[0-9 ()\-]{5,20}$", ErrorMessage = "Enter a valid phone number")]
    public string? Phone { get; set; }
}

public class MyAccountViewModel
{
    public User User { get; set; } = null!;
    public ProfileViewModel Profile { get; set; } = new();
    public List<Order> Orders { get; set; } = [];
    public List<Reservation> Reservations { get; set; } = [];
    public List<Address> Addresses { get; set; } = [];
}
