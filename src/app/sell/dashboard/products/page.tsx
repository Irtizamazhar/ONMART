"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface StoreProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  categorySlug: string;
  soldCount?: number;
  inStock?: boolean;
}

export default function SellerProductsPage() {
  const { customerUser } = useAuth();
  const sellerEmail = customerUser?.email ?? "";
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    if (!sellerEmail) return Promise.resolve([]);
    return fetch(`/api/store/products?sellerEmail=${encodeURIComponent(sellerEmail)}`)
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : []))
      .catch(() => []);
  };

  useEffect(() => {
    if (!sellerEmail) return;
    setLoading(true);
    loadProducts().then(setProducts).finally(() => setLoading(false));
  }, [sellerEmail]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Your Products</h2>
        <div className="flex gap-2">
          <Link href="/sell/dashboard/upload" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            + Upload product
          </Link>
          <Link href="/sell/dashboard" className="text-sm text-gray-600 hover:text-gray-800">
            ← Dashboard
          </Link>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-orange-50">
            <h3 className="font-medium text-gray-800">Products ({products.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-4 py-2 font-medium">Image</th>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Price</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Sold</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                        <Image src={p.image || "/placeholder.png"} alt="" fill className="object-contain" sizes="48px" />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-800 max-w-[240px]">{p.title}</td>
                    <td className="px-4 py-2 text-gray-700">Rs. {p.price?.toLocaleString?.() ?? p.price}</td>
                    <td className="px-4 py-2 text-gray-600">{p.categorySlug}</td>
                    <td className="px-4 py-2 text-gray-700 font-medium">{p.soldCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-gray-500">
          {loading ? "Loading products..." : "No products yet. Upload one from Upload Product."}
        </div>
      )}
    </div>
  );
}
