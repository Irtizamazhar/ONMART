"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/components/ProductCard";
import Image from "next/image";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [topSelling, setTopSelling] = useState<Product[]>([]);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/store/products").then((r) => r.json()).then((d) => (Array.isArray(d) ? (d as Product[]) : [])).catch(() => []),
      fetch("/api/store/products?bestSelling=1&limit=10").then((r) => r.json()).then((d) => (Array.isArray(d) ? (d as Product[]) : [])).catch(() => []),
      fetch("/api/store/orders").then((r) => r.json()).then((d) => (Array.isArray(d) ? d.length : 0)).catch(() => 0),
    ]).then(([prods, best, ordCount]) => {
      if (!cancelled) {
        setProducts(prods);
        setTopSelling(best);
        setOrdersCount(ordCount);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "..." : products.length}
          </p>
        </div>
        <Link href="/admin/orders" className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:border-orange-200 block">
          <p className="text-sm text-gray-500">Orders</p>
          <p className="text-2xl font-bold text-gray-800">{loading ? "..." : ordersCount}</p>
        </Link>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Users</p>
          <p className="text-2xl font-bold text-gray-800">—</p>
          <p className="text-xs text-gray-400">Coming soon</p>
        </div>
      </div>

      {topSelling.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-800">Top Selling Products</h3>
            <Link
              href="/admin/products"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-4 py-2 font-medium">Image</th>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Price</th>
                  <th className="px-4 py-2 font-medium">Sold</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {topSelling.slice(0, 10).map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100">
                        <Image src={p.image || "/placeholder.png"} alt="" fill className="object-contain" sizes="40px" />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-800 max-w-[200px] truncate">{p.title}</td>
                    <td className="px-4 py-2 text-gray-700">Rs. {p.price?.toLocaleString?.() ?? p.price}</td>
                    <td className="px-4 py-2 font-medium text-gray-800">{(p as { soldCount?: number }).soldCount ?? 0}</td>
                    <td className="px-4 py-2 text-gray-600">{(p as { categorySlug?: string }).categorySlug ?? p.category ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-medium text-gray-800">Recent Products</h3>
          <Link
            href="/admin/products"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-4 py-2 font-medium">Image</th>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Price</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 10).map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100">
                        <Image
                          src={p.image || "/placeholder.png"}
                          alt=""
                          fill
                          className="object-contain"
                          sizes="40px"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-800 max-w-[200px] truncate">
                      {p.title}
                    </td>
                    <td className="px-4 py-2 text-gray-700">Rs. {p.price?.toLocaleString?.() ?? p.price}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {(p as { categorySlug?: string }).categorySlug ?? p.category ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
