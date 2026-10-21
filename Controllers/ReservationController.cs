using System.Security.Claims;
using System.Security.Cryptography;
using Delizioso.Data;
using Delizioso.Models;
using Delizioso.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Delizioso.Controllers;

public class ReservationController(AppDbContext db, Customers customers, IEmailSender mail) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(string? modify)
    {
        var model = new BookTableViewModel();
        if (modify != null && await FindActive(modify) is { } r)
        {
            model.Modify = r.Code;
            model.Date = DateOnly.FromDateTime(r.ReservedFor);
            model.Time = TimeOnly.FromDateTime(r.ReservedFor);
            model.Guests = r.Guests;
        }
        return View(model);
    }

    // Step 1 → step 2: validate the slot, then ask for contact details.
    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Index(BookTableViewModel model)
    {
        if (ModelState.IsValid &&
            ReservationRules.Validate(model.Date!.Value, model.Time!.Value, model.Guests!.Value, DateTime.Now) is { } error)
            ModelState.AddModelError("", error);
        if (!ModelState.IsValid) return View(model);

        return RedirectToAction(nameof(Confirm), new
        {
            date = model.Date!.Value.ToString("yyyy-MM-dd"),
            time = model.Time!.Value.ToString("HH:mm"),
            guests = model.Guests,
            modify = model.Modify,
        });
    }

    [HttpGet]
    public async Task<IActionResult> Confirm(DateOnly? date, TimeOnly? time, int? guests, string? modify)
    {
        if (date == null || time == null || guests == null ||
            ReservationRules.Validate(date.Value, time.Value, guests.Value, DateTime.Now) != null)
            return RedirectToAction(nameof(Index));

        var model = new ConfirmReservationViewModel { Date = date, Time = time, Guests = guests };
        if (modify != null && await FindActive(modify) is { } r)
        {
            model.Modify = r.Code;
            (model.FirstName, model.LastName) = FormOptions.SplitName(r.CustomerName);
            (model.PhoneCode, model.Phone) = FormOptions.SplitPhone(r.Phone);
            model.Email = r.Email;
            model.Occasion = r.Occasion;
            model.SpecialRequest = r.SpecialRequest;
            model.Newsletter = r.Newsletter;
        }
        else if (await customers.CurrentAsync(User) is { } user)
        {
            (model.FirstName, model.LastName) = FormOptions.SplitName(user.FullName);
            model.Email = user.Email;
            if (user.Phone != "") (model.PhoneCode, model.Phone) = FormOptions.SplitPhone(user.Phone);
        }
        return View(model);
    }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Confirm(ConfirmReservationViewModel model)
    {
        if (ModelState.IsValid &&
            ReservationRules.Validate(model.Date!.Value, model.Time!.Value, model.Guests!.Value, DateTime.Now) is { } error)
            ModelState.AddModelError("", error);
        if (!FormOptions.PhoneCodes.Any(p => p.Code == model.PhoneCode))
            ModelState.AddModelError(nameof(model.PhoneCode), "Choose a country code");
        if (!ModelState.IsValid) return View(model);

        var reservation = model.Modify != null ? await FindActive(model.Modify) : null;
        if (reservation == null)
        {
            reservation = new Reservation
            {
                Code = Convert.ToHexString(RandomNumberGenerator.GetBytes(6)),
                Status = "Confirmed",
                UserId = (await customers.CurrentAsync(User))?.Id,
            };
            db.Reservations.Add(reservation);
        }

        reservation.CustomerName = $"{model.FirstName.Trim()} {model.LastName?.Trim()}".Trim();
        reservation.Phone = FormOptions.JoinPhone(model.PhoneCode, model.Phone);
        reservation.Email = model.Email.Trim();
        reservation.ReservedFor = model.Date!.Value.ToDateTime(model.Time!.Value);
        reservation.Guests = model.Guests!.Value;
        reservation.Occasion = FormOptions.Occasions.Contains(model.Occasion) ? model.Occasion! : "";
        reservation.SpecialRequest = model.SpecialRequest?.Trim() ?? "";
        reservation.Newsletter = model.Newsletter;
        var changed = model.Modify != null && reservation.Id != 0;
        if (await customers.CurrentAsync(User) is { } customer) await customers.RememberAsync(customer, reservation.Phone, null, null, null);
        await db.SaveChangesAsync();

        var (subject, html) = EmailTemplates.ReservationConfirmed(reservation, DetailsUrl(reservation.Code), changed);
        await mail.SendAsync(reservation.Email, subject, html);

        return RedirectToAction(nameof(Details), new { code = reservation.Code });
    }

    [HttpGet("Reservation/{code:length(12)}")]
    public async Task<IActionResult> Details(string code)
    {
        var reservation = await db.Reservations.FirstOrDefaultAsync(r => r.Code == code);
        return reservation == null ? NotFound() : View(reservation);
    }

    // Occasion / special request can still be changed on the "confirmed" page (saved in the background).
    [HttpPost("Reservation/{code:length(12)}/Notes"), ValidateAntiForgeryToken]
    public async Task<IActionResult> Notes(string code, ReservationNotesViewModel model)
    {
        var reservation = await FindActive(code);
        if (reservation == null) return NotFound();
        if (!ModelState.IsValid) return BadRequest();

        reservation.Occasion = FormOptions.Occasions.Contains(model.Occasion) ? model.Occasion! : "";
        reservation.SpecialRequest = model.SpecialRequest?.Trim() ?? "";
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("Reservation/{code:length(12)}/Cancel")]
    public async Task<IActionResult> Cancel(string code)
    {
        var reservation = await db.Reservations.FirstOrDefaultAsync(r => r.Code == code);
        if (reservation == null) return NotFound();
        return reservation.Status == "Cancelled" ? RedirectToAction(nameof(Details), new { code }) : View(reservation);
    }

    [HttpPost("Reservation/{code:length(12)}/Cancel"), ValidateAntiForgeryToken, ActionName("Cancel")]
    public async Task<IActionResult> CancelConfirmed(string code)
    {
        var reservation = await db.Reservations.FirstOrDefaultAsync(r => r.Code == code);
        if (reservation == null) return NotFound();

        if (reservation.Status != "Cancelled")
        {
            reservation.Status = "Cancelled";
            await db.SaveChangesAsync();
            var (subject, html) = EmailTemplates.ReservationCancelled(reservation, Url.Action(nameof(Index), "Reservation", null, Request.Scheme)!);
            await mail.SendAsync(reservation.Email, subject, html);
        }
        return RedirectToAction(nameof(Details), new { code });
    }

    private string DetailsUrl(string code) => Url.Action(nameof(Details), "Reservation", new { code }, Request.Scheme)!;

    private Task<Reservation?> FindActive(string code) =>
        db.Reservations.FirstOrDefaultAsync(r => r.Code == code && r.Status != "Cancelled");
}
