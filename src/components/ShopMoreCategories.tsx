"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryDisplayName } from "@/lib/displayName";

const QUICK_LINK_KEYS = [
  { key: "shopMore.topDeals" as const, href: "/?category=electronics" },
  { key: "shopMore.bestUnder5000" as const, href: "/?category=electronics" },
  { key: "shopMore.clearanceSale" as const, href: "/?category=women's clothing" },
];

interface CustomCat { id: string; name: string; nameUr?: string | null; nameZh?: string | null; nameTranslations?: Record<string, string> | null; slug: string; image: string; }

export default function ShopMoreCategories() {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<CustomCat[]>([]);
  const [disabledSlugs, setDisabledSlugs] = useState<string[]>([]);

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

  return (
    <section className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 min-w-0">
      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4">{t("shopMore.title")}</h3>
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {QUICK_LINK_KEYS.map((q) => (
          <Link
            key={q.key}
            href={q.href}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:border-[#f57224] hover:text-[#f57224] transition-colors duration-200 active:scale-[0.98]"
          >
            {t(q.key)}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {visibleCategories.map((cat) => {
          const displayName = getCategoryDisplayName(cat, language);
          return (
          <Link
            key={cat.id}
            href={`/?category=${encodeURIComponent(cat.slug)}`}
            className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-white border border-slate-200 hover:border-[#f57224]/50 hover:shadow-md transition-all duration-200 active:scale-[0.99]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cat.image || ""} alt={displayName} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover mb-1.5 sm:mb-2" />
            <span className="text-xs sm:text-sm font-medium text-slate-800 text-center line-clamp-2">{displayName}</span>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
