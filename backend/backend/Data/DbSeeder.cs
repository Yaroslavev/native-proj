using System.Text;
using backend.Abstract;
using backend.Constants;
using backend.Data.Entities;
using backend.Models.Seeder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace backend.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(this WebApplication webApplication)
        {
            using var scope = webApplication.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<DbContextBackend>();

            context.Database.Migrate();

            if (!context.Roles.Any())
            {
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<RoleEntity>>();
                await roleManager.CreateAsync(new() { Name = Roles.Admin });
                await roleManager.CreateAsync(new() { Name = Roles.User });
            }

            if (!context.Users.Any())
            {
                var imageService = scope.ServiceProvider.GetRequiredService<IImageService>();
                var jsonFile = Path.Combine(Directory.GetCurrentDirectory(), "Helpers", "JsonData", "Users.json");

                if (File.Exists(jsonFile))
                {
                    var jsonData = File.ReadAllText(jsonFile, Encoding.UTF8);
                    try
                    {
                        var users = JsonConvert.DeserializeObject<List<SeederUserModel>>(jsonData) ?? throw new JsonException();
                        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<UserEntity>>();
                        foreach (var user in users)
                        {
                            UserEntity newUser = new()
                            {
                                UserName = user.Email,
                                PhoneNumber = user.PhoneNumber,
                                Email = user.Email,
                                Firstname = user.FirstName,
                                Lastname = user.LastName,
                                Image = await imageService.SaveImageFromUrlAsync(user.Image)
                            };

                            var result = await userManager.CreateAsync(newUser, user.Password);

                            if (result.Succeeded)
                            {
                                await userManager.AddToRoleAsync(newUser, user.Role);
                            }
                            else
                            {
                                Console.WriteLine($"--Error creating user {user.Email}--");
                            }
                        }
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine($"--Error parsing json--\n{e.Message}");
                    }
                }
                else Console.WriteLine($"--Error opening file {jsonFile}--");
            }
            if (!context.Categories.Any())
            {
                var imageService = scope.ServiceProvider.GetRequiredService<IImageService>();
                var jsonFile = Path.Combine(Directory.GetCurrentDirectory(), "Helpers", "JsonData", "Categories.json");
                if (File.Exists(jsonFile))
                {
                    var jsonData = File.ReadAllText(jsonFile, Encoding.UTF8);
                    try
                    {
                        var categories = JsonConvert.DeserializeObject<List<SeederCategoryModel>>(jsonData)
                            ?? throw new JsonException();
                        foreach (var category in categories)
                        {
                            var newCategory = new CategoryEntity
                            {
                                Name = category.Name,
                                Description = category.Description,
                                UserId = category.UserId,
                                Image = await imageService.SaveImageFromUrlAsync(category.Image!)
                            };
                            context.Categories.Add(newCategory);
                            context.SaveChanges();
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"--Error parse json--{ex.Message}");
                    }
                }
                else Console.WriteLine($"--Error open file {jsonFile}--");
            }
        }
    }
}
