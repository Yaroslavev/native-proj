namespace backend.Models.Dish
{
    public class DishItemViewModel
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; } = 0;
        public IEnumerable<string>? Images { get; set; }
        public long CategoryId { get; set; }
    }
}
