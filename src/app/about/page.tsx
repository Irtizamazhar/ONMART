"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const BOXES = [
  { titleKey: "about.missionTitle", textKey: "about.missionText", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=260&fit=crop", id: "mission" },
  { titleKey: "about.careersTitle", textKey: "about.careersText", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=260&fit=crop", id: "careers" },
  { titleKey: "about.pressTitle", textKey: "about.pressText", image: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=260&fit=crop", id: "press" },
  { titleKey: "about.warrantyTitle", textKey: "about.warrantyText", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=260&fit=crop", id: "warranty" },
  { titleKey: "about.sellTitle", textKey: "about.sellText", image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=260&fit=crop", id: "sell" },
];

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50/30">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-10 sm:py-14">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 h-56 sm:h-72 ring-4 ring-white/50">
          <Image src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&h=500&fit=crop" alt={t("about.title")} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end p-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">{t("about.title")}</h1>
              <p className="text-slate-200 text-sm sm:text-base mt-1">{t("about.subtitle")}</p>
            </div>
          </div>
        </div>
        <p className="text-slate-600 leading-relaxed text-center max-w-2xl mx-auto mb-14 text-base sm:text-lg">
          {t("about.intro")}
        </p>
        <div className="space-y-8">
          {BOXES.map((box, i) => (
            <article key={box.id} id={box.id} className="group bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden hover:shadow-xl hover:border-orange-200/60 transition-all duration-300">
              <div className={`grid grid-cols-1 sm:grid-cols-5 gap-0 ${i % 2 === 1 ? "sm:flex-row-reverse" : ""}`}>
                <div className="relative h-52 sm:h-auto sm:min-h-[220px] sm:col-span-2 order-2 sm:order-1">
                  <Image src={box.image} alt={t(box.titleKey)} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 40vw" />
                </div>
                <div className="p-6 sm:p-8 sm:col-span-3 flex flex-col justify-center order-1 sm:order-2 bg-gradient-to-br from-white to-slate-50/50">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 text-[#f57224]">{t(box.titleKey)}</h2>
                  <p className="text-slate-600 leading-relaxed">{t(box.textKey)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#f57224] text-white font-semibold shadow-lg hover:bg-[#e0651a] hover:shadow-xl transition-all">{t("common.backToHome")}</Link>
        </div>
      </div>
    </main>
  );
}
