"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelled, setShowCancelled] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`/api/store/orders${showCancelled ? "?includeCancelled=1" : ""}`)
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [showCancelled]);

  const STATUS_OPTIONS = ["pending", "packing", "dispatched", "delivered"];

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setStatusError(null);
    const r = await fetch("/api/store/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });
    if (r.ok) {
      fetchOrders();
    } else {
      const data = await r.json().catch(() => ({}));
      setStatusError(data?.error || `Failed to update status (${r.status})`);
    }
  };

  const handlePrint = async (order: Order) => {
    const r = await fetch("/api/store/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: "packing" }),
    });
    if (r.ok) fetchOrders();
    const win = window.open("", "_blank", "width=600,height=720");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>Packing Slip #${order.id}</title>
      <style>
        body{font-family:'Segoe UI',system-ui,sans-serif;padding:24px;max-width:520px;margin:0 auto;background:#f8fafc;color:#1e293b}
        .card{background:#fff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.08);padding:20px;margin-bottom:16px}
        h1{font-size:20px;margin:0 0 16px;color:#f57224}
        .row{margin:10px 0;font-size:14px}
        strong{display:inline-block;min-width:90px;color:#64748b}
        .tip{background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px;margin-top:20px;font-size:13px;color:#92400e}
        .tip strong{display:inline;min-width:0}
        ul{margin:8px 0;padding-left:20px}
        hr{border:0;border-top:1px solid#e2e8f0;margin:16px 0}
      </style>
      </head><body>
      <div class="card">
      <h1>Packing Slip — #${order.id}</h1>
      <div class="row"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
      <div class="row"><strong>Name:</strong> ${order.name || "—"}</div>
      <div class="row"><strong>Email:</strong> ${order.email}</div>
      <div class="row"><strong>Phone:</strong> ${order.phone || "—"}</div>
      <div class="row"><strong>Address:</strong> ${order.address || "—"}</div>
      <div class="row"><strong>City/Area:</strong> ${[order.city, order.province, order.area].filter(Boolean).join(", ") || "—"}</div>
      <hr/>
      <p><strong>Items:</strong></p>
      <ul>${order.items.map((i) => `<li>${i.title} × ${i.quantity} — Rs. ${(i.price * i.quantity).toLocaleString()}</li>`).join("")}</ul>
      <p><strong>Total: Rs. ${order.total.toLocaleString()}</strong></p>
      <p class="tip"><strong>Tip:</strong> In the Print dialog, choose <strong>Save as PDF</strong> or <strong>Microsoft Print to PDF</strong> to save this slip, or select your printer to print.</p>
      <p style="margin-top:16px;font-size:12px;color:#94a3b8">Onmart — Status set to Packing.</p>
      </div>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-gray-800">Orders</h2>
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
          <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-800">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {statusError && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-red-700 text-sm flex items-center justify-between gap-2">
            <span>{statusError}</span>
            <button type="button" onClick={() => setStatusError(null)} className="text-red-500 hover:text-red-700">×</button>
          </div>
        )}
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders yet. When customers place orders they will appear here.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order.id} id={`order-${order.id}`} className="p-4 sm:p-6 hover:bg-gray-50/50 order-card border-b border-gray-100 last:border-b-0">
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
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200">
                  <label className="text-sm text-gray-600">Status:</label>
                  {(order.status || "").toLowerCase() === "cancelled" ? (
                    <span className="px-2 py-1 rounded text-sm font-medium bg-red-100 text-red-800">Cancelled (by customer)</span>
                  ) : (
                    <>
                      <select
                        value={(order.status || "pending").toLowerCase()}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handlePrint(order)}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 print:hidden"
                      >
                        Print
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
