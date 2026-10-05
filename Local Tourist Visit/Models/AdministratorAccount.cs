namespace Local_Tourist_Visit.Models;

public class AdministratorAccount
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;

    // Salted hash produced by PasswordHasher; the plain password is never stored.
    public string PasswordHash { get; set; } = string.Empty;
}
