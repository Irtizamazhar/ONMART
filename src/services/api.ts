import axios from "axios";

// Base URL: FakeStore API (replace with your backend URL when ready)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://fakestoreapi.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Products – fetch more for Onmart (FakeStore returns max 20 per call; we combine categories for more)
export const fetchProducts = async (limit = 24) => {
  const { data } = await api.get(`/products?limit=${limit}`);
  return data;
};

export const fetchAllProducts = async () => {
  const categories = ["electronics", "jewelery", "men's clothing", "women's clothing"];
  const results = await Promise.all(
    categories.map((cat) => api.get(`/products/category/${cat}`).then((r) => r.data))
  );
  const seen = new Set<number>();
  const combined: unknown[] = [];
  results.flat().forEach((p: { id: number }) => {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      combined.push(p);
    }
  });
  return combined;
};

export const fetchProductById = async (id: string) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const fetchCategories = async () => {
  const { data } = await api.get("/products/categories");
  return data;
};

// Map UI category slugs to real FakeStore API categories so that
// every visible category on Onmart actually returns products.
// If a slug is not in this map, we fall back to using it directly.
const CATEGORY_ALIASES: Record<string, string> = {
  groceries: "men's clothing",
  health: "women's clothing",
  "men's clothing": "men's clothing",
  "women's clothing": "women's clothing",
  "mother-baby": "women's clothing",
  home: "electronics",
  electronics: "electronics",
  accessories: "electronics",
  appliances: "electronics",
  sports: "electronics",
  jewellery: "jewelery",
  automotive: "electronics",
};

export const fetchProductsByCategory = async (category: string) => {
  const apiCategory = CATEGORY_ALIASES[category] ?? category;
  const { data } = await api.get(`/products/category/${apiCategory}`);
  return data;
};

// Future: auth, cart, orders - ready for backend integration
// export const login = (credentials) => api.post('/auth/login', credentials);
// export const register = (user) => api.post('/auth/register', user);
// export const getCart = () => api.get('/cart');
// export const addToCart = (item) => api.post('/cart', item);

export default api;
