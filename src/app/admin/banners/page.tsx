"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Banner {
  id: string;
  src: string;
  href: string;
  label: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/store/banners")
      .then((r) => r.json())
      .then((d) => setBanners(Array.isArray(d) ? d : []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!src.trim() && !imageFile) {
      setMessage({ type: "err", text: "Upload an image or paste Image URL." });
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = src.trim();
      if (imageFile) {
        const form = new FormData();
        form.append("file", imageFile);
        form.append("folder", "banners");
        const up = await fetch("/api/upload", { method: "POST", body: form });
        if (!up.ok) throw new Error("Image upload failed");
        const d = await up.json();
        imageUrl = (d.url && typeof d.url === "string" ? d.url : "").trim();
      }
      if (!imageUrl) {
        setMessage({ type: "err", text: "Image is required. Upload a file or paste a valid image URL." });
        setSubmitting(false);
        return;
      }
      const r = await fetch("/api/store/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          src: imageUrl,
          label: label.trim() || "Banner",
        }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err?.error || "Failed");
      }
      setMessage({ type: "ok", text: "Carousel slide added. It will show on the home page." });
      setSrc("");
      setImageFile(null);
      setLabel("");
      load();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed to add banner." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this banner?")) return;
    setDeletingId(id);
    fetch(`/api/store/banners?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        load();
      })
      .catch(() => alert("Failed to delete banner."))
      .finally(() => setDeletingId(null));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Banners</h2>
        <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-800">
          ← Dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden order-2 lg:order-1">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-800">Your carousel slides</h3>
            <span className="text-sm font-semibold text-orange-600">
              {loading ? "…" : banners.length} {banners.length === 1 ? "banner" : "banners"} uploaded
            </span>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading…</div>
          ) : banners.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No carousel slides yet. Add one below to show on the home page.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {banners.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  <div className="w-20 h-12 rounded overflow-hidden bg-gray-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.src} alt={b.label} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{b.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    disabled={deletingId === b.id}
                    className="text-red-600 hover:text-red-700 text-xs font-medium shrink-0 disabled:opacity-50"
                  >
                    {deletingId === b.id ? "…" : "Remove"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 order-1 lg:order-2">
          <h3 className="font-medium text-gray-800 mb-3">Add carousel slide</h3>
          <p className="text-xs text-gray-500 mb-3">Carousel slides appear on the home page. Add at least one slide; all slides are stored in the database and shown in the carousel. Recommended size: 1200×400 px (or similar aspect ratio).</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            {message && (
              <p className={"text-sm " + (message.type === "ok" ? "text-green-600" : "text-red-600")}>
                {message.text}
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image: upload from laptop or paste URL *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setImageFile(f);
                    setSrc("");
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 text-sm"
              />
              {imageFile && <p className="mt-1 text-xs text-gray-500">Selected: {imageFile.name}</p>}
              <input
                type="url"
                value={src}
                onChange={(e) => { setSrc(e.target.value); setImageFile(null); }}
                placeholder="Or paste image URL"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label (alt text, optional)</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Summer Sale"
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
                  Adding…
                </>
              ) : "Add carousel slide"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
