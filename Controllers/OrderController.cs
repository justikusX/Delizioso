using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using Delizioso.Data;
using Delizioso.Models;
using Delizioso.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Delizioso.Controllers;

public class OrderController(AppDbContext db, Customers customers, IEmailSender mail) : Controller
{
    public async Task<IActionResult> Index() => View(await PageModel());

    /// <summary>Separate order list page (used on phones; the desktop page shows it in a sidebar).</summary>
    public async Task<IActionResult> List() => View(await PageModel());

    /// <summary>Returns the discount for a voucher code, or 404 when the code is unknown.</summary>
    [HttpGet]
    public async Task<IActionResult> Voucher(string code)
    {
        var voucher = await FindVoucher(code);
        return voucher == null ? NotFound() : Json(new { code = voucher.Code, amount = voucher.Amount });
    }

    [HttpGet]
    public IActionResult Shipping() => View();

    [HttpGet]
    public async Task<IActionResult> Checkout()
    {
        var model = new CheckoutViewModel();
        if (await customers.CurrentAsync(User) is { } user)
        {
            (model.FirstName, var last) = FormOptions.SplitName(user.FullName);
            model.LastName = last;
            model.Email = user.Email;
            if (user.Phone != "") (model.PhoneCode, model.Phone) = FormOptions.SplitPhone(user.Phone);
        }
        await FillCheckoutView();
        return View(model);
    }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Checkout(CheckoutViewModel model)
    {
        var lines = await ParseCart(model.CartJson);
        if (!model.AcceptTerms) ModelState.AddModelError(nameof(model.AcceptTerms), "Please accept the Terms of use & Privacy Policy");
        if (lines.Count == 0) ModelState.AddModelError("", "Your order list is empty. Add some dishes first.");
        if (!OrderRules.Methods.Any(m => m.Value == model.Method)) ModelState.AddModelError(nameof(model.Method), "Choose an order method");
        if (!OrderRules.Payments.Any(p => p.Value == model.Payment)) ModelState.AddModelError(nameof(model.Payment), "Choose a payment method");
        if (!FormOptions.PhoneCodes.Any(p => p.Code == model.PhoneCode)) ModelState.AddModelError(nameof(model.PhoneCode), "Choose a country code");
        if (model.Method == "Delivery" && string.IsNullOrWhiteSpace(model.Address))
            ModelState.AddModelError(nameof(model.Address), "Choose your shipping address");

        DateTime? scheduled = null;
        if (model.OrderTime == "later")
        {
            var ok = DateTime.TryParseExact(model.LaterAt, "yyyy-MM-ddTHH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var at);
            if (!ok || !OrderRules.LaterSlots(DateTime.Now).Contains(at)) ModelState.AddModelError(nameof(model.LaterAt), "Choose a time for your order");
            else scheduled = at;
        }

        var voucher = string.IsNullOrWhiteSpace(model.VoucherCode) ? null : await FindVoucher(model.VoucherCode);

        if (!ModelState.IsValid)
        {
            await FillCheckoutView();
            return View(model);
        }

        var subtotal = lines.Sum(l => l.Dish.Price * l.Quantity);
        var tax = OrderRules.Tax(subtotal);
        var discount = Math.Min(voucher?.Amount ?? 0, subtotal + tax);
        var order = new Order
        {
            Code = Convert.ToHexString(RandomNumberGenerator.GetBytes(6)),
            CustomerName = $"{model.FirstName.Trim()} {model.LastName?.Trim()}".Trim(),
            Phone = FormOptions.JoinPhone(model.PhoneCode, model.Phone),
            Email = model.Email.Trim(),
            Method = model.Method,
            Payment = model.Payment,
            Address = model.Method == "Delivery" ? model.Address!.Trim() : "",
            Latitude = model.Method == "Delivery" ? model.Latitude : null,
            Longitude = model.Method == "Delivery" ? model.Longitude : null,
            ScheduledFor = scheduled,
            Note = model.Note?.Trim() ?? "",
            Subtotal = subtotal,
            Tax = tax,
            Discount = discount,
            VoucherCode = voucher?.Code ?? "",
            Total = subtotal + tax - discount,
            Status = model.Payment == "Cash" ? "New" : "Awaiting payment",
            UserId = (await customers.CurrentAsync(User))?.Id,
            Items = lines.Select(l => new OrderItem { DishId = l.Dish.Id, Quantity = l.Quantity, UnitPrice = l.Dish.Price }).ToList(),
        };
        db.Orders.Add(order);
        if (await customers.CurrentAsync(User) is { } customer)
            await customers.RememberAsync(customer, order.Phone, order.Address, order.Latitude, order.Longitude);
        await db.SaveChangesAsync();

        foreach (var item in order.Items) item.Dish = lines.First(l => l.Dish.Id == item.DishId).Dish;
        var (subject, html) = EmailTemplates.OrderPlaced(order, Url.Action(nameof(Placed), "Order", new { code = order.Code }, Request.Scheme)!);
        await mail.SendAsync(order.Email, subject, html);

        return RedirectToAction(nameof(Placed), new { code = order.Code });
    }

    [HttpGet("Order/{code:length(12)}")]
    public async Task<IActionResult> Placed(string code)
    {
        var order = await db.Orders.Include(o => o.Items).ThenInclude(i => i.Dish).FirstOrDefaultAsync(o => o.Code == code);
        return order == null ? NotFound() : View(order);
    }

    private async Task FillCheckoutView()
    {
        ViewBag.Dishes = await db.Dishes.ToListAsync();
        var user = await customers.CurrentAsync(User);
        ViewBag.SavedAddresses = user == null
            ? new List<Address>()
            : await db.Addresses.Where(a => a.UserId == user.Id).OrderByDescending(a => a.LastUsedAt).Take(5).ToListAsync();
    }

    private async Task<OrderPageViewModel> PageModel() => new()
    {
        Categories = await db.Categories.OrderBy(c => c.SortOrder).ToListAsync(),
        Dishes = await db.Dishes.OrderBy(d => d.Id).ToListAsync(),
    };

    private Task<Voucher?> FindVoucher(string code)
    {
        var normalized = code.Trim().ToUpperInvariant();
        return db.Vouchers.FirstOrDefaultAsync(v => v.Code == normalized && v.IsActive);
    }

    /// <summary>Turns the browser cart into priced lines; unknown dishes and bad quantities are dropped.</summary>
    private async Task<List<(Dish Dish, int Quantity)>> ParseCart(string? json)
    {
        Dictionary<string, int>? raw = null;
        try { raw = JsonSerializer.Deserialize<Dictionary<string, int>>(json ?? "{}"); }
        catch (JsonException) { }
        if (raw == null) return [];

        var wanted = raw.Where(kv => int.TryParse(kv.Key, out _) && kv.Value is > 0 and <= OrderRules.MaxQuantity)
            .ToDictionary(kv => int.Parse(kv.Key), kv => kv.Value);
        var dishes = await db.Dishes.Where(d => wanted.Keys.Contains(d.Id)).ToListAsync();
        return dishes.Select(d => (d, wanted[d.Id])).ToList();
    }
}
