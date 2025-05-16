using AutoMapper;
using backend.Abstract;
using backend.Constants;
using backend.Data.Entities;
using backend.Models.Account;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AuthController(IImageService imageService, UserManager<UserEntity> userManager, IMapper mapper, IJwtTokenService jwtTokenService) : Controller
    {
        [HttpPost]
        public async Task<IActionResult> RegisterAsync([FromForm] RegisterViewModel registerModel)
        {
            try
            {
                var user = await userManager.FindByEmailAsync(registerModel.Email);
                if (user is not null) throw new Exception("Email is already in use");

                var newUser = mapper.Map<UserEntity>(registerModel);
                newUser.Image = registerModel.Image is null ? null : await imageService.SaveImageAsync(registerModel.Image);
                var result = await userManager.CreateAsync(newUser, registerModel.Password);

                if (!result.Succeeded)
                {
                    throw new Exception("Error creating user");
                }

                await userManager.AddToRoleAsync(newUser, Roles.User);
                var token = await jwtTokenService.GenerateTokenAsync(newUser);

                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> LoginAsync([FromForm] LoginViewModel loginModel)
        {
            try
            {
                var user = await userManager.FindByEmailAsync(loginModel.Email);

                if (user is null) return BadRequest("User not found");
                if (!await userManager.CheckPasswordAsync(user, loginModel.Password)) return BadRequest("Invalid password");

                var token = await jwtTokenService.GenerateTokenAsync(user);

                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAsync([FromForm] UpdateViewModel updateModel)
        {
            try
            {
                var user = await userManager.FindByEmailAsync(updateModel.Email);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                mapper.Map(updateModel, user);

                if (updateModel.Image != null && updateModel.Image.Length > 0)
                {
                    string imageUrl = await imageService.ReplaceImage(user.Image, updateModel.Image);
                    user.Image = imageUrl;
                }

                var result = await userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
                }

                var token = await jwtTokenService.GenerateTokenAsync(user);

                return Ok(new
                {
                    token
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
