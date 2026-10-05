using System.Net;
using System.Net.Http.Json;
using Local_Tourist_Visit.Data;
using Local_Tourist_Visit.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace LocalTouristVisit.Tests;

/// <summary>Integration tests for administrator login and attraction management (FR-14 to FR-20, BR-01 to BR-03).</summary>
public class AdminApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static AttractionSaveRequest ValidRequest(string name = "Embekka Devalaya") => new()
    {
        Name = name,
        CategoryId = SeedData.ReligiousHeritage,
        Description = "A 14th-century shrine known for its carved wooden pillars.",
        OpeningHours = "Daily 8:00 AM - 6:00 PM",
        DistanceFromKandyKm = 15m,
        Latitude = 7.2181,
        Longitude = 80.5676,
    };

    [Fact]
    public async Task TC11_Login_WithValidCredentials_ReturnsToken()
    {
        var response = await factory.CreateClient().PostAsJsonAsync(
            "/api/auth/login",
            new LoginRequest { Username = ApiFactory.AdminUsername, Password = ApiFactory.AdminPassword });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var login = await response.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.False(string.IsNullOrWhiteSpace(login!.Token));
        Assert.True(login.ExpiresAtUtc > DateTime.UtcNow);
    }

    [Theory]
    [InlineData(ApiFactory.AdminUsername, "wrong-password")]
    [InlineData("unknown-user", ApiFactory.AdminPassword)]
    public async Task TC12_Login_WithInvalidCredentials_Returns401(string username, string password)
    {
        var response = await factory.CreateClient().PostAsJsonAsync(
            "/api/auth/login", new LoginRequest { Username = username, Password = password });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task TC13_Login_WithEmptyFields_Returns400()
    {
        var response = await factory.CreateClient().PostAsJsonAsync(
            "/api/auth/login", new LoginRequest { Username = "", Password = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task TC14_AdminEndpoints_WithoutToken_Return401()
    {
        var client = factory.CreateClient();

        var create = await client.PostAsJsonAsync("/api/admin/attractions", ValidRequest());
        var update = await client.PutAsJsonAsync("/api/admin/attractions/1", ValidRequest());
        var delete = await client.DeleteAsync("/api/admin/attractions/1");

        Assert.Equal(HttpStatusCode.Unauthorized, create.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, update.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, delete.StatusCode);
    }

    [Fact]
    public async Task TC15_AdminEndpoints_WithTamperedToken_Return401()
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new("Bearer", "not.a.valid-token");

        var response = await client.DeleteAsync("/api/admin/attractions/1");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task TC16_Create_WithValidData_SavesAndAppearsInCatalogue()
    {
        var admin = await factory.CreateAdminClientAsync();

        var response = await admin.PostAsJsonAsync("/api/admin/attractions", ValidRequest("Embekka Devalaya TC16"));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<AttractionDto>();
        Assert.Equal("Religious & Heritage", created!.CategoryName);

        var found = await factory.CreateClient()
            .GetFromJsonAsync<List<AttractionDto>>("/api/attractions?search=TC16");
        Assert.Single(found!);
    }

    [Theory]
    [InlineData(null, 1, "Some description", "Name")]
    [InlineData("   ", 1, "Some description", "Name")]
    [InlineData("Some name", null, "Some description", "CategoryId")]
    [InlineData("Some name", 1, "", "Description")]
    public async Task TC17_Create_WithMissingMandatoryField_Returns400(
        string? name, int? categoryId, string? description, string invalidField)
    {
        var admin = await factory.CreateAdminClientAsync();
        var request = new AttractionSaveRequest { Name = name, CategoryId = categoryId, Description = description };

        var response = await admin.PostAsJsonAsync("/api/admin/attractions", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Contains(invalidField, problem!.Errors.Keys);
    }

    [Fact]
    public async Task TC18_Create_WithUnknownCategory_Returns400()
    {
        var admin = await factory.CreateAdminClientAsync();
        var request = ValidRequest();
        request.CategoryId = 99;

        var response = await admin.PostAsJsonAsync("/api/admin/attractions", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData(25.1)]
    [InlineData(-1)]
    public async Task TC19_Create_OutsideThe25KmScope_Returns400(double distanceKm)
    {
        var admin = await factory.CreateAdminClientAsync();
        var request = ValidRequest();
        request.DistanceFromKandyKm = (decimal)distanceKm;

        var response = await admin.PostAsJsonAsync("/api/admin/attractions", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task TC20_Update_ChangesStoredRecord()
    {
        var admin = await factory.CreateAdminClientAsync();
        var created = await (await admin.PostAsJsonAsync("/api/admin/attractions", ValidRequest("TC20 original")))
            .Content.ReadFromJsonAsync<AttractionDto>();

        var edit = ValidRequest("TC20 renamed");
        edit.CategoryId = SeedData.Museum;
        edit.OpeningHours = "  ";
        var response = await admin.PutAsJsonAsync($"/api/admin/attractions/{created!.Id}", edit);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var stored = await admin.GetFromJsonAsync<AttractionDto>($"/api/attractions/{created.Id}");
        Assert.Equal("TC20 renamed", stored!.Name);
        Assert.Equal("Museum", stored.CategoryName);
        Assert.Null(stored.OpeningHours);
    }

    [Fact]
    public async Task TC21_Update_WithMissingMandatoryField_Returns400AndKeepsRecord()
    {
        var admin = await factory.CreateAdminClientAsync();
        var created = await (await admin.PostAsJsonAsync("/api/admin/attractions", ValidRequest("TC21 original")))
            .Content.ReadFromJsonAsync<AttractionDto>();

        var edit = ValidRequest("");
        var response = await admin.PutAsJsonAsync($"/api/admin/attractions/{created!.Id}", edit);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var stored = await admin.GetFromJsonAsync<AttractionDto>($"/api/attractions/{created.Id}");
        Assert.Equal("TC21 original", stored!.Name);
    }

    [Fact]
    public async Task TC22_Update_UnknownId_Returns404()
    {
        var admin = await factory.CreateAdminClientAsync();

        var response = await admin.PutAsJsonAsync("/api/admin/attractions/99999", ValidRequest());

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task TC23_Delete_RemovesRecord()
    {
        var admin = await factory.CreateAdminClientAsync();
        var created = await (await admin.PostAsJsonAsync("/api/admin/attractions", ValidRequest("TC23 to delete")))
            .Content.ReadFromJsonAsync<AttractionDto>();

        var response = await admin.DeleteAsync($"/api/admin/attractions/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var lookup = await admin.GetAsync($"/api/attractions/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, lookup.StatusCode);
    }

    [Fact]
    public async Task TC24_Delete_UnknownId_Returns404()
    {
        var admin = await factory.CreateAdminClientAsync();

        var response = await admin.DeleteAsync("/api/admin/attractions/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task TC25_Logout_RequiresAuthentication()
    {
        var anonymous = await factory.CreateClient().PostAsync("/api/auth/logout", null);
        var admin = await factory.CreateAdminClientAsync();
        var authenticated = await admin.PostAsync("/api/auth/logout", null);

        Assert.Equal(HttpStatusCode.Unauthorized, anonymous.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, authenticated.StatusCode);
    }

    [Fact]
    public async Task TC26_AdminPassword_IsStoredHashedNotInPlainText()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var admin = await db.AdministratorAccounts.SingleAsync();

        Assert.NotEqual(ApiFactory.AdminPassword, admin.PasswordHash);
        Assert.DoesNotContain(ApiFactory.AdminPassword, admin.PasswordHash);
    }
}
