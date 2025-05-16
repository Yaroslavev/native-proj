namespace backend.Models.Account
{
    public class UpdateViewModel
    {
        public String Email { get; set; } = string.Empty;
        public String Firstname { get; set; } = string.Empty;
        public String Lastname { get; set; } = string.Empty;
        public String Age { get; set; } = "0";
        public String? PhoneNumber { get; set; }
        public IFormFile? Image { get; set; }
    }
}
