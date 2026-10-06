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
| Guest (not logged in) | Explore · My plan · **Sign in** · **Sign up** |
| Normal user | Explore · My plan · Hi, Name · Log out |
| Admin user | Explore · My plan · **Admin** · Hi, Name · Log out |

The **Admin** tab is hidden until an admin-role account signs in.

## Auth routes

| Page | Route |
|------|--------|
| Sign in | `/login` |
| Sign up | `/signup` |
| Admin manage (guarded) | `/admin` |

Sign-up creates a **Tourist** account (saved in browser localStorage). Admin is not self-registered.

## Demo accounts

| Username | Password | Result |
|----------|----------|--------|
| `user` | `User12345` | Normal user |
| `manager` | `Manager123` | Admin tab appears |

## Architecture

```text
src/app/
  core/           models, mock data, services, admin guard
  layout/shell/   header + outlet
  features/
    attractions/  list + detail
    itinerary/
    auth/         sign in + sign up
    admin/        list + form (Admin role only)
```
