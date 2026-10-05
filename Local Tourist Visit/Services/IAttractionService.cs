using Local_Tourist_Visit.Dtos;

namespace Local_Tourist_Visit.Services;

public interface IAttractionService
{
    Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync();
    Task<bool> CategoryExistsAsync(int categoryId);

    /// <summary>Returns attractions whose name contains <paramref name="search"/> and whose category is one of <paramref name="categoryIds"/>; an empty filter matches everything.</summary>
    Task<IReadOnlyList<AttractionDto>> SearchAsync(string? search, IReadOnlyCollection<int> categoryIds);

    Task<AttractionDto?> GetByIdAsync(int id);
    Task<AttractionDto> CreateAsync(AttractionSaveRequest request);
    Task<AttractionDto?> UpdateAsync(int id, AttractionSaveRequest request);
    Task<bool> DeleteAsync(int id);
}
