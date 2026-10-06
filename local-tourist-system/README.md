# LocalVista — Angular UI (hardcoded data)

Sample frontend for the **Local Tourist Day-Visit Planner** (Kandy).  
APIs and SQL Server come later; this app uses in-memory mock data.

## Run

```bash
npm install
npm start
```

Open `http://localhost:4200/` (use the port your terminal prints). Hard refresh with **Ctrl+F5** after updates.

## Navigation behaviour

| State | Nav shows |
|-------|-----------|
| Guest (visitor) | Explore · My plan · **Admin sign in** |
| Demo admin signed in | Explore · My plan · **Admin** · name · Log out |

Visitors browse attractions and build a day plan **without** signing in. There is **no tourist sign-up or tourist sign-in**. The **Admin** tab appears only after the demo admin signs in.

## Auth

| Page | Route |
|------|--------|
| Admin sign in | `/auth` |
| Admin manage (guarded) | `/admin` |

- `/signup` redirects to Explore (`/`).
- `/login` and `/admin/login` redirect to `/auth`.
- Demo admin (UI mock only): `manager` / `Manager123` — **not production security**.

## Session itinerary

One-day plan is stored in **`sessionStorage`** (cleared when the browser session ends). Guests can add, remove, reorder, and clear stops. No bookings, payments, or cloud-saved itineraries.

## Architecture

```text
src/app/
  core/           models, mock data, services, admin guard, map preview seam
  layout/shell/   header + outlet
  features/
    attractions/  list + detail (multi-image gallery)
    itinerary/    session day plan
    auth/         admin sign-in only
    admin/        list + form (multi-image URLs)
```

See `ANGULAR_FRONTEND_OVERVIEW.md` for a full page-by-page status document.
