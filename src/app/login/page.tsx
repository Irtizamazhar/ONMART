"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";

const ORANGE = "#f25a2a";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "";

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getRedirectAfterLogin = (): string => {
    if (returnUrl) return returnUrl;
    return "/sell/dashboard";
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!emailOrPhone.trim()) {
      setError("Please enter your Phone or Email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (password.length < 4) {
      setError("Invalid credentials.");
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
      setError(!isEmail && emailOrPhone.trim() ? "Invalid credentials." : "Please enter your Phone or Email.");
      return;
    }
    setLoading(true);
    const result = await login(loginId, password);
    setLoading(false);
    if (result.ok) {
      router.push(getRedirectAfterLogin());
    } else {
      setError(result.error || "Invalid email or password. If you applied as a seller, use the same email and password you set during application.");
    }
  };

  const signupLink = "/sell/apply";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Black header - jaise signup */}
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

      {/* Split layout: orange left, white form right */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left: orange panel - Become An Onmart Seller Today */}
        <div
          className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col justify-center p-8 xl:p-12 relative overflow-hidden"
          style={{ backgroundColor: ORANGE }}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_80%_80%_at_20%_50%,_white,_transparent)]" />
          <div className="relative z-10 max-w-md">
            <h1 className="text-2xl xl:text-3xl font-bold text-white leading-tight">
              Become An Onmart Seller Today!
            </h1>
            <p className="mt-4 text-white/95 text-base">
              Create an Onmart seller account now and reach millions of customers!
            </p>
          </div>
          <div className="relative z-10 mt-10 flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🛒</div>
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl">📦</div>
          </div>
        </div>

        {/* Right: white login form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-slate-50 lg:bg-white">
          <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Login</h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Email"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                autoComplete="username"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-10 text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <button type="submit" className="w-full rounded-lg py-3.5 text-base font-bold text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed" style={{ backgroundColor: ORANGE }} disabled={loading}>
                {loading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : null}
                Login
              </button>
              <p className="text-xs text-slate-600 text-center">
                By clicking Login, you agree to these{" "}
                <Link href="/terms" className="text-orange-600 font-medium hover:underline">Terms &amp; Conditions</Link>
                {" "}and{" "}
                <Link href="/privacy-policy" className="text-orange-600 font-medium hover:underline">Privacy Policy</Link>.
              </p>
              <div className="flex justify-center text-sm">
                <Link href="/forgot-password" className="text-blue-600 hover:underline font-medium">Reset password</Link>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account yet?{" "}
              <Link href={signupLink} className="font-semibold text-blue-600 hover:underline">
                Create a new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
