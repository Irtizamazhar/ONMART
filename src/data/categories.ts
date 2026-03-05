// Single source of truth for all categories – used in CategoryMenu and Home section title
export const CATEGORIES = [
  { name: "Groceries & Pets", slug: "groceries", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop" },
  { name: "Health & Beauty", slug: "health", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=80&h=80&q=80" },
  { name: "Men's Fashion", slug: "men's clothing", image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=80&h=80&fit=crop" },
  { name: "Women's Fashion", slug: "women's clothing", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=80&h=80&fit=crop" },
  { name: "Mother & Baby", slug: "mother-baby", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=80&h=80&fit=crop" },
  { name: "Home & Lifestyle", slug: "home", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=80&h=80&fit=crop" },
  { name: "Electronic Devices", slug: "electronics", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&h=80&fit=crop" },
  { name: "Electronic Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop" },
  { name: "TV & Home Appliances", slug: "appliances", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop" },
  { name: "Sports & Outdoor", slug: "sports", image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=80&h=80&q=80" },
  { name: "Watches, Bags & Jewellery", slug: "jewelery", image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=80&h=80&fit=crop" },
  { name: "Automotive & Motorbike", slug: "automotive", image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=80&h=80&fit=crop" },
] as const;

export function getCategoryName(slug: string | null): string | null {
  if (!slug) return null;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  return cat ? cat.name : null;
}
