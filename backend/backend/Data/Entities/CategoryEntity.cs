using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Data.Entities
{
    public class CategoryEntity
    {
        [Key]
        public long Id { get; set; }
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;
        [StringLength(100)]
        public string? Image { get; set; }

        [ForeignKey("User")]
        public long UserId { get; set; }
        public virtual UserEntity? User { get; set; }
    }
}
