using System.ComponentModel.DataAnnotations;

namespace Delizioso.Models;

public class ContactViewModel
{
    [Required(ErrorMessage = "Enter your first name")]
    [MaxLength(50)]
    public string FirstName { get; set; } = "";

    [MaxLength(50)]
    public string? LastName { get; set; }

    [Required(ErrorMessage = "Enter your email")]
    [EmailAddress(ErrorMessage = "Enter a valid email")]
    [MaxLength(100)]
    public string Email { get; set; } = "";

    [MaxLength(200)]
    public string? Subject { get; set; }

    [Required(ErrorMessage = "Write your message")]
    [MaxLength(2000)]
    public string Message { get; set; } = "";
}
