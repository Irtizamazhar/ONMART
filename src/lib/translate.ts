/**
 * Free translation via MyMemory API (no key required, limited requests).
 * Translates English text to Urdu, Chinese, and all other site languages.
 */
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

/** MyMemory langpair code for each LangCode (en is source) */
const LANG_PAIRS: Record<string, string> = {
  ur: "ur",
  zh: "zh-CN",
  ar: "ar",
  hi: "hi",
  tr: "tr",
  id: "id",
  bn: "bn",
  pt: "pt",
  es: "es",
  fr: "fr",
  de: "de",
  ru: "ru",
  ja: "ja",
  ko: "ko",
};

async function translateOne(text: string, targetCode: string): Promise<string | null> {
  const pair = LANG_PAIRS[targetCode] || targetCode;
  try {
    const res = await fetch(
      `${MYMEMORY_URL}?q=${encodeURIComponent(text.trim())}&langpair=en|${pair}`
    );
    const data = (await res.json()) as { responseData?: { translatedText?: string }; responseStatus?: number };
    const translated = data?.responseData?.translatedText?.trim();
    if (translated && data?.responseStatus !== 403) return translated;
    return null;
  } catch {
    return null;
  }
}

/** Translate English text to all languages. Returns object with keys ur, zh, ar, hi, ... */
export async function translateToAll(text: string): Promise<Record<string, string>> {
  if (!text || !text.trim()) return {};
  const keys = Object.keys(LANG_PAIRS);
  const results = await Promise.all(keys.map((code) => translateOne(text, code)));
  const out: Record<string, string> = {};
  keys.forEach((code, i) => {
    const val = results[i];
    if (val) out[code] = val;
  });
  return out;
}

export async function translateToUrdu(text: string): Promise<string | null> {
  return translateOne(text, "ur");
}

export async function translateToChinese(text: string): Promise<string | null> {
  return translateOne(text, "zh");
}
