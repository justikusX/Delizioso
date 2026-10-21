using Delizioso.Data;
using Delizioso.Models;
using Microsoft.AspNetCore.Mvc;

namespace Delizioso.Controllers;

public class ContactController(AppDbContext db) : Controller
{
    [HttpGet]
    public IActionResult Index() => View(new ContactViewModel());

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Index(ContactViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        db.ContactMessages.Add(new ContactMessage
        {
            Name = $"{model.FirstName.Trim()} {model.LastName?.Trim()}".Trim(),
            Email = model.Email.Trim(),
            Subject = model.Subject?.Trim() ?? "",
            Message = model.Message.Trim(),
        });
        await db.SaveChangesAsync();

        TempData["ContactSent"] = model.FirstName.Trim();
        return RedirectToAction(nameof(Index));
    }
}
