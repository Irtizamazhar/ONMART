# Onmart – Project, API & Data Guide (تفصیلی رہنما)

Yeh document batata hai ke **kahan kya data hai**, **kaun si API kahan hai**, aur **kis page/component mein kya use hota hai**.

---

## 1. Database (MySQL + Prisma)

- **Schema file:** `prisma/schema.prisma`
- **Connection:** `src/lib/db.ts` – `prisma` client (MySQL `DATABASE_URL` from `.env`)

### Tables (Models)

| Model | Purpose |
|-------|--------|
| **User** | Customer login (email, passwordHash, name, phone, isAdmin). Used for store login, signup, profile, orders. |
| **Admin** | Admin login (email, passwordHash, name). Separate from User. |
| **OtpVerification** | OTP codes for phone login (phone, code, expiresAt). |
| **Category** | Product categories (name, nameUr, nameZh, nameTranslations, slug, image). |
| **Product** | Products (title, price, image, images, categorySlug, description, sectionSlug, rating, ratingCount, soldCount, inStock, hidden, etc.). |
| **ProductReview** | Reviews on products (productId, author, reviewerEmail, text, rating). |
| **Banner** | Home page banners (src, href, label). |
| **Order** | Orders (email, name, phone, address, city, province, area, total, status, items). |
| **OrderItem** | Order line items (orderId, productId, title, price, quantity, image). |
| **DisabledCategorySlug** | Category slugs that are disabled/hidden from store (slug only). |
| **PasswordResetToken** | Password reset links (email, token, expiresAt). |

---

## 2. Data Files (Code / Static Data)

| File | Kya hai | Kahan use hota hai |
|------|---------|---------------------|
| **src/data/categories.ts** | Default categories list (name, slug, image). Groceries, Health, Men's/Women's Fashion, Electronics, etc. | CategoryMenu, Home section titles, API categories upsert. |
| **src/data/sections.ts** | Home sections: `flash`, `top-deals`, `new-arrivals`, `clearance`. Labels translation keys. | Products API (section filter), Admin section dropdown, Home section blocks + View All. |
| **src/data/translations.ts** | Multi-language strings (en, ur, zh, ar, hi, …) – nav, footer, home, product, cart, auth, etc. | `useLanguage()` / `t("key")` across app. |

---

## 3. Lib (Shared Logic)

| File | Kya karta hai |
|------|----------------|
| **src/lib/db.ts** | Prisma client export. |
| **src/lib/auth.ts** | Password hash/verify, `userToJson`, `adminToJson`. |
| **src/lib/translate.ts** | `translateToAll(title)` – product/category name se multi-language translations. |
| **src/lib/displayName.ts** | `getProductDisplayTitle(product, language)` – product title by language. |
| **src/lib/phone.ts** | `normalizePhoneToE164(phone)` – phone number normalize. |
| **src/lib/sms.ts** | OTP send (Twilio) + rate limit + verify (Twilio ya DB). |
| **src/lib/otp.ts** | OTP generate/store/verify (DB). |
| **src/lib/seedFromFakeApi.ts** | FakeStore API se products fetch karke DB mein insert (seed). |

---

## 4. APIs – Full List

### 4.1 Auth APIs (`src/app/api/auth/`)

| Route | Method | Purpose | Body/Params |
|-------|--------|--------|-------------|
| **/api/auth/login** | POST | Customer login (email ya phone + password) | `{ email, password }` |
| **/api/auth/register** | POST | Customer signup (email + password) | `{ email, password, name? }` |
| **/api/auth/login-admin** | POST | Admin login | `{ email, password }` |
| **/api/auth/profile** | PATCH | Update customer name (current password required for email users) | `{ email, name?, currentPassword? }` |
| **/api/auth/forgot-password** | POST | Password reset link bhejna | `{ email }` |
| **/api/auth/reset-password** | POST | Token se password set karna | `{ token, newPassword }` |
| **/api/auth/otp/request** | POST | Phone par OTP bhejna | `{ phone }` |
| **/api/auth/otp/verify** | POST | OTP verify + login/signup (phone user create) | `{ phone, code, name?, password? }` |

