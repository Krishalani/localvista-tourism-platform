using System.Security.Claims;
using System.Text;
using Local_Tourist_Visit.Data;
using Local_Tourist_Visit.Dtos;
using Local_Tourist_Visit.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Local_Tourist_Visit.Services;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 60;
}

public interface IAuthService
{
    /// <summary>Returns a signed token when the credentials are valid, otherwise null.</summary>
    Task<LoginResponse?> LoginAsync(string username, string password);
}

public class AuthService(
    AppDbContext db,
    IPasswordHasher<AdministratorAccount> hasher,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    public const string AdministratorRole = "Administrator";

    public async Task<LoginResponse?> LoginAsync(string username, string password)
    {
        var admin = await db.AdministratorAccounts.FirstOrDefaultAsync(a => a.Username == username.Trim());
        if (admin is null)
        {
            return null;
        }

        var result = hasher.VerifyHashedPassword(admin, admin.PasswordHash, password);
        if (result == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var options = jwtOptions.Value;
        var expires = DateTime.UtcNow.AddMinutes(options.ExpiryMinutes);
        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
                new Claim(ClaimTypes.Name, admin.Username),
                new Claim(ClaimTypes.Role, AdministratorRole),
            ]),
            Issuer = options.Issuer,
            Audience = options.Audience,
            Expires = expires,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key)),
                SecurityAlgorithms.HmacSha256),
        };

        var token = new JsonWebTokenHandler().CreateToken(descriptor);
        return new LoginResponse(token, expires, admin.Username);
    }
}
