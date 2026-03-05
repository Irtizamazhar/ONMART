"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV_ORANGE = "#f25a2a";

export default function AccountDropdown() {
  const { user, logoutCustomer } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  if (!user) return null;

  const displayName = user.name || user.email?.replace(/^\+/, "") || "Account";
  const firstLetter = (displayName.charAt(0) || "A").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition-colors duration-200 border-2 border-white/40"
        aria-expanded={open}
        aria-haspopup="true"
        title={displayName}
      >
        {firstLetter}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 py-1 min-w-[180px] rounded-xl bg-white shadow-lg border border-slate-200 z-50">
          <Link
            href="/orders"
            className="block px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg mx-1"
            onClick={() => setOpen(false)}
          >
            My Orders
          </Link>
          <Link
            href="/account"
            className="block px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg mx-1"
            onClick={() => setOpen(false)}
          >
            Manage Account
          </Link>
          <button
            type="button"
            onClick={() => { setOpen(false); logoutCustomer(); }}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mx-1"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
