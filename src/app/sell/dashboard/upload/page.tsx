"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AdminCategorySelect from "@/components/AdminCategorySelect";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

const ORANGE = "#f25a2a";

export default function SellerUploadPage() {
  const { customerUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null]);
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/store/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

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
    setImageUrls((p) => { const next = [...p]; next[i] = url; return next; });
    setImageFiles((p) => { const next = [...p]; next[i] = null; return next; });
  };
  const setImageFileAt = (i: number, file: File | null) => {
    setImageFiles((p) => { const next = [...p]; next[i] = file; return next; });
    if (file) setImageUrls((p) => { const n = [...p]; n[i] = ""; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!customerUser?.email) {
      setMessage({ type: "err", text: "You must be logged in." });
      return;
    }
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
        } else if (url) collectedImages.push(url);
      }
      if (collectedImages.length === 0) {
        setMessage({ type: "err", text: "Add at least one product image." });
        setSubmitting(false);
        return;
      }
      const r = await fetch("/api/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          price: numPrice,
          image: collectedImages[0],
          images: collectedImages,
          categorySlug,
          description: description.trim() || undefined,
          sellerEmail: customerUser.email,
        }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err?.error || "Failed");
      }
      setMessage({ type: "ok", text: "Product uploaded successfully." });
      setTitle("");
      setPrice("");
      setImageUrls([""]);
      setImageFiles([null]);
      setDescription("");
      setCategorySlug("");
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed to upload product." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Upload product</h2>
        <Link href="/sell/dashboard" className="text-sm text-gray-600 hover:text-gray-800">
          ← Dashboard
        </Link>
      </div>

      <div className="max-w-lg bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-sm text-gray-600 mb-4">Select an existing category. You cannot add new categories.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}>{message.text}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs) *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Category * (select only)</label>
            <AdminCategorySelect
              categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
              value={categorySlug}
              onChange={setCategorySlug}
              placeholder="Select category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product images (1–5). First = main.</label>
            {imageUrls.map((url, i) => (
              <div key={i} className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFileAt(i, e.target.files?.[0] ?? null)}
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-gray-800 text-sm w-36"
                />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setImageUrlAt(i, e.target.value)}
                  placeholder="Or paste image URL"
                  className="flex-1 min-w-[120px] rounded-lg border border-gray-300 px-3 py-2 text-gray-800 text-sm"
                />
                {imageUrls.length > 1 && (
                  <button type="button" onClick={() => removeImageSlot(i)} className="text-red-600 text-sm">Remove</button>
                )}
              </div>
            ))}
            {imageUrls.length < 5 && (
              <button type="button" onClick={addImageSlot} className="mt-2 text-sm font-medium hover:underline" style={{ color: ORANGE }}>+ Add another image</button>
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
            className="w-full rounded-lg text-white py-2.5 font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: ORANGE }}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading…
              </>
            ) : "Upload product"}
          </button>
        </form>
      </div>
    </div>
  );
}
