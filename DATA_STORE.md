# Onmart – Backend / Data Store

This project uses a **file-based store** (`data/store.json`) for admin-created data and orders. All APIs are Next.js Route Handlers under `app/api/`. You can later replace this with a real database (Prisma, MongoDB, Supabase, etc.) by keeping the same API shape.

---

## Where data is stored

| What              | Where                    | API routes                          |
|-------------------|--------------------------|-------------------------------------|
| Categories        | `data/store.json`        | `GET/POST/DELETE /api/store/categories` |
| Products          | `data/store.json`        | `GET/POST/DELETE /api/store/products`   |
| Banners           | `data/store.json`        | `GET/POST/DELETE /api/store/banners`    |
| Orders            | `data/store.json`        | `GET/POST/PATCH /api/store/orders`     |
| Disabled categories | `data/store.json`      | `GET/POST /api/store/disabled-categories` |
| Uploads (images)  | `public/uploads/`        | `POST /api/upload`                     |

**Auth:** Frontend-only (AuthContext). No user table in store. For real auth, add a backend auth API and use it from the app.

---

## 1. Categories

**Stored in:** `store.categories`

| Field   | Type   | Description                    |
|--------|--------|--------------------------------|
| id     | string | e.g. `cat-1234567890-abc123`   |
| name   | string | Display name (e.g. "Groceries & Pets") |
| slug   | string | URL slug (e.g. `groceries-pets`) |
| image  | string | Image URL                      |

**Default categories** are defined in `src/data/categories.ts`. Admin can add **custom categories** via Admin → Categories; those are saved in `store.categories`. Admin can **hide** default categories via disabled list.

---

## 2. Products

**Stored in:** `store.products`

| Field        | Type   | Description                          |
|-------------|--------|--------------------------------------|
| id          | string | e.g. `prod-1234567890-xyz`           |
| title       | string | Product name                         |
| price       | number | Price (e.g. Rs.)                     |
| image       | string | Main image URL                       |
| images      | string[] | Optional extra images              |
| categorySlug| string | Must match a category slug           |
| description | string | Optional description                 |
| rating      | object | Optional `{ rate: number, count: number }` |
| reviews     | array  | Optional `[{ id, author, text, rating, createdAt }]` |

**Rating & reviews:** When admin uploads a product, the API auto-adds a default `rating` and sample `reviews`. Product details page shows stars and “Customer reviews” from this data.

**Products from FakeStore API** (numeric ids) are not stored in `store.json`; they come from the external API. Only admin-uploaded products (id starting with `prod-`) are in the store.

---

## 3. Banners

**Stored in:** `store.banners`

| Field | Type   | Description     |
|-------|--------|-----------------|
| id    | string | Unique id       |
| src   | string | Image URL       |
| href  | string | Link URL        |
| label | string | Optional label  |

---

## 4. Orders

**Stored in:** `store.orders`

| Field     | Type   | Description                    |
|----------|--------|--------------------------------|
| id       | string | e.g. `ord-1234567890-abc`      |
| email    | string | Customer email                 |
| name     | string | Customer name                  |
| phone    | string | Phone (from checkout)          |
| address  | string | Delivery address               |
| city     | string | Optional                       |
| province | string | Optional                       |
| area     | string | Optional                       |
| items    | array  | `[{ id, title, price, quantity, image }]` |
| total    | number | Order total                    |
| status   | string | `pending` \| `packing` \| `dispatched` \| `delivered` \| `cancelled` |
| createdAt| string | ISO date string                |

**Status rules:**

- **User** can cancel only when status is `pending` (not when packing/dispatched/delivered).
- **Admin** cannot set status to `cancelled` (no cancel option on admin side). Admin can only set: pending → packing → dispatched → delivered.
- **Admin list** hides cancelled orders by default; “Show cancelled” shows them.

---

## 5. Disabled category slugs

**Stored in:** `store.disabledCategorySlugs`

Array of category slugs that are hidden from the user site (e.g. `["electronics"]`). Used so admin can hide default categories without deleting them.

---

## File structure of `data/store.json`

```json
{
  "categories": [ ... ],
  "products": [ ... ],
  "banners": [ ... ],
  "disabledCategorySlugs": [ ... ],
  "orders": [ ... ]
}
```

Ensure the `data/` folder exists; the API creates it when writing.

---

## What to do when adding a real backend

1. **Keep the same API routes** (`/api/store/...`) and response shapes so the frontend does not change.
2. **Replace** `readStore()` / `writeStore()` in `src/app/api/store/route.ts` (and other store route files) with your DB client (e.g. Prisma, MongoDB, Supabase).
3. **Auth:** Add a proper auth API (e.g. JWT or session) and use it in AuthContext and in middleware for `/admin`.
4. **Uploads:** Keep `public/uploads/` or move to cloud storage (e.g. S3, Cloudinary) and store only URLs in products/banners.
5. **Reviews:** You can add `POST /api/store/products/[id]/reviews` to let users submit reviews and persist them in the same product or a separate `reviews` table.

---

## Quick reference – APIs

| Method | Route | Purpose |
|--------|--------|---------|
| GET    | /api/store/categories | List categories (for menu + home) |
| POST   | /api/store/categories | Add custom category (admin) |
| DELETE | /api/store/categories?id= | Delete custom category (admin) |
| GET    | /api/store/disabled-categories | List disabled slugs |
| POST   | /api/store/disabled-categories | Add/remove disabled slug (admin) |
| GET    | /api/store/products | List products (optional `?category=slug`) |
| POST   | /api/store/products | Add product (admin; adds default rating + reviews) |
| DELETE | /api/store/products?id= | Delete product (admin) |
| GET    | /api/store/orders | List orders (`?email=` for user, else admin; default excludes cancelled) |
| GET    | /api/store/orders?includeCancelled=1 | Include cancelled (admin) |
| POST   | /api/store/orders | Create order (checkout / Buy Now) |
| PATCH  | /api/store/orders | Update order status (user cancel or admin status change) |
| GET    | /api/store/banners | List banners |
| POST   | /api/upload | Upload image (multipart); returns URL |

All of the above read/write the same data that is documented in this file.
