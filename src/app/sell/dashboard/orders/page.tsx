"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  id: number | string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  area?: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

export default function SellerOrdersPage() {
  const { customerUser } = useAuth();
  const sellerEmail = customerUser?.email ?? "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelled, setShowCancelled] = useState(false);

  const fetchOrders = () => {
    if (!sellerEmail) return;
    setLoading(true);
    const q = new URLSearchParams({ sellerEmail });
    if (showCancelled) q.set("includeCancelled", "1");
    fetch(`/api/store/orders?${q}`)
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [sellerEmail, showCancelled]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-gray-800">Orders (your products only)</h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show cancelled
          </label>
          <Link href="/sell/dashboard" className="text-sm text-gray-600 hover:text-gray-800">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No orders containing your products yet. When customers buy your products, they will appear here.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50/50 border-b border-gray-100 last:border-b-0">
                <div className="mb-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-gray-500">#{order.id}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">{order.status}</span>
                    <span className="font-bold text-gray-800">Rs. {order.total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                  <p><span className="font-medium text-gray-800 min-w-[80px] inline-block">Name:</span> {order.name || "—"}</p>
                  <p><span className="font-medium text-gray-800 min-w-[80px] inline-block">Email:</span> {order.email}</p>
                  <p><span className="font-medium text-gray-800 min-w-[80px] inline-block">Phone:</span> {order.phone || "—"}</p>
                  <p><span className="font-medium text-gray-800 min-w-[80px] inline-block">Address:</span> {order.address || "—"}</p>
                  <p><span className="font-medium text-gray-800 min-w-[80px] inline-block">City/Area:</span> {[order.city, order.province, order.area].filter(Boolean).join(", ") || "—"}</p>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Items</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.title} × {item.quantity} — Rs. {(item.price * item.quantity).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Status: </span>
                  <span className="px-2 py-1 rounded text-sm font-medium bg-slate-100 text-slate-800">{order.status}</span>
                  <p className="text-xs text-gray-500 mt-1">Only admin can change order status.</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
