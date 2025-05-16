using backend.Data;
using backend.Data.Entities;
using Microsoft.AspNetCore.Identity;
using AutoMapper;
using backend.Abstract;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Services
{
    public class JwtTokenService(IConfiguration configuration, UserManager<UserEntity> userManager) : IJwtTokenService
    {
        public async Task<string> GenerateTokenAsync(UserEntity user)
        {
            var claims = new List<Claim>
            {
                new Claim("email", user.Email!),
                new Claim("name", $"{user.Firstname} {user.Lastname}"),
                new Claim("age", user.Age.ToString()),
                new Claim("phoneNumber", user.PhoneNumber ?? ""),
                new Claim("image", user.Image ?? ""),
            };

            var roles = await userManager.GetRolesAsync(user);
            foreach (var role in roles) claims.Add(new Claim("roles", role));

            var key = Encoding.UTF8.GetBytes(configuration.GetValue<string>("JwtKey") ?? throw new ArgumentException("JwtKey configuration is missing"));

            var signinKey = new SymmetricSecurityKey(key);
            var signinCredential = new SigningCredentials(signinKey, SecurityAlgorithms.HmacSha256);
            var jwt = new JwtSecurityToken
                (
                    signingCredentials: signinCredential,
                    expires: DateTime.Now.AddDays(7),
                    claims: claims
                );

            return new JwtSecurityTokenHandler().WriteToken(jwt);
        }
    }
}
