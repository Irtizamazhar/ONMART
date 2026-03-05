"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Loader() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-[180px] py-10">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-[var(--daraz-orange)] rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">{t("common.loading")}</p>
      </div>
    </div>
  );
}
