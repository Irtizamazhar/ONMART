# Onmart – Next.js Frontend

A **production-ready frontend** for **Onmart** (online shopping) built with **Next.js 14**, **Tailwind CSS**, and **Axios**. Ready to zip and run, with a clean structure and responsive UI.

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS**
- **Axios** (API layer)
- **TypeScript**

## Project Structure

```
daraz-clone/
├── public/
├── src/
│   ├── app/
│   │   ├── cart/page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── product-details/[id]/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx (Home)
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CategoryMenu.tsx
│   │   ├── Slider.tsx
│   │   └── Loader.tsx
│   ├── context/
│   │   └── CartContext.tsx
│   ├── services/
│   │   └── api.ts
│   └── ...
├── package.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

## Installation & Run

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

**One command runs everything:** User site (home, cart, products) and Admin panel both run from the same server. No need to run anything separately.
- **User site:** [http://localhost:3000](http://localhost:3000)
- **Admin panel:** [http://localhost:3000/admin](http://localhost:3000/admin) (login: admin@onmart.com / admin123)

## Build for Production

```bash
npm run build
npm start
```

## Features

- **Home page** – Category menu, **promotional banners** (add images to `public/banners/` as banner1.png … banner10.png), flash sale section, and product grid
- **Mega category menu** – Categories dropdown and quick links
- **Navbar** – Logo, search bar, Login/Register, Cart icon with count
- **Product listing** – Grid with add-to-cart; filter by category via URL (`?category=electronics`)
- **Product details** – Image, price, description, quantity, add to cart
- **Cart** – Add/remove items, update quantity, order summary, proceed to checkout (UI only)
- **Login / Register** – Mock auth (localStorage); ready to connect to your backend
- **Responsive** – Desktop, tablet, and mobile
- **API** – Axios service using [FakeStore API](https://fakestoreapi.com); easy to swap for your backend via `NEXT_PUBLIC_API_URL`

## Backend Preparation

- `src/services/api.ts` – Axios instance and product/category helpers
- Environment variable `NEXT_PUBLIC_API_URL` for your API base URL
- Commented placeholders for auth and cart API calls

**Built-in store (file-based):** Orders, admin-uploaded products, categories, and banners are stored in `data/store.json`. See **DATA_STORE.md** for what is stored, API list, and how to replace with a real database.

## Zip-Ready

You can zip the `daraz-clone` folder (excluding `node_modules` and `.next`). To run elsewhere:

```bash
unzip daraz-clone.zip
cd daraz-clone
npm install
npm run dev
```

---

**Note:** This is a frontend-only clone. Login/Register and checkout are mock flows. Connect your own backend for real auth and orders.
