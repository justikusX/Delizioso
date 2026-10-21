using System.Security.Cryptography;
using Delizioso.Models;
using Microsoft.AspNetCore.DataProtection;

namespace Delizioso.Services;

/// <summary>
/// Signed, time-limited tokens for the "confirm email" and "reset password" links. They contain the user id and
/// security stamp, so changing the password makes every older reset link useless.
/// </summary>
public class AccountTokens(IDataProtectionProvider provider)
{
    public const string ConfirmPurpose = "confirm-email";
    public const string ResetPurpose = "reset-password";

    private readonly ITimeLimitedDataProtector _protector =
        provider.CreateProtector("Delizioso.AccountTokens").ToTimeLimitedDataProtector();

    public string Create(User user, string purpose, TimeSpan lifetime) =>
        _protector.Protect($"{purpose}|{user.Id}|{user.SecurityStamp}", lifetime);

    /// <summary>Returns (userId, stamp) when the token is valid for this purpose and not expired.</summary>
    public (int UserId, string Stamp)? Read(string? token, string purpose)
    {
        if (string.IsNullOrEmpty(token)) return null;
        try
        {
            var parts = _protector.Unprotect(token).Split('|');
            if (parts.Length == 3 && parts[0] == purpose && int.TryParse(parts[1], out var id)) return (id, parts[2]);
        }
        catch (CryptographicException) { /* tampered or expired */ }
        return null;
    }
}
