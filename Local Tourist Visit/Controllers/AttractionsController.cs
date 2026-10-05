using Local_Tourist_Visit.Dtos;
using Local_Tourist_Visit.Services;
using Microsoft.AspNetCore.Mvc;

namespace Local_Tourist_Visit.Controllers;

/// <summary>Public, read-only catalogue used by tourists (FR-01 to FR-07).</summary>
[ApiController]
[Route("api/attractions")]
public class AttractionsController(IAttractionService attractions) : ControllerBase
{
    // GET api/attractions?search=temple&categoryIds=1&categoryIds=4
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AttractionDto>>> Search(
        [FromQuery] string? search,
        [FromQuery] int[]? categoryIds) =>
        Ok(await attractions.SearchAsync(search, categoryIds ?? []));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AttractionDto>> GetById(int id)
    {
        var attraction = await attractions.GetByIdAsync(id);
        return attraction is null
            ? Problem(statusCode: StatusCodes.Status404NotFound, detail: "Attraction not found.")
            : Ok(attraction);
    }
}
