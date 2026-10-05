import { getApi, mainApi } from "@/app/api/apiService";
import { locales } from "@/i18n/langs";
import {
  flatTranslationsToNested,
  deepMergeTranslations,
  parseFlatTranslationPayload,
} from "./utils";

/** Load strings from backend when MAIN API is configured. Set VITE_I18N_REMOTE_ENABLED=false to disable. */
export function isRemoteEnabled(): boolean {
  if (import.meta.env.VITE_I18N_REMOTE_ENABLED === "false") return false;
  return Boolean(import.meta.env.VITE_API_BASE_URL_MAIN);
}

function getRemoteTranslationsPath(lang: string): string {
  const base =
    import.meta.env.VITE_I18N_TRANSLATIONS_PATH ?? "/v1/i18n/translations";
  return `${base.replace(/\/$/, "")}/${lang}`;
}

/**
 * Fetches remote flat translations for a language. Returns null if disabled or on failure.
 */
export async function fetchRemoteFlatTranslations(
  lang: string,
): Promise<Record<string, string> | null> {
  if (!isRemoteEnabled()) return null;
  if (!import.meta.env.VITE_API_BASE_URL_MAIN) return null;

  try {
    const res = await getApi<unknown>(
      mainApi,
      getRemoteTranslationsPath(lang),
    );
    if (!res.success || res.data == null) return null;
    return parseFlatTranslationPayload(res.data);
  } catch {
    return null;
  }
}

function useStaticFallback(): boolean {
  return import.meta.env.VITE_I18N_STATIC_FALLBACK !== "false";
}

/**
 * Backend strings win over static JSON for the same keys.
 * If `VITE_I18N_STATIC_FALLBACK=false`, only remote nested JSON is used (no file fallback).
 */
export function mergeBundlesForLocale(
  staticBundle: Record<string, unknown>,
  remoteFlat: Record<string, string> | null,
): Record<string, unknown> {
  const staticOn = useStaticFallback();
  if (!remoteFlat || Object.keys(remoteFlat).length === 0) {
    return staticOn ? staticBundle : {};
  }
  const nested = flatTranslationsToNested(remoteFlat);
  if (!staticOn) {
    return nested;
  }
  return deepMergeTranslations(staticBundle, nested);
}

/** @deprecated use mergeBundlesForLocale */
export function mergeStaticWithRemote(
  staticBundle: Record<string, unknown>,
  remoteFlat: Record<string, string> | null,
): Record<string, unknown> {
  return mergeBundlesForLocale(staticBundle, remoteFlat);
}

/** Resolve static JSON: baked-in locale or English for dynamic-only codes. */
export async function loadStaticBundleForLang(
  lang: string,
): Promise<Record<string, unknown>> {
  const baked = locales[lang as keyof typeof locales];
  if (baked) {
    const mod = await baked.i18n();
    return mod as unknown as Record<string, unknown>;
  }
  const en = locales.en;
  const mod = await en.i18n();
  return mod as unknown as Record<string, unknown>;
}
