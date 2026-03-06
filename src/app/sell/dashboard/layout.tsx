"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ORANGE = "#f25a2a";

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customerUser, isReady, isSeller, logoutCustomer } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!customerUser) {
      router.replace("/login?returnUrl=" + encodeURIComponent("/sell/dashboard"));
      return;
    }
    if (!isSeller) {
      router.replace("/sell");
      return;
    }
  }, [isReady, customerUser, isSeller, router]);

  useEffect(() => setSidebarOpen(false), [pathname]);

  if (!isReady || !customerUser || !isSeller) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  const navLinks = [
    { href: "/sell/dashboard", label: "Dashboard" },
    { href: "/sell/dashboard/products", label: "Products" },
    { href: "/sell/dashboard/upload", label: "Upload Product" },
    { href: "/sell/dashboard/orders", label: "Orders" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
          <Link
            href="/sell/dashboard"
            className="font-semibold text-lg text-orange-400"
            onClick={() => setSidebarOpen(false)}
          >
            Seller Admin
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
            href="/sell"
            className="block px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            ← Sell on Onmart
          </Link>
          <button
            type="button"
            onClick={() => { logoutCustomer(); router.replace("/login"); }}
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
          <h1 className="text-base sm:text-lg font-medium text-gray-800 truncate">Seller Admin</h1>
          <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[140px] sm:max-w-none">{customerUser.email}</span>
        </header>
        <div className="p-3 sm:p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
