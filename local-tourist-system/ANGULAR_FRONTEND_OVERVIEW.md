# LocalVista frontend and requirement status

**Product:** Local Tourist Day-Visit Planner and Information System (Kandy)  
**Frontend:** Angular standalone components  
**Backend:** ASP.NET Core Web API, C#, Entity Framework Core  
**Data:** SQL Server catalogue; ASP.NET Core Identity tables  
**Guest itinerary:** Browser `sessionStorage`; tourist registration is out of scope.

## Run the system

From the workspace root:

```powershell
dotnet run --project localvista-backend/LocalVista/LocalVista.csproj
```

Then, from `localvista-tourism-platform/local-tourist-system`:

```powershell
npm install
npm start
```

Open `http://localhost:4200`. Before the first API start, run `localvista-tourism-platform/database/LocalVista_Schema.sql` against SQL Server. That script drops and recreates the catalogue tables; do not rerun it where catalogue data must be preserved. The API applies Identity migrations and seeds a development admin. Configure credentials outside committed files for shared environments.

## Google Maps Embed API setup

The attraction detail page uses the Google Maps Embed API `place` mode when a key is present. Copy `public/localvista-config.example.js` to `public/localvista-config.js` and set `googleMapsEmbedApiKey`. Enable Maps Embed API and restrict the browser key to the application's HTTP referrers. The actual config is Git-ignored. With no key, the page keeps a coordinate-based Google Maps preview and shows a setup hint.

The browser key is visible to users by design; protect it with HTTP-referrer restrictions. Google Maps Platform requires an API key for Embed API requests. See Google's [Maps Embed API setup](https://developers.google.com/maps/documentation/embed/get-api-key) and [map embedding guide](https://developers.google.com/maps/documentation/embed/embedding-map).

## Pages and behavior

| Route | Access | Behavior |
|---|---|---|
| `/` | Guest/admin | Live catalogue, name search, multi-category filtering, URL-preserved filters, empty/error states, add-to-plan |
| `/attractions/:id` | Guest/admin | Detail, ordered image gallery, coordinates, map, add/remove from plan; preserves query parameters when returning |
| `/itinerary` | Guest/admin | Session plan; add/remove/reorder/clear; no bookings or account persistence |
| `/auth` | Guest | Admin login using API Identity cookie; no public admin registration |
| `/admin` | Admin | Catalogue management and delete confirmation |
| `/admin/attractions/new` | Admin | Validated attraction creation |
| `/admin/attractions/:id/edit` | Admin | Validated attraction editing |

The API enforces admin access independently of the client route guard. The browser's stored admin display state does not grant API access.

## Proposal/SRS coverage snapshot

| Requirement group | Implementation status |
|---|---|
| FR-01 to FR-07: catalogue, search/filter, details, images | Implemented; catalogue is API-backed and seeded with 15 attractions |
| FR-08: Google Maps API map | Implemented through Maps Embed API when a valid runtime key is configured; no-key preview fallback is available |
| FR-09: preserve search/filter on return | Implemented through Angular query parameter preservation |
| FR-10 to FR-13: one-day plan | Implemented in session storage, including duplicate prevention and reorder controls |
| FR-14 to FR-21: admin authentication and CRUD | Implemented with Identity, role authorization, validation, and delete confirmation |
| NFR-01, NFR-03: response time and reliability thresholds | Not claimed as verified; require repeatable measurements under the SRS conditions |
| NFR-02: three-interaction usability target | The flow is designed for this target; user evaluation evidence is still needed |
| NFR-04: admin security | Identity and server-side role authorization are implemented; production transport/security configuration must be reviewed at deployment |
| NFR-05: 99% availability | Deployment and uptime monitoring are outside the local development project; not verified |
| NFR-06 and NFR-07: maintainability and adding attraction records | Supported by admin CRUD and the relational data model |
| NFR-08: browser and responsive compatibility | Responsive layouts are implemented; Chrome/Edge/Firefox and 360-1920 px verification should be recorded before claiming conformance |

## Architecture

```text
Angular routes and standalone feature components
  -> core services (HTTP API, auth, session itinerary, map URL)
  -> ASP.NET controllers
  -> application services and repositories
  -> EF Core LocalVistaDbContext
  -> SQL Server catalogue + Identity tables
```

Feature code is under `src/app/features`; shared models, API services, auth guard, and map config are under `src/app/core`. The frontend dev server proxies `/api` to the API. SQL catalogue schema and sample data are in `../database/LocalVista_Schema.sql`.

## Demonstration checklist

1. Start SQL Server, the API, then Angular; show the 15-place catalogue.
2. Search by name, apply multiple categories, and show the empty-results message.
3. Open a detail page, inspect images/location, and return with filters preserved.
4. Add attractions, reorder/remove them, refresh within the session, then clear the plan.
5. Sign in as admin; add, edit, and delete a sample attraction; verify delete confirmation.
6. Sign out and show that the API rejects an admin write without an authenticated Admin session.
7. If the Maps Embed key is configured, demonstrate the interactive map. Otherwise explain the preview fallback and configure the key before claiming FR-08 complete.

## Verification still required

The rubric/SRS quality thresholds that need measurement cannot be established by source inspection alone. Record response-time samples, request-error counts, a first-time usability walkthrough, and browser/viewport checks. A 99% uptime claim requires a deployed environment and a monitoring period; it cannot be demonstrated by a local run.
