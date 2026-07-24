export const DEFAULT_LOCALE = "ja";

export const LOCALES = [
  { code: "ja", htmlLang: "ja", label: "日本語", enabled: true },
  { code: "zh-tw", htmlLang: "zh-Hant", label: "繁體中文", enabled: false },
  { code: "zh-cn", htmlLang: "zh-Hans", label: "简体中文", enabled: false },
  { code: "en", htmlLang: "en", label: "English", enabled: false },
  { code: "ko", htmlLang: "ko", label: "한국어", enabled: false },
  { code: "vi", htmlLang: "vi", label: "Tiếng Việt", enabled: false }
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const LOCALE_CODES = LOCALES.map((locale) => locale.code);
export const ENABLED_LOCALES = LOCALES.filter((locale) => locale.enabled);

export function isLocaleCode(value: string): value is LocaleCode {
  return LOCALE_CODES.includes(value as LocaleCode);
}

export function getLocale(value: string) {
  return LOCALES.find((locale) => locale.code === value) ?? LOCALES[0];
}

export function localePath(locale: string, slug = "home") {
  return `/${locale}/${slug}/`;
}
