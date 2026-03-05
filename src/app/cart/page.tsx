"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getProductDisplayTitle } from "@/lib/displayName";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { customerUser, openSignupModal } = useAuth();
  const { t, language } = useLanguage();
  const [guestEmail, setGuestEmail] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-10 sm:py-16 text-center w-full min-w-0 max-w-full overflow-x-hidden">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-lg p-8 sm:p-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{t("cart.empty")}</h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">{t("cart.emptyHint")}</p>
          <Link href="/" className="inline-block mt-6 sm:mt-8 btn-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base">
            {t("cart.continueShopping")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-4 py-5 sm:py-8 md:py-12 w-full min-w-0 max-w-full overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-5 sm:mb-8">
        {t("cart.title")} <span className="text-slate-500 font-normal text-base sm:text-lg">({totalItems} {t("cart.items")})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 min-w-0">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 min-w-0">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 sm:gap-5 bg-white rounded-xl border border-slate-200 shadow-sm p-3 sm:p-5 hover:shadow-card-hover transition-shadow"
            >
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 bg-slate-50 rounded-lg sm:rounded-xl overflow-hidden ring-1 ring-slate-100">
                <Image
                  src={item.image}
                  alt={getProductDisplayTitle(item, language)}
                  fill
                  className="object-contain p-1.5 sm:p-2"
                  sizes="(max-width: 640px) 80px, 112px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product-details/${item.id}`}
                  className="font-semibold text-slate-800 hover:text-[#f57224] line-clamp-2 transition-colors text-sm sm:text-base"
                >
                  {getProductDisplayTitle(item, language)}
                </Link>
                <p className="text-[#f57224] font-bold text-base sm:text-lg mt-0.5 sm:mt-1">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 flex-wrap">
                  <div className="flex items-center border border-slate-300 rounded-lg sm:rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                    >
                      −
                    </button>
                    <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 text-xs sm:text-sm font-medium hover:underline"
                  >
                    {t("cart.remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 min-w-0">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-lg p-4 sm:p-6 lg:sticky lg:top-28 min-w-0">
            <h2 className="font-bold text-slate-800 text-base sm:text-lg mb-4 sm:mb-5">{t("cart.orderSummary")}</h2>
            <div className="flex justify-between text-slate-600 mb-2 text-sm sm:text-base">
              <span>{t("cart.subtotal")} ({totalItems} {t("cart.items")})</span>
              <span className="font-medium text-slate-800">Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
              <div className="flex justify-between font-bold text-lg sm:text-xl text-slate-800">
                <span>{t("cart.total")}</span>
                <span className="text-[#f57224]">Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>
            {orderError && <p className="mt-2 text-sm text-red-600">{orderError}</p>}
            {!customerUser && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email for order *</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800"
                />
              </div>
            )}
            <Link
              href="/"
              className="mt-3 sm:mt-4 block text-center text-[#f57224] font-semibold hover:underline text-sm sm:text-base"
            >
              {t("cart.continueShopping")}
            </Link>
            <button
              type="button"
              disabled={placing}
              className="mt-3 sm:mt-4 w-full btn-primary py-3 sm:py-3.5 text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={() => {
                if (!customerUser) {
                  openSignupModal("/cart");
                  return;
                }
                router.push("/checkout?fromCart=1");
              }}
            >
              {t("cart.proceedToCheckout")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
