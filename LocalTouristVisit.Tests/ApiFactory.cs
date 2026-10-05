using System.Net.Http.Headers;
using System.Net.Http.Json;
using Local_Tourist_Visit.Data;
using Local_Tourist_Visit.Dtos;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace LocalTouristVisit.Tests;

/// <summary>
/// Hosts the real API in memory, replacing SQL Server with an isolated in-memory database
/// so every test class starts from the same seeded catalogue.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>
{
    public const string AdminUsername = "test-admin";
    public const string AdminPassword = "Test@Password1";

    private readonly string _databaseName = $"tests-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("Jwt:Key", "integration-test-signing-key-0123456789-abcdef");
        builder.UseSetting("AdminSeed:Username", AdminUsername);
        builder.UseSetting("AdminSeed:Password", AdminPassword);

        builder.ConfigureServices(services =>
        {
            var sqlServerRegistrations = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>)
                    || (d.ServiceType.IsGenericType
                        && d.ServiceType.GenericTypeArguments.Contains(typeof(AppDbContext))))
                .ToList();
            foreach (var descriptor in sqlServerRegistrations)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(_databaseName));
        });
    }

    public async Task<HttpClient> CreateAdminClientAsync()
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequest { Username = AdminUsername, Password = AdminPassword });
        response.EnsureSuccessStatusCode();

        var login = await response.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login!.Token);
        return client;
    }
}
