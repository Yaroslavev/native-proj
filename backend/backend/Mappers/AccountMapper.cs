using AutoMapper;
using backend.Data.Entities;
using backend.Models.Account;

namespace backend.Mappers
{
    public class AccountMapper : Profile
    {
        public AccountMapper()
        {
            CreateMap<RegisterViewModel, UserEntity>()
                .ForMember(x => x.UserName, opt => opt.MapFrom(x => x.Email))
                .ForMember(x => x.Email, opt => opt.MapFrom(x => x.Email))
                .ForMember(x => x.Firstname, opt => opt.MapFrom(x => x.Firstname))
                .ForMember(x => x.Lastname, opt => opt.MapFrom(x => x.Lastname))
                .ForMember(x => x.Age, opt => opt.MapFrom(x => x.Age))
                .ForMember(x => x.PhoneNumber, opt => opt.MapFrom(x => x.PhoneNumber))
                .ForMember(x => x.Image, opt => opt.Ignore());

            CreateMap<UpdateViewModel, UserEntity>()
                .ForMember(x => x.UserName, opt => opt.MapFrom(x => x.Email))
                .ForMember(x => x.Email, opt => opt.MapFrom(x => x.Email))
                .ForMember(x => x.Firstname, opt => opt.MapFrom(x => x.Firstname))
                .ForMember(x => x.Lastname, opt => opt.MapFrom(x => x.Lastname))
                .ForMember(x => x.Age, opt => opt.MapFrom(x => x.Age))
                .ForMember(x => x.PhoneNumber, opt => opt.MapFrom(x => x.PhoneNumber))
                .ForMember(x => x.Image, opt => opt.Ignore());
        }
    }
}
