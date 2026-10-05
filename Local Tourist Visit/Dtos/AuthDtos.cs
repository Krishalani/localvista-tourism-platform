using System.ComponentModel.DataAnnotations;

namespace Local_Tourist_Visit.Dtos;

public class LoginRequest
{
    [Required(AllowEmptyStrings = false, ErrorMessage = "Username is required.")]
    public string? Username { get; set; }

    [Required(AllowEmptyStrings = false, ErrorMessage = "Password is required.")]
    public string? Password { get; set; }
}

public record LoginResponse(string Token, DateTime ExpiresAtUtc, string Username);
