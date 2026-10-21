using Delizioso.Data;
using Delizioso.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Delizioso.Controllers;

public class MenuController(AppDbContext db) : Controller
{
    public async Task<IActionResult> Index()
    {
        var model = new MenuGridModel
        {
            Title = "Menu",
            Categories = await db.Categories.OrderBy(c => c.SortOrder).ToListAsync(),
            Dishes = await db.Dishes.OrderBy(d => d.Id).ToListAsync(),
        };
        return View(model);
    }
}
