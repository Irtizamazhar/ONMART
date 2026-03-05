"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const MEN_FASHION_IMAGES = [
  { src: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&h=500&fit=crop", alt: "Men's traditional fashion" },
  { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop", alt: "Watches" },
  { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop", alt: "Men's shoes" },
];

export default function RamadanBazaarBanner() {
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-4 py-6 md:py-8" aria-label="Ramadan Bazaar promotion">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0a3324] via-[#0d4d38] to-[#0a3324] border border-amber-500/20 shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {/* Crescent moon - classic Islamic style */}
          <svg className="absolute top-8 right-14 w-12 h-12 md:w-16 md:h-16 text-amber-400/30" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="24" fill="currentColor" />
            <circle cx="42" cy="28" r="20" fill="#0d4d38" />
          </svg>
          <svg className="absolute bottom-14 left-8 w-10 h-10 text-amber-400/20" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="24" fill="currentColor" />
            <circle cx="42" cy="28" r="20" fill="#0a3324" />
          </svg>
          {/* Stars */}
          {[[12, 18], [18, 8], [82, 22], [88, 14], [10, 70], [90, 75], [50, 5], [25, 85]].map(([left, top], i) => (
            <svg key={i} className="absolute w-3 h-3 md:w-4 md:h-4 text-amber-300/50" style={{ left: `${left}%`, top: `${top}%` }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
            </svg>
          ))}
          {/* Lantern shapes */}
          <svg className="absolute bottom-10 left-6 w-9 h-12 text-amber-500/20 hidden sm:block" viewBox="0 0 36 48" fill="currentColor">
            <path d="M18 0l-4 8h8L18 0zm-6 10H8v6h4l2 24h8l2-24h4v-6H12z" />
          </svg>
          <svg className="absolute bottom-10 right-6 w-9 h-12 text-amber-500/20 hidden sm:block" viewBox="0 0 36 48" fill="currentColor">
            <path d="M18 0l-4 8h8L18 0zm-6 10H8v6h4l2 24h8l2-24h4v-6H12z" />
          </svg>
        </div>

        <div className="relative z-10 px-6 py-8 md:px-10 md:py-12 lg:px-14 lg:py-14">
          {/* Arabic/Urdu calligraphy - Ramadan Bazaar */}
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-400/95 tracking-wider" style={{ fontFamily: "Georgia, 'Traditional Arabic', serif" }}>
              رمضان بازار
            </h2>
            <p className="text-amber-200/90 text-sm md:text-base mt-2 tracking-[0.3em] uppercase">
              {t("ramadan.bazaar")}
            </p>
          </div>

          {/* Men's fashion images - center */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-10">
            {MEN_FASHION_IMAGES.map((img, i) => (
              <div key={i} className="relative w-[140px] h-[180px] md:w-[180px] md:h-[220px] lg:w-[200px] lg:h-[260px] rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-xl ring-2 ring-amber-400/20">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 140px, (max-width: 1024px) 180px, 200px"
                />
              </div>
            ))}
          </div>

          {/* UP TO 70% OFF - bold golden with glow */}
          <div className="text-center mb-6 md:mb-8">
            <p className="text-amber-100/90 text-sm md:text-base mb-1 uppercase tracking-widest">{t("ramadan.limitedTime")}</p>
            <p
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-amber-400"
              style={{
                textShadow: "0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.3), 0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {t("ramadan.upTo70")}
            </p>
            <p className="text-amber-200/80 text-sm md:text-base mt-2">{t("ramadan.onMensFashion")}</p>
          </div>

          {/* Shop Now button - gradient */}
          <div className="flex justify-center">
            <Link
              href="/?category=men's clothing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg text-amber-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 shadow-lg shadow-amber-500/40 hover:shadow-amber-400/50 hover:from-amber-300 hover:via-amber-200 hover:to-amber-300 transition-all duration-300 border border-amber-200/50"
            >
              <span>{t("promo.shopNow")}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
