using AutoMapper;
using backend.Data.Entities;
using backend.Models.Category;

namespace backend.Mappers
{
    public class CategoryMapper : Profile
    {
        public CategoryMapper()
        {
            CreateMap<CategoryEntity, CategoryItemViewModel>();
            CreateMap<CategoryCreateViewModel, CategoryEntity>()
                .ForMember(opt => opt.Image, x => x.Ignore())
                .ForMember(opt => opt.UserId, x => x.Ignore());
            CreateMap<CategoryEditViewModel, CategoryEntity>()
                .ForMember(opt => opt.Image, x => x.Ignore())
                .ForMember(opt => opt.UserId, x => x.Ignore());
        }
    }
}
