using System.Security.Claims;
using Delizioso.Data;
using Delizioso.Models;
using Delizioso.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Delizioso.Controllers;

public class AccountController(
    AppDbContext db,
    IPasswordHasher<User> hasher,
    IAuthenticationSchemeProvider schemes,
    IEmailSender mail,
    AccountTokens tokens,
    Customers customers,
    IWebHostEnvironment env) : Controller
{
    public const string ExternalScheme = "External";
    public const string StampClaim = "stamp";

    // ---------- Log in ----------

    [HttpGet]
    public IActionResult Login(string? returnUrl, bool googleError = false)
    {
        if (googleError) TempData["Notice"] = "Google sign-in was cancelled or failed. Please try again.";
        return View(new LoginViewModel { ReturnUrl = returnUrl });
    }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        var user = await FindByEmail(model.Email);
        if (user != null && user.PasswordHash == "" && user.GoogleId != null)
        {
            ModelState.AddModelError("", "This account uses Google sign-in. Use “Log in with google” or reset the password to add one.");
            return View(model);
        }
        if (user == null || hasher.VerifyHashedPassword(user, user.PasswordHash, model.Password) == PasswordVerificationResult.Failed)
        {
            ModelState.AddModelError("", "Wrong email or password");
            return View(model);
        }
        if (!user.EmailConfirmed)
        {
            ViewData["Unconfirmed"] = user.Email;
            ModelState.AddModelError("", "Please confirm your email first. We sent you a link when you signed up.");
            return View(model);
        }

        await SignInAsync(user, model.RememberMe);
        return LocalRedirectOrHome(model.ReturnUrl);
    }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Index", "Home");
    }

    // ---------- Sign up + email confirmation ----------

    [HttpGet]
    public IActionResult Register(string? returnUrl) => View(new RegisterViewModel { ReturnUrl = returnUrl });

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model)
    {
        var existing = ModelState.IsValid ? await FindByEmail(model.Email) : null;
        if (existing is { EmailConfirmed: true })
            ModelState.AddModelError(nameof(model.Email), "An account with this email already exists. Log in or reset your password.");
        if (!ModelState.IsValid) return View(model);

        // Signing up again with a not-yet-confirmed email starts over: new name/password and a fresh link
        // (the account stays unusable until the link from that mailbox is opened).
        var user = existing ?? db.Users.Add(new User { Email = Normalize(model.Email) }).Entity;
        user.FullName = model.FullName.Trim();
        user.PasswordHash = hasher.HashPassword(user, model.Password);
        user.SecurityStamp = Guid.NewGuid().ToString("N"); // older confirmation links stop working
        await db.SaveChangesAsync();

        await SendConfirmationAsync(user, model.ReturnUrl);
        return RedirectToAction(nameof(CheckEmail), new { email = user.Email });
    }

    [HttpGet]
    public IActionResult CheckEmail(string email)
    {
        ViewData["Email"] = email;
        return View();
    }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> ResendConfirmation(string email)
    {
        var user = await FindByEmail(email);
        if (user is { EmailConfirmed: false }) await SendConfirmationAsync(user, null);
        // Same answer whether or not the account exists, so the form can't be used to look up emails.
        return RedirectToAction(nameof(CheckEmail), new { email = Normalize(email) });
    }

    [HttpGet]
    public async Task<IActionResult> ConfirmEmail(string token, string? returnUrl)
    {
        var data = tokens.Read(token, AccountTokens.ConfirmPurpose);
        var user = data == null ? null : await db.Users.FirstOrDefaultAsync(u => u.Id == data.Value.UserId);
        if (user == null || user.SecurityStamp != data!.Value.Stamp)
        {
            TempData["Notice"] = "This confirmation link is invalid or has expired. Log in to get a new one.";
            return RedirectToAction(nameof(Login));
        }

        if (!user.EmailConfirmed)
        {
            user.EmailConfirmed = true;
            await db.SaveChangesAsync();
            await customers.ClaimGuestRecordsAsync(user);
        }

        await SignInAsync(user, true);
        TempData["AccountNotice"] = "Your email is confirmed. Welcome to Delizioso!";
        return Url.IsLocalUrl(returnUrl) ? LocalRedirect(returnUrl!) : RedirectToAction(nameof(Index));
    }

    // ---------- Forgot / reset password ----------

    [HttpGet]
    public IActionResult ForgotPassword() => View(new ForgotPasswordViewModel());

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        var user = await FindByEmail(model.Email);
        if (user != null)
        {
            var url = Url.Action(nameof(ResetPassword), "Account",
                new { token = tokens.Create(user, AccountTokens.ResetPurpose, TimeSpan.FromHours(2)) }, Request.Scheme)!;
            var (subject, html) = EmailTemplates.ResetPassword(user.FullName, url);
            if (!await mail.SendAsync(user.Email, subject, html)) TempData["MailFailed"] = true;
            ShowDevLink(url);
        }

        ViewData["Sent"] = Normalize(model.Email);
        return View(model);
    }

    [HttpGet]
    public async Task<IActionResult> ResetPassword(string token)
    {
        var data = tokens.Read(token, AccountTokens.ResetPurpose);
        if (data == null || !await db.Users.AnyAsync(u => u.Id == data.Value.UserId && u.SecurityStamp == data.Value.Stamp))
        {
            TempData["Notice"] = "This reset link is invalid or has expired. Please request a new one.";
            return RedirectToAction(nameof(ForgotPassword));
        }
        return View(new ResetPasswordViewModel { Token = token });
    }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
    {
        var data = tokens.Read(model.Token, AccountTokens.ResetPurpose);
        var user = data == null ? null : await db.Users.FirstOrDefaultAsync(u => u.Id == data.Value.UserId);
        if (user == null || user.SecurityStamp != data!.Value.Stamp)
        {
            TempData["Notice"] = "This reset link is invalid or has expired. Please request a new one.";
            return RedirectToAction(nameof(ForgotPassword));
        }
        if (!ModelState.IsValid) return View(model);

        user.PasswordHash = hasher.HashPassword(user, model.Password);
        user.SecurityStamp = Guid.NewGuid().ToString("N"); // logs out other devices and kills old links
        user.EmailConfirmed = true; // the link proved they own the mailbox
        await db.SaveChangesAsync();
        await customers.ClaimGuestRecordsAsync(user);

        await SignInAsync(user, false);
        TempData["AccountNotice"] = "Your password has been changed.";
        return RedirectToAction(nameof(Index));
    }

    // ---------- Google ----------

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> ExternalLogin(string? returnUrl)
    {
        if (await schemes.GetSchemeAsync(GoogleDefaults.AuthenticationScheme) == null)
        {
            TempData["Notice"] = "Sign in with Google isn't set up yet. Please use your email and password.";
            return RedirectToAction(nameof(Login), new { returnUrl });
        }

        var redirect = Url.Action(nameof(GoogleCallback), new { returnUrl });
        return Challenge(new AuthenticationProperties { RedirectUri = redirect }, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet]
    public async Task<IActionResult> GoogleCallback(string? returnUrl)
    {
        // Google signs into a short-lived "External" cookie; turn that into our own customer account.
        var result = await HttpContext.AuthenticateAsync(ExternalScheme);
        await HttpContext.SignOutAsync(ExternalScheme);

        var googleId = result.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = result.Principal?.FindFirstValue(ClaimTypes.Email);
        if (googleId == null || email == null)
        {
            TempData["Notice"] = "Google sign-in was cancelled or failed. Please try again.";
            return RedirectToAction(nameof(Login), new { returnUrl });
        }

        var user = await db.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId) ?? await FindByEmail(email);
        if (user == null)
        {
            user = new User { Email = Normalize(email), FullName = result.Principal!.FindFirstValue(ClaimTypes.Name) ?? email };
            db.Users.Add(user);
        }
        user.GoogleId = googleId;
        user.EmailConfirmed = true; // Google has verified the address
        await db.SaveChangesAsync();
        await customers.ClaimGuestRecordsAsync(user);

        await SignInAsync(user, true);
        return LocalRedirectOrHome(returnUrl);
    }

    // ---------- My account ----------

    [Authorize, HttpGet]
    public async Task<IActionResult> Index()
    {
        var user = await customers.CurrentAsync(User);
        if (user == null) return RedirectToAction(nameof(Login));
        return View(await AccountPage(user));
    }

    [Authorize, HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Profile([Bind(Prefix = "Profile")] ProfileViewModel model)
    {
        var user = await customers.CurrentAsync(User);
        if (user == null) return RedirectToAction(nameof(Login));
        if (!FormOptions.PhoneCodes.Any(p => p.Code == model.PhoneCode)) ModelState.AddModelError("Profile.PhoneCode", "Choose a country code");
        if (!ModelState.IsValid)
        {
            var page = await AccountPage(user);
            page.Profile = model;
            return View(nameof(Index), page);
        }

        user.FullName = model.FullName.Trim();
        user.Phone = string.IsNullOrWhiteSpace(model.Phone) ? "" : FormOptions.JoinPhone(model.PhoneCode, model.Phone);
        await db.SaveChangesAsync();
        await SignInAsync(user, true); // refresh the name shown in the header
        TempData["AccountNotice"] = "Your profile has been saved.";
        return RedirectToAction(nameof(Index));
    }

    [Authorize, HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        var user = await customers.CurrentAsync(User);
        if (user == null) return RedirectToAction(nameof(Login));
        await db.Addresses.Where(a => a.Id == id && a.UserId == user.Id).ExecuteDeleteAsync();
        return RedirectToAction(nameof(Index), null, "addresses");
    }

    // ---------- helpers ----------

    private async Task<MyAccountViewModel> AccountPage(User user)
    {
        var (code, phone) = user.Phone == "" ? (FormOptions.PhoneCodes[0].Code, "") : FormOptions.SplitPhone(user.Phone);
        return new MyAccountViewModel
        {
            User = user,
            Profile = new ProfileViewModel { FullName = user.FullName, PhoneCode = code, Phone = phone },
            Orders = await db.Orders.Include(o => o.Items).ThenInclude(i => i.Dish)
                .Where(o => o.UserId == user.Id).OrderByDescending(o => o.CreatedAt).ToListAsync(),
            Reservations = await db.Reservations.Where(r => r.UserId == user.Id).OrderByDescending(r => r.ReservedFor).ToListAsync(),
            Addresses = await db.Addresses.Where(a => a.UserId == user.Id).OrderByDescending(a => a.LastUsedAt).ToListAsync(),
        };
    }

    private async Task SendConfirmationAsync(User user, string? returnUrl)
    {
        var url = Url.Action(nameof(ConfirmEmail), "Account",
            new { token = tokens.Create(user, AccountTokens.ConfirmPurpose, TimeSpan.FromDays(3)), returnUrl }, Request.Scheme)!;
        var (subject, html) = EmailTemplates.ConfirmEmail(user.FullName, url);
        if (!await mail.SendAsync(user.Email, subject, html)) TempData["MailFailed"] = true;
        ShowDevLink(url);
    }

    /// <summary>Without SMTP on a developer machine, show the emailed link on the page so it can be tested.</summary>
    private void ShowDevLink(string url)
    {
        if (!mail.IsConfigured && env.IsDevelopment()) TempData["DevLink"] = url;
    }

    private static string Normalize(string? email) => (email ?? "").Trim().ToLowerInvariant();

    private Task<User?> FindByEmail(string? email)
    {
        var e = Normalize(email);
        return db.Users.FirstOrDefaultAsync(u => u.Email == e);
    }

    private async Task SignInAsync(User user, bool persistent)
    {
        user.LastLoginAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var identity = new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(StampClaim, user.SecurityStamp),
        ], CookieAuthenticationDefaults.AuthenticationScheme);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity), new AuthenticationProperties { IsPersistent = persistent });
    }

    private IActionResult LocalRedirectOrHome(string? returnUrl) =>
        Url.IsLocalUrl(returnUrl) ? LocalRedirect(returnUrl!) : RedirectToAction("Index", "Home");
}
