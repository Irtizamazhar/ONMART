"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getProductDisplayTitle } from "@/lib/displayName";
import { getSectionDiscountPercent } from "@/data/sections";

export interface Product {
  id: number | string;
  title: string;
  titleUr?: string;
  titleZh?: string;
  titleTranslations?: Record<string, string>;
  price: number;
  image: string;
  category?: string;
  rating?: { rate: number; count: number };
  inStock?: boolean;
  originalPrice?: number | null;
  discountPercent?: number | null;
  sectionSlug?: string | null;
}

interface ProductCardProps {
  product: Product;
  showDiscount?: boolean;
  originalPrice?: number;
  discountPercent?: number;
}

export default function ProductCard({
  product,
  showDiscount = false,
  originalPrice,
  discountPercent,
}: ProductCardProps) {
  const { toggleItem, items } = useCart();
  const { customerUser, openSignupModal } = useAuth();
  const { t, language } = useLanguage();
  const inCart = items.some((i) => i.id === product.id);
  const displayTitle = getProductDisplayTitle(product, language);
  const outOfStock = product.inStock === false;

  const handleToggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    if (!inCart && !customerUser) {
      openSignupModal(`/product-details/${product.id}`);
      return;
    }
    toggleItem({
      id: product.id,
      title: product.title,
      titleTranslations: product.titleTranslations,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  };

  const sectionPct = getSectionDiscountPercent(product.sectionSlug);
  const effectiveDiscountPercent =
    product.discountPercent != null
      ? product.discountPercent
      : sectionPct > 0
        ? sectionPct
        : discountPercent;
  const effectiveOriginalPrice =
    product.originalPrice != null && product.originalPrice > 0
      ? product.originalPrice
      : effectiveDiscountPercent != null && effectiveDiscountPercent > 0
        ? Math.round((product.price / (1 - effectiveDiscountPercent / 100)) * 100) / 100
        : originalPrice;
  const hasDiscount = (showDiscount || (effectiveDiscountPercent != null && effectiveDiscountPercent > 0)) && effectiveDiscountPercent != null && effectiveDiscountPercent > 0;

  return (
    <Link
      href={`/product-details/${product.id}`}
      className="group block h-full min-w-0 w-full bg-white rounded-xl border border-slate-200/80 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--daraz-orange)] flex flex-col h-[320px]"
    >
      <div className="relative w-full h-[180px] flex-shrink-0 bg-slate-50/50 overflow-hidden">
        <Image
          src={product.image || "/placeholder.png"}
          alt={displayTitle}
          fill
          className="object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={typeof product.id === "string"}
        />
        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
            -{effectiveDiscountPercent}%
          </span>
        )}
        {product.rating && (
          <span className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-white/95 backdrop-blur rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-700">
            <span className="text-amber-500">★</span> {product.rating.rate}
          </span>
        )}
      </div>
      <div className="p-2 sm:p-3 flex flex-col flex-1 min-h-0 overflow-hidden">
        <h3 className="text-xs sm:text-sm font-medium text-slate-800 line-clamp-2 min-h-[2rem] sm:min-h-[2.25rem] transition-colors duration-200 group-hover:text-[#f57224]">
          {displayTitle}
        </h3>
        <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-hidden min-h-[1.25rem]">
          <span className="text-base sm:text-lg font-bold text-[#f57224] truncate min-w-0">
            Rs. {product.price.toLocaleString()}
          </span>
          {hasDiscount && effectiveOriginalPrice != null && effectiveOriginalPrice > 0 && (
            <span className="text-xs sm:text-sm text-slate-500 line-through truncate shrink-0 max-w-[60%]">
              Rs. {effectiveOriginalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <p className={`text-xs font-semibold mt-0.5 flex-shrink-0 ${outOfStock ? "text-red-600" : "text-green-600"}`}>
          {outOfStock ? t("product.outOfStock") : t("product.inStock")}
        </p>
        <button
          type="button"
          onClick={handleToggleCart}
          disabled={outOfStock}
          className={`mt-auto pt-1.5 sm:pt-2 w-full text-xs sm:text-sm font-semibold py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex-shrink-0 transition-all duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--daraz-orange)] ${
            outOfStock
              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
              : inCart
              ? "bg-white text-[#f57224] border-2 border-[#f57224] hover:bg-orange-50"
              : "bg-[#f57224] text-white hover:bg-[#e5611a] shadow-sm hover:shadow-md"
          }`}
        >
          {outOfStock ? t("product.outOfStock") : inCart ? t("home.removeFromCart") : t("home.addToCart")}
        </button>
      </div>
    </Link>
  );
}
