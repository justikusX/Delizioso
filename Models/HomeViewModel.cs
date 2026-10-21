namespace Delizioso.Models;

public class HomeViewModel
{
    public List<Category> Categories { get; set; } = [];
    public List<Dish> PopularDishes { get; set; } = [];
    public List<Chef> Chefs { get; set; } = [];
    public List<Testimonial> Testimonials { get; set; } = [];
}
