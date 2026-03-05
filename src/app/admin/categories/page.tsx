"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  nameUr?: string | null;
  nameZh?: string | null;
  slug: string;
  image: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [disabledSlugs, setDisabledSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [disablingSlug, setDisablingSlug] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"hide" | "delete" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (message?.type === "ok") {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/store/categories").then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])).catch(() => []),
      fetch("/api/store/disabled-categories").then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])).catch(() => []),
    ]).then(([cats, disabled]) => {
      setCategories(cats);
      setDisabledSlugs(disabled);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemoveCustom = (id: string) => {
    if (!confirm("Remove this category from the list?")) return;
    setDeletingId(id);
    fetch(`/api/store/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        load();
      })
      .catch(() => alert("Failed to remove category."))
      .finally(() => setDeletingId(null));
  };

  const handleDisableDefault = (slug: string) => {
    if (!confirm("Hide this category from the site?")) return;
    setDisablingSlug(slug);
    fetch("/api/store/disabled-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, disabled: true }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        load();
      })
      .catch(() => alert("Failed."))
      .finally(() => setDisablingSlug(null));
  };

  const handleEnableDefault = (slug: string) => {
    setDisablingSlug(slug);
    fetch("/api/store/disabled-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, disabled: false }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        load();
      })
      .catch(() => alert("Failed."))
      .finally(() => setDisablingSlug(null));
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === categories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(categories.map((c) => c.id)));
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const handleBulkHide = async () => {
    const slugs = categories.filter((c) => selectedIds.has(c.id)).map((c) => c.slug);
    if (slugs.length === 0) return;
    if (!confirm(`Hide ${slugs.length} category/categories from the site?`)) return;
    setBulkAction("hide");
    try {
      for (const slug of slugs) {
        await fetch("/api/store/disabled-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, disabled: true }),
        });
      }
      load();
      setSelectedIds(new Set());
    } finally {
      setBulkAction(null);
    }
  };
  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (!confirm(`Permanently delete ${ids.length} category/categories?`)) return;
    setBulkAction("delete");
    try {
      for (const id of ids) {
        await fetch(`/api/store/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      }
      load();
      setSelectedIds(new Set());
    } finally {
      setBulkAction(null);
    }
  };

  const openEdit = (c: Category) => {
    setEditingCategory(c);
    setEditName(c.name);
    setEditSlug(c.slug);
    setEditImage(c.image || "");
    setEditImageFile(null);
    setEditError("");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setEditError("");
    if (!editName.trim()) {
      setEditError("Name is required.");
      return;
    }
    const slugVal = editSlug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!slugVal) {
      setEditError("Slug is required.");
      return;
    }
    setEditSubmitting(true);
    const doPatch = (imageUrl?: string) => {
      const body: { id: string; name: string; slug: string; image?: string } = {
        id: editingCategory.id,
        name: editName.trim(),
        slug: slugVal,
      };
      if (imageUrl !== undefined) body.image = imageUrl;
      fetch("/api/store/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
        .then(({ ok, data }) => {
          if (!ok) throw new Error(data?.error || "Failed to update.");
          setMessage({ type: "ok", text: "Category updated." });
          setEditingCategory(null);
          load();
        })
        .catch((err) => setEditError(err?.message || "Failed to update category."))
        .finally(() => setEditSubmitting(false));
    };
    if (editImageFile) {
      const form = new FormData();
      form.append("file", editImageFile);
      form.append("folder", "categories");
      fetch("/api/upload", { method: "POST", body: form })
        .then((r) => r.json())
        .then((d) => doPatch(d?.url || ""))
        .catch(() => {
          setEditError("Image upload failed.");
          setEditSubmitting(false);
        });
    } else {
      doPatch(editImage.trim());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!name.trim()) {
      setMessage({ type: "err", text: "Category name is required." });
      return;
    }
    const s = name.trim().toLowerCase().replace(/\s+/g, "-");
    setSubmitting(true);
    const doSubmit = (imageUrl: string) => {
      fetch("/api/store/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: s, image: imageUrl }),
      })
        .then((r) => {
          if (!r.ok) return r.json().then((d) => Promise.reject(d));
          return r.json();
        })
        .then(() => {
          setMessage({ type: "ok", text: "Category added successfully." });
          setName("");
          setImage("");
          setImageFile(null);
          load();
        })
        .catch((err) => {
          setMessage({ type: "err", text: err?.error || "Failed to add category." });
        })
        .finally(() => setSubmitting(false));
    };
    if (imageFile) {
      const form = new FormData();
      form.append("file", imageFile);
      form.append("folder", "categories");
      fetch("/api/upload", { method: "POST", body: form })
        .then((r) => r.json())
        .then((d) => doSubmit(d?.url || ""))
        .catch(() => {
          setMessage({ type: "err", text: "Image upload failed." });
          setSubmitting(false);
        });
    } else {
      doSubmit(image.trim());
    }
  };

  return (
    <div>
      {message?.type === "ok" &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="alert"
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-6 p-4"
            aria-live="polite"
          >
            <div className="rounded-lg border-2 border-orange-400 bg-orange-50 px-6 py-4 text-orange-900 shadow-xl">
              <span className="font-medium">{message.text}</span>
            </div>
          </div>,
          document.body
        )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
        <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-800">
          ← Dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="font-medium text-gray-800 mb-3">Add category</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            {message && message.type === "err" && (
              <p className="text-sm text-red-600">{message.text}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mobile Phones"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image: upload from laptop or paste URL (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setImageFile(f);
                    setImage("");
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 text-sm"
              />
              {imageFile && <p className="mt-1 text-xs text-gray-500">Selected: {imageFile.name}</p>}
              <input
                type="url"
                value={image}
                onChange={(e) => { setImage(e.target.value); setImageFile(null); }}
                placeholder="Or paste image URL"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
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
              ) : "Add category"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-3">
              <h3 className="font-medium text-gray-800">Your custom categories</h3>
              {categories.length > 0 && (
                <>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === categories.length && categories.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                    Select all
                  </label>
                  {selectedIds.size > 0 && (
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleBulkHide}
                        disabled={!!bulkAction}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium disabled:opacity-50"
                      >
                        {bulkAction === "hide" ? "…" : "Hide"}
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        disabled={!!bulkAction}
                        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        {bulkAction === "delete" ? "…" : "Delete"}
                      </button>
                    </span>
                  )}
                </>
              )}
            </div>
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading…</div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No custom categories yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {categories.map((c) => {
                  const isHidden = disabledSlugs.includes(c.slug);
                  return (
                    <li key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded border-gray-300 shrink-0"
                      />
                      <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 shrink-0">
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-gray-400 text-xs">—</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 truncate">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.slug}{isHidden ? " (hidden)" : ""}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => isHidden ? handleEnableDefault(c.slug) : handleDisableDefault(c.slug)}
                          disabled={disablingSlug === c.slug}
                          className={isHidden ? "text-green-600 hover:text-green-700 text-xs font-medium disabled:opacity-50" : "text-amber-600 hover:text-amber-700 text-xs font-medium disabled:opacity-50"}
                        >
                          {disablingSlug === c.slug ? "…" : isHidden ? "Show" : "Hide"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustom(c.id)}
                          disabled={deletingId === c.id}
                          className="text-red-600 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                        >
                          {deletingId === c.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {editingCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit category</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              {editError && <p className="text-sm text-red-600">{editError}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  placeholder="e.g. mobile-phones"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image: upload or URL (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setEditImageFile(f); setEditImage(""); }
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 text-sm"
                />
                <input
                  type="url"
                  value={editImage}
                  onChange={(e) => { setEditImage(e.target.value); setEditImageFile(null); }}
                  placeholder="Or paste image URL"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 rounded-lg bg-orange-500 text-white py-2.5 font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {editSubmitting ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingCategory(null); setEditError(""); }}
                  disabled={editSubmitting}
                  className="px-4 rounded-lg border border-gray-300 text-gray-700 py-2.5 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
