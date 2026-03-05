"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Banners() {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [items, setItems] = useState<{ id: string; src: string; href: string; alt: string; width?: number | null; height?: number | null }[]>([]);

  useEffect(() => {
    fetch("/api/store/banners")
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) && d.length > 0
          ? d.map((b: { id: string; src: string; href: string; label: string; width?: number | null; height?: number | null }) => ({
              id: b.id,
              src: b.src,
              href: b.href || "#",
              alt: b.label || "Banner",
              width: b.width,
              height: b.height,
            }))
          : [];
        setItems(list);
      })
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 4500);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="w-full min-w-0 max-w-full px-0 sm:px-2 md:px-4 py-3 sm:py-4" aria-label="Promotional carousel">
      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 shadow-lg ring-1 ring-slate-200/50 min-w-0">
        <div className="relative aspect-[21/8] min-h-[160px] sm:min-h-[220px] md:min-h-[340px] lg:min-h-[420px]">
          {items.map((banner, i) => (
            <Link
              key={banner.id}
              href={banner.href}
              className={`absolute inset-0 block transition-all duration-500 ease-out ${
                i === index ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
              }`}
            >
              {loaded[i] !== false ? (
                <>
                  <img
                    src={banner.src}
                    alt={banner.alt}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    onError={() => setLoaded((p) => ({ ...p, [i]: false }))}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f57224] to-[#e5611a] text-white font-bold text-xl px-4">
                  {banner.alt}
                </div>
              )}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all duration-200 active:scale-95"
          aria-label="Previous"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % items.length)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all duration-200 active:scale-95"
          aria-label="Next"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2 bg-black/25 backdrop-blur-md px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                i === index ? "bg-white w-5 sm:w-7" : "bg-white/60 hover:bg-white/80 w-1.5 sm:w-2"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
