using Local_Tourist_Visit.Dtos;
using Local_Tourist_Visit.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Local_Tourist_Visit.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var response = await auth.LoginAsync(request.Username!, request.Password!);
        return response is null
            ? Problem(statusCode: StatusCodes.Status401Unauthorized, detail: "Invalid username or password.")
            : Ok(response);
    }

    // Tokens are stateless, so logging out means the client discards its token.
    // The endpoint exists so the client has one place to end the session (FR-16).
    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout() => NoContent();
}
