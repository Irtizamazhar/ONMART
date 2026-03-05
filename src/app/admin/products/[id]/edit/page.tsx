"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminCategorySelect from "@/components/AdminCategorySelect";
import Loader from "@/components/Loader";
import { useDelayedLoader } from "@/hooks/useDelayedLoader";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

interface ProductData {
  id: string;
  title: string;
  titleUr?: string;
  titleZh?: string;
  price: number;
  image: string;
  images?: string[];
  categorySlug: string;
  description?: string;
  sectionSlug?: string | null;
  inStock?: boolean;
  originalPrice?: number | null;
  discountPercent?: number | null;
}

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const showLoader = useDelayedLoader(loading, 200);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null]);
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [sectionSlug, setSectionSlug] = useState("");
  const [inStock, setInStock] = useState(true);
  const [discountPercent, setDiscountPercent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch(`/api/store/products?id=${encodeURIComponent(id)}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/store/categories").then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])).catch(() => []),
    ]).then(([p, custom]) => {
      if (cancelled) return;
      setCustomCategories(custom);
      if (p) {
        setProduct(p);
        setTitle(p.title || "");
        setPrice(String(p.price ?? ""));
        setDescription(p.description || "");
        setCategorySlug(p.categorySlug || "");
        setSectionSlug(p.sectionSlug || "");
        setInStock(p.inStock !== false);
        setDiscountPercent(p.discountPercent != null ? String(p.discountPercent) : "");
        const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : [""]);
        setImageUrls(imgs.length ? imgs : [""]);
        setImageFiles(imgs.map(() => null));
      } else {
        setProduct(null);
      }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const addImageSlot = () => {
    if (imageUrls.length >= 5) return;
    setImageUrls((p) => [...p, ""]);
    setImageFiles((p) => [...p, null]);
  };
  const removeImageSlot = (i: number) => {
    setImageUrls((p) => p.filter((_, j) => j !== i));
    setImageFiles((p) => p.filter((_, j) => j !== i));
  };
  const setImageUrlAt = (i: number, url: string) => {
    setImageUrls((p) => { const n = [...p]; n[i] = url; return n; });
    setImageFiles((p) => { const n = [...p]; n[i] = null; return n; });
  };
  const setImageFileAt = (i: number, file: File | null) => {
    setImageFiles((p) => { const n = [...p]; n[i] = file; return n; });
    if (file) setImageUrls((prev) => { const n = [...prev]; n[i] = ""; return n; });
  };

  const allCategories = customCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setMessage(null);
    if (!title.trim()) {
      setMessage({ type: "err", text: "Product title is required." });
      return;
    }
    if (!categorySlug) {
      setMessage({ type: "err", text: "Please select a category." });
      return;
    }
    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      setMessage({ type: "err", text: "Enter a valid price." });
      return;
    }
    setSubmitting(true);
    const collectedImages: string[] = [];
    try {
      for (let i = 0; i < imageUrls.length; i++) {
        const file = imageFiles[i];
        const url = imageUrls[i]?.trim();
        if (file) {
          const form = new FormData();
          form.append("file", file);
          form.append("folder", "products");
          const up = await fetch("/api/upload", { method: "POST", body: form });
          if (!up.ok) throw new Error("Upload failed for image " + (i + 1));
          const d = await up.json();
          if (d.url) collectedImages.push(d.url);
        } else if (url) {
          collectedImages.push(url);
        }
      }
      if (collectedImages.length === 0 && product) {
        const existing = Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : (product.image ? [product.image] : []);
        if (existing.length > 0) collectedImages.push(...existing);
      }
      if (collectedImages.length === 0) {
        setMessage({ type: "err", text: "Add at least one product image." });
        setSubmitting(false);
        return;
      }
      const r = await fetch(`/api/store/products?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          price: numPrice,
          image: collectedImages[0],
          images: collectedImages,
          categorySlug,
          description: description.trim() || undefined,
          sectionSlug: sectionSlug.trim() || null,
          inStock,
          discountPercent: sectionSlug && sectionSlug.trim() && discountPercent.trim() !== "" && !Number.isNaN(Number(discountPercent)) && Number(discountPercent) >= 0 && Number(discountPercent) <= 100 ? Math.round(Number(discountPercent)) : null,
        }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err?.error || "Failed to update");
      }
      setMessage({ type: "ok", text: "Product updated successfully." });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed to update product." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        {showLoader ? <Loader /> : (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-9 h-9 border-2 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }
  if (!product) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600 mb-4">Product not found.</p>
        <Link href="/admin/products" className="text-orange-600 hover:underline">← Back to Products</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Edit product</h2>
        <div className="flex gap-2">
          <Link href="/admin/products" className="text-sm text-gray-600 hover:text-gray-800">
            ← Products
          </Link>
          <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-800">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-lg bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product name (English)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <AdminCategorySelect
              categories={allCategories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
              value={categorySlug}
              onChange={setCategorySlug}
              placeholder="Select category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Show in section (optional)</label>
            <select
              value={sectionSlug}
              onChange={(e) => setSectionSlug(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
            >
              <option value="">None</option>
              <option value="flash">Flash Sale</option>
              <option value="top-deals">Top Deals</option>
              <option value="clearance">Clearance Sale</option>
            </select>
          </div>
          {sectionSlug && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount % (optional – store par yahi % dikhega)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="e.g. 10, 25, 50"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
              />
              <p className="text-xs text-gray-500 mt-0.5">Jitna % yahan daaloge, utna hi store par dikhega.</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editInStock"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="editInStock" className="text-sm font-medium text-gray-700">In Stock (uncheck for Out of Stock)</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product images (1–5): upload or paste URL. First = main.
            </label>
            {imageUrls.map((url, i) => (
              <div key={i} className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFileAt(i, e.target.files?.[0] ?? null)}
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-gray-800 text-sm w-36"
                />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setImageUrlAt(i, e.target.value)}
                  placeholder="Or paste image URL / path"
                  className="flex-1 min-w-[120px] rounded-lg border border-gray-300 px-3 py-2 text-gray-800 text-sm"
                />
                {imageUrls.length > 1 && (
                  <button type="button" onClick={() => removeImageSlot(i)} className="text-red-600 text-sm">Remove</button>
                )}
              </div>
            ))}
            {imageUrls.length < 5 && (
              <button type="button" onClick={addImageSlot} className="mt-2 text-sm text-orange-600 hover:underline">+ Add another image</button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-orange-500 text-white py-2.5 font-medium hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving…
              </>
            ) : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
