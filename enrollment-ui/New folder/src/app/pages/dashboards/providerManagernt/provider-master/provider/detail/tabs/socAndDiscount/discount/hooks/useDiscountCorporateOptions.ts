import { useEffect, useMemo, useState } from "react";
import { fetchIcCorpDropdownApi } from "@/store/features/providerRestriction/providerRestrictionAPI";

export type DiscountCorporateOption = { value: string; label: string };

const icCorpOptionsCache = new Map<string, DiscountCorporateOption[]>();
const icCorpInflight = new Map<string, Promise<DiscountCorporateOption[]>>();

function mapIcCorpOptions(
  corporates: { id?: string; name?: string }[],
): DiscountCorporateOption[] {
  return corporates
    .map((item) => ({
      value: String(item.id ?? "").trim(),
      label: String(item.name ?? "").trim() || String(item.id ?? "").trim(),
    }))
    .filter((row) => row.value);
}

/** Merge freshly resolved option lists into state, keeping the same reference when nothing changed. */
function mergeLoadedOptions(
  prev: Record<string, DiscountCorporateOption[]>,
  next: Record<string, DiscountCorporateOption[]>,
): Record<string, DiscountCorporateOption[]> {
  const unchanged = Object.entries(next).every(
    ([insurerId, options]) => prev[insurerId] === options,
  );
  return unchanged ? prev : { ...prev, ...next };
}

function loadIcCorpOptions(insurerId: string): Promise<DiscountCorporateOption[]> {
  const cached = icCorpOptionsCache.get(insurerId);
  if (cached) return Promise.resolve(cached);
  const pending = icCorpInflight.get(insurerId);
  if (pending) return pending;

  const request = fetchIcCorpDropdownApi({ insurerId })
    .then((result) => {
      const options = result.ok ? mapIcCorpOptions(result.corporates) : [];
      icCorpOptionsCache.set(insurerId, options);
      return options;
    })
    .finally(() => {
      icCorpInflight.delete(insurerId);
    });

  icCorpInflight.set(insurerId, request);
  return request;
}

/** Loads corporates for the active insurer only (IC-Corp). Results are cached per IC. */
export function useDiscountCorporateOptions(args: {
  enabled: boolean;
  insurerIds: string[];
}) {
  const { enabled, insurerIds } = args;
  const normalizedIds = useMemo(
    () =>
      Array.from(
        new Set(
          (insurerIds ?? [])
            .map((id) => id.trim())
            .filter(Boolean),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [insurerIds],
  );

  const [optionsByInsurerId, setOptionsByInsurerId] = useState<
    Record<string, DiscountCorporateOption[]>
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || normalizedIds.length === 0) {
      setLoading(false);
      return;
    }

    const fromCache: Record<string, DiscountCorporateOption[]> = {};
    const missingIds: string[] = [];
    normalizedIds.forEach((insurerId) => {
      const cached = icCorpOptionsCache.get(insurerId);
      if (cached) {
        fromCache[insurerId] = cached;
        return;
      }
      missingIds.push(insurerId);
    });

    if (Object.keys(fromCache).length > 0) {
      setOptionsByInsurerId((prev) => mergeLoadedOptions(prev, fromCache));
    }

    if (missingIds.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      missingIds.map(async (insurerId) => {
        const options = await loadIcCorpOptions(insurerId);
        return [insurerId, options] as const;
      }),
    )
      .then((entries) => {
        if (cancelled) return;
        const fetched = Object.fromEntries(entries);
        setOptionsByInsurerId((prev) => mergeLoadedOptions(prev, fetched));
      })
      .catch(() => {
        if (!cancelled) {
          setOptionsByInsurerId((prev) => mergeLoadedOptions(prev, fromCache));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, normalizedIds]);

  const options = useMemo(() => {
    const map = new Map<string, string>();
    Object.values(optionsByInsurerId).forEach((rows) => {
      rows.forEach((row) => {
        if (!map.has(row.value)) map.set(row.value, row.label);
      });
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [optionsByInsurerId]);

  return { options, optionsByInsurerId, loading };
}
