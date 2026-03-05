"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import { useDelayedLoader } from "@/hooks/useDelayedLoader";

const SAVED_ADDRESSES_KEY = "onmart-addresses";

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  building: string;
  colony: string;
  province: string;
  city: string;
  area: string;
  address: string;
}

function loadSavedAddresses(): SavedAddress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_ADDRESSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAddressesToList(list: SavedAddress[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(list));
}

export default function AccountPage() {
  const { customerUser, isReady, updateCustomerProfile, logoutCustomer, openSignupModal } = useAuth();
  const showLoader = useDelayedLoader(!isReady, 200);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<Partial<SavedAddress>>({
    label: "",
    fullName: "",
    phone: "",
    building: "",
    colony: "",
    province: "",
    city: "",
    area: "",
    address: "",
  });

  useEffect(() => {
    if (customerUser?.name !== undefined) setName(customerUser.name || "");
  }, [customerUser?.name]);

  useEffect(() => {
    if (customerUser?.email !== undefined) setPhone(customerUser.email || "");
  }, [customerUser?.email]);

  useEffect(() => {
    setAddresses(loadSavedAddresses());
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!customerUser) {
      openSignupModal("/account");
    }
  }, [isReady, customerUser, openSignupModal]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerUser?.email) return;
    setProfileMessage(null);
    setProfileSaving(true);
    try {
      const r = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerUser.email,
          name: name.trim() || null,
          ...(customerUser.email.includes("@") && currentPassword ? { currentPassword } : {}),
          ...(!customerUser.email.includes("@") && phone.trim() ? { phone: phone.trim() } : {}),
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setProfileMessage({ type: "err", text: d?.error || "Failed to update profile." });
        return;
      }
      if (d.user?.name !== undefined) updateCustomerProfile({ name: d.user.name ?? "" });
      if (d.user?.email !== undefined) updateCustomerProfile({ email: d.user.email ?? customerUser.email });
      setProfileMessage({ type: "ok", text: "Profile updated." });
      setCurrentPassword("");
    } catch {
      setProfileMessage({ type: "err", text: "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  const saveAddressToStorage = (list: SavedAddress[]) => {
    setAddresses(list);
    saveAddressesToList(list);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const a = addressForm;
    if (!a.fullName?.trim() || !a.phone?.trim() || !a.address?.trim()) return;
    const newAddr: SavedAddress = {
      id: editingAddress?.id || "addr-" + Date.now(),
      label: (a.label || "Home").trim(),
      fullName: a.fullName.trim(),
      phone: a.phone.trim(),
      building: (a.building || "").trim(),
      colony: (a.colony || "").trim(),
      province: (a.province || "").trim(),
      city: (a.city || "").trim(),
      area: (a.area || "").trim(),
      address: a.address.trim(),
    };
    const list = loadSavedAddresses();
    if (editingAddress) {
      const idx = list.findIndex((x) => x.id === editingAddress.id);
      if (idx >= 0) list[idx] = newAddr;
      else list.push(newAddr);
    } else {
      list.push(newAddr);
    }
    saveAddressToStorage(list);
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({ label: "", fullName: "", phone: "", building: "", colony: "", province: "", city: "", area: "", address: "" });
  };

  const handleDeleteAddress = (id: string) => {
    if (!confirm("Remove this address?")) return;
    saveAddressToStorage(addresses.filter((a) => a.id !== id));
  };

  const handleEditAddress = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setAddressForm(addr);
    setShowAddressForm(true);
  };

  const isEmailUser = customerUser?.email?.includes("@");

  if (!isReady) {
    return (
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-10">
        {showLoader ? <Loader /> : (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-9 h-9 border-2 border-slate-200 border-t-[#f57224] rounded-full animate-spin" />
          </div>
        )}
      </main>
    );
  }

  if (!customerUser) {
    return (
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-10 text-center">
        <p className="text-slate-600">Please log in or sign up to manage your account.</p>
        <Link href="/" className="mt-4 inline-block text-[#f57224] font-semibold hover:underline">Continue shopping</Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Manage Account</h1>
        <Link href="/" className="text-sm text-slate-500 hover:text-[#f57224]">← Back to shop</Link>
      </div>

      <div className="space-y-8">
        {/* Profile */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email / Phone</label>
              {isEmailUser ? (
                <input
                  type="text"
                  value={customerUser.email}
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600"
                />
              ) : (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                />
              )}
              <p className="mt-1 text-xs text-slate-500">
                {isEmailUser ? "Login identifier (cannot be changed here)" : "You can edit and save your phone number."}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
              />
            </div>
            {isEmailUser && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current password (required to save)</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                />
              </div>
            )}
            {profileMessage && (
              <p className={`text-sm ${profileMessage.type === "ok" ? "text-green-600" : "text-red-600"}`}>{profileMessage.text}</p>
            )}
            <button
              type="submit"
              disabled={profileSaving}
              className="rounded-lg bg-[#f57224] text-white px-4 py-2.5 font-medium hover:bg-[#e06520] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {profileSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving…
                </>
              ) : "Save profile"}
            </button>
          </form>
        </section>

        {/* Saved addresses */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Saved addresses</h2>
          <p className="text-sm text-slate-600 mb-4">Use these at checkout for faster delivery.</p>
          {addresses.length > 0 && (
            <ul className="space-y-3 mb-4">
              {addresses.map((addr) => (
                <li key={addr.id} className="flex items-start justify-between gap-2 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div>
                    <span className="font-medium text-slate-800">{addr.label}</span>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {addr.fullName}, {addr.phone}
                    </p>
                    <p className="text-sm text-slate-500">{[addr.building, addr.colony, addr.city, addr.area, addr.address].filter(Boolean).join(", ") || addr.address}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => handleEditAddress(addr)} className="text-sm text-[#f57224] hover:underline">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="text-sm text-red-600 hover:underline">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!showAddressForm ? (
            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setAddressForm({ label: "Home", fullName: "", phone: "", building: "", colony: "", province: "", city: "", area: "", address: "" });
                setShowAddressForm(true);
              }}
              className="text-[#f57224] font-medium hover:underline"
            >
              + Add new address
            </button>
          ) : (
            <form onSubmit={handleSaveAddress} className="space-y-3 pt-2 border-t border-slate-200">
              <h3 className="font-medium text-slate-800">{editingAddress ? "Edit address" : "New address"}</h3>
              <input type="text" placeholder="Label (e.g. Home, Office)" value={addressForm.label || ""} onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 text-sm" />
              <input type="text" placeholder="Full name *" value={addressForm.fullName || ""} onChange={(e) => setAddressForm((p) => ({ ...p, fullName: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 text-sm" required />
              <input type="tel" placeholder="Phone *" value={addressForm.phone || ""} onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 text-sm" required />
              <input type="text" placeholder="Building / Street" value={addressForm.building || ""} onChange={(e) => setAddressForm((p) => ({ ...p, building: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 text-sm" />
              <input type="text" placeholder="Colony / Landmark" value={addressForm.colony || ""} onChange={(e) => setAddressForm((p) => ({ ...p, colony: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 text-sm" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" placeholder="Province" value={addressForm.province || ""} onChange={(e) => setAddressForm((p) => ({ ...p, province: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 text-sm" />
                <input type="text" placeholder="City" value={addressForm.city || ""} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 text-sm" />
              </div>
              <input type="text" placeholder="Area" value={addressForm.area || ""} onChange={(e) => setAddressForm((p) => ({ ...p, area: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 text-sm" />
              <input type="text" placeholder="Full address *" value={addressForm.address || ""} onChange={(e) => setAddressForm((p) => ({ ...p, address: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 text-sm" required />
              <div className="flex gap-2">
                <button type="submit" className="rounded-lg bg-[#f57224] text-white px-4 py-2 text-sm font-medium">Save address</button>
                <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">Cancel</button>
              </div>
            </form>
          )}
        </section>

        {/* Security */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Security</h2>
          {isEmailUser ? (
            <p className="text-sm text-slate-600 mb-3">Change your password via the reset link sent to your email.</p>
          ) : (
            <p className="text-sm text-slate-600 mb-3">You signed up with phone. Set a password later from the signup flow to enable email login.</p>
          )}
          {isEmailUser && (
            <Link href="/forgot-password" className="inline-block text-[#f57224] font-medium hover:underline">
              Forgot password / Reset password
            </Link>
          )}
        </section>

        {/* Quick links */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick links</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/orders" className="text-[#f57224] font-medium hover:underline">
                My Orders
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-[#f57224] font-medium hover:underline">
                Cart
              </Link>
            </li>
            <li>
              <button type="button" onClick={() => logoutCustomer()} className="text-red-600 font-medium hover:underline text-left">
                Logout
              </button>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
