# LocalVista Angular Frontend — Current Status

**Project:** Local Tourist Day-Visit Planner (Kandy)  
**App folder:** `local-tourist-system`  
**Stack:** Angular (standalone components, client render)  
**Data mode:** Hardcoded / in-browser mock (no live ASP.NET API, SQL Server, or Identity yet)

This document describes what the UI contains today: pages, what each page does, and features that are complete in the frontend.

---

## 1. How to run

```bash
cd local-tourist-system
npm install
npm start
```

Open the URL printed in the terminal (usually `http://localhost:4200/`). Use **Ctrl+F5** after UI updates if the browser looks stale.

---

## 2. Site map (pages & routes)

| Page | Route | Who can use it | Purpose |
|------|--------|----------------|---------|
| Explore (landing + catalogue) | `/` | Everyone (guests) | Browse/search/filter places; add to day plan |
| Attraction detail | `/attractions/:id` | Everyone | Place details, multi-image gallery, tips, map preview, add/remove from plan |
| My plan (itinerary) | `/itinerary` | Everyone | View/reorder/remove/clear the one-day **session** plan |
| Admin sign in | `/auth` | Guests (admin demo only) | Sign in as mock admin — no tourist accounts |
| Admin catalogue | `/admin` | **Admin only** | List places; delete with confirmation |
| Add place | `/admin/attractions/new` | **Admin only** | Create a catalogue entry (multi-image URLs) |
| Edit place | `/admin/attractions/:id/edit` | **Admin only** | Update a catalogue entry |

### Redirects

| Old / alias route | Goes to |
|-------------------|---------|
| `/login` | `/auth` |
| `/signup` | `/` (Explore) |
| `/admin/login` | `/auth` |
| Unknown paths (`**`) | `/` |

### Shared shell (all pages)

- Brand header (LocalVista · Kandy day visits)
- Role-aware nav (guest vs admin)
- Main content outlet
- Simple footer

---

## 3. Navigation by login state

| State | Navbar shows |
|-------|----------------|
| **Guest** | Explore · My plan · **Admin sign in** |
| **Admin** (demo session) | Explore · My plan · **Admin** · display name · Log out |

Rules:

- Visitors **do not** register or sign in as tourists.
- The **Admin** tab is hidden until the demo admin signs in.
- Guests can explore, open details, and build a day plan without an account.

---

## 4. What’s implemented on each page

### 4.1 Explore — `/`

- Hero with search, stats, and spotlight photos
- How-it-works steps (browse → add → enjoy; no account needed)
- Catalogue grid with name search + multi-select category filters
- Filter state in URL query params (`q`, `categories`)
- Cards show primary image, optional “N photos” badge, category, distance, hours
- **+ Add** to session itinerary from the card

### 4.2 Attraction detail — `/attractions/:id`

- Multi-image gallery (main image + thumbnail strip when more than one URL)
- Category, description, distance, opening hours, travel tips
- Add / remove from day plan
- Location: latitude/longitude + **iframe map preview** via `MapPreviewService` (replaceable seam for Google Maps API later)
- Not-found state for unknown ids

### 4.3 My plan — `/itinerary`

- Session plan in **`sessionStorage`** (not `localStorage`; not a saved account itinerary)
- Empty state with browse CTA
- Ordered timeline with **Move up / Move down**, remove, clear
- Day snapshot (stop count, combined distance labels, categories)
- No bookings, payments, multi-day, or cloud save

### 4.4 Admin sign in — `/auth`

- Admin-only form
- Clearly labelled **demo** credentials (mock auth — not production security)
- No sign-up / no public admin registration
- Redirects to `/admin` (or `returnUrl` under `/admin`)

**Demo admin:** `manager` / `Manager123`

### 4.5 Admin catalogue & form

- Guarded list with edit / delete (+ confirmation dialog)
- Add/edit form with required name, category, description
- **Multiple image URLs**: add, edit, remove, live preview
- Lat/lng fields retained for map preview

---

## 5. Features completed overall (frontend)

| Feature | Status |
|---------|--------|
| Browse catalogue (15+ places ≈ within 25 km of Kandy) | Done |
| Name search + category filter + URL preserve | Done |
| Attraction detail + tips + distance | Done |
| Multiple images per attraction (mock URLs) | Done |
| Gallery on detail; primary image on cards | Done |
| Map preview from lat/lng (replaceable service) | Done |
| Guest day plan: add / remove / reorder / clear | Done |
| Plan in `sessionStorage` | Done |
| Admin sign-in only (guest vs admin) | Done |
| Admin CRUD + delete confirm + validation | Done |
| No tourist registration / tourist sign-in | Done |

---

## 6. Architecture (frontend seams)

```text
src/app/
  core/
    models/          Attraction (imageUrls[]), Auth (Admin only)
    data/            MOCK_ATTRACTIONS
    services/        AttractionService, ItineraryService, AuthService, MapPreviewService
    guards/          adminGuard
  layout/shell/
  features/
    attractions/     list + detail
    itinerary/
    auth/            admin sign-in
    admin/           list + multi-image form
```

Services are the intended swap point for future HTTP → ASP.NET Core + SQL Server + Identity.

---

## 7. Intentionally not done yet

| Area | Notes |
|------|--------|
| ASP.NET Core REST API | Not integrated |
| SQL Server + EF Core | Not connected |
| Real authentication / Identity | Demo admin mock only |
| Google Maps JavaScript API | Iframe preview via `MapPreviewService` only |
| Image file upload / blob storage | URL strings in mock data only |
| Tourist accounts, bookings, payments | Out of scope for this UI phase |

---

## 8. Quick walkthrough checklist

1. Open `/` as a guest — browse, search, filter, add places.  
2. Open a detail page — switch gallery images; see map preview.  
3. Open **My plan** — reorder, remove, clear; refresh tab keeps plan; new session clears it.  
4. Open **Admin sign in** — use demo credentials; **Admin** tab appears.  
5. CRUD a place with multiple image URLs.  
6. Log out — Admin tab disappears; guest flow still works.  
7. Visit `/signup` — lands on Explore.

---

*Updated for admin-only auth, session itinerary, and multi-image mock support.*
