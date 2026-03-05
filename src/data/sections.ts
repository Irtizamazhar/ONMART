/**
 * Home page sections. Products can be assigned to one section via sectionSlug.
 * Used by: API (filter), Admin (dropdown), Home (section blocks + View All).
 * Section discount %: used when product has no saved originalPrice/discountPercent – show this % and compute original price from price.
 */
export const PRODUCT_SECTIONS = [
  { slug: "flash", labelKey: "home.flashSale", discountPercent: 17 },
  { slug: "top-deals", labelKey: "home.topDeals", discountPercent: 10 },
  { slug: "clearance", labelKey: "home.clearanceSale", discountPercent: 23 },
] as const;

export type SectionSlug = (typeof PRODUCT_SECTIONS)[number]["slug"];

export const SECTION_SLUGS: SectionSlug[] = PRODUCT_SECTIONS.map((s) => s.slug);

export function isValidSectionSlug(s: string | null): s is SectionSlug {
  return s != null && SECTION_SLUGS.includes(s as SectionSlug);
}

/** Discount % for sections that show a discount badge. Returns 0 if section has no discount. */
export function getSectionDiscountPercent(sectionSlug: string | null | undefined): number {
  if (!sectionSlug) return 0;
  const section = PRODUCT_SECTIONS.find((s) => s.slug === sectionSlug);
  return section?.discountPercent ?? 0;
}
