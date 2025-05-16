namespace backend.Models.Seeder
{
    public class SeederCategoryModel
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Image { get; set; }
        public long UserId { get; set; }
    }
}
