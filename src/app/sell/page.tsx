"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const BENEFITS = [
  { key: "sell.benefit1", icon: "%" },
  { key: "sell.benefit2", icon: "📦" },
  { key: "sell.benefit3", icon: "🚚" },
  { key: "sell.benefit4", icon: "💳" },
] as const;

const STEPS = [
  { key: "sell.step1", icon: "📱" },
  { key: "sell.step2", icon: "📝" },
  { key: "sell.step3", icon: "🪪" },
  { key: "sell.step4", icon: "📤" },
] as const;

export default function SellPage() {
  const { t } = useLanguage();
  const { isSeller } = useAuth();
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50/30">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {/* Banner 1: Sell on OnMart hero + New Seller Benefits (Daraz-style) */}
        <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl mb-6 sm:mb-8 min-h-[320px] sm:min-h-[340px] flex flex-col sm:flex-row">
          {/* Navbar-style orange background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f25a2a] via-[#ea5220] to-[#dc4b1c]" />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_80%_80%_at_20%_50%,_white,_transparent)]" />
          <div className="relative flex-1 flex flex-col justify-center p-6 sm:p-8 md:p-10 z-10">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-md max-w-xl">
              {t("sell.bannerHeadline")}
            </h1>
            <Link
              href="/sell/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 sm:mt-6 inline-flex items-center gap-2 self-start px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-[#fde047] text-[#dc4b1c] font-bold text-sm sm:text-base shadow-lg hover:bg-[#facc15] transition-colors"
            >
              {t("sell.beSellerToday")}
              <span className="ml-1">→</span>
            </Link>
            {isSeller && (
              <Link
                href="/sell/dashboard"
                className="mt-3 inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-white/20 text-white font-semibold text-sm border border-white/40 hover:bg-white/30 transition-colors"
              >
                Seller Dashboard (upload products)
              </Link>
            )}
          </div>
          {/* New Seller Benefits card */}
          <div className="relative sm:w-[320px] md:w-[360px] flex-shrink-0 m-4 sm:m-6 sm:ml-0 bg-white rounded-2xl shadow-xl p-4 sm:p-5 z-10 border border-orange-100">
            <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-[#dc4b1c] font-semibold text-sm mb-4">
              {t("sell.newSellerBenefits")}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {BENEFITS.map((b) => (
                <div key={b.key} className="flex flex-col items-center text-center">
                  <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg sm:text-xl mb-1.5">
                    {b.icon}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700 leading-tight">
                    {t(b.key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Banner 2: How to Join (same size feel, purple gradient) */}
        <section className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl mb-6 sm:mb-8 min-h-[320px] sm:min-h-[340px] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 p-6 sm:p-8 md:p-10">
          <h2 className="text-center text-xl sm:text-2xl font-bold text-[#fde047] mb-6 sm:mb-8">
            {t("sell.howToJoin")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {STEPS.map((s, i) => (
              <div key={s.key} className="relative flex flex-col items-center">
                {i < STEPS.length - 1 && (
                  <span className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-0 border border-dashed border-white/50 z-0" aria-hidden />
                )}
                <div className="relative z-10 border-2 border-dashed border-white/60 rounded-xl p-3 sm:p-4 bg-white/5 backdrop-blur-sm w-full flex flex-col items-center text-center min-h-[120px] sm:min-h-[140px]">
                  <span className="text-2xl sm:text-3xl mb-2">{s.icon}</span>
                  <span className="text-white text-xs sm:text-sm font-medium leading-tight">
                    {t(s.key)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6 sm:mt-8">
            <a
              href="mailto:seller@onmart.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-white/80 bg-purple-800/80 text-white font-semibold hover:bg-purple-800 transition-colors"
            >
              {t("sell.learnMore")}
              <span className="ml-1">→</span>
            </a>
          </div>
        </section>

        {/* Contact card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden hover:shadow-xl hover:border-orange-200/60 transition-all duration-300 mb-8">
          <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-white to-slate-50/50">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 text-[#f57224]">
              {t("about.sellTitle")}
            </h2>
            <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
              {t("about.sellText")}
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#f57224] text-white font-semibold shadow-lg hover:bg-[#e0651a] hover:shadow-xl transition-all"
          >
            {t("common.backToHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
