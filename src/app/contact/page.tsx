"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50/30">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-10 sm:py-14">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 h-56 sm:h-72 ring-4 ring-white/50">
          <Image src="https://images.unsplash.com/photo-1484480974693-6ca0a1fb2f57?w=900&h=500&fit=crop" alt={t("contact.title")} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end p-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">{t("contact.title")}</h1>
              <p className="text-slate-200 text-sm sm:text-base mt-1">{t("contact.subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-48">
              <Image src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=320&fit=crop" alt={t("contact.getInTouch")} fill className="object-cover" />
            </div>
            <div className="p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 mb-4 text-[#f57224]">{t("contact.getInTouch")}</h2>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-[#f57224] font-bold">@</span><strong className="text-slate-800">{t("contact.email")}:</strong> support@onmart.com</li>
                <li className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-[#f57224] font-bold">📞</span><strong className="text-slate-800">{t("contact.phone")}:</strong> +92 XXX XXXXXXX</li>
                <li className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-[#f57224] font-bold">📍</span><strong className="text-slate-800">{t("contact.address")}:</strong> Onmart HQ, City, Pakistan</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-slate-800 mb-5 text-[#f57224]">{t("contact.sendMessage")}</h2>
            {submitted ? (
              <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-6 text-green-800 text-center">
                <p className="text-lg font-medium">{t("contact.thankYou")}</p>
                <p className="text-sm mt-1">{t("contact.weWillBack")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder={t("contact.yourName")} value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[#f57224] focus:ring-2 focus:ring-orange-100 outline-none transition" />
                <input type="email" placeholder={t("contact.yourEmail")} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[#f57224] focus:ring-2 focus:ring-orange-100 outline-none transition" />
                <textarea placeholder={t("contact.yourMessage")} value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[#f57224] focus:ring-2 focus:ring-orange-100 outline-none transition resize-none" />
                <button type="submit" className="w-full py-3.5 rounded-xl bg-[#f57224] text-white font-semibold hover:bg-[#e0651a] shadow-lg hover:shadow-xl transition-all">{t("contact.submit")}</button>
              </form>
            )}
          </div>
        </div>
        <div className="mt-14 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#f57224] text-white font-semibold shadow-lg hover:bg-[#e0651a] hover:shadow-xl transition-all">{t("common.backToHome")}</Link>
        </div>
      </div>
    </main>
  );
}
