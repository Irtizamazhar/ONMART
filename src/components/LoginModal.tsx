"use client";

import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const ORANGE = "#f25a2a";

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal, openSignupModal, login, loginWithPhoneOtp } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [tab, setTab] = useState<"password" | "phone">("password");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("PK+92");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!emailOrPhone.trim()) {
      setError(t("auth.phoneOrEmail"));
      return;
    }
    if (!password) {
      setError(t("auth.pleaseEnterPassword"));
      return;
    }
    if (password.length < 4) {
      setError(t("auth.invalidCredentials"));
      return;
    }
    const isEmail = emailOrPhone.trim().includes("@");
    const loginId = isEmail ? emailOrPhone.trim().toLowerCase() : (() => {
      const raw = emailOrPhone.trim().replace(/\D/g, "");
      if (raw.startsWith("0")) {
        if (raw.length !== 11) return "";
        return "+92" + raw.slice(1);
      }
      if (raw.startsWith("92")) {
        if (raw.length !== 12) return "";
        return "+" + raw;
      }
      return "";
    })();
    if (!loginId) {
      setError(!isEmail && emailOrPhone.trim() ? t("auth.invalidCredentials") : t("auth.phoneOrEmail"));
      return;
    }
    setLoading(true);
    const result = await login(loginId, password);
    setLoading(false);
    if (result.ok) {
      closeLoginModal();
      setEmailOrPhone("");
      setPassword("");
      router.refresh();
    } else {
      setError(result.error || t("auth.invalidCredentialsPhone"));
    }
  };

  const getFullPhone = (): string => {
    const countryDigits = countryCode.replace(/\D/g, "") || "92";
    let phoneDigits = phone.trim().replace(/\D/g, "");
    if (phoneDigits.startsWith("0")) {
      if (phoneDigits.length !== 11) return "";
      phoneDigits = phoneDigits.slice(1);
    } else if (phoneDigits.startsWith(countryDigits) && phoneDigits.length > countryDigits.length) {
      phoneDigits = phoneDigits.slice(countryDigits.length);
    }
    if (phoneDigits.length !== 10) return "";
    const combined = countryDigits + phoneDigits;
    return "+" + combined;
  };

  const handleSendCode = async () => {
    const fullPhone = getFullPhone();
    if (!fullPhone) {
      setError(t("auth.invalidPhone"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to send code.");
        return;
      }
      setOtpSent(true);
      setOtp("");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async (e: FormEvent) => {
    e.preventDefault();
    const fullPhone = getFullPhone();
    if (!fullPhone || fullPhone.length < 12) {
      setError("Invalid phone number.");
      return;
    }
    if (otp.trim().length < 4) {
      setError(t("auth.enterCode"));
      return;
    }
    setError("");
    setLoading(true);
    const ok = await loginWithPhoneOtp(fullPhone, otp.trim());
    setLoading(false);
    if (ok) {
      closeLoginModal();
      setPhone("");
      setOtp("");
      setOtpSent(false);
      router.refresh();
    } else {
      setError(t("auth.invalidCode"));
    }
  };

  const handleClose = () => {
    setError("");
    setEmailOrPhone("");
    setPassword("");
    setPhone("");
    setOtp("");
    setOtpSent(false);
    setTab("password");
    closeLoginModal();
  };

  if (!loginModalOpen) return null;

  const modalContent = (
    <div className="contents">
      <div
        className="fixed inset-0 z-[9998] bg-black/50 animate-fade-in"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pointer-events-none"
        aria-hidden
      >
        <div
          className="w-full max-w-[420px] max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-white shadow-2xl scrollbar-hide sm:max-w-[440px] animate-scale-in pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Login"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-6 pb-6">
          {/* Tabs: Password | Phone Number */}
          <div className="flex items-center justify-between border-b border-slate-200">
            <button
              type="button"
              onClick={() => { setTab("password"); setError(""); setOtpSent(false); }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === "password" ? "border-[#f57224] text-[#f57224]" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t("auth.passwordTab")}
            </button>
            <button
              type="button"
              onClick={() => { setTab("phone"); setError(""); }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === "phone" ? "border-[#f57224] text-[#f57224]" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t("auth.phoneTab")}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              aria-label="Close"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          {tab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={t("auth.phoneOrEmail")}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[#f57224] focus:outline-none focus:ring-1 focus:ring-[#f57224]"
                autoComplete="username"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.pleaseEnterPassword")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-10 text-slate-800 placeholder:text-slate-400 focus:border-[#f57224] focus:outline-none focus:ring-1 focus:ring-[#f57224]"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-slate-500 hover:text-slate-700 hover:underline">{t("auth.forgotPassword")}</Link>
              </div>
              <button type="submit" className="w-full rounded-lg py-3.5 text-base font-bold uppercase tracking-wide text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed" style={{ backgroundColor: ORANGE }} disabled={loading}>
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t("auth.loginButton")}
                  </>
                ) : t("auth.loginButton")}
              </button>
            </form>
          )}

          {tab === "phone" && (
            <form onSubmit={otpSent ? handlePhoneVerify : (e) => { e.preventDefault(); handleSendCode(); }} className="mt-5 space-y-4">
              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
              <p className="text-xs text-slate-500">{t("auth.useSamePhone")}</p>
              <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                <span className="flex items-center px-3 bg-slate-50 text-slate-600 text-sm border-r border-slate-300 font-medium">+92</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "").replace(/^92(?=\d{10})/, "");
                    if (v.startsWith("0")) v = v.replace(/^0+/, "");
                    setPhone(v);
                  }}
                  placeholder="3001234567 or 03001234567"
                  className="flex-1 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  disabled={otpSent}
                />
              </div>
              {otpSent && (
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={t("auth.codePlaceholder")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[#f57224] focus:outline-none focus:ring-1 focus:ring-[#f57224]"
                  maxLength={6}
                />
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3.5 text-base font-bold text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: ORANGE }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {otpSent ? t("auth.verifyButton") : t("auth.sendCodeViaSms")}
                  </>
                ) : otpSent ? t("auth.verifyButton") : t("auth.sendCodeViaSms")}
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-slate-600">
            {t("auth.noAccount")}{" "}
            <button type="button" onClick={() => { handleClose(); openSignupModal(); }} className="font-semibold text-blue-600 hover:underline">
              {t("auth.signUp")}
            </button>
          </p>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-slate-500">{t("auth.orLoginWith")}</span></div>
          </div>
          <div className="flex gap-3">
            <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              {t("auth.google")}
            </button>
            <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              {t("auth.facebook")}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
