"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Banners from "@/components/Banners";
import CategoryMenu from "@/components/CategoryMenu";
import HorizontalDragScroll from "@/components/HorizontalDragScroll";
import PromoStrip from "@/components/PromoStrip";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import ReasonToBuy from "@/components/ReasonToBuy";
import type { Product } from "@/components/ProductCard";
import { getCategoryName } from "@/data/categories";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryDisplayName } from "@/lib/displayName";
import { getCategoryTranslationKey } from "@/data/translations";
import { PRODUCT_SECTIONS } from "@/data/sections";
import { useDelayedLoader } from "@/hooks/useDelayedLoader";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const category = searchParams.get("category");
  const bestSelling = searchParams.get("bestSelling") === "1";
  const section = searchParams.get("section")?.trim() || null;
  const search = (searchParams.get("search") || "").trim();
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [flashProducts, setFlashProducts] = useState<Product[]>([]);
  const [topDealsProducts, setTopDealsProducts] = useState<Product[]>([]);
  const [clearanceProducts, setClearanceProducts] = useState<Product[]>([]);
  const [customCategoryNames, setCustomCategoryNames] = useState<Record<string, { name: string; nameUr?: string; nameZh?: string; nameTranslations?: Record<string, string> }>>({});
  const [loading, setLoading] = useState(true);
  const [viewAllLoading, setViewAllLoading] = useState(false);
  const productsSectionRef = useRef<HTMLElement>(null);
  const showLoader = useDelayedLoader(loading, 200);

  const mapApiProduct = (p: { id: string; title: string; titleUr?: string; titleZh?: string; titleTranslations?: Record<string, string>; price: number; image: string; categorySlug: string; inStock?: boolean; originalPrice?: number | null; discountPercent?: number | null; sectionSlug?: string | null }) => ({
    id: p.id,
    title: p.title,
    titleUr: p.titleUr,
    titleZh: p.titleZh,
    titleTranslations: p.titleTranslations,
    price: p.price,
    image: p.image || "/placeholder.png",
    category: p.categorySlug,
    inStock: p.inStock !== false,
    originalPrice: p.originalPrice ?? undefined,
    discountPercent: p.discountPercent ?? undefined,
    sectionSlug: p.sectionSlug ?? undefined,
  });

  // Main listing: load products by category, section, or bestSelling
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const url = bestSelling
          ? "/api/store/products?bestSelling=1&limit=200"
          : section
          ? `/api/store/products?section=${encodeURIComponent(section)}`
          : category
          ? `/api/store/products?category=${encodeURIComponent(category)}`
          : "/api/store/products";
        const res = await fetch(url);
        const data = await res.json();
        const list = Array.isArray(data) ? data.map(mapApiProduct) : [];
        if (!cancelled) setProducts(list);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setViewAllLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [category, bestSelling, section]);

  // Section products for home blocks (Flash, Top Deals, Clearance) - only when on main home
  useEffect(() => {
    if (category || search || bestSelling || section) {
      setFlashProducts([]);
      setTopDealsProducts([]);
      setClearanceProducts([]);
      return;
    }
    const mapP = (p: unknown) => {
      const q = p as { id: string; title: string; titleUr?: string; titleZh?: string; titleTranslations?: Record<string, string>; price: number; image?: string; categorySlug: string; inStock?: boolean; originalPrice?: number | null; discountPercent?: number | null; sectionSlug?: string | null };
      return {
        id: q.id,
        title: q.title,
        titleUr: q.titleUr,
        titleZh: q.titleZh,
        titleTranslations: q.titleTranslations,
        price: q.price,
        image: q.image || "/placeholder.png",
        category: q.categorySlug,
        inStock: q.inStock !== false,
        originalPrice: q.originalPrice ?? undefined,
        discountPercent: q.discountPercent ?? undefined,
        sectionSlug: q.sectionSlug ?? undefined,
      };
    };
    let cancelled = false;
    Promise.all([
      fetch("/api/store/products?section=flash").then((r) => r.json()),
      fetch("/api/store/products?section=top-deals").then((r) => r.json()),
      fetch("/api/store/products?section=clearance").then((r) => r.json()),
    ]).then(([flash, topDeals, clearance]) => {
      if (cancelled) return;
      setFlashProducts(Array.isArray(flash) ? flash.map(mapP) : []);
      setTopDealsProducts(Array.isArray(topDeals) ? topDeals.map(mapP) : []);
      setClearanceProducts(Array.isArray(clearance) ? clearance.map(mapP) : []);
    }).catch(() => {
      if (!cancelled) {
        setFlashProducts([]);
        setTopDealsProducts([]);
        setClearanceProducts([]);
      }
    });
    return () => { cancelled = true; };
  }, [category, search, bestSelling, section]);

  // Best Selling: automatic from DB by sold count (only when no category/search/bestSelling/section on main)
  useEffect(() => {
    if (category || search || bestSelling || section) {
      setBestSellerProducts([]);
      return;
    }
    let cancelled = false;
    fetch("/api/store/products?bestSelling=1&limit=8")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        const arr = Array.isArray(data) ? data : [];
        setBestSellerProducts(arr.map((p: unknown) => {
          const q = p as { id: string; title: string; titleUr?: string; titleZh?: string; titleTranslations?: Record<string, string>; price: number; image?: string; categorySlug: string; inStock?: boolean; originalPrice?: number | null; discountPercent?: number | null; sectionSlug?: string | null };
          return {
            id: q.id,
            title: q.title,
            titleUr: q.titleUr,
            titleZh: q.titleZh,
            titleTranslations: q.titleTranslations,
            price: q.price,
            image: q.image || "/placeholder.png",
            category: q.categorySlug,
            inStock: q.inStock !== false,
            originalPrice: q.originalPrice ?? undefined,
            discountPercent: q.discountPercent ?? undefined,
            sectionSlug: q.sectionSlug ?? undefined,
          };
        }));
      })
      .catch(() => { if (!cancelled) setBestSellerProducts([]); });
    return () => { cancelled = true; };
  }, [category, search, bestSelling]);

  useEffect(() => {
    fetch("/api/store/categories")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          const map: Record<string, { name: string; nameUr?: string; nameZh?: string; nameTranslations?: Record<string, string> }> = {};
          d.forEach((c: { slug: string; name: string; nameUr?: string | null; nameZh?: string | null; nameTranslations?: Record<string, string> | null }) => {
            map[c.slug] = { name: c.name, nameUr: c.nameUr ?? undefined, nameZh: c.nameZh ?? undefined, nameTranslations: c.nameTranslations ?? undefined };
          });
          setCustomCategoryNames(map);
        }
      })
      .catch(() => {});
  }, []);

  // When user selects a category, bestSelling, section, or search, scroll to products section after load
  useEffect(() => {
    if ((category || search || bestSelling || section) && !loading && productsSectionRef.current) {
      const id = setTimeout(() => {
        productsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return () => clearTimeout(id);
    }
  }, [category, search, bestSelling, section, loading]);

  const normalizedSearch = search.toLowerCase().trim();
  const visibleProducts = normalizedSearch
    ? products.filter((p) => {
        const titleStr = (p.title || "").toLowerCase();
        const urStr = (p.titleUr || "").toLowerCase();
        const zhStr = (p.titleZh || "").toLowerCase();
        const tr = p.titleTranslations as Record<string, string> | undefined;
        const allTranslations = tr ? Object.values(tr).join(" ").toLowerCase() : "";
        return titleStr.includes(normalizedSearch) || urStr.includes(normalizedSearch) || zhStr.includes(normalizedSearch) || allTranslations.includes(normalizedSearch);
      })
    : products;

  const showPriceoyeSections = !category && !normalizedSearch && !bestSelling && !section && products.length > 0;

  const handleViewAll = (href: string) => {
    setViewAllLoading(true);
    router.push(href);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50/80 relative w-full min-w-0 max-w-full overflow-x-hidden">
      {viewAllLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80">
          <Loader />
        </div>
      )}
      <CategoryMenu />

      <section className="max-w-7xl mx-auto w-full px-3 sm:px-4 pt-3 sm:pt-4 pb-2 min-w-0">
        <Banners />
      </section>

      <PromoStrip />

      {showPriceoyeSections && (
        <>
          {/* Best Seller - automatic by sold count (from DB) */}
          <section className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">{t("home.bestSeller")}</h2>
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">{t("home.getBestPrices")}</p>
                <button
                  type="button"
                  onClick={() => handleViewAll("/?bestSelling=1")}
                  className="text-sm font-semibold text-[rgb(243,88,35)] hover:underline"
                >
                  {t("home.viewAll")}
                </button>
              </div>
            </div>
            {bestSellerProducts.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">{t("home.noProducts")}</p>
            ) : (
              <HorizontalDragScroll>
                {bestSellerProducts.map((p, i) => (
                  <div key={p.id} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] min-w-0 animate-fade-in-up flex flex-col" style={{ animationDelay: `${i * 60}ms` }}>
                    <ProductCard product={p} showDiscount />
                  </div>
                ))}
              </HorizontalDragScroll>
            )}
          </section>

          {/* Flash Sale - products with section = flash */}
          <section className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">{t("home.flashSale")}</h2>
              <button
                type="button"
                onClick={() => handleViewAll("/?section=flash")}
                className="text-sm font-semibold text-[rgb(243,88,35)] hover:underline"
              >
                {t("home.viewAll")}
              </button>
            </div>
            {flashProducts.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 -mx-3 sm:-mx-4 px-3 sm:px-4">{t("home.noProducts")}</p>
            ) : (
              <HorizontalDragScroll>
                {flashProducts.slice(0, 8).map((p, i) => (
                  <div key={p.id} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] min-w-0 animate-fade-in-up flex flex-col" style={{ animationDelay: `${i * 60}ms` }}>
                    <ProductCard product={p} showDiscount />
                  </div>
                ))}
              </HorizontalDragScroll>
            )}
          </section>

          {/* Top Deals */}
          <section className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">{t("home.topDeals")}</h2>
              <button
                type="button"
                onClick={() => handleViewAll("/?section=top-deals")}
                className="text-sm font-semibold text-[rgb(243,88,35)] hover:underline"
              >
                {t("home.viewAll")}
              </button>
            </div>
            {topDealsProducts.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">{t("home.noProducts")}</p>
            ) : (
              <HorizontalDragScroll>
                {topDealsProducts.slice(0, 8).map((p, i) => (
                  <div key={p.id} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] min-w-0 animate-fade-in-up flex flex-col" style={{ animationDelay: `${i * 60}ms` }}>
                    <ProductCard product={p} showDiscount />
                  </div>
                ))}
              </HorizontalDragScroll>
            )}
          </section>

          {/* Clearance Sale */}
          <section className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">{t("home.clearanceSale")}</h2>
              <button
                type="button"
                onClick={() => handleViewAll("/?section=clearance")}
                className="text-sm font-semibold text-[rgb(243,88,35)] hover:underline"
              >
                {t("home.viewAll")}
              </button>
            </div>
            {clearanceProducts.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">{t("home.noProducts")}</p>
            ) : (
              <HorizontalDragScroll>
                {clearanceProducts.slice(0, 8).map((p, i) => (
                  <div key={p.id} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] min-w-0 animate-fade-in-up flex flex-col" style={{ animationDelay: `${i * 60}ms` }}>
                    <ProductCard product={p} showDiscount />
                  </div>
                ))}
              </HorizontalDragScroll>
            )}
          </section>

          {/* Reason to Buy - Priceoye style */}
          <ReasonToBuy />
        </>
      )}

      {/* Latest / Main listing - scroll target when category/search is selected */}
      <section
        ref={productsSectionRef}
        id="products-section"
        className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 flex-1 bg-white rounded-t-2xl shadow-sm scroll-mt-4 min-w-0"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 flex-wrap">
          <h2 className="section-title text-lg sm:text-xl">
            {normalizedSearch
              ? `${t("home.searchResults")} "${search}"`
              : bestSelling
              ? t("home.bestSeller")
              : section
              ? (PRODUCT_SECTIONS.find((s) => s.slug === section) ? t(PRODUCT_SECTIONS.find((s) => s.slug === section)!.labelKey) : section)
              : category
              ? (() => {
                  const custom = customCategoryNames[category];
                  if (custom) return getCategoryDisplayName({ ...custom, slug: category }, language);
                  return t(getCategoryTranslationKey(category)) || getCategoryName(category) || category;
                })()
              : t("home.latestProducts")}
          </h2>
          {!normalizedSearch && !category && (
            <button
              type="button"
              onClick={() => {
                if (section) handleViewAll("/");
                else if (bestSelling) handleViewAll("/");
                else productsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="text-sm font-semibold text-[rgb(243,88,35)] hover:underline"
            >
              {t("home.viewAll")}
            </button>
          )}
        </div>
        {showLoader ? (
          <Loader />
        ) : loading ? (
          <div className="min-h-[280px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-[#f57224] rounded-full animate-spin" />
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center">
            <p className="text-slate-500 text-base sm:text-lg">{t("home.noProducts")}</p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">{t("home.tryAnother")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
            {visibleProducts.map((product, i) => (
              <div key={product.id} className="animate-fade-in-up min-w-0" style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}>
                <ProductCard product={product} showDiscount />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-[120px] flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#f57224] rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
