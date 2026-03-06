"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

export interface AuthUser {
  email: string;
  name?: string;
  isAdmin?: boolean;
  isSeller?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  customerUser: AuthUser | null;
  isReady: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  login: (email: string, password: string, name?: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  loginWithPhone: (phone: string, name?: string) => boolean;
  loginWithPhoneOtp: (phone: string, code: string, name?: string, password?: string) => Promise<boolean>;
  loginAdmin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutCustomer: () => void;
  logoutAdmin: () => void;
  logout: () => void;
  updateCustomerProfile: (data: { name?: string; email?: string }) => void;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  signupModalOpen: boolean;
  openSignupModal: (returnUrl?: string) => void;
  closeSignupModal: () => void;
  consumeReturnUrl: () => string | null;
}

const CUSTOMER_STORAGE_KEY = "onmart-customer";
const ADMIN_STORAGE_KEY = "onmart-admin";

const AuthContext = createContext<AuthContextType | null>(null);

function saveCustomer(u: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(u));
  else localStorage.removeItem(CUSTOMER_STORAGE_KEY);
}

function saveAdmin(u: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(u));
  else localStorage.removeItem(ADMIN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [customerUser, setCustomerUser] = useState<AuthUser | null>(null);
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawCustomer = typeof window !== "undefined" ? localStorage.getItem(CUSTOMER_STORAGE_KEY) : null;
      const rawAdmin = typeof window !== "undefined" ? localStorage.getItem(ADMIN_STORAGE_KEY) : null;
      if (rawCustomer) {
        const parsed = JSON.parse(rawCustomer) as AuthUser;
        if (parsed && typeof parsed.email === "string") {
          setCustomerUser({ ...parsed, isAdmin: false });
        }
      }
      if (rawAdmin) {
        const parsed = JSON.parse(rawAdmin) as AuthUser;
        if (parsed && typeof parsed.email === "string") {
          setAdminUser({ ...parsed, isAdmin: true });
        }
      }
    } catch {
      setCustomerUser(null);
      setAdminUser(null);
    }
    setIsReady(true);
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string): Promise<boolean> => {
    const trimmed = email.trim();
    if (!trimmed || !password) return false;
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          password,
          ...(name !== undefined && name.trim() ? { name: name.trim() } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Signup failed");
      }
      const data = await res.json();
      const u = data.user as AuthUser;
      if (u && typeof u.email === "string") {
        const customer = { ...u, isAdmin: false, isSeller: u.isSeller === true };
        setCustomerUser(customer);
        saveCustomer(customer);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, []);

  const login = useCallback(async (email: string, password: string, _name?: string): Promise<{ ok: boolean; error?: string }> => {
    const trimmed = email.trim();
    if (!trimmed || !password) return { ok: false, error: "Email and password required." };
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: (data && typeof data.error === "string" ? data.error : null) || "Invalid email or password." };
      }
      const u = data.user as AuthUser;
      if (u && typeof u.email === "string") {
        const customer = { ...u, isAdmin: false, isSeller: u.isSeller === true };
        setCustomerUser(customer);
        saveCustomer(customer);
        return { ok: true };
      }
      return { ok: false, error: "Invalid response from server." };
    } catch {
      return { ok: false, error: "Login failed. Try again." };
    }
  }, []);

  const loginWithPhone = useCallback((phone: string, name?: string) => {
    const trimmed = phone.trim().replace(/\D/g, "");
    if (trimmed.length < 10) return false;
    const customer: AuthUser = { email: "+" + trimmed, ...(name?.trim() ? { name: name.trim() } : {}), isAdmin: false };
    setCustomerUser(customer);
    saveCustomer(customer);
    return true;
  }, []);

  const loginAdmin = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      return { ok: false, error: "Email and password required." };
    }
    try {
      const res = await fetch("/api/auth/login-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data && data.user) {
        const u = data.user as AuthUser;
        if (u && typeof u.email === "string") {
          const admin = { ...u, isAdmin: true };
          setAdminUser(admin);
          saveAdmin(admin);
          return { ok: true };
        }
      }
      return { ok: false, error: (data && data.error) || "Invalid admin email or password." };
    } catch {
      return { ok: false, error: "Network error. Try again." };
    }
  }, []);

  const loginWithPhoneOtp = useCallback(async (phone: string, code: string, name?: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          code,
          name: name?.trim() || undefined,
          password: password?.trim() && password.trim().length >= 4 ? password.trim() : undefined,
        }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const u = data.user as AuthUser;
      if (u && typeof u.email === "string") {
        const customer = { ...u, isAdmin: false, isSeller: u.isSeller === true };
        setCustomerUser(customer);
        saveCustomer(customer);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, []);

  const logoutCustomer = useCallback(() => {
    setCustomerUser(null);
    saveCustomer(null);
  }, []);

  const updateCustomerProfile = useCallback((data: { name?: string; email?: string }) => {
    setCustomerUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      if (data.name !== undefined) next.name = data.name.trim() || undefined;
      if (data.email !== undefined) next.email = data.email.trim();
      saveCustomer(next);
      return next;
    });
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdminUser(null);
    saveAdmin(null);
  }, []);

  const logout = useCallback(() => {
    const isAdminRoute = pathname === "/admin" || (pathname && pathname.startsWith("/admin/"));
    if (isAdminRoute) {
      setAdminUser(null);
      saveAdmin(null);
    } else {
      setCustomerUser(null);
      saveCustomer(null);
    }
  }, [pathname]);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);
  const openSignupModal = useCallback((url?: string) => {
    setSignupModalOpen(true);
    if (url) setReturnUrl(url);
  }, []);
  const closeSignupModal = useCallback(() => {
    setSignupModalOpen(false);
    setReturnUrl(null);
  }, []);
  const consumeReturnUrl = useCallback(() => {
    const u = returnUrl;
    setReturnUrl(null);
    return u;
  }, [returnUrl]);

  const isAdminRoute = pathname === "/admin" || (pathname && pathname.startsWith("/admin/"));
  const user = isAdminRoute ? adminUser : customerUser;
  const isAdmin = !!adminUser;
  const isSeller = !!(customerUser && (customerUser as AuthUser & { isSeller?: boolean }).isSeller);

  const value: AuthContextType = {
    user,
    customerUser,
    isReady,
    isAdmin,
    isSeller,
    login,
    signup,
    loginWithPhone,
    loginWithPhoneOtp,
    loginAdmin,
    logoutCustomer,
    logoutAdmin,
    logout,
    updateCustomerProfile,
    loginModalOpen,
    openLoginModal,
    closeLoginModal,
    signupModalOpen,
    openSignupModal,
    closeSignupModal,
    consumeReturnUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
