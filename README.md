# Opwatch

A bilingual (Thai / English) watch ecommerce storefront with a full back-office,
built with **Nuxt 3** and **MariaDB / MySQL**.

> Brand reference for the visual direction: [olympianus.com](https://olympianus.com/) —
> a quiet-luxury watch house. Opwatch is an original build, not a copy.

---

## Features

| Area | What's included |
| --- | --- |
| **Storefront** | Hero, featured collection, category showcase, product grid with search / sort / price filter, product detail with gallery, specs & reviews |
| **Ecommerce** | Persistent shopping cart (local storage), quantity steppers, free-shipping progress, checkout with contact + shipping address + payment method, order confirmation |
| **Membership** | Sign up / sign in, member benefits, reward points (1 pt per 50 ฿), total spend, order history, order tracking |
| **Admin panel** | Dashboard with revenue / orders / customers / low-stock, product CRUD, category CRUD, order management with status workflow, member list, store settings |
| **Localisation** | Thai and English, locale-aware URLs, currency formatting, bilingual product data |
| **Installation** | Web installer at `/install` — sets store details, administrator, and database connection; creates the schema and seeds the catalogue |

---

## Tech stack

- **Nuxt 3** (SSR) + **Vue 3**
- `@nuxtjs/i18n` — Thai (default) / English
- `@pinia/nuxt` + `useState` composables for cart / auth / site
- **MariaDB / MySQL** via `mysql2` — schema in `server/db/schema.sql`
- `bcryptjs` for password hashing, HMAC-signed session cookies
- Swappable data layer: the same `Store` interface backed by MySQL in production
  and a JSON file store in development (`server/db/json.ts`)

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

The first request redirects to **`/install`**. Configure:

1. **Store details** — name, tagline, contact, currency, default language
2. **Administrator** — email + password (this is your back-office login)
3. **Database** — choose **MariaDB / MySQL** (recommended) or the JSON file store

For MariaDB, the installer creates the database and all tables automatically.
You only need a server with a user that can `CREATE DATABASE`.

Then open:

- Storefront: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`

---

## Configuration

The installer writes a single file: **`config/site.config.json`** (gitignored).

```jsonc
{
  "installed": true,
  "secret": "…",                     // HMAC key for session cookies
  "site":   { "name": "Opwatch", "currency": "THB", "currencySymbol": "฿", "defaultLocale": "th", … },
  "admin":  { "email": "admin@opwatch.co.th", "passwordHash": "…" },
  "db":     { "driver": "mysql", "host": "127.0.0.1", "port": 3306, "user": "opwatch", "password": "…", "database": "opwatch" },
  "installedAt": "2026-10-27T00:00:00.000Z"
}
```

A template lives at [`config/site.config.example.json`](config/site.config.example.json).
Changing the database details at any time requires deleting the file and
re-running `/install` (the schema is recreated from `server/db/schema.sql`).

### Manual database setup

```bash
mysql -u root -p < server/db/schema.sql      # creates the opwatch database + tables
node scripts/init-db.mjs                     # or apply the schema using the saved config
```

### JSON development store

Selecting the JSON driver stores everything in `data/store.json` — useful when
no database server is available. The catalogue is seeded on install.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview a production build |
| `npm run generate` | Static generation (storefront pages; API routes need a server) |
| `node scripts/init-db.mjs` | Apply the schema to the configured database |

---

## Project layout

```
assets/css/main.css        Design system (palette, type, components)
locales/                   th.json / en.json — all UI strings
composables/               useSite · useAuth · useCart · useToast
components/                AppHeader · AppFooter · ProductCard · CartDrawer · …
layouts/                   default (storefront) · admin (back-office)
pages/                     storefront pages
pages/admin/               back-office pages
server/
  db/                      Store interface, MySQL adapter, JSON adapter, schema.sql
  utils/                   config, auth, installer, seed, slug
  api/                     public + admin REST endpoints
```

---

## API overview

**Public** — `GET /api/site`, `GET /api/categories`, `GET /api/products`,
`GET /api/products/:slug`, `POST /api/reviews`, `POST /api/auth/*`,
`POST /api/orders`, `GET /api/orders/:orderNo`, `GET /api/customer/*`

**Admin** (session required, admin only) — `GET /api/admin/stats`,
`/api/admin/products` (CRUD), `/api/admin/categories` (CRUD),
`/api/admin/orders` (list + status updates), `/api/admin/customers`,
`/api/admin/settings`

**Installer** — `GET /api/install/status`, `POST /api/install/test-db`,
`POST /api/install`, `POST /api/install/reset`

---

## Notes

- Product imagery under `public/images/` is placeholder photography — swap in
  your own and update `data/store.json` (or re-seed via the installer).
- Payment methods are configurable placeholders (bank transfer / card / COD);
  no payment gateway is integrated.
- Shipping fees and the free-shipping threshold are editable in
  **Admin → Settings**.

© Opwatch. Designed and crafted with care in Thailand.
