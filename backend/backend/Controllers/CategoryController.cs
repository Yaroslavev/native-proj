using System.Security.Claims;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Abstract;
using backend.Data;
using backend.Data.Entities;
using backend.Models.Category;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class CategoryController(UserManager<UserEntity> userManager, DbContextBackend context, IMapper mapper, IImageService imageService) : Controller
    {
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                string username = User.Claims.FirstOrDefault()!.Value;
                var user = await userManager.FindByEmailAsync(username);
                var categories = context.Categories
                    .Where(x => x.UserId == user!.Id)
                    .ProjectTo<CategoryItemViewModel>(mapper.ConfigurationProvider)
                    .ToList();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(long id)
        {
            try
            {
                string username = User.Claims.FirstOrDefault()!.Value;
                var user = await userManager.FindByEmailAsync(username);
                var category = context.Categories
                    .Where(x => x.UserId == user!.Id && x.Id == id)
                    .ProjectTo<CategoryItemViewModel>(mapper.ConfigurationProvider)
                    .SingleOrDefault();

                if (category is null) return NotFound("Category not found");

                return Ok(category);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromForm] CategoryCreateViewModel categoryModel)
        {
            try
            {
                string username = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value ?? throw new Exception("No email found");
                var user = await userManager.FindByEmailAsync(username);
                var category = mapper.Map<CategoryEntity>(categoryModel);
                if (categoryModel.Image is null)
                {
                    category.Image = "";
                }
                else
                {
                    category.Image = await imageService.SaveImageAsync(categoryModel.Image);
                }
                category.UserId = user!.Id;

                context.Categories.Add(category);
                context.SaveChanges();

                return Ok(new { id = category.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> EditCategory([FromForm] CategoryEditViewModel categoryModel)
        {
            var category = context.Categories.SingleOrDefault(x => x.Id == categoryModel.Id);
            if (category is null) return NotFound("Category not found");

            category = mapper.Map(categoryModel, category);
            if (categoryModel.Image is not null)
            {
                category.Image = await imageService.ReplaceImage(category.Image, categoryModel.Image);
            }

            context.SaveChanges();

            return Ok(new { id = category.Id });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteCategory(long id)
        {
            var category = context.Categories.SingleOrDefault(x => x.Id == id);
            if (category is null) return NotFound("Category not found");

            if (category.Image is not null)
            {
                imageService.DeleteImageIfExists(category.Image);
            }
            context.Categories.Remove(category);
            context.SaveChanges();

            return Ok();
        }
    }
}
