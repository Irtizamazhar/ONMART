"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      {/* Full-width hero - no sidebar */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#5b21b6] via-[#7c3aed] to-[#4c1d95] min-h-[260px] md:min-h-[320px] flex items-center">
        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-10">
          <span className="text-white/90 text-sm font-semibold mb-1">{t("hero.mall")}</span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            {t("hero.bestDeals")}
          </h2>
          <div className="flex flex-wrap gap-2 text-sm text-yellow-300 mb-5">
            <span>{t("hero.authentic")}</span>
            <span className="text-white/80">{t("hero.or")}</span>
            <span>{t("hero.cashback")}</span>
          </div>
          <Link
            href="/?category=electronics"
            className="inline-block bg-[#f57224] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#e5611a] transition-colors w-fit shadow-lg"
          >
            {t("hero.checkOut")}
          </Link>
        </div>
        <div className="absolute top-5 right-5 md:top-8 md:right-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center px-3 py-2">
          <span className="text-white font-bold text-sm text-center leading-tight">{t("hero.upTo")}<br />{t("hero.off")}</span>
        </div>
        <div className="absolute bottom-5 right-24 md:right-40 flex gap-3 opacity-90">
          <div className="w-14 h-20 bg-white/20 rounded-xl backdrop-blur-sm" />
          <div className="w-12 h-16 bg-white/20 rounded-xl backdrop-blur-sm" />
          <div className="w-16 h-14 bg-white/20 rounded-xl backdrop-blur-sm" />
        </div>
      </div>
    </section>
  );
}
