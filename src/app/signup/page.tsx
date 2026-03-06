"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";

const ORANGE = "#f25a2a";

export default function SignupPage() {
  const { loginWithPhoneOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "";

  const [countryCode, setCountryCode] = useState("PK+92");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sentViaSms, setSentViaSms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const fullPhoneNumber = (): string => {
    const countryDigits = countryCode.replace(/\D/g, "") || "92";
    let phoneDigits = phone.trim().replace(/\D/g, "").replace(/^0+/, "");
    if (phoneDigits.startsWith(countryDigits) && phoneDigits.length > countryDigits.length) {
      phoneDigits = phoneDigits.slice(countryDigits.length);
    }
    const combined = countryDigits + phoneDigits;
    return combined.length >= 12 ? "+" + combined : "";
  };

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    const countryDigits = countryCode.replace(/\D/g, "") || "92";
    let num = phone.trim().replace(/\D/g, "").replace(/^0+/, "");
    if (num.startsWith(countryDigits) && num.length > countryDigits.length) num = num.slice(countryDigits.length);
    if (num.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!agreed) {
      setError("Please agree to Terms of Use and Privacy Policy.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const fullPhone = fullPhoneNumber();
      if (!fullPhone) {
        setError("Invalid phone number.");
        return;
      }
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, intent: "signup" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error === "Already exist" ? "Already exist" : (data.error || "Failed to send code."));
        return;
      }
      setOtpSent(true);
      setOtp("");
      setSentViaSms(data.sentViaSms === true);
      setResendCooldown(60);
      const iv = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(iv);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    const fullPhone = fullPhoneNumber();
    if (!fullPhone || fullPhone.length < 12) {
      setError("Invalid phone number.");
      return;
    }
    if (otp.trim().length < 4) {
      setError("Please enter the code.");
      return;
    }
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    setError("");
    setLoading(true);
    const ok = await loginWithPhoneOtp(fullPhone, otp.trim(), name.trim(), password.trim() || undefined);
    setLoading(false);
    if (ok) {
      router.push(returnUrl || "/");
    } else {
      setError("Invalid or expired code. (DEV: check server terminal for the code.)");
    }
  };

  const loginLink = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : "/login";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Black header - login jaisa */}
      <header className="w-full bg-black text-white border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-12 sm:h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo variant="white" className="!text-white" />
            <span className="font-semibold text-white text-sm sm:text-base">Onmart</span>
          </Link>
          <Link href="/" className="text-sm text-white/80 hover:text-white">
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-slate-50">
      <div className="max-w-[440px] w-full mx-auto flex flex-col">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex-1">
          <h1 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">Sign up</h1>

          <form onSubmit={otpSent ? handleVerify : handleSendCode} className="mt-5 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[#f57224] focus:outline-none focus:ring-1 focus:ring-[#f57224]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone number</label>
              <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                <span className="flex items-center px-3 bg-slate-50 text-slate-600 text-sm border-r border-slate-300">{countryCode}</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").replace(/^92(?=\d{10})/, "");
                    setPhone(v);
                  }}
                  placeholder="e.g. 3001234567"
                  className="flex-1 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  disabled={otpSent}
                />
              </div>
            </div>
            {!otpSent && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a password for email login later"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-10 text-slate-800 placeholder:text-slate-400 focus:border-[#f57224] focus:outline-none focus:ring-1 focus:ring-[#f57224]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            )}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-[#f57224] focus:ring-[#f57224]"
              />
              <span className="text-sm text-slate-600">
                By creating and/or using your account, you agree to our{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms of Use</a> and{" "}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </span>
            </label>
            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enter code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="e.g. 123456"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 focus:border-[#f57224] focus:outline-none focus:ring-1 focus:ring-[#f57224]"
                  maxLength={6}
                />
                {sentViaSms ? (
                  <p className="mt-1 text-xs text-slate-500">Code sent to your number.</p>
                ) : (
                  <p className="mt-1 text-xs text-amber-600">DEV: code is in the server terminal. Use it above.</p>
                )}
                {resendCooldown > 0 ? (
                  <p className="mt-1 text-xs text-slate-500">Resend in {resendCooldown}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendCode({ preventDefault: () => {} } as FormEvent)}
                    className="mt-1 text-xs text-[#f57224] hover:underline disabled:opacity-50 disabled:pointer-events-none"
                    disabled={loading}
                  >
                    Resend code
                  </button>
                )}
              </div>
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
                  {otpSent ? "Verifying…" : "Sending…"}
                </>
              ) : otpSent ? "Verify & Sign up" : "Send code via SMS"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href={loginLink} className="font-semibold text-blue-600 hover:underline">
              Log in
            </Link>
          </p>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-slate-500">Or sign up with</span></div>
          </div>
          <div className="flex gap-3">
            <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Google
            </button>
            <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Facebook
            </button>
          </div>
        </div>

        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← Back to home</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
