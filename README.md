# Gaarizo

**Pakistan ki gaariyan, aik jagah** - a modern used-car marketplace for Pakistan (think OLX / PakWheels), built as a single full-stack Next.js app. Frontend pages and backend API route handlers live in the same project.

## Features

- Browse approved car ads with search, filters (brand, city, price, year, fuel, transmission), sorting and pagination (filters synced to the URL)
- Car detail page with image gallery, spec grid, Call / WhatsApp buttons and favourites
- Sign up / login with JWT in an httpOnly cookie
- Post an ad with up to 4 photos (uploaded to Cloudinary); every ad is reviewed before it goes live
- My Ads: status badges (Pending / Approved / Rejected + reason), mark as sold, delete
- Admin dashboard: animated stats, approve / reject (with reason), feature toggle, delete, users list
- Dark / light theme (saved in localStorage, no flash), glassmorphism UI, Framer Motion animations, skeleton loaders, toasts
- Health endpoint (`/api/health`) and a "Served by: hostname" footer, handy for load-balancing demos
- Prices in PKR: `Rs 45,00,000` and short form `45 lacs`

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, JavaScript, `src/`) |
| Database | PostgreSQL + Prisma ORM 6 |
| Auth | Custom JWT (`jose`) in httpOnly cookie `gaarizo_token`, passwords hashed with `bcryptjs` |
| Images | Cloudinary |
| UI | Tailwind CSS v4, Framer Motion, lucide-react, react-hot-toast |

## Folder structure

```
prisma/
  schema.prisma            data model (User, Ad, enums)
  migrations/0001_init/    initial SQL migration (committed)
  seed.js                  idempotent seed (admin, demo seller, demo ads)
src/
  proxy.js                 protects /post-ad, /my-ads, /admin (Next.js 16 replacement for middleware.js)
  lib/                     prisma, auth, cloudinary, validators, format, serialize
  context/                 AuthContext, ThemeContext, FavouritesContext
  components/              Navbar, Footer, CarCard, CarImage, ui helpers
  views/                   client-side page bodies (Home, Cars, CarDetail, PostAd, MyAds, Admin, ...)
  app/                     routes: pages (page.js) and api/ route handlers
```

## API endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | public | status, db connectivity, hostname, time |
| POST | `/api/auth/register` | public | create account, set cookie |
| POST | `/api/auth/login` | public | log in, set cookie |
| POST | `/api/auth/logout` | public | clear cookie |
| GET | `/api/auth/me` | public | current user or `null` |
| GET | `/api/ads` | public | approved ads, filters + sort + pagination (`{ads,total,page,pages}`) |
| GET | `/api/ads/featured` | public | approved, featured, not sold |
| GET | `/api/ads/meta` | public | distinct brands and cities |
| GET | `/api/ads/mine` | user | own ads, all statuses |
| GET | `/api/ads/[id]` | public / owner / admin | ad details (+views); owner or admin can see non-approved |
| POST | `/api/ads` | user | create ad (multipart, `images` up to 4) - status PENDING |
| PATCH | `/api/ads/[id]/sold` | owner | toggle sold |
| DELETE | `/api/ads/[id]` | owner / admin | delete ad and its Cloudinary images |
| GET | `/api/admin/stats` | admin | dashboard counters |
| GET | `/api/admin/ads?status=` | admin | list ads by status |
| PATCH | `/api/admin/ads/[id]/approve` | admin | approve |
| PATCH | `/api/admin/ads/[id]/reject` | admin | reject with `{reason}` |
| PATCH | `/api/admin/ads/[id]/feature` | admin | toggle featured |
| GET | `/api/admin/users` | admin | users (never returns passwords) |

## Demo accounts (after seeding)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@gaarizo.pk` | `Admin@123` |
| Seller | `seller@gaarizo.pk` | `Seller@123` |

The admin account comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.

## Run locally

Requires Node.js 20+ and a running PostgreSQL database.

```bash
npm install
cp .env.example .env        # then fill DATABASE_URL and the Cloudinary keys
npx prisma migrate deploy
npm run seed
npm run dev
```

Open http://localhost:3000. Without Cloudinary keys everything works except uploading photos (the API returns a clear error); ads without photos show a gradient placeholder.

Production build: `npm run build && npm start` (the build does not need a database).

## Notes

- Secrets are read on the server only; there are no `NEXT_PUBLIC_` variables and the client calls relative `/api/...` URLs.
- Set `COOKIE_SECURE=true` only when serving over HTTPS in production, otherwise the browser will drop the cookie on plain HTTP.
- Set a long random `JWT_SECRET` in every real deployment.
