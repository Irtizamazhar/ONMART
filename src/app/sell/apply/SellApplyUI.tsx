"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES, type LangCode } from "@/data/translations";
import Logo from "@/components/Logo";
import ApplyPageRoot from "./ApplyPageRoot";

const ORANGE = "#f25a2a";

const MAX_IMAGE_DIM = 1000;
const JPEG_QUALITY = 0.75;

/** Compress image to smaller base64 JPEG for DB/store. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > MAX_IMAGE_DIM || height > MAX_IMAGE_DIM) {
        if (width > height) {
          height = (height / width) * MAX_IMAGE_DIM;
          width = MAX_IMAGE_DIM;
        } else {
          width = (width / height) * MAX_IMAGE_DIM;
          height = MAX_IMAGE_DIM;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image"));
    };
    img.src = url;
  });
}

/** Normalize to E.164 for Pakistan (03xx, 3xx, +92...) */
function toE164(value: string): string {
  const digits = value.trim().replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) return "+92" + digits.slice(1);
  if (digits.startsWith("92") && digits.length === 12) return "+" + digits;
  if (digits.length === 10 && digits.startsWith("3")) return "+92" + digits;
  return "";
}

/** Format CNIC as 35201-1234567-1 (5-7-1). Input: digits only, max 13. */
function formatCnicDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 13);
  if (d.length <= 5) return d;
  if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12, 13)}`;
}

/** Accept any image for CNIC; name/upper part should be visible (user responsibility). */
function checkImageIsCnicShape(dataUrl: string): Promise<{ ok: boolean; message?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w <= 0 || h <= 0) {
        resolve({ ok: false, message: "Invalid image." });
        return;
      }
      resolve({ ok: true });
    };
    img.onerror = () => resolve({ ok: false, message: "Could not read image." });
    img.src = dataUrl;
  });
}

export default function SellApplyUI() {
  const { t, language, setLanguage } = useLanguage();
  const [step, setStep] = useState<"phone" | "otp" | "form">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneVerified, setPhoneVerified] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [city, setCity] = useState("");
  const [categories, setCategories] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [vendorType, setVendorType] = useState<"individual" | "cooperative" | null>(null);
  const [cnicNumber, setCnicNumber] = useState("");
  const [cnicFront, setCnicFront] = useState("");
  const [cnicBack, setCnicBack] = useState("");
  const [cnicVerified, setCnicVerified] = useState(false);
  const [warehouseImage, setWarehouseImage] = useState("");
  const [storeImage, setStoreImage] = useState("");
  const [formPart, setFormPart] = useState<1 | 2>(1);
  const [dragOverFront, setDragOverFront] = useState(false);
  const [dragOverBack, setDragOverBack] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailUsedError, setEmailUsedError] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  useEffect(() => {
    if (!languageDropdownOpen && !countryDropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-sell-header-dropdown]")) {
        setLanguageDropdownOpen(false);
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [languageDropdownOpen, countryDropdownOpen]);

  const readFileAsDataUrl = (file: File, maxSizeMB = 1.5): Promise<string> =>
    new Promise((resolve, reject) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        reject(new Error(`Image must be under ${maxSizeMB}MB`));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const readImageCompressed = async (file: File): Promise<string> => {
    if (!file.type.startsWith("image/")) throw new Error("Not an image");
    return compressImage(file);
  };

  const handleCnicFront = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readImageCompressed(file);
      setCnicFront(data);
      setCnicVerified(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid image");
    }
    e.target.value = "";
  };
  const handleCnicBack = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readImageCompressed(file);
      setCnicBack(data);
      setCnicVerified(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid image");
    }
    e.target.value = "";
  };
  const processFileForCnicFront = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      const data = await readImageCompressed(file);
      setCnicFront(data);
      setCnicVerified(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid image");
    }
  };
  const processFileForCnicBack = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      const data = await readImageCompressed(file);
      setCnicBack(data);
      setCnicVerified(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid image");
    }
  };
  const handleWarehouseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readImageCompressed(file);
      setWarehouseImage(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid image");
    }
    e.target.value = "";
  };
  const handleStoreImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readImageCompressed(file);
      setStoreImage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid image");
    }
    e.target.value = "";
  };

  const handleVerifyCnic = async () => {
    if (!cnicFront || !cnicBack) return;
    setError("");
    const front = await checkImageIsCnicShape(cnicFront);
    if (!front.ok) {
      setError(front.message ?? "Invalid CNIC front. Upload actual ID card (landscape).");
      return;
    }
    const back = await checkImageIsCnicShape(cnicBack);
    if (!back.ok) {
      setError(back.message ?? "Invalid CNIC back. Upload actual ID card (landscape).");
      return;
    }
    setCnicVerified(true);
    setError("");
  };

  const fullPhone = toE164(phoneInput);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullPhone) {
      setError(t("apply.enterOtpError") || "Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, intent: "seller_apply" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to send OTP.");
        return;
      }
      setOtpSent(true);
      setOtp("");
      setStep("otp");
      setResendCooldown(60);
      const iv = setInterval(() => {
        setResendCooldown((c) => (c <= 1 ? (clearInterval(iv), 0) : c - 1));
      }, 1000);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.trim().length < 4) {
      setError(t("apply.enterOtpError") || "Please enter the OTP code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, code: otp.trim(), intent: "seller_apply" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Invalid or expired code.");
        return;
      }
      if (data.verified) {
        setPhoneVerified(fullPhone);
        setStep("form");
        setError("");
      } else {
        setError("Invalid or expired code.");
      }
    } catch {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, intent: "seller_apply" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to resend OTP.");
        return;
      }
      setOtp("");
      setResendCooldown(60);
      const iv = setInterval(() => {
        setResendCooldown((c) => (c <= 1 ? (clearInterval(iv), 0) : c - 1));
      }, 1000);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (emailUsedError) {
      setError(emailUsedError);
      return;
    }
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!vendorType) {
      setError(t("apply.vendorType") ? `${t("apply.vendorType")} - ${t("apply.individual")} / ${t("apply.cooperative")}` : "Please select Individual or Cooperative.");
      return;
    }
    if (vendorType === "cooperative" && !warehouseImage) {
      setError(t("apply.warehouseImageRequired") || "Warehouse image is required for Cooperative.");
      return;
    }
    if (!cnicFront || !cnicBack) {
      setError(t("apply.uploadBothCnic") || "Please upload both CNIC front and back.");
      return;
    }
    if (!cnicVerified) {
      setError(t("apply.verifyCnicToContinue") || "Please upload both CNIC images and click Verify CNIC to continue.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password is required and must be at least 6 characters.");
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
          phone: phoneVerified || fullPhone,
          shopName: shopName.trim() || undefined,
          city: city.trim() || undefined,
          categories: categories.trim() || undefined,
          message: message.trim() || undefined,
          vendorType,
          cnicFront: cnicFront || undefined,
          cnicBack: cnicBack || undefined,
          cnicNumber: cnicNumber.trim().replace(/\D/g, "").slice(0, 20) || undefined,
          storeImage: storeImage || undefined,
          warehouseImage: vendorType === "cooperative" ? warehouseImage || undefined : undefined,
          password: password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit.");
      }
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg === "Already used email." ? "Already used email." : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApplyPageRoot>
      <header
        className="w-full sticky top-0 z-40 border-b border-orange-900/40"
        style={{ backgroundColor: ORANGE }}
      >
        <div className="max-w-6xl mx-auto px-4 h-10 sm:h-12 flex items-center justify-between">
          <Link href="/sell" className="flex items-center gap-1 shrink-0 text-white font-semibold" aria-label="Onmart Seller Center">
            <Logo variant="white" className="!text-white" />
            <span className="text-white/95 text-xs sm:text-sm font-medium ml-1 hidden sm:inline">Seller Center</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative" data-sell-header-dropdown>
              <button
                type="button"
                onClick={() => { setCountryDropdownOpen((o) => !o); setLanguageDropdownOpen(false); }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded text-white/95 hover:text-white hover:bg-white/20 text-sm"
              >
                <span aria-hidden>🇵🇰</span>
                <span>Pakistan</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {countryDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                  <div className="px-3 py-2 text-gray-300 text-sm">🇵🇰 Pakistan</div>
                </div>
              )}
            </div>
            <div className="relative" data-sell-header-dropdown>
              <button
                type="button"
                onClick={() => { setLanguageDropdownOpen((o) => !o); setCountryDropdownOpen(false); }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded text-white/95 hover:text-white hover:bg-white/20 text-sm"
              >
                <span>{LANGUAGES.find((l) => l.code === language)?.label ?? "English"}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {languageDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 min-w-[140px] max-h-60 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => { setLanguage(lang.code as LangCode); setLanguageDropdownOpen(false); }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${language === lang.code ? "text-white bg-gray-700" : "text-gray-300 hover:bg-gray-800"}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div
        className="flex-1 flex flex-col items-center justify-center py-8 pb-12 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url(/seller-apply-bg.png)" }}
      >
        <div className="absolute inset-0 bg-black/15 pointer-events-none" aria-hidden />
        {!submitted && (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight drop-shadow-lg text-center [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]">
              {t("apply.signupOnOnmart")}
            </h1>
            <p className="text-white/90 text-sm sm:text-base mb-5 drop-shadow-md text-center [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
              {step === "phone" || step === "otp" ? (t("apply.otpSubtitle") || "Enter your phone number and verify with OTP to continue.") : t("apply.subtitle")}
            </p>
          </>
        )}

        {submitted ? (
          <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl p-6 sm:p-8 text-center ring-1 ring-white/20">
            <div className="rounded-full w-14 h-14 bg-emerald-500/40 flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-400/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">{t("apply.successTitle")}</h2>
            <p className="text-white/95 mb-2 text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{t("apply.successText")}</p>
            <p className="text-white/90 mb-6 text-sm font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">Please wait for approval within 24 hours.</p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              style={{ backgroundColor: ORANGE }}
            >
              {t("apply.backToSell")}
            </Link>
          </div>
        ) : step === "phone" ? (
          <form onSubmit={handleSendOtp} className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl p-5 sm:p-6 space-y-4 ring-1 ring-white/20">
            <p className="text-white/95 text-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
              {t("apply.alreadyHaveAccount")}{" "}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: ORANGE }}>
                {t("apply.logIn")}
              </Link>
            </p>
            {error && (
              <div className="rounded-2xl bg-red-500/40 border border-red-400/60 px-4 py-3.5 text-sm font-medium text-white backdrop-blur-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.phone")} *</label>
              <div className="flex rounded-2xl border-2 border-white/50 bg-black/30 overflow-hidden focus-within:border-white focus-within:ring-2 focus-within:ring-white/50">
                <span className="flex items-center gap-1.5 px-4 py-3.5 text-white/90 text-sm border-r border-white/30 bg-black/20">
                  <span className="text-green-400" aria-hidden>📱</span> +92
                </span>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder={t("apply.phonePlaceholder") || "9xxxx"}
                  className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/70 px-4 py-3.5 text-base outline-none seller-apply-input"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !fullPhone}
              className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ backgroundColor: ORANGE }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t("apply.sendOtp")}
                </>
              ) : (
                t("apply.sendOtp")
              )}
            </button>
            <p className="text-white/80 text-xs sm:text-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
              {t("apply.termsPrefix")}{" "}
              <Link href="/terms" className="font-semibold hover:underline" style={{ color: ORANGE }}>{t("apply.termsLink")}</Link>
              {" "}{t("apply.termsAnd")}{" "}
              <Link href="/privacy-policy" className="font-semibold hover:underline" style={{ color: ORANGE }}>{t("apply.privacyLink")}</Link>
            </p>
          </form>
        ) : step === "otp" ? (
          <form onSubmit={handleVerifyOtp} className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl p-5 sm:p-6 space-y-4 ring-1 ring-white/20">
            {error && (
              <div className="rounded-2xl bg-red-500/40 border border-red-400/60 px-4 py-3.5 text-sm font-medium text-white backdrop-blur-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.phone")}</label>
              <input
                type="text"
                value={fullPhone}
                readOnly
                className="w-full rounded-2xl border-2 border-white/50 bg-black/50 text-white px-4 py-3.5 text-base seller-apply-input opacity-90"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.enterOtp")} *</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full rounded-2xl border-2 border-white/50 bg-black/30 text-white placeholder:text-white/70 px-4 py-3.5 text-base focus:border-white focus:ring-2 focus:ring-white/50 outline-none transition-all seller-apply-input"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading || otp.trim().length < 4}
                className="flex-1 py-4 rounded-2xl text-white font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: ORANGE }}
              >
                {loading ? t("auth.verifying") : t("auth.verifyButton")}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendCooldown > 0}
                className="py-4 px-6 rounded-2xl border-2 border-white/60 text-white font-semibold hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {resendCooldown > 0 ? `${t("apply.resendOtp")} (${resendCooldown}s)` : t("apply.resendOtp")}
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setStep("phone"); setError(""); setOtp(""); }}
              className="w-full text-sm text-white/80 hover:text-white"
            >
              ← Change phone number
            </button>
          </form>
        ) : (
          <form onSubmit={formPart === 2 ? handleSubmitForm : (e) => { e.preventDefault(); setFormPart(2); }} className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl p-5 sm:p-6 space-y-4 ring-1 ring-white/20">
            {error && (
              <div className="rounded-2xl bg-red-500/40 border border-red-400/60 px-4 py-3.5 text-sm font-medium text-white backdrop-blur-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                {error}
              </div>
            )}
            {formPart === 1 ? (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.phone")}</label>
                  <input
                    type="text"
                    value={phoneVerified}
                    readOnly
                    className="w-full rounded-2xl border-2 border-white/50 bg-black/50 text-white px-4 py-3.5 text-base seller-apply-input opacity-90"
                  />
                </div>
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
                    onChange={(e) => { setEmail(e.target.value); setEmailUsedError(""); }}
                    onBlur={async () => {
                      const e = email.trim();
                      if (!e || e.length < 3) return;
                      setEmailChecking(true);
                      try {
                        const res = await fetch(`/api/seller-apply?email=${encodeURIComponent(e)}`);
                        const data = await res.json().catch(() => ({}));
                        setEmailUsedError(data.used ? "Already used email." : "");
                      } finally {
                        setEmailChecking(false);
                      }
                    }}
                    placeholder={t("apply.email")}
                    className="w-full rounded-2xl border-2 border-white/50 bg-black/30 text-white placeholder:text-white/70 px-4 py-3.5 text-base focus:border-white focus:ring-2 focus:ring-white/50 outline-none transition-all seller-apply-input"
                    required
                  />
                  {emailUsedError && (
                    <p className="text-red-400 text-sm font-medium flex items-center gap-1">
                      <span aria-hidden>⚠</span> {emailUsedError}
                    </p>
                  )}
                  {emailChecking && (
                    <p className="text-white/70 text-xs">Checking email...</p>
                  )}
                </div>
                <div className="space-y-2 rounded-2xl border-2 border-white/40 bg-black/20 p-4">
                  <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.cnicFront")} / {t("apply.cnicBack")}</label>
                  <p className="text-xs text-white/70">Name and details should be clearly visible in the image.</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCnicDisplay(cnicNumber)}
                    onChange={(e) => setCnicNumber(e.target.value.replace(/\D/g, "").slice(0, 13))}
                    placeholder={t("apply.cnicNumberPlaceholder") || "e.g. 35201-1234567-1"}
                    className="w-full rounded-xl border-2 border-white/50 bg-black/30 text-white placeholder:text-white/70 px-3 py-2.5 text-sm seller-apply-input"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-xs text-white/80 mb-1">{t("apply.cnicFrontLabel")}</span>
                      <label
                        className={`block rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors min-h-[100px] flex flex-col items-center justify-center gap-1 ${dragOverFront ? "border-white bg-white/10" : "border-white/50 bg-black/30 hover:border-white/70"} ${cnicFront ? "border-emerald-400/60 bg-emerald-500/10" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFront(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFront(false); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverFront(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) processFileForCnicFront(file);
                        }}
                      >
                        <input type="file" accept="image/*" className="hidden" onChange={handleCnicFront} />
                        {cnicFront ? (
                          <span className="flex flex-col items-center gap-1.5">
                            <span className="text-emerald-400 text-sm font-medium">✓ {t("apply.cnicFront")}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCnicFront(""); setCnicVerified(false); setError(""); }}
                              className="text-white/90 text-xs underline hover:text-white focus:outline-none"
                            >
                              Remove
                            </button>
                          </span>
                        ) : (
                          <>
                            <svg className="w-8 h-8 text-white/60 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.96 8H16a4 4 0 010 8h-4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <span className="text-white/80 text-xs">Drag & drop or click</span>
                          </>
                        )}
                      </label>
                    </div>
                    <div>
                      <span className="block text-xs text-white/80 mb-1">{t("apply.cnicBackLabel")}</span>
                      <label
                        className={`block rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors min-h-[100px] flex flex-col items-center justify-center gap-1 ${dragOverBack ? "border-white bg-white/10" : "border-white/50 bg-black/30 hover:border-white/70"} ${cnicBack ? "border-emerald-400/60 bg-emerald-500/10" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverBack(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverBack(false); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverBack(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) processFileForCnicBack(file);
                        }}
                      >
                        <input type="file" accept="image/*" className="hidden" onChange={handleCnicBack} />
                        {cnicBack ? (
                          <span className="flex flex-col items-center gap-1.5">
                            <span className="text-emerald-400 text-sm font-medium">✓ {t("apply.cnicBack")}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCnicBack(""); setCnicVerified(false); setError(""); }}
                              className="text-white/90 text-xs underline hover:text-white focus:outline-none"
                            >
                              Remove
                            </button>
                          </span>
                        ) : (
                          <>
                            <svg className="w-8 h-8 text-white/60 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.96 8H16a4 4 0 010 8h-4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <span className="text-white/80 text-xs">Drag & drop or click</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleVerifyCnic()}
                    disabled={!cnicFront || !cnicBack}
                    className="w-full py-2.5 rounded-xl border-2 border-white/50 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                  >
                    {cnicVerified ? `✓ ${t("apply.cnicVerified")}` : t("apply.verifyCnic")}
                  </button>
                  <button
                    type="submit"
                    disabled={!cnicFront || !cnicBack || !cnicVerified}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: ORANGE }}
                  >
                    {t("apply.next")} →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.vendorType")} *</label>
                  <div className="flex gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-white/50 bg-black/30 px-4 py-3.5 cursor-pointer transition-all has-[:checked]:border-white has-[:checked]:ring-2 has-[:checked]:ring-white/50 has-[:checked]:bg-black/50">
                      <input type="radio" name="vendorType" checked={vendorType === "individual"} onChange={() => { setVendorType("individual"); setWarehouseImage(""); }} className="sr-only" />
                      <span className="text-white font-medium">{t("apply.individual")}</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-white/50 bg-black/30 px-4 py-3.5 cursor-pointer transition-all has-[:checked]:border-white has-[:checked]:ring-2 has-[:checked]:ring-white/50 has-[:checked]:bg-black/50">
                      <input type="radio" name="vendorType" checked={vendorType === "cooperative"} onChange={() => setVendorType("cooperative")} className="sr-only" />
                      <span className="text-white font-medium">{t("apply.cooperative")}</span>
                    </label>
                  </div>
                </div>
                {vendorType === "cooperative" && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{t("apply.warehousePicture")} *</label>
                    <label className="block rounded-2xl border-2 border-dashed border-white/50 bg-black/30 p-4 text-center cursor-pointer hover:border-white/70 transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={handleWarehouseImage} />
                      {warehouseImage ? (
                        <span className="text-emerald-400 text-sm">✓ {t("apply.warehousePictureLabel")}</span>
                      ) : (
                        <span className="text-white/70 text-sm">+ {t("apply.warehousePictureLabel")}</span>
                      )}
                    </label>
                  </div>
                )}
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
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">Password *</label>
              <div className="relative rounded-2xl border-2 border-white/50 bg-black/30 transition-all">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-transparent text-white placeholder:text-white/70 px-4 py-3.5 pr-12 text-base outline-none focus:outline-none focus:ring-0 seller-apply-input"
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !!emailUsedError || password.length < 6}
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
            <button
              type="button"
              onClick={() => setFormPart(1)}
              className="w-full text-sm text-white/80 hover:text-white"
            >
              ← {t("apply.back")}
            </button>
              </>
            )}
          </form>
        )}

        {!submitted && (
          <p className="mt-6 text-center relative z-10">
            <Link href="/sell" className="text-sm font-medium text-white/95 hover:text-white hover:underline [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] transition-colors">
              {t("apply.backToSell")}
            </Link>
          </p>
        )}
      </div>
    </ApplyPageRoot>
  );
}
