using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Abstract;
using backend.Data;
using backend.Data.Entities;
using backend.Models.Category;
using backend.Models.Dish;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class DishController(DbContextBackend context, IMapper mapper, IImageService imageService) : Controller
    {
        [HttpGet]
        public IActionResult GetDishes()
        {
            try
            {
                var dishes = context.Dishes
                    .ProjectTo<DishItemViewModel>(mapper.ConfigurationProvider)
                    .ToList();

                return Ok(dishes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetDish(long id)
        {
            try
            {
                var dish = mapper.Map<DishItemViewModel>(context.Dishes.FirstOrDefault(x => x.Id == id));

                return Ok(dish);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{categoryId}")]
        public IActionResult GetDishesByCategory(long categoryId)
        {
            try
            {
                var dishes = context.Dishes
                    .Where(x => x.CategoryId == categoryId)
                    .ProjectTo<DishItemViewModel>(mapper.ConfigurationProvider)
                    .ToList();

                return Ok(dishes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateDish([FromForm] DishCreateViewModel dishModel)
        {
            try
            {
                var dish = mapper.Map<DishEntity>(dishModel);
                dish.Images = dishModel.Images is not null ? await imageService.SaveImagesAsync(dishModel.Images) : null;

                context.Dishes.Add(dish);
                context.SaveChanges();

                return Ok(new { id = dish.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> EditDish([FromForm] DishEditViewModel dishModel)
        {
            try
            {
                var dish = context.Dishes.FirstOrDefault(x => x.Id == dishModel.Id);

                if (dish is null)
                {
                    return NotFound("Dish not found");
                }

                dish = mapper.Map(dishModel, dish);
                if (dish.Images is not null)
                {
                    imageService.DeleteImagesIfExists(dish.Images);
                }
                dish.Images = dishModel.Images is not null ? await imageService.SaveImagesAsync(dishModel.Images) : null;

                context.Dishes.Update(dish);
                context.SaveChanges();

                return Ok(new { id = dish.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteDish(long id)
        {
            try
            {
                var dish = context.Dishes.FirstOrDefault(x => x.Id == id);
                if (dish is null) return NotFound("Dish not found");

                if (dish.Images is not null)
                {
                    imageService.DeleteImagesIfExists(dish.Images);
                }
                context.Dishes.Remove(dish);
                context.SaveChanges();

                return Ok(new { id = dish.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
