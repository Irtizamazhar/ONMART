"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const FAQ_KEYS = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
  { q: "faq.q7", a: "faq.a7" },
  { q: "faq.q8", a: "faq.a8" },
  { q: "faq.q9", a: "faq.a9" },
  { q: "faq.q10", a: "faq.a10" },
];

export default function FAQPage() {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50/30">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-10 sm:py-14">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 h-56 sm:h-72 ring-4 ring-white/50">
          <Image src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&h=500&fit=crop" alt={t("faq.title")} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end p-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">{t("faq.title")}</h1>
              <p className="text-slate-200 text-sm sm:text-base mt-1">{t("faq.subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {FAQ_KEYS.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 hover:shadow-lg hover:border-orange-200/50 transition-all">
              <h2 className="font-bold text-slate-800 mb-2 text-lg flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#f57224] text-white flex items-center justify-center text-sm font-bold">{i + 1}</span>
                {t(faq.q)}
              </h2>
              <p className="text-slate-600 leading-relaxed pl-11">{t(faq.a)}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#f57224] text-white font-semibold shadow-lg hover:bg-[#e0651a] hover:shadow-xl transition-all">{t("common.backToHome")}</Link>
        </div>
      </div>
    </main>
  );
}
