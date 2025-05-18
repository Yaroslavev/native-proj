using AutoMapper;
using backend.Data.Entities;
using backend.Models.Dish;

namespace backend.Mappers
{
    public class DishMapper : Profile
    {
        public DishMapper() {
            CreateMap<DishEntity, DishItemViewModel>();
            CreateMap<DishCreateViewModel, DishEntity>()
                .ForMember(opt => opt.Images, x => x.Ignore());
            CreateMap<DishEditViewModel, DishEntity>()
                .ForMember(opt => opt.Images, x => x.Ignore());
        }
    }
}
