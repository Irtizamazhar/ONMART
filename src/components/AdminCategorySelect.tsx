"use client";

import { useState, useRef, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AdminCategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (slug: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AdminCategorySelect({
  categories,
  value,
  onChange,
  placeholder = "Select category",
  className = "",
}: AdminCategorySelectProps) {
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

  const selected = categories.find((c) => c.slug === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left text-gray-800 flex items-center justify-between gap-2 bg-white"
      >
        <span className={selected ? "" : "text-gray-500"}>{selected ? selected.name : placeholder}</span>
        <svg className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.slug);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 ${value === c.slug ? "bg-orange-50 text-orange-800 font-medium" : "text-gray-800"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
