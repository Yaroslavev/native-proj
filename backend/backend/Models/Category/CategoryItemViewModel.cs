namespace backend.Models.Category
{
    public class CategoryItemViewModel
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Image { get; set; }
        public long UserId { get; set; }
    }
}