**Kahan use:**  
Login page (OTP request), Signup (OTP), Forgot/Reset password pages, Account (profile), Admin login.

---

### 4.2 Store APIs (`src/app/api/store/`)

| Route | Method | Purpose | Params / Body |
|-------|--------|--------|----------------|
| **/api/store/products** | GET | Products list ya single product | **Query:** `id`, `category`, `section`, `bestSelling=1`, `includeHidden=1`, `limit`, `email` (reviews “mine”). Single: `?id=xxx`. List: `?category=slug` / `?section=flash|top-deals|new-arrivals|clearance` / `?bestSelling=1&limit=8`. Hidden products by default filter; admin ke liye `includeHidden=1`. |
| **/api/store/products** | POST | Naya product create (admin) | Body: title, price, image, categorySlug, description?, sectionSlug?, inStock?, titleUr?, titleZh?, images? |
| **/api/store/products** | PATCH | Product update (admin) | Query: `?id=productId`. Body: title, price, image, categorySlug, description?, sectionSlug?, inStock?, hidden?, etc. |
| **/api/store/products** | DELETE | Product delete (admin) | Query: `?id=productId` |
| **/api/store/products/[id]/reviews** | GET | User ki existing review (product page “Change review”) | Query: `?email=xxx` |
| **/api/store/products/[id]/reviews** | POST | Review submit (sirf delivered order wale user) | Body: email, author, rating (1–5), text? |
| **/api/store/products/[id]/reviews** | PATCH | Review update | Body: email, text?, rating? |
| **/api/store/products/[id]/reviews** | DELETE | Review delete | Body: email, reviewId |
| **/api/store/categories** | GET | Saari categories (DB se; default categories upsert) | – |
| **/api/store/categories** | POST | Nayi category (admin) | Body: name, slug, image?, nameUr?, nameZh? |
| **/api/store/categories** | PATCH | Category edit (admin) | Body: id, name?, slug?, image?, nameUr?, nameZh? |
| **/api/store/categories** | DELETE | Category delete (admin) | Query: `?id=categoryId` |
| **/api/store/disabled-categories** | GET | Disabled category slugs list | – |
| **/api/store/disabled-categories** | POST | Category enable/disable (admin) | Body: slug, disabled (true/false) |
| **/api/store/banners** | GET | Saare banners (home carousel) | – |
| **/api/store/banners** | POST | Naya banner (admin) | Body: src, href?, label? |
| **/api/store/banners** | DELETE | Banner delete (admin) | Query: `?id=bannerId` |
| **/api/store/orders** | GET | Orders list (customer ya admin) | Query: `email=xxx` (customer), `includeCancelled=1` (admin) |
| **/api/store/orders** | POST | Naya order (checkout) | Body: email, name?, phone?, address?, city?, province?, area?, items[], total |
| **/api/store/orders** | PATCH | Order status update (admin) | Query: `?id=orderId`. Body: status (pending, packing, dispatched, delivered, cancelled) |
| **/api/store/search-suggestions** | GET | Search suggestions (categories + products) | Query: `?q=searchText` |
| **/api/store/can-review** | GET | Kya user is product par review kar sakta hai (delivered order) | Query: `?productId=xxx&email=xxx` → `{ canReview: true/false }` |
| **/api/store/seed-from-fake-api** | GET | FakeStore API se products seed karna | – |

**Kahan use:**  
- **Products:** Home (bestSelling, section=flash/top-deals/new-arrivals/clearance, category), product-details, checkout (single product), admin products/upload/edit.  
- **Categories:** CategoryMenu, product listing, admin categories, upload/edit product.  
- **Disabled categories:** Admin categories page (enable/disable).  
- **Banners:** Home Banners, admin banners.  
- **Orders:** Checkout (POST), Customer orders page (GET by email), Admin orders (GET all, PATCH status).  
- **Reviews:** Product details page (GET/POST/PATCH/DELETE), can-review for “Write review” button.  
- **Search:** Navbar/search – search-suggestions.

---

### 4.3 Upload API

