using Microsoft.AspNetCore.Mvc;

namespace Delizioso.Controllers;

public class AboutController : Controller
{
    public IActionResult Index() => View();
}
