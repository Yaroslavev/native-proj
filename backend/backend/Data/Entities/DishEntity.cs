using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Data.Entities
{
    public class DishEntity
    {
        [Key]
        public long Id { get; set; }
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; } = 0;

        public IEnumerable<string>? Images { get; set; }
        [ForeignKey("Category")]
        public long CategoryId { get; set; }
        public virtual CategoryEntity? Category { get; set; }
    }
}
