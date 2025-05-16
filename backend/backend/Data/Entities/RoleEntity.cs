using Microsoft.AspNetCore.Identity;

namespace backend.Data.Entities
{
    public class RoleEntity : IdentityRole<long>
    {
        public virtual ICollection<UserRoleEntity>? UserRoles { get; set; }
    }
}
