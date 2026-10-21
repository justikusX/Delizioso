namespace Delizioso.Models;

/// <summary>Data for the shared menu grid partial (homepage "popular menu" and the Menu page).</summary>
public class MenuGridModel
{
    public string Title { get; set; } = "";
    public List<Category> Categories { get; set; } = [];
    public List<Dish> Dishes { get; set; } = [];
    public int PageSize { get; set; } = 6;
}
