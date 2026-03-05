"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const ORANGE = "#f25a2a";

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const ok = await signup(email.trim(), password, name.trim());
    if (ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Email may already be registered or something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] sm:max-w-[480px]">
        <div className="rounded-xl bg-white p-6 shadow-xl sm:p-8">
          <h1 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">{t("auth.createAccount")}</h1>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("auth.fullName")}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[var(--daraz-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--daraz-orange)]"
                autoComplete="name"
              />
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.phoneOrEmail")}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[var(--daraz-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--daraz-orange)]"
                autoComplete="email"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password")}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-10 text-slate-800 placeholder:text-slate-400 focus:border-[var(--daraz-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--daraz-orange)]"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("auth.confirmPassword")}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[var(--daraz-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--daraz-orange)]"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg py-3.5 text-base font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-95"
              style={{ backgroundColor: ORANGE }}
            >
              {t("auth.signUp")}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              {t("auth.login")}
            </Link>
          </p>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-sm text-slate-500">{t("auth.orSignUpWith")}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t("auth.google")}
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {t("auth.facebook")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
