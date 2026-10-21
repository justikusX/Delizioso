using System.Security.Claims;
using Delizioso.Data;
using Delizioso.Models;
using Microsoft.EntityFrameworkCore;

namespace Delizioso.Services;

/// <summary>Ties orders, reservations and saved addresses to customer accounts.</summary>
public class Customers(AppDbContext db)
{
    /// <summary>The logged-in user, or null (also when the account no longer exists).</summary>
    public async Task<User?> CurrentAsync(ClaimsPrincipal principal) =>
        int.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? await db.Users.FirstOrDefaultAsync(u => u.Id == id)
            : null;

    /// <summary>
    /// Attaches guest orders and reservations made with this email to the account.
    /// Only call it for a confirmed email, so nobody can claim someone else's orders.
    /// </summary>
    public async Task ClaimGuestRecordsAsync(User user)
    {
        if (!user.EmailConfirmed) return;
        await db.Orders.Where(o => o.UserId == null && o.Email.ToLower() == user.Email)
            .ExecuteUpdateAsync(s => s.SetProperty(o => o.UserId, user.Id));
        await db.Reservations.Where(r => r.UserId == null && r.Email.ToLower() == user.Email)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.UserId, user.Id));
    }

    /// <summary>Remembers the phone and delivery address from an order for next time (changes are saved by the caller).</summary>
    public async Task RememberAsync(User user, string phone, string? address, double? lat, double? lng)
    {
        if (user.Phone == "") user.Phone = phone;
        if (string.IsNullOrWhiteSpace(address)) return;

        var text = address.Trim();
        var saved = await db.Addresses.FirstOrDefaultAsync(a => a.UserId == user.Id && a.Text == text);
        if (saved == null)
        {
            saved = new Address { UserId = user.Id, Text = text };
            db.Addresses.Add(saved);
        }
        saved.Latitude = lat;
        saved.Longitude = lng;
        saved.LastUsedAt = DateTime.UtcNow;
    }
}
