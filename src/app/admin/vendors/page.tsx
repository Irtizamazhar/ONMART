"use client";

import { useEffect, useState } from "react";

interface VendorApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  shopName?: string;
  city?: string;
  address?: string;
  categories?: string;
  message?: string;
  cnicFront?: string;
  cnicBack?: string;
  cnicNumber?: string;
  storeImage?: string;
  vendorType?: string;
  warehouseImage?: string;
  status: string;
  createdAt: string;
}

export default function AdminVendorsPage() {
  const [list, setList] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VendorApplication | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewImage, setViewImage] = useState<{ src: string; title: string } | null>(null);

  const filteredList = searchQuery.trim()
    ? list.filter((v) => {
        const q = searchQuery.trim().toLowerCase();
        const name = (v.fullName || "").toLowerCase();
        const email = (v.email || "").toLowerCase();
        const shop = (v.shopName || "").toLowerCase();
        const cat = (v.categories || "").toLowerCase();
        const phone = (v.phone || "").replace(/\D/g, "");
        const qDigits = q.replace(/\D/g, "");
        return (
          name.includes(q) ||
          email.includes(q) ||
          shop.includes(q) ||
          cat.includes(q) ||
          (qDigits.length >= 4 && phone.includes(qDigits))
        );
      })
    : list;

  const fetchList = () => {
    setLoading(true);
    fetch("/api/admin/vendor-applications")
      .then((r) => r.json())
      .then((d) => setList(Array.isArray(d) ? d : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (!viewImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewImage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewImage]);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const res = await fetch("/api/admin/vendor-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "approved" }),
      });
      if (res.ok) {
        fetchList();
        if (selected?.id === id) setSelected({ ...selected, status: "approved" });
      }
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setApprovingId(id);
    try {
      const res = await fetch("/api/admin/vendor-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "rejected" }),
      });
      if (res.ok) {
        fetchList();
        if (selected?.id === id) setSelected(null);
      }
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Vendor Applications</h2>
      <p className="text-sm text-gray-500 mb-6">
        Review seller requests. Approve or reject. After you approve, we can set up next steps.
      </p>

      {!loading && list.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, email, shop or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-3 py-2 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          Loading...
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No vendor applications yet.
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No vendors match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-800">By name</h3>
            </div>
            <ul className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {filteredList.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(v)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-2 ${
                      selected?.id === v.id ? "bg-orange-50 border-l-4 border-orange-500" : ""
                    }`}
                  >
                    <span className="font-medium text-gray-800">{v.fullName}</span>
                    <span
                      className={`shrink-0 text-xs px-2 py-0.5 rounded ${
                        v.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : v.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {v.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-800">Details &amp; Approve / Reject</h3>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {selected ? (
                <>
                  <p className="text-xs text-gray-500 mb-4">
                    Approve sends login/approval email to seller. Reject sends email: &quot;Documents are not correct. Please submit correct documents and apply again.&quot;
                  </p>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500 font-medium">Name</dt>
                      <dd className="text-gray-900">{selected.fullName}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium">Email</dt>
                      <dd className="text-gray-900">{selected.email}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium">Phone</dt>
                      <dd className="text-gray-900">{selected.phone}</dd>
                    </div>
                    {selected.shopName && (
                      <div>
                        <dt className="text-gray-500 font-medium">Shop / Business</dt>
                        <dd className="text-gray-900">{selected.shopName}</dd>
                      </div>
                    )}
                    {selected.city && (
                      <div>
                        <dt className="text-gray-500 font-medium">City</dt>
                        <dd className="text-gray-900">{selected.city}</dd>
                      </div>
                    )}
                    {selected.address && (
                      <div>
                        <dt className="text-gray-500 font-medium">Address</dt>
                        <dd className="text-gray-900 whitespace-pre-wrap">{selected.address}</dd>
                      </div>
                    )}
                    {selected.categories && (
                      <div>
                        <dt className="text-gray-500 font-medium">Categories</dt>
                        <dd className="text-gray-900">{selected.categories}</dd>
                      </div>
                    )}
                    {selected.message && (
                      <div>
                        <dt className="text-gray-500 font-medium">Message</dt>
                        <dd className="text-gray-900 whitespace-pre-wrap">{selected.message}</dd>
                      </div>
                    )}
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <p className="text-gray-700 font-semibold mb-2">Documents (review before approve/reject)</p>
                    </div>
                    {selected.cnicFront && (
                      <div>
                        <dt className="text-gray-500 font-medium">CNIC Front</dt>
                        <dd className="mt-1">
                          <button
                            type="button"
                            onClick={() => setViewImage({ src: selected.cnicFront!, title: "CNIC Front" })}
                            className="inline-block rounded-lg border border-gray-200 overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-orange-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          >
                            <img src={selected.cnicFront} alt="CNIC Front" className="max-w-full h-auto max-h-48 object-contain pointer-events-none" />
                          </button>
                        </dd>
                      </div>
                    )}
                    {selected.cnicBack && (
                      <div>
                        <dt className="text-gray-500 font-medium">CNIC Back</dt>
                        <dd className="mt-1">
                          <button
                            type="button"
                            onClick={() => setViewImage({ src: selected.cnicBack!, title: "CNIC Back" })}
                            className="inline-block rounded-lg border border-gray-200 overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-orange-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          >
                            <img src={selected.cnicBack} alt="CNIC Back" className="max-w-full h-auto max-h-48 object-contain pointer-events-none" />
                          </button>
                        </dd>
                      </div>
                    )}
                    {selected.cnicNumber && (
                      <div>
                        <dt className="text-gray-500 font-medium">CNIC Number</dt>
                        <dd className="text-gray-900">{selected.cnicNumber}</dd>
                      </div>
                    )}
                    {selected.vendorType && (
                      <div>
                        <dt className="text-gray-500 font-medium">Type</dt>
                        <dd className="text-gray-900 capitalize">{selected.vendorType}</dd>
                      </div>
                    )}
                    {selected.storeImage && (
                      <div>
                        <dt className="text-gray-500 font-medium">Store picture</dt>
                        <dd className="mt-1">
                          <button
                            type="button"
                            onClick={() => setViewImage({ src: selected.storeImage!, title: "Store picture" })}
                            className="inline-block rounded-lg border border-gray-200 overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-orange-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          >
                            <img src={selected.storeImage} alt="Store" className="max-w-full h-auto max-h-48 object-contain pointer-events-none" />
                          </button>
                        </dd>
                      </div>
                    )}
                    {selected.warehouseImage && (
                      <div>
                        <dt className="text-gray-500 font-medium">Warehouse picture</dt>
                        <dd className="mt-1">
                          <button
                            type="button"
                            onClick={() => setViewImage({ src: selected.warehouseImage!, title: "Warehouse picture" })}
                            className="inline-block rounded-lg border border-gray-200 overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-orange-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          >
                            <img src={selected.warehouseImage} alt="Warehouse" className="max-w-full h-auto max-h-48 object-contain pointer-events-none" />
                          </button>
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-gray-500 font-medium">Status</dt>
                      <dd className="text-gray-900 capitalize">{selected.status}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium">Applied at</dt>
                      <dd className="text-gray-900">{new Date(selected.createdAt).toLocaleString()}</dd>
                    </div>
                  </dl>
                  {selected.status === "pending" && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleApprove(selected.id)}
                        disabled={approvingId === selected.id}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                      >
                        {approvingId === selected.id ? "…" : "Approve"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(selected.id)}
                        disabled={approvingId === selected.id}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {selected.status === "approved" && (
                    <p className="mt-4 pt-4 border-t border-gray-200 text-sm text-green-700 font-medium">
                      Approved. Next steps can be configured later.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Select a vendor from the list to see details and approve.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image view modal */}
      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="View image"
          onClick={() => setViewImage(null)}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-white font-medium text-lg">{viewImage.title}</span>
              <button
                type="button"
                onClick={() => setViewImage(null)}
                className="ml-4 px-3 py-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
              >
                Close
              </button>
            </div>
            <div className="rounded-lg overflow-hidden bg-gray-900 shadow-2xl">
              <img
                src={viewImage.src}
                alt={viewImage.title}
                className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
