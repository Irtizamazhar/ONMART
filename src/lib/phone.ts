/**
 * Single source of truth for normalizing phone to E.164 for Pakistan.
 * Rules: (1) Start with 0 → exactly 11 digits (03xxxxxxxxx). (2) Start with +92/92 → exactly 12 digits (923001234567).
 * Returns "" if invalid.
 */
export function normalizePhoneToE164(value: unknown): string {
  const s = value != null ? String(value).trim() : "";
  const digits = s.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    if (digits.length !== 11) return "";
    const withoutLeadZero = digits.slice(1);
    return "+92" + withoutLeadZero;
  }
  if (digits.startsWith("92")) {
    if (digits.length !== 12) return "";
    return "+" + digits;
  }
  return "";
}
