namespace Local_Tourist_Visit.Models;

public class Attraction
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? OpeningHours { get; set; }
    public string? TravelTips { get; set; }
    public decimal? DistanceFromKandyKm { get; set; }
    public string? ImageUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // BR-03: every attraction belongs to exactly one category.
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
