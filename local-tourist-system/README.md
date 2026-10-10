# LocalVista - Angular frontend

Angular frontend for the Local Tourist Day-Visit Planner. The catalogue and administrator features use the ASP.NET Core API and SQL Server database. Guest itineraries are stored in the current browser session.

## Run

1. Set up SQL Server using `../database/LocalVista_Schema.sql` (first setup only; the script resets catalogue tables).
2. Start the API from the workspace root: `dotnet run --project localvista-backend/LocalVista/LocalVista.csproj`.
3. In another terminal, run `npm install` and `npm start` from this directory.
4. Open `http://localhost:4200`.

The API seeds the development admin account (`manager` / `Manager123`). Change the seed credentials before using a shared or deployed environment.

## Google Maps Embed API

The attraction detail page uses Google's interactive Maps Embed API when a key is configured. Copy `public/localvista-config.example.js` to `public/localvista-config.js`, add a key with Maps Embed API enabled, and restrict the key to the app's HTTP referrers. The local config file is ignored by Git. Without a key, the page falls back to the coordinate-based Google Maps preview.

## Scope and routes

- Guests can search/filter attractions, view details, and build a one-day plan without registration.
- The plan supports add, remove, reorder, and clear; it is kept in `sessionStorage`.
- Admins sign in at `/auth` and manage attractions at `/admin` (create, edit, delete).
- Tourist accounts, bookings, ticketing, and payments are out of scope.

See `ANGULAR_FRONTEND_OVERVIEW.md` for the page map, architecture, and requirement status.
