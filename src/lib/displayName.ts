/**
 * Helpers to get category name or product title in the user's selected language.
 * Uses nameTranslations/titleTranslations (all languages) with fallback to nameUr/nameZh, then translation keys for known slugs, finally name/title.
 */
import type { LangCode } from "@/data/translations";
import { translations, getCategoryTranslationKey } from "@/data/translations";

export type CategoryForDisplay = {
  name: string;
  nameUr?: string | null;
  nameZh?: string | null;
  nameTranslations?: Record<string, string> | null;
  slug?: string;
};

export function getCategoryDisplayName(cat: CategoryForDisplay, language: LangCode): string {
  const tr = cat.nameTranslations as Record<string, string> | undefined;
  if (tr?.[language]?.trim()) return tr[language].trim();
  if (language === "ur" && cat.nameUr?.trim()) return cat.nameUr.trim();
  if (language === "zh" && cat.nameZh?.trim()) return cat.nameZh.trim();
  if (cat.slug) {
    const key = getCategoryTranslationKey(cat.slug);
    const map = translations[language];
    const enMap = translations.en;
    const translated = (map && map[key]) || (enMap && enMap[key]);
    if (translated) return translated;
  }
  return cat.name || "";
}

export type ProductForDisplay = {
  title: string;
  titleUr?: string | null;
  titleZh?: string | null;
  titleTranslations?: Record<string, string> | null;
};

export function getProductDisplayTitle(product: ProductForDisplay, language: LangCode): string {
  const tr = product.titleTranslations as Record<string, string> | undefined;
  if (tr?.[language]?.trim()) return tr[language].trim();
  if (language === "ur" && product.titleUr?.trim()) return product.titleUr.trim();
  if (language === "zh" && product.titleZh?.trim()) return product.titleZh.trim();
  return product.title || "";
}
