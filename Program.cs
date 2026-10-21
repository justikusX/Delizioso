using System.Security.Claims;
using Delizioso.Controllers;
using Delizioso.Data;
using Delizioso.Models;
using Delizioso.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection("Email"));
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddSingleton<AccountTokens>();
builder.Services.AddScoped<Customers>();

var auth = builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(o =>
    {
        o.LoginPath = "/Account/Login";
        o.ExpireTimeSpan = TimeSpan.FromDays(30);
        // Log the visitor out if their account was deleted or their password changed elsewhere.
        o.Events.OnValidatePrincipal = async ctx =>
        {
            var db = ctx.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
            var stamp = ctx.Principal?.FindFirstValue(AccountController.StampClaim);
            var valid = int.TryParse(ctx.Principal?.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
                        && await db.Users.AnyAsync(u => u.Id == id && u.SecurityStamp == stamp);
            if (!valid)
            {
                ctx.RejectPrincipal();
                await ctx.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            }
        };
    })
    // Short-lived cookie that holds the Google identity until AccountController.GoogleCallback maps it to a customer.
    .AddCookie(AccountController.ExternalScheme, o => o.ExpireTimeSpan = TimeSpan.FromMinutes(10));

// Google sign-in is optional: set Authentication:Google:ClientId and ClientSecret (e.g. with dotnet user-secrets) to enable it.
var google = builder.Configuration.GetSection("Authentication:Google");
if (!string.IsNullOrEmpty(google["ClientId"]) && !string.IsNullOrEmpty(google["ClientSecret"]))
{
    auth.AddGoogle(o =>
    {
        o.ClientId = google["ClientId"]!;
        o.ClientSecret = google["ClientSecret"]!;
        o.SignInScheme = AccountController.ExternalScheme;
        o.Events.OnRemoteFailure = ctx =>
        {
            ctx.Response.Redirect("/Account/Login?googleError=1");
            ctx.HandleResponse();
            return Task.CompletedTask;
        };
    });
}

var app = builder.Build();

// Apply pending migrations (creates the Delizioso database on first run).
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// The site is in English: parse numbers/dates the same way regardless of the server's Windows language
// (otherwise "40.885" coordinates fail to bind on a machine with Russian regional settings).
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new Microsoft.AspNetCore.Localization.RequestCulture("en-US"),
    SupportedCultures = [new System.Globalization.CultureInfo("en-US")],
    SupportedUICultures = [new System.Globalization.CultureInfo("en-US")],
});

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();
