"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const ITEMS = [
  { titleKey: "privacy.collectTitle", textKey: "privacy.collectText" },
  { titleKey: "privacy.useTitle", textKey: "privacy.useText" },
  { titleKey: "privacy.noSellTitle", textKey: "privacy.noSellText" },
  { titleKey: "privacy.securityTitle", textKey: "privacy.securityText" },
  { titleKey: "privacy.rightsTitle", textKey: "privacy.rightsText" },
];

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50/30">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-10 sm:py-14">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 h-56 sm:h-72 ring-4 ring-white/50">
          <Image src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=900&h=500&fit=crop" alt={t("privacy.title")} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end p-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">{t("privacy.title")}</h1>
              <p className="text-slate-200 text-sm sm:text-base mt-1">{t("privacy.subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-10 mb-8">
          <p className="text-slate-500 text-sm mb-8">{t("privacy.lastUpdated")}</p>
          <p className="text-slate-600 leading-relaxed mb-8 text-base">
            {t("privacy.intro")}
          </p>
          <ul className="space-y-5">
            {ITEMS.map((item, i) => (
              <li key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#f57224] text-white flex items-center justify-center font-bold text-sm">{i + 1}</span>
                <div><strong className="text-slate-800">{t(item.titleKey)}:</strong><span className="text-slate-600 ml-1">{t(item.textKey)}</span></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#f57224] text-white font-semibold shadow-lg hover:bg-[#e0651a] hover:shadow-xl transition-all">{t("common.backToHome")}</Link>
        </div>
      </div>
    </main>
  );
}
