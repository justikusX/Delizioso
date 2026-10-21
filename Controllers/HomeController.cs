using System.Diagnostics;
using Delizioso.Data;
using Delizioso.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Delizioso.Controllers;

public class HomeController(AppDbContext db) : Controller
{
    public async Task<IActionResult> Index()
    {
        var model = new HomeViewModel
        {
            Categories = await db.Categories.OrderBy(c => c.SortOrder).ToListAsync(),
            PopularDishes = await db.Dishes.Where(d => d.IsPopular).OrderBy(d => d.Id).ToListAsync(),
            Chefs = await db.Chefs.OrderBy(c => c.SortOrder).ToListAsync(),
            Testimonials = await db.Testimonials.OrderBy(t => t.SortOrder).ToListAsync(),
        };
        return View(model);
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
