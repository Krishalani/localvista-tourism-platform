using Local_Tourist_Visit.Dtos;
using Local_Tourist_Visit.Services;
using Microsoft.AspNetCore.Mvc;

namespace Local_Tourist_Visit.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(IAttractionService attractions) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll() =>
        Ok(await attractions.GetCategoriesAsync());
}