| Route | Method | Purpose | Body |
|-------|--------|--------|------|
| **/api/upload** | POST | File upload (image) | FormData: `file`, `folder` (products | banners | categories). Saves in `public/uploads/<folder>/`. Returns `{ url }`. |

**Kahan use:** Admin upload product, edit product, banners, categories (image upload).

---

### 4.4 Store JSON (Legacy / Export)

- **File:** `src/app/api/store/route.ts`  
- **Data path:** `data/store.json` (project root ke andar `data/` folder).  
- **Content:** categories, products, banners, disabledCategorySlugs, orders – yeh structure read/write hota hai.  
- **Note:** Ab asal app **Prisma/MySQL** use karta hai; yeh route/store.json kisi UI se directly use nahi ho raha, lekin code mein defined hai (export/backup type use ho sakta hai).

---

## 5. Pages – Kon Si API / Data Use Karti Hai

| Page | APIs / Data |
|------|-------------|
| **Home (src/app/page.tsx)** | Products: `bestSelling=1&limit=8`, `section=flash|top-deals|new-arrivals|clearance`, `category=`, main list. Categories: GET /api/store/categories. |
| **Product details (product-details/[id])** | GET product by id, GET/POST/PATCH/DELETE reviews, GET can-review, categories. |
| **Checkout** | GET product by id (cart items), POST /api/store/orders. |
| **Customer Orders (orders)** | GET /api/store/orders?email=xxx. |
| **Account (account)** | PATCH /api/auth/profile. |
| **Login** | POST /api/auth/otp/request (phone OTP). |
| **Signup** | POST /api/auth/otp/request. |
| **Forgot password** | POST /api/auth/forgot-password. |
| **Reset password** | POST /api/auth/reset-password. |
| **Admin dashboard (admin)** | Products count, best selling, orders count (GET products, orders). |
| **Admin products list** | GET /api/store/products?includeHidden=1, DELETE product, PATCH product (Hide/Unhide). |
| **Admin upload product** | GET categories, POST /api/upload (image), POST /api/store/products. |
| **Admin edit product ([id]/edit)** | GET product by id, GET categories, POST /api/upload, PATCH /api/store/products. |
| **Admin categories** | GET categories, GET disabled-categories, POST/PATCH/DELETE categories, POST disabled-categories, POST /api/upload. |
| **Admin banners** | GET/POST/DELETE /api/store/banners, POST /api/upload. |
| **Admin orders** | GET /api/store/orders (includeCancelled=1), PATCH order status. |

---

## 6. Summary Table – “Kahan Kya Hai”

| Cheez | Location | Notes |
|-------|----------|--------|
| **Database** | MySQL (Prisma) | .env → DATABASE_URL |
| **Categories list (default)** | src/data/categories.ts | Slug, name, image – menu + API upsert |
| **Sections (flash, top-deals, …)** | src/data/sections.ts | Products section filter + home blocks |
| **Translations** | src/data/translations.ts | t("key") – en, ur, zh, etc. |
| **Products CRUD** | /api/store/products | GET list/single, POST, PATCH, DELETE |
| **Reviews** | /api/store/products/[id]/reviews | GET, POST, PATCH, DELETE |
| **Categories CRUD** | /api/store/categories | GET, POST, PATCH, DELETE |
| **Disabled categories** | /api/store/disabled-categories | GET, POST (slug, disabled) |
| **Banners** | /api/store/banners | GET, POST, DELETE |
| **Orders** | /api/store/orders | GET (email / admin), POST, PATCH (status) |
| **Search suggestions** | /api/store/search-suggestions | GET ?q= |
| **Can review check** | /api/store/can-review | GET ?productId=&email= |
| **Seed (FakeStore)** | /api/store/seed-from-fake-api | GET |
| **Auth (login, register, profile, reset, OTP)** | /api/auth/* | Login, signup, profile, forgot/reset, OTP |
| **Admin login** | /api/auth/login-admin | POST |
| **File upload** | /api/upload | POST FormData → public/uploads/ |
| **Store JSON (legacy)** | data/store.json | read/write in src/app/api/store/route.ts |

Agar kisi specific API ya page ka exact flow chahiye ho to batao, us hisse ko aur detail mein likh sakta hoon.
