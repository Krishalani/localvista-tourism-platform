using Local_Tourist_Visit.Data;
using Local_Tourist_Visit.Dtos;
using Local_Tourist_Visit.Models;
using Microsoft.EntityFrameworkCore;

namespace Local_Tourist_Visit.Services;

public class AttractionService(AppDbContext db) : IAttractionService
{
    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync() =>
        await db.Categories
            .OrderBy(c => c.Id)
            .Select(c => new CategoryDto(c.Id, c.Name))
            .ToListAsync();

    public Task<bool> CategoryExistsAsync(int categoryId) =>
        db.Categories.AnyAsync(c => c.Id == categoryId);

    public async Task<IReadOnlyList<AttractionDto>> SearchAsync(string? search, IReadOnlyCollection<int> categoryIds)
    {
        var query = db.Attractions.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(a => a.Name.ToLower().Contains(term));
        }

        if (categoryIds.Count > 0)
        {
            query = query.Where(a => categoryIds.Contains(a.CategoryId));
        }

        return await query
            .OrderBy(a => a.Name)
            .Select(a => new AttractionDto(
                a.Id, a.Name, a.CategoryId, a.Category.Name, a.Description, a.OpeningHours,
                a.TravelTips, a.DistanceFromKandyKm, a.ImageUrl, a.Latitude, a.Longitude))
            .ToListAsync();
    }

    public async Task<AttractionDto?> GetByIdAsync(int id)
    {
        var attraction = await db.Attractions
            .AsNoTracking()
            .Include(a => a.Category)
            .FirstOrDefaultAsync(a => a.Id == id);

        return attraction is null ? null : ToDto(attraction);
    }

    public async Task<AttractionDto> CreateAsync(AttractionSaveRequest request)
    {
        var attraction = new Attraction();
        Apply(request, attraction);

        db.Attractions.Add(attraction);
        await db.SaveChangesAsync();
        await db.Entry(attraction).Reference(a => a.Category).LoadAsync();

        return ToDto(attraction);
    }

    public async Task<AttractionDto?> UpdateAsync(int id, AttractionSaveRequest request)
    {
        var attraction = await db.Attractions.FindAsync(id);
        if (attraction is null)
        {
            return null;
        }

        Apply(request, attraction);
        await db.SaveChangesAsync();
        await db.Entry(attraction).Reference(a => a.Category).LoadAsync();

        return ToDto(attraction);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var attraction = await db.Attractions.FindAsync(id);
        if (attraction is null)
        {
            return false;
        }

        db.Attractions.Remove(attraction);
        await db.SaveChangesAsync();
        return true;
    }

    private static void Apply(AttractionSaveRequest request, Attraction attraction)
    {
        attraction.Name = request.Name!.Trim();
        attraction.CategoryId = request.CategoryId!.Value;
        attraction.Description = request.Description!.Trim();
        attraction.OpeningHours = NullIfBlank(request.OpeningHours);
        attraction.TravelTips = NullIfBlank(request.TravelTips);
        attraction.DistanceFromKandyKm = request.DistanceFromKandyKm;
        attraction.ImageUrl = NullIfBlank(request.ImageUrl);
        attraction.Latitude = request.Latitude;
        attraction.Longitude = request.Longitude;
    }

    private static string? NullIfBlank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static AttractionDto ToDto(Attraction a) => new(
        a.Id, a.Name, a.CategoryId, a.Category.Name, a.Description, a.OpeningHours,
        a.TravelTips, a.DistanceFromKandyKm, a.ImageUrl, a.Latitude, a.Longitude);
}
