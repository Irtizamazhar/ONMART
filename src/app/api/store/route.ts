import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface StoreProductReview {
  id: string;
  author: string;
  text: string;
  rating: number;
  createdAt: string;
}

export interface StoreProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  images?: string[];
  categorySlug: string;
  description?: string;
  rating?: { rate: number; count: number };
  reviews?: StoreProductReview[];
}

export interface StoreBanner {
  id: string;
  src: string;
  href: string;
  label: string;
}

export interface OrderItem {
  id: number | string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface StoreOrder {
  id: string;
  email: string;
  name?: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  area?: string;
}

export interface Store {
  categories: StoreCategory[];
  products: StoreProduct[];
  banners: StoreBanner[];
  disabledCategorySlugs: string[];
  orders: StoreOrder[];
}

function readStore(): Store {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const data = JSON.parse(raw) as Partial<Store>;
    return {
      categories: Array.isArray(data.categories) ? data.categories : [],
      products: Array.isArray(data.products) ? data.products : [],
      banners: Array.isArray(data.banners) ? data.banners : [],
      disabledCategorySlugs: Array.isArray(data.disabledCategorySlugs) ? data.disabledCategorySlugs : [],
      orders: Array.isArray(data.orders) ? data.orders : [],
    };
  } catch {
    return { categories: [], products: [], banners: [], disabledCategorySlugs: [], orders: [] };
  }
}

function writeStore(store: Store) {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export { readStore, writeStore, STORE_PATH };
