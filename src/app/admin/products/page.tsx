"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface StoreProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  categorySlug: string;
  soldCount?: number;
  inStock?: boolean;
  hidden?: boolean;
}

const loadProducts = () =>
  fetch("/api/store/products?includeHidden=1")
    .then((r) => r.json())
    .then((d) => (Array.isArray(d) ? d : []))
    .catch(() => []);

export default function AdminProductsPage() {
  const [uploadedProducts, setUploadedProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hidingId, setHidingId] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    loadProducts().then((uploaded) => {
      setUploadedProducts(uploaded);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadProducts().then((uploaded) => {
      if (!cancelled) setUploadedProducts(uploaded);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    fetch(`/api/store/products?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        refresh();
      })
      .catch(() => alert("Failed to delete."))
      .finally(() => setDeletingId(null));
  };

  const handleHide = (id: string, currentlyHidden: boolean) => {
    setHidingId(id);
    const newHidden = !currentlyHidden;
    fetch(`/api/store/products?id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: newHidden }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        setUploadedProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, hidden: newHidden } : p))
        );
      })
      .catch(() => alert("Failed to update."))
      .finally(() => setHidingId(null));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Products</h2>
        <div className="flex gap-2">
          <Link href="/admin/upload" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            + Upload product
          </Link>
          <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-800">
            ← Dashboard
          </Link>
        </div>
      </div>

      {uploadedProducts.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-orange-50">
            <h3 className="font-medium text-gray-800">Products in database ({uploadedProducts.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-4 py-2 font-medium">Image</th>
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Price</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Stock</th>
                  <th className="px-4 py-2 font-medium">Sold</th>
                  <th className="px-4 py-2 font-medium w-28">Action</th>
                </tr>
              </thead>
              <tbody>
                {uploadedProducts.map((p) => (
                  <tr key={p.id} className={`border-t border-gray-100 hover:bg-gray-50 ${p.hidden ? "bg-gray-100 opacity-75" : ""}`}>
                    <td className="px-4 py-2">
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                        <Image src={p.image || "/placeholder.png"} alt="" fill className="object-contain" sizes="48px" />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{p.id}</td>
                    <td className="px-4 py-2 text-gray-800 max-w-[240px]">{p.title}</td>
                    <td className="px-4 py-2 text-gray-700">Rs. {p.price?.toLocaleString?.() ?? p.price}</td>
                    <td className="px-4 py-2 text-gray-600">{p.categorySlug}</td>
                    <td className="px-4 py-2">
                      <span className={p.inStock === false ? "text-red-600 font-medium" : "text-green-600"}>
                        {p.inStock === false ? "Out of Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-700 font-medium">{p.soldCount ?? 0}</td>
                    <td className="px-4 py-2 flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/products/${encodeURIComponent(p.id)}/edit`}
                        className="text-orange-600 hover:text-orange-700 text-xs font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="text-red-600 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                      >
                        {deletingId === p.id ? "…" : "Delete"}
                      </button>
                      {(p.inStock === false || p.hidden) && (
                        <button
                          type="button"
                          onClick={() => handleHide(p.id, !!p.hidden)}
                          disabled={hidingId === p.id}
                          className="text-slate-600 hover:text-slate-800 text-xs font-medium disabled:opacity-50"
                        >
                          {hidingId === p.id ? "…" : p.hidden ? "Unhide" : "Hide"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-gray-500">
          {loading ? "Loading products..." : "No products in database. Upload one from Upload Product."}
        </div>
      )}
    </div>
  );
}
