# MySQL Setup Guide – Onmart

Is guide mein bataya gaya hai ke aap Onmart project ko MySQL 8.0 ke sath kaise run karenge aur saara data (signup, login, admin, products, orders, categories, banners) MySQL mein kaise store hoga.

## 1. MySQL 8.0 par database banao

1. **MySQL 8.0 Command Line Client** open karo (Windows Search mein "MySQL 8.0 Command Line Client" likho).
2. Apna MySQL root password daalo (jab install kiya tha tab set kiya tha).
3. Neeche command chalao:

```sql
CREATE DATABASE onmart;
```

4. Exit karne ke liye: `exit`

Agar aapka password empty hai to `CREATE DATABASE onmart;` ke baad seed/migrate chalega. Agar password set hai to `.env` mein wahi use karna hoga.

---

## 2. Project mein environment set karo

1. Project root (`onmart` folder) mein **`.env`** file banao (agar nahi hai).
2. **`.env.example`** kholo aur usko copy karke `.env` banao, phir `DATABASE_URL` apne MySQL ke hisaab se set karo:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/onmart"
```

- `root` – MySQL username (agar alag user use karte ho to woh likho).
- `YOUR_PASSWORD` – MySQL password (agar koi password nahi to empty chhod do: `mysql://root:@localhost:3306/onmart`).
- `onmart` – database name (jo step 1 mein banaya).

---

## 3. Prisma generate aur database tables banao

Terminal project folder mein kholo aur ye commands chalao:

```bash
npx prisma generate
npx prisma db push
```

- `prisma generate` – Prisma client banata hai.
- `prisma db push` – MySQL mein saari tables (User, Category, Product, Order, etc.) create kar deta hai.

---

## 4. Admin user create karo (seed)

Admin login ke liye ek default admin user chahiye. Ye command chalao:

```bash
npx prisma db seed
```

Isse **admin@onmart.com** / **admin123** wala admin user create ho jata hai. Baad mein password MySQL ya kisi admin panel se change kar sakte ho.

---

## 5. App chalao

```bash
npm run dev
```

Browser mein `http://localhost:3000` kholo.

- **User signup:** `/register` – email + password MySQL (User table) mein save hoga.
- **User login:** `/login` ya navbar se Login – same User table se verify hoga.
- **Admin login:** `/admin` – sirf woh user login ho sakta hai jiska `isAdmin` true hai (e.g. seed wala admin@onmart.com).

---

## Data kahan store hota hai?

| Cheez           | MySQL table(s)        |
|-----------------|------------------------|
| User signup     | `User`                 |
| User / Admin login | `User` (verify)     |
| Categories      | `Category`             |
| Products        | `Product`, `ProductReview` |
| Orders          | `Order`, `OrderItem`   |
| Banners         | `Banner`               |
| Disabled categories | `DisabledCategorySlug` |

Saara data ab file ki jagah MySQL mein hai; koi `data/store.json` type file use nahi hoti.

---

## Agar error aaye

- **"Can't connect to MySQL"** – MySQL service run ho rahi hai confirm karo (Services mein "MySQL80" ya apna service check karo).
- **"Access denied"** – `.env` mein `DATABASE_URL` ka password sahi hona chahiye.
- **"Unknown database"** – Step 1 mein `CREATE DATABASE onmart;` chala lo.
- **Seed fail** – Pehle `npx prisma db push` chala lo, phir `npx prisma db seed`.

---

## Commands summary

| Kaam              | Command                 |
|-------------------|-------------------------|
| Tables create     | `npx prisma db push`    |
| Admin user seed   | `npx prisma db seed`    |
| Client regenerate | `npx prisma generate`   |
| App run           | `npm run dev`           |

Is tarah signup, login, admin side aur baki project ka sara data MySQL mein store aur integrate ho jata hai.
