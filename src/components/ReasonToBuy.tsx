"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const REASONS = [
  { title: "Extended Warranty", sub: "Know More", href: "#", icon: "🛡️" },
  { title: "Packaging Video", sub: "Know More", href: "#", icon: "📦" },
  { title: "Open Parcel", sub: "ISB - LHR - KHI", href: "#", icon: "📷" },
  { title: "Easy Installments", sub: "Know More", href: "#", icon: "💳" },
];

export default function ReasonToBuy() {
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 min-w-0">
      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">{t("home.reasonsToBuy")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {REASONS.map((r) => (
          <Link
            key={r.title}
            href={r.href}
            className="flex flex-col items-center text-center p-4 sm:p-6 rounded-xl bg-white border border-slate-200 hover:border-[#f57224]/50 hover:shadow-md transition-all duration-200 active:scale-[0.99]"
          >
            <span className="text-xl sm:text-2xl mb-1.5 sm:mb-2">{r.icon}</span>
            <span className="font-semibold text-slate-800 text-sm sm:text-base">{r.title}</span>
            <span className="text-xs sm:text-sm text-[#f57224] font-medium mt-1">{r.sub}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
