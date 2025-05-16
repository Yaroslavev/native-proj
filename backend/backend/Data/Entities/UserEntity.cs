using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace backend.Data.Entities
{
    public class UserEntity : IdentityUser<long>
    {
        [StringLength(100)]
        public string Firstname { get; set; } = string.Empty;
        [StringLength(100)]
        public string Lastname { get; set; } = string.Empty;
        public int Age { get; set; } = 0;
        [StringLength(15)]
        public override string? PhoneNumber { get; set; }
        [StringLength(500)]
        public string? Image { get; set; }

        public virtual ICollection<UserRoleEntity>? UserRoles { get; set; }
        public virtual ICollection<CategoryEntity>? Categories { get; set; }
    }
}
