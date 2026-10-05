export const locales = {
  en: {
    label: "English",
    dayjs: () => import("dayjs/locale/en"),
    flatpickr: null,
    i18n: () => import("./locales/en/translations.json"),
    flag: "united-kingdom",
  },
  hi: {
    label: "हिन्दी",
    dayjs: () => import("dayjs/locale/hi"),
    flatpickr: null,
    i18n: () => import("./locales/hi/translations.json"),
    flag: "india",
  },
  gu: {
    label: "ગુજરાતી",
    dayjs: () => import("dayjs/locale/gu"),
    flatpickr: null,
    i18n: () => import("./locales/gu/translations.json"),
    flag: "india",
  },
  ta: {
    label: "தமிழ்",
    dayjs: () => import("dayjs/locale/ta"),
    flatpickr: null,
    i18n: () => import("./locales/ta/translations.json"),
    flag: "india",
  },
};

export const supportedLanguages = Object.keys(locales);

export type LocaleCode = keyof typeof locales;

export type Dir = "ltr" | "rtl";
