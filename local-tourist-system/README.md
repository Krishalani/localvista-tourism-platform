# LocalVista — Angular UI (hardcoded data)

Sample frontend for the **Local Tourist Day-Visit Planner** (Kandy).  
APIs and SQL Server come later; this app uses in-memory mock data.

## Run

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Features covered

| Area | Routes | Notes |
|------|--------|-------|
| Catalogue + search/filter | `/` | Query params preserve filters (`q`, `categories`) |
| Attraction detail + map embed | `/attractions/:id` | Google Maps iframe (API key later) |
| One-day itinerary | `/itinerary` | Session `localStorage`; no tourist accounts |
| Admin login | `/admin/login` | `admin` / `Admin123` |
| Admin CRUD | `/admin`, `/admin/attractions/new`, `/admin/attractions/:id/edit` | Guarded; delete confirmation |

## Architecture

```text
src/app/
  core/           models, mock data, services, admin guard
  layout/shell/   header + outlet
  features/
    attractions/  list + detail
    itinerary/
    admin/        login, list, form
```

Services (`AttractionService`, `ItineraryService`, `AuthService`) are the seam where HTTP calls will replace hardcoded data later.
