using System.ComponentModel.DataAnnotations;

namespace Local_Tourist_Visit.Dtos;

public record CategoryDto(int Id, string Name);

public record AttractionDto(
    int Id,
    string Name,
    int CategoryId,
    string CategoryName,
    string Description,
    string? OpeningHours,
    string? TravelTips,
    decimal? DistanceFromKandyKm,
    string? ImageUrl,
    double? Latitude,
    double? Longitude);

/// <summary>Body of the administrator create and update requests (FR-17 to FR-19).</summary>
public class AttractionSaveRequest
{
    // FR-18: name, category and description are mandatory.
    [Required(AllowEmptyStrings = false, ErrorMessage = "Name is required.")]
    [StringLength(150)]
    public string? Name { get; set; }

    [Required(ErrorMessage = "Category is required.")]
    public int? CategoryId { get; set; }

    [Required(AllowEmptyStrings = false, ErrorMessage = "Description is required.")]
    [StringLength(2000)]
    public string? Description { get; set; }

    [StringLength(200)]
    public string? OpeningHours { get; set; }

    [StringLength(1000)]
    public string? TravelTips { get; set; }

    // BR-02: only attractions within approximately 25 km of Kandy may be catalogued.
    [Range(0.0, 25.0, ErrorMessage = "Distance must be between 0 and 25 km from Kandy.")]
    public decimal? DistanceFromKandyKm { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [Range(-90.0, 90.0, ErrorMessage = "Latitude must be between -90 and 90.")]
    public double? Latitude { get; set; }

    [Range(-180.0, 180.0, ErrorMessage = "Longitude must be between -180 and 180.")]
    public double? Longitude { get; set; }
}
