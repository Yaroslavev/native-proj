using backend.Data.Entities;

namespace backend.Abstract
{
    public interface IJwtTokenService
    {
        Task<string> GenerateTokenAsync(UserEntity user);
    }
}
