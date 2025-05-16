namespace backend.Models.Account
{
    public class RegisterViewModel
    {
        public String Email { get; set; } = string.Empty;
        public String Password { get; set; } = string.Empty;
        public String Firstname { get; set; } = string.Empty;
        public String Lastname { get; set; } = string.Empty;
        public int Age { get; set; } = 0;
        public String? PhoneNumber { get; set; }
        public IFormFile? Image { get; set; }
    }
}
