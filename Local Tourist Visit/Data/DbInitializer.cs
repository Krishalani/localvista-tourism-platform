using Local_Tourist_Visit.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Local_Tourist_Visit.Data;

public static class DbInitializer
{
    /// <summary>Applies pending migrations and seeds the first administrator and the starting catalogue.</summary>
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<AdministratorAccount>>();

        if (db.Database.IsRelational())
        {
            await db.Database.MigrateAsync();
        }
        else
        {
            await db.Database.EnsureCreatedAsync();
        }

        if (!await db.AdministratorAccounts.AnyAsync())
        {
            var username = configuration["AdminSeed:Username"];
            var password = configuration["AdminSeed:Password"];
            if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
            {
                var admin = new AdministratorAccount { Username = username };
                admin.PasswordHash = hasher.HashPassword(admin, password);
                db.AdministratorAccounts.Add(admin);
            }
        }

        if (!await db.Attractions.AnyAsync())
        {
            db.Attractions.AddRange(SeedData.Attractions());
        }

        await db.SaveChangesAsync();
    }
}
