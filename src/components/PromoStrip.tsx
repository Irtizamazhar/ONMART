"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function PromoStrip() {
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 w-full min-w-0">
      <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-r from-amber-800 via-amber-900 to-amber-800 border border-amber-600/40 shadow-xl shadow-amber-900/20 min-w-0">
        <div className="p-4 sm:p-5 md:p-6 flex flex-wrap items-center justify-center sm:justify-between gap-4 sm:gap-5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-amber-50">
              {t("promo.grandRamadan")}
            </h2>
            <span className="hidden sm:inline w-px h-6 bg-amber-400/50" />
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5 md:gap-8 text-xs sm:text-sm">
            <span className="flex items-center gap-2 text-white font-semibold">
              <span className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </span>
              {t("promo.vouchersOff")}
            </span>
            <span className="flex items-center gap-2 text-white font-semibold">
              <span className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </span>
              {t("promo.freeDelivery")}
            </span>
            <span className="flex items-center gap-2 text-white font-semibold">
              <span className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              {t("promo.flash80")}
            </span>
          </div>
          <Link
            href="/"
            className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            {t("promo.shopNow")}
          </Link>
        </div>
      </div>
    </section>
  );
}
