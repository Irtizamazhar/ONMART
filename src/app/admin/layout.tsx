"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, customerUser, isReady, isAdmin, loginAdmin, logoutAdmin } = useAuth();
  const pathname = usePathname();
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Show admin login when not admin (no redirect – /admin works even after customer signup).
  const showAdminLogin = !isReady || !user;

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (showAdminLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        {/* Admin login – shown when not admin (e.g. after customer signup) or not logged in */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white border border-gray-200 shadow-2xl p-6">
            <h1 className="text-xl font-bold text-gray-800 text-center mb-1">Onmart Admin</h1>
            <p className="text-sm text-gray-500 text-center mb-6">Admin login</p>
            {customerUser && !user && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                You’re logged in as a customer on this device. Sign in below with your <strong>admin</strong> account to open the panel.
              </p>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAdminError("");
                const result = await loginAdmin(adminEmail, adminPassword);
                if (result.ok) {
                  setAdminEmail("");
                  setAdminPassword("");
                } else {
                  setAdminError(result.error || "Invalid admin email or password.");
                }
              }}
              className="space-y-4"
            >
              {adminError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{adminError}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@onmart.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-orange-500 text-white py-2.5 font-medium hover:bg-orange-600"
              >
                Admin Login
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              User site: <Link href="/" className="text-orange-600 hover:underline">localhost:3000</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/upload", label: "Upload Product" },
    { href: "/admin/banners", label: "Banners" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 sm:w-72 max-w-[85vw] bg-slate-800 text-white flex flex-col shrink-0 transform transition-transform duration-200 ease-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <Link href="/admin" className="font-semibold text-lg text-orange-400" onClick={() => setSidebarOpen(false)}>
            Onmart Admin
          </Link>
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="p-2 flex-1 overflow-y-auto">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2.5 rounded-lg text-sm ${
                pathname === href
                  ? "bg-slate-700 text-orange-400"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <Link
            href="/"
            className="block px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            ← Back to site
          </Link>
          <button
            type="button"
            onClick={() => logoutAdmin()}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-w-0">
        <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 flex items-center justify-between gap-2">
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-base sm:text-lg font-medium text-gray-800 truncate">Admin</h1>
          <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[140px] sm:max-w-none">{user.email}</span>
        </header>
        <div className="p-3 sm:p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
