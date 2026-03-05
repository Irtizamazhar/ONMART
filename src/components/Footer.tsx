"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const ABOUT_LINKS: { key: string; href: string }[] = [
  { key: "footer.aboutUs", href: "/about" },
  { key: "footer.faqs", href: "/faq" },
  { key: "footer.contactUs", href: "/contact" },
  { key: "footer.careers", href: "/about#careers" },
  { key: "footer.pressBlog", href: "/about#press" },
  { key: "footer.termsCondition", href: "/terms" },
  { key: "footer.warrantyCenter", href: "/about#warranty" },
];
const CUSTOMER_LINKS: { key: string; href: string }[] = [
  { key: "footer.helpCenter", href: "/faq" },
  { key: "footer.privacyPolicy", href: "/privacy-policy" },
  { key: "footer.installmentsPlan", href: "/faq#installments" },
  { key: "footer.eWarranty", href: "/faq#warranty" },
  { key: "footer.sellOnOnmart", href: "/sell" },
  { key: "footer.returnPolicy", href: "/return-policy" },
  { key: "footer.shippingPolicy", href: "/shipping-policy" },
];
const PAYMENT_ICONS: { key: string; src: string; alt: string }[] = [
  { key: "footer.visa", src: "/payment/visa.svg", alt: "Visa" },
  { key: "footer.mastercard", src: "/payment/mastercard.svg", alt: "Mastercard" },
  { key: "footer.debitCard", src: "/payment/debit.svg", alt: "Debit Card" },
  { key: "footer.jazzCash", src: "/payment/jazzcash.svg", alt: "JazzCash" },
  { key: "footer.easypaisa", src: "/payment/easypaisa.svg", alt: "Easypaisa" },
];

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-auto bg-[#1e293b] text-slate-300 border-t border-slate-600/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-12 w-full min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 items-start">
          <div className="md:text-left">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">{t("footer.about")}</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {ABOUT_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link href={href} className="text-slate-400 hover:text-white transition-colors duration-200">{t(key)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center justify-center md:order-none order-first sm:col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-4">{t("footer.securePayments")}</h3>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {PAYMENT_ICONS.map(({ key, src, alt }) => (
                <span key={key} className="inline-flex items-center justify-center bg-white/10 hover:bg-white/15 rounded-lg transition-colors duration-200 overflow-hidden shadow-sm" title={t(key)}>
                  <Image src={src} alt={alt} width={56} height={36} className="object-contain w-12 h-8 sm:w-14 sm:h-9" />
                </span>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-4 text-center max-w-[260px]">{t("footer.securePaymentNote")}</p>
          </div>
          <div className="md:text-right text-left">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">{t("footer.customerService")}</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {CUSTOMER_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link href={href} className="text-slate-400 hover:text-white transition-colors duration-200">{t(key)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-600/80 text-center">
          <p className="text-sm text-slate-500">
            {t("footer.copyright")} © {new Date().getFullYear()} Onmart
          </p>
        </div>
      </div>
    </footer>
  );
}
