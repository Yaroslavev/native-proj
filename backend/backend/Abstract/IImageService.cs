namespace backend.Abstract
{
    public interface IImageService
    {
        Task<string> SaveImageAsync(byte[] bytes);
        Task<string> SaveImageAsync(IFormFile image);
        Task<string> SaveImageAsync(string base64);
        Task<string> SaveImageFromUrlAsync(string imageUrl);
        Task<List<string>> SaveImagesAsync(IEnumerable<byte[]> bytesArray);
        Task<List<string>> SaveImagesAsync(IEnumerable<IFormFile> imagesArray);
        Task<byte[]> LoadBytesAsync(string name);
        void DeleteImage(string nameWithFormat);
        void DeleteImageIfExists(string nameWithFormat);
        void DeleteImages(IEnumerable<string> namesWithFormat);
        void DeleteImagesIfExists(IEnumerable<string> namesWithFormat);
        Task<string> ReplaceImage(string? nameWithFormatOld, IFormFile imageNew);
    }
}
