"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const ORANGE = "#f25a2a";

function normalizeEmailOrPhone(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  if (raw.includes("@")) return raw.toLowerCase();
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length < 10) return raw;
  const with92 = digits.startsWith("92") && digits.length >= 12 ? digits : "92" + digits.replace(/^92/, "");
  return with92.length >= 12 ? "+" + with92 : raw;
}

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!emailOrPhone.trim()) {
      setError(t("forgot.enterEmail"));
      return;
    }
    const toSend = normalizeEmailOrPhone(emailOrPhone);
    if (!toSend) {
      setError("Enter a valid email or phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: toSend }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSent(true);
        if (data.resetLink) setResetLink(data.resetLink);
      } else {
        setError(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-100">
      <div className="w-full max-w-[420px]">
        <div className="rounded-xl bg-white p-6 shadow-xl sm:p-8">
          <h1 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">{t("forgot.title")}</h1>
          {sent ? (
            <div className="mt-5 space-y-3">
              <p className="text-slate-600 text-sm">
                {t("forgot.ifAccountExists").replace("{email}", emailOrPhone)}
              </p>
              {resetLink && (
                <p className="text-xs text-slate-500">
                  Dev: <a href={resetLink} className="text-orange-600 hover:underline break-all">Click here to reset password</a>
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Email or phone number (e.g. +92 300 1234567)"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[var(--daraz-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--daraz-orange)]"
                autoComplete="username"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3.5 text-base font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: ORANGE }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending…
                  </>
                ) : t("forgot.sendResetLink")}
              </button>
            </form>
          )}
          <p className="mt-5 text-center text-sm text-slate-600">
            <Link href="/" className="font-semibold text-blue-600 hover:underline">
              {t("forgot.backToLogin")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
