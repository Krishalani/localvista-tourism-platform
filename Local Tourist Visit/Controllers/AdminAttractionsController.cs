using Local_Tourist_Visit.Dtos;
using Local_Tourist_Visit.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Local_Tourist_Visit.Controllers;

/// <summary>Attraction management, restricted to authenticated administrators (BR-01, FR-17 to FR-20).</summary>
[ApiController]
[Route("api/admin/attractions")]
[Authorize(Roles = AuthService.AdministratorRole)]
public class AdminAttractionsController(IAttractionService attractions) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<AttractionDto>> Create(AttractionSaveRequest request)
    {
        if (!await attractions.CategoryExistsAsync(request.CategoryId!.Value))
        {
            return UnknownCategory();
        }

        var created = await attractions.CreateAsync(request);
        return CreatedAtAction(
            nameof(AttractionsController.GetById), "Attractions", new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AttractionDto>> Update(int id, AttractionSaveRequest request)
    {
        if (!await attractions.CategoryExistsAsync(request.CategoryId!.Value))
        {
            return UnknownCategory();
        }

        var updated = await attractions.UpdateAsync(id, request);
        return updated is null ? NotFoundProblem() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await attractions.DeleteAsync(id) ? NoContent() : NotFoundProblem();

    // BR-03: the category must be one of the predefined categories.
    private ActionResult UnknownCategory()
    {
        ModelState.AddModelError(nameof(AttractionSaveRequest.CategoryId), "Category must be one of the predefined categories.");
        return ValidationProblem(ModelState);
    }

    private ObjectResult NotFoundProblem() =>
        Problem(statusCode: StatusCodes.Status404NotFound, detail: "Attraction not found.");
}
