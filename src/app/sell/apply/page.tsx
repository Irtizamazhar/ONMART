"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const ORANGE = "#f25a2a";

export default function SellApplyPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [city, setCity] = useState("");
  const [categories, setCategories] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/seller-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          shopName: shopName.trim() || undefined,
          city: city.trim() || undefined,
          categories: categories.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-slate-900 bg-cover bg-center bg-no-repeat relative seller-apply-page"
      style={{ backgroundImage: "url(/seller-apply-bg.png)" }}
    >
      <div className="absolute inset-0 bg-black/15" aria-hidden />
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]">
          {t("apply.title")}
        </h1>
        <p className="text-white/95 text-base sm:text-lg mb-10 drop-shadow-md [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
          {t("apply.subtitle")}
        </p>

        {submitted ? (
          <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/40 shadow-2xl p-8 sm:p-10 text-center ring-1 ring-white/10">
            <div className="rounded-full w-16 h-16 bg-emerald-500/40 flex items-center justify-center mx-auto mb-5 ring-4 ring-emerald-400/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">{t("apply.successTitle")}</h2>
            <p className="text-white/95 mb-8 text-base [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{t("apply.successText")}</p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              style={{ backgroundColor: ORANGE }}
            >
              {t("apply.backToSell")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/40 shadow-2xl p-6 sm:p-8 md:p-10 space-y-5 ring-1 ring-white/10">
            {error && (
              <div className="rounded-2xl bg-red-500/40 border border-red-400/60 px-4 py-3.5 text-sm font-medium text-white backdrop-blur-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.fullName")} *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("apply.fullName")}
                className="w-full rounded-2xl border-2 border-white/50 bg-black/30 text-white placeholder:text-white/70 px-4 py-3.5 text-base focus:border-white focus:ring-2 focus:ring-white/50 outline-none transition-all seller-apply-input"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.email")} *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("apply.email")}
                className="w-full rounded-2xl border-2 border-white/50 bg-black/30 text-white placeholder:text-white/70 px-4 py-3.5 text-base focus:border-white focus:ring-2 focus:ring-white/50 outline-none transition-all seller-apply-input"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.phone")} *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("apply.phone")}
                className="w-full rounded-2xl border-2 border-white/50 bg-black/30 text-white placeholder:text-white/70 px-4 py-3.5 text-base focus:border-white focus:ring-2 focus:ring-white/50 outline-none transition-all seller-apply-input"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.shopName")}</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder={t("apply.shopName")}
                className="w-full rounded-2xl border-2 border-white/50 bg-black/30 text-white placeholder:text-white/70 px-4 py-3.5 text-base focus:border-white focus:ring-2 focus:ring-white/50 outline-none transition-all seller-apply-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.city")}</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("apply.city")}
                className="w-full rounded-2xl border-2 border-white/50 bg-black/30 text-white placeholder:text-white/70 px-4 py-3.5 text-base focus:border-white focus:ring-2 focus:ring-white/50 outline-none transition-all seller-apply-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.categories")}</label>
              <input
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder={t("apply.categories")}
                className="w-full rounded-2xl border-2 border-white/50 bg-black/30 text-white placeholder:text-white/70 px-4 py-3.5 text-base focus:border-white focus:ring-2 focus:ring-white/50 outline-none transition-all seller-apply-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.message")}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("apply.message")}
                rows={4}
                className="w-full rounded-2xl border-2 border-white/50 bg-black/30 text-white placeholder:text-white/70 px-4 py-3.5 text-base focus:border-white focus:ring-2 focus:ring-white/50 outline-none transition-all resize-none seller-apply-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: ORANGE }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t("apply.submit")}
                </>
              ) : (
                t("apply.submit")
              )}
            </button>
          </form>
        )}

        <p className="mt-8 text-center">
          <Link href="/sell" className="text-base font-medium text-white/95 hover:text-white hover:underline [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] transition-colors">
            {t("apply.backToSell")}
          </Link>
        </p>
      </div>
    </main>
  );
}
