"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryDisplayName } from "@/lib/displayName";

interface CustomCat {
  id: string;
  name: string;
  nameUr?: string | null;
  nameZh?: string | null;
  nameTranslations?: Record<string, string> | null;
  slug: string;
  image: string;
}

export default function CategoryMenu() {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<CustomCat[]>([]);
  const [disabledSlugs, setDisabledSlugs] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const didMoveRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    fetch("/api/store/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]));
  }, []);
  useEffect(() => {
    fetch("/api/store/disabled-categories")
      .then((r) => r.json())
      .then((d) => setDisabledSlugs(Array.isArray(d) ? d : []))
      .catch(() => setDisabledSlugs([]));
  }, []);

  const disabledSet = new Set(disabledSlugs);
  const visibleCategories = categories.filter((c) => !disabledSet.has(c.slug));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    didMoveRef.current = false;
    const rect = scrollRef.current.getBoundingClientRect();
    startXRef.current = e.clientX - rect.left;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    didMoveRef.current = true;
    e.preventDefault();
    const rect = scrollRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const walk = (x - startXRef.current) * 1.2;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    startXRef.current = x;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setTimeout(() => { didMoveRef.current = false; }, 0);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-3 sm:px-4 bg-white border-b border-slate-200/80 shadow-sm w-full min-w-0">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto overflow-y-hidden py-3 scrollbar-hide min-h-[52px] -mx-3 sm:-mx-4 px-3 sm:px-4 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {visibleCategories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          const displayName = getCategoryDisplayName(cat, language);
          return (
            <Link
              key={cat.id}
              href={`/?category=${encodeURIComponent(cat.slug)}`}
              onClick={(e) => {
                if (didMoveRef.current) e.preventDefault();
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "border-[rgb(243,88,35)] bg-orange-50 text-[rgb(243,88,35)]"
                  : "border-slate-200 bg-slate-50 hover:border-[rgb(243,88,35)]/50 hover:bg-orange-50/80 text-slate-700 active:scale-[0.98]"
              }`}
            >
              
              <img src={cat.image || ""} alt="" className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg object-cover ring-1 ring-slate-200/50" />
              <span className="truncate max-w-[120px] sm:max-w-none">{displayName}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
