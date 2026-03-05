"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES, type LangCode } from "@/data/translations";
import { getCategoryDisplayName, getProductDisplayTitle } from "@/lib/displayName";
import AccountDropdown from "@/components/AccountDropdown";
import Logo from "@/components/Logo";

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const NAV_ORANGE = "#f25a2a";
const NAV_ORANGE_DARK = "#dc4b1c";

export default function Navbar() {
  const router = useRouter();
  const { totalItems, itemCount } = useCart();
  const { user, openLoginModal, openSignupModal, logoutCustomer } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<({ type: "category"; slug: string; name: string; nameUr?: string; nameZh?: string; nameTranslations?: Record<string, string> } | { type: "product"; id: string; title: string; titleUr?: string; titleZh?: string; titleTranslations?: Record<string, string> })[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [mobileLanguageOpen, setMobileLanguageOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!languageDropdownOpen) return;
    const close = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) setLanguageDropdownOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [languageDropdownOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) setMobileLanguageOpen(false);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!suggestionsOpen) return;
    const close = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) setSuggestionsOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [suggestionsOpen]);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/store/search-suggestions?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d: { categories?: { slug: string; name: string; nameUr?: string; nameZh?: string; nameTranslations?: Record<string, string> }[]; products?: { id: string; title: string; titleUr?: string; titleZh?: string; titleTranslations?: Record<string, string> }[] }) => {
          const list: ({ type: "category"; slug: string; name: string; nameUr?: string; nameZh?: string; nameTranslations?: Record<string, string> } | { type: "product"; id: string; title: string; titleUr?: string; titleZh?: string; titleTranslations?: Record<string, string> })[] = [];
          (d.categories || []).forEach((c) => list.push({ type: "category", slug: c.slug, name: c.name, nameUr: c.nameUr, nameZh: c.nameZh, nameTranslations: c.nameTranslations }));
          (d.products || []).forEach((p) => list.push({ type: "product", id: p.id, title: p.title, titleUr: p.titleUr, titleZh: p.titleZh, titleTranslations: p.titleTranslations }));
          setSuggestions(list);
          setSuggestionsOpen(list.length > 0);
        })
        .catch(() => setSuggestions([]));
    }, 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const selectLanguage = (code: LangCode) => {
    setLanguage(code);
    setLanguageDropdownOpen(false);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 text-white shadow-md transition-shadow duration-200 animate-slide-down"
      style={{ backgroundColor: NAV_ORANGE }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* 1) TOP THIN BAR */}
        <div className="hidden md:flex items-center justify-between text-[11px] sm:text-xs py-2 border-b border-white/15">
          <div className="flex items-center gap-4 sm:gap-6 tracking-wide">
            <Link
              href="#"
              className="font-medium hover:underline underline-offset-2 decoration-white/80"
            >
              {t("nav.saveMoreOnApp")}
            </Link>
            <Link
              href="/sell"
              className="font-medium hover:underline underline-offset-2 decoration-white/80"
            >
              {t("nav.sellOnOnmart")}
            </Link>
            <Link
              href="#"
              className="font-medium hover:underline underline-offset-2 decoration-white/80"
            >
              {t("nav.helpSupport")}
            </Link>
          </div>
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLanguageDropdownOpen((o) => !o)}
                className="font-medium hover:underline underline-offset-2 decoration-white/80 inline-flex items-center gap-1.5"
                aria-expanded={languageDropdownOpen}
                aria-haspopup="true"
              >
                <span className="text-sm leading-none shrink-0" aria-hidden>{LANGUAGES.find((l) => l.code === language)?.flag}</span>
                {LANGUAGES.find((l) => l.code === language)?.label ?? t("nav.language")}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${languageDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {languageDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 py-1 min-w-[140px] max-w-[min(280px,100vw-2rem)] max-h-[70vh] overflow-y-auto scrollbar-hide rounded-xl bg-white shadow-lg border border-slate-200/90 z-50 transition-opacity duration-200">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => selectLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                        language === lang.code ? "bg-orange-50 text-[#f57224]" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-sm leading-none shrink-0 w-5 text-center" aria-hidden>{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2) MAIN NAV BAR */}
        <div className="py-3 md:py-4 flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Mobile menu trigger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-white/15 text-white transition-colors"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo: ON, trolley, art – white on orange */}
          <Link href="/" className="flex-shrink-0 flex items-center hover:opacity-95 transition-opacity" aria-label="OnMart Home">
            <Logo variant="white" />
          </Link>

          {/* Center: large search with suggestions */}
          <div ref={searchWrapRef} className="flex-1 min-w-0 max-w-xl md:max-w-2xl mx-1 md:mx-4 relative">
            <form onSubmit={handleSearch}>
              <div className="flex rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-white/30 transition-shadow duration-200">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
                  placeholder={t("nav.searchPlaceholder")}
                  className="w-full py-2.5 md:py-3 pl-3 md:pl-4 pr-2 text-gray-900 placeholder:text-gray-500 text-sm md:text-base focus:outline-none focus:ring-0"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 flex items-center justify-center w-11 md:w-12 text-white transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
                  style={{ backgroundColor: NAV_ORANGE_DARK }}
                  aria-label="Search"
                >
                  <SearchIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </form>
            {suggestionsOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="py-1">
                  {suggestions.map((s, i) =>
                    s.type === "category" ? (
                      <Link
                        key={`cat-${s.slug}`}
                        href={`/?category=${encodeURIComponent(s.slug)}`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                        onClick={() => { setSuggestionsOpen(false); setSearchQuery(""); setMobileMenuOpen(false); }}
                      >
                        <span className="font-medium">{getCategoryDisplayName(s, language)}</span>
                      </Link>
                    ) : (
                      <Link
                        key={`prod-${s.id}`}
                        href={`/?search=${encodeURIComponent(s.title)}`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                        onClick={() => { setSuggestionsOpen(false); setSearchQuery(""); setMobileMenuOpen(false); }}
                      >
                        <span className="font-medium truncate">{getProductDisplayTitle(s, language)}</span>
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Cart, Login, Sign up or Account — user site: only show customer account, not admin */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4 flex-shrink-0 ml-auto">
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 px-2 py-2 md:px-3 md:py-2.5 rounded-xl hover:bg-white/15 text-white transition-colors duration-200"
            >
              <CartIcon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="hidden sm:inline text-sm font-semibold">{t("nav.cart")}</span>
              {user && itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 md:top-0.5 md:right-0 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-xs font-bold bg-white"
                  style={{ color: NAV_ORANGE }}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            {!user && (
              <>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="hidden sm:inline-flex items-center font-semibold text-sm text-white hover:bg-white/15 px-3 py-2 rounded-xl transition-colors duration-200"
                >
                  {t("nav.login")}
                </button>
                <button
                  type="button"
                  onClick={() => openSignupModal()}
                  className="hidden sm:inline-flex items-center font-semibold text-sm text-white hover:bg-white/15 px-3 py-2 rounded-xl transition-colors duration-200"
                >
                  {t("nav.signUp")}
                </button>
              </>
            )}
            {user && <AccountDropdown />}
          </div>
        </div>
      </div>

      {/* Mobile: collapsed menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-white/20 px-4 py-4 space-y-0.5"
          style={{ backgroundColor: NAV_ORANGE_DARK }}
        >
          {!user && (
            <>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openLoginModal(); }}
                className="w-full text-left block py-3 px-3 rounded-xl text-white font-medium hover:bg-white/15 transition-colors duration-200"
              >
                {t("nav.login")}
              </button>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openSignupModal(); }}
                className="w-full text-left block py-3 px-3 rounded-xl text-white font-medium hover:bg-white/15 transition-colors duration-200"
              >
                {t("nav.signUp")}
              </button>
            </>
          )}
          {user && (
            <>
              <Link
                href="/orders"
                className="block py-3 px-3 rounded-xl text-white font-medium hover:bg-white/15 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.myOrders")}
              </Link>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); logoutCustomer(); }}
                className="w-full text-left block py-3 px-3 rounded-xl text-white font-medium hover:bg-red-500/20 transition-colors duration-200"
              >
                {t("nav.logout")}
              </button>
            </>
          )}
          <Link
            href="/cart"
            className="block py-3 px-3 rounded-xl text-white font-medium hover:bg-white/15 transition-colors duration-200"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("nav.cart")} ({totalItems} {t("cart.items")})
          </Link>
          <div className="border-t border-white/20 pt-3 mt-2">
            <button
              type="button"
              onClick={() => setMobileLanguageOpen((o) => !o)}
              className="w-full text-left flex items-center gap-2 py-3 px-3 rounded-xl text-white font-medium hover:bg-white/15 transition-colors duration-200"
              aria-expanded={mobileLanguageOpen}
            >
              <span className="text-sm leading-none shrink-0 w-5 text-center" aria-hidden>{LANGUAGES.find((l) => l.code === language)?.flag}</span>
              {t("nav.language")} — {LANGUAGES.find((l) => l.code === language)?.label}
              <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${mobileLanguageOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileLanguageOpen && (
              <div className="max-h-[50vh] overflow-y-auto scrollbar-hide mt-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => { selectLanguage(lang.code); setMobileMenuOpen(false); setMobileLanguageOpen(false); }}
                    className={`w-full text-left block py-2.5 px-3 pl-10 rounded-xl text-white font-medium transition-colors duration-200 hover:bg-white/15 flex items-center gap-2 ${
                      language === lang.code ? "bg-white/20" : ""
                    }`}
                  >
                    <span className="text-sm leading-none shrink-0 w-5 text-center" aria-hidden>{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
