using System.Net;
using System.Net.Http.Json;
using Local_Tourist_Visit.Data;
using Local_Tourist_Visit.Dtos;

namespace LocalTouristVisit.Tests;

/// <summary>Integration tests for the public catalogue (FR-01 to FR-07).</summary>
public class CatalogueApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private async Task<List<AttractionDto>> GetAttractionsAsync(string query = "") =>
        (await _client.GetFromJsonAsync<List<AttractionDto>>($"/api/attractions{query}"))!;

    [Fact]
    public async Task TC01_Catalogue_ReturnsAtLeastFifteenAttractions()
    {
        var attractions = await GetAttractionsAsync();

        Assert.True(attractions.Count >= 15);
        Assert.All(attractions, a =>
        {
            Assert.False(string.IsNullOrWhiteSpace(a.Name));
            Assert.False(string.IsNullOrWhiteSpace(a.CategoryName));
        });
    }

    [Fact]
    public async Task TC02_Categories_ReturnsTheSevenPredefinedCategories()
    {
        var categories = await _client.GetFromJsonAsync<List<CategoryDto>>("/api/categories");

        Assert.Equal(
            ["Religious & Heritage", "Nature", "Adventure", "Museum", "Viewpoint", "Recreation", "Eco Tourism"],
            categories!.Select(c => c.Name));
    }

    [Theory]
    [InlineData("museum")]
    [InlineData("MUSEUM")]
    [InlineData("  Museum ")]
    public async Task TC03_Search_MatchesNameIgnoringCaseAndSpaces(string term)
    {
        var attractions = await GetAttractionsAsync($"?search={Uri.EscapeDataString(term)}");

        Assert.Equal(2, attractions.Count);
        Assert.All(attractions, a => Assert.Contains("museum", a.Name, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task TC04_Search_WithNoMatch_ReturnsEmptyList()
    {
        var attractions = await GetAttractionsAsync("?search=zzz-no-such-place");

        Assert.Empty(attractions);
    }

    [Fact]
    public async Task TC05_Filter_BySingleCategory_ReturnsOnlyThatCategory()
    {
        var attractions = await GetAttractionsAsync($"?categoryIds={SeedData.Viewpoint}");

        Assert.Equal(2, attractions.Count);
        Assert.All(attractions, a => Assert.Equal("Viewpoint", a.CategoryName));
    }

    [Fact]
    public async Task TC06_Filter_ByMultipleCategories_ReturnsAnyOfThem()
    {
        var attractions = await GetAttractionsAsync(
            $"?categoryIds={SeedData.Museum}&categoryIds={SeedData.EcoTourism}");

        Assert.Equal(3, attractions.Count);
        Assert.All(attractions, a => Assert.Contains(a.CategoryId, new[] { SeedData.Museum, SeedData.EcoTourism }));
    }

    [Fact]
    public async Task TC07_SearchAndFilter_Combined_MustSatisfyBoth()
    {
        var attractions = await GetAttractionsAsync($"?search=temple&categoryIds={SeedData.ReligiousHeritage}");
        var wrongCategory = await GetAttractionsAsync($"?search=temple&categoryIds={SeedData.Nature}");

        Assert.Equal(3, attractions.Count);
        Assert.Empty(wrongCategory);
    }

    [Fact]
    public async Task TC08_Details_ReturnsFullAttractionInformation()
    {
        var temple = (await GetAttractionsAsync("?search=Dalada")).Single();

        var detail = await _client.GetFromJsonAsync<AttractionDto>($"/api/attractions/{temple.Id}");

        Assert.Equal("Religious & Heritage", detail!.CategoryName);
        Assert.False(string.IsNullOrWhiteSpace(detail.Description));
        Assert.False(string.IsNullOrWhiteSpace(detail.OpeningHours));
        Assert.False(string.IsNullOrWhiteSpace(detail.TravelTips));
        Assert.Equal(0.5m, detail.DistanceFromKandyKm);
        Assert.NotNull(detail.Latitude);
        Assert.NotNull(detail.Longitude);
    }

    [Fact]
    public async Task TC09_Details_ForUnknownId_Returns404()
    {
        var response = await _client.GetAsync("/api/attractions/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task TC10_SeedData_AllAttractionsAreWithin25KmOfKandy()
    {
        var attractions = await GetAttractionsAsync();

        Assert.All(attractions, a => Assert.InRange(a.DistanceFromKandyKm!.Value, 0m, 25m));
    }
}
