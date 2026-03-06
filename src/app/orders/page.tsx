"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  id: number | string;
  productId?: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  email: string;
  name?: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const { customerUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const placed = searchParams.get("placed") === "1";

  const fetchOrders = () => {
    const email = customerUser?.email;
    if (!email) return;
    setLoading(true);
    fetch(`/api/store/orders?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!customerUser?.email) {
      setLoading(false);
      setOrders([]);
      return;
    }
    fetchOrders();
  }, [customerUser?.email]);

  const canCancel = (status: string) => {
    const s = (status || "").toLowerCase();
    return s === "pending";
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Cancel this order?")) return;
    const r = await fetch("/api/store/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: "cancelled" }),
    });
    if (r.ok) fetchOrders();
  };

  return (
    <main className="max-w-3xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">My Orders</h1>

      {placed && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
          Your order has been placed. You can see it below.
        </div>
      )}

      {!customerUser && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <p className="text-slate-600">Log in to see your orders.</p>
          <Link href="/" className="inline-block mt-4 text-[#f57224] font-semibold hover:underline">
            Continue shopping
          </Link>
        </div>
      )}

      {customerUser && loading && <p className="text-slate-500">Loading orders…</p>}

      {customerUser && !loading && orders.length === 0 && !placed && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <p className="text-slate-600">You have no orders yet.</p>
          <Link href="/" className="inline-block mt-4 text-[#f57224] font-semibold hover:underline">
            Continue shopping
          </Link>
        </div>
      )}

      {customerUser && !loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <span className="font-mono text-sm text-slate-500">#{order.id}</span>
                <span className="text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-medium">
                  {order.status}
                </span>
              </div>
              <ul className="text-slate-700 space-y-1 mb-3">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.productId ? (
                      <Link
                        href={`/product-details/${item.productId}`}
                        className="text-[#f57224] font-medium hover:underline"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span>{item.title}</span>
                    )}
                    {" "}× {item.quantity} — Rs. {(item.price * item.quantity).toLocaleString()}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-bold text-slate-800">Total: Rs. {order.total.toLocaleString()}</p>
                {canCancel(order.status) && (
                  <button
                    type="button"
                    onClick={() => handleCancel(order.id)}
                    className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
