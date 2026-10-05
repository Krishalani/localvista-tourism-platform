# Local Tourist Day-Visit Planner and Information System (Kandy, Sri Lanka)

ITE2953 Programming Group Project. A web application that lets tourists browse attractions
within about 25 km of Kandy, search and filter them, view details and a map, and build a
one-day visit plan. An administrator keeps the catalogue up to date.

## Structure

| Folder | What it is |
| --- | --- |
| `Local Tourist Visit/` | ASP.NET Core Web API (C#, .NET 10), Entity Framework Core, SQL Server |
| `local-tourist-system/` | Angular 22 single-page application |
| `LocalTouristVisit.Tests/` | xUnit integration tests for the API |
| `docs/screenshots/` | Screenshots of the running system |

Backend layers: `Controllers` (HTTP endpoints) → `Services` (business logic) → `Data`
(EF Core `AppDbContext`, migrations, seed data) → SQL Server. `Models` are the database
entities and `Dtos` are the shapes sent to and from the browser.

## Running the system

Prerequisites: .NET 10 SDK, Node.js 24, SQL Server LocalDB (installed with Visual Studio).

1. Start the API (creates the database, applies migrations and seeds 15 attractions on first run):

   ```
   cd "Local Tourist Visit"
   dotnet run --launch-profile http
   ```

   The API listens on http://localhost:5282.

2. Start the web application in a second terminal:

   ```
   cd local-tourist-system
   npm install
   npm start
   ```

   Open http://localhost:4200.

3. Administrator login: username `admin`, password `Kandy@Admin2026`
   (set in `Local Tourist Visit/appsettings.Development.json`; used only to create the first
   account, and stored in the database as a salted hash).

To use a different SQL Server instance, change `ConnectionStrings:DefaultConnection` in
`Local Tourist Visit/appsettings.json`.

## API

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/attractions?search=&categoryIds=` | Public | Catalogue, search and category filter |
| GET | `/api/attractions/{id}` | Public | Attraction details |
| GET | `/api/categories` | Public | The seven predefined categories |
| POST | `/api/auth/login` | Public | Administrator login, returns a JWT |
| POST | `/api/auth/logout` | Administrator | End the session |
| POST | `/api/admin/attractions` | Administrator | Add an attraction |
| PUT | `/api/admin/attractions/{id}` | Administrator | Update an attraction |
| DELETE | `/api/admin/attractions/{id}` | Administrator | Delete an attraction |

## Tests

```
cd LocalTouristVisit.Tests
dotnet test                 # 33 API integration tests (TC01 - TC26)

cd local-tourist-system
npm test -- --watch=false   # 17 unit tests (TC27 - TC40 and the app shell)
```

The API tests host the real application in memory and replace SQL Server with the EF Core
in-memory provider, so they do not need a database server.

## Maps

Attraction maps use the keyless Google Maps embed. To use the Google Maps Embed API with
your own key instead, set `GOOGLE_MAPS_EMBED_KEY` in
`local-tourist-system/src/app/core/api.config.ts`.

## Photo credits

Attraction photos are from Wikimedia Commons; authors and licences are listed on the
`/credits` page of the application.
