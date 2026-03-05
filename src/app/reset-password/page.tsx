"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/Loader";

const ORANGE = "#f25a2a";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Invalid reset link. Use the link from your email or request a new one.");
      return;
    }
    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
      } else {
        setError(data.error || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-xl sm:p-8">
          <h1 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">Reset password</h1>
          <p className="mt-5 text-slate-600 text-sm">Invalid or missing reset link. Request a new one from the login page.</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-orange-600 font-semibold hover:underline">Forgot password</Link>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-xl sm:p-8">
          <h1 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">Password reset</h1>
          <p className="mt-5 text-green-600 text-sm">Your password has been updated. Redirecting to login…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-xl sm:p-8">
        <h1 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">Set new password</h1>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 4 characters"
              minLength={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[var(--daraz-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--daraz-orange)]"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              minLength={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-[var(--daraz-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--daraz-orange)]"
              autoComplete="new-password"
            />
          </div>
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
                Updating…
              </>
            ) : "Update password"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          <Link href="/" className="font-semibold text-blue-600 hover:underline">Back to home</Link>
        </p>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-[80vh] flex items-center justify-center"><Loader /></main>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
