import { useEffect, useMemo, useState } from "react";
import { fetchProviderSocList } from "@/store/features/providerSoc/providerSocAPI";
import type { NormalizedProviderSoc } from "@/store/features/providerSoc/providerSocTypes";
import { mapProviderSocToListRow } from "../utils/mapProviderSocToListRow";
import type { SocListRow } from "../data/socListData";

export type UseProviderSocListOptions = {
  isActive?: boolean;
  download?: boolean;
};

export function useProviderSocList(
  providerId?: string,
  options: UseProviderSocListOptions = {},
) {
  const resolvedProviderId = providerId?.trim() ?? "";
  const isActive = options.isActive;
  const download = options.download ?? true;
  const [rows, setRows] = useState<NormalizedProviderSoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!resolvedProviderId) {
      setRows([]);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetchProviderSocList({
      providerId: resolvedProviderId,
      isActive,
      download,
    })
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setRows([]);
          setError(result.message ?? "");
          return;
        }
        setRows(result.rows);
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
          setError("Failed to load SOC records.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [download, isActive, resolvedProviderId]);

  const listRows = useMemo<SocListRow[]>(
    () => rows.map(mapProviderSocToListRow),
    [rows],
  );

  return {
    rows,
    listRows,
    loading: Boolean(resolvedProviderId) && loading,
    error,
  };
}
