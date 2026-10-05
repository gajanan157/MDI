import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchProviderAgreementList } from "@/store/features/providerAgreement/providerAgreementAPI";
import { mapNormalizedAgreementToListRow } from "../../../agreement/providerAgreementMapper";
import {
  getAgreementNameFlags,
  type AgreementListRow,
} from "../../../agreement/utils/agreementHelpers";
import { formatAgreementNameForDisplay } from "../../../../shared/agreementTypeChip.helpers";
import { DISCOUNT_AGREEMENT_LIST_FILTERS, DISCOUNT_SOC_LIST_FILTERS } from "../utils/discountConfig";
import { useProviderSocList } from "../../soc/hooks/useProviderSocList";
import { mapProviderSocToDropdownOption } from "../../soc/utils/mapProviderSocToListRow";
import { DiscountAgreementOptionLabel } from "../components/DiscountAgreementOptionLabel";

export type DiscountAgreementOption = {
  value: string;
  label: ReactNode;
  searchText: string;
};

function formatDiscountAgreementOption(row: AgreementListRow): DiscountAgreementOption {
  const name = formatAgreementNameForDisplay(row.agreementName);
  const status = String(row.status ?? "").trim();
  const showStatus = Boolean(status && status.toLowerCase() !== "active");
  const icNames = getAgreementNameFlags(row.agreementName).isInsurerBipartite
    ? (row.insurerMappings ?? [])
        .map((mapping) => String(mapping.insurerName ?? "").trim())
        .filter(Boolean)
    : [];

  return {
    value: row.id,
    label: (
      <DiscountAgreementOptionLabel
        name={name}
        insurerNames={icNames}
        status={showStatus ? status : undefined}
      />
    ),
    searchText: `${name} ${icNames.join(" ")} ${status}`.trim(),
  };
}

export function mapAgreementInsurerOptions(
  row: AgreementListRow | null | undefined,
): { value: string; label: string }[] {
  if (!row) return [];
  const seen = new Set<string>();
  return (row.insurerMappings ?? [])
    .map((mapping) => {
      const id = String(mapping.insurerId ?? "").trim();
      if (!id || seen.has(id)) return null;
      seen.add(id);
      const name = String(mapping.insurerName ?? "").trim();
      return { value: id, label: name || id };
    })
    .filter((item): item is { value: string; label: string } => Boolean(item));
}

export function useDiscountFormOptions(providerId?: string) {
  const [rows, setRows] = useState<AgreementListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { rows: socRows, loading: socLoading } = useProviderSocList(providerId, {
    isActive: DISCOUNT_SOC_LIST_FILTERS.isActive,
    download: DISCOUNT_SOC_LIST_FILTERS.download,
  });

  useEffect(() => {
    const resolved = providerId?.trim() ?? "";
    if (!resolved) {
      setRows([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchProviderAgreementList(resolved, {
      providerAgreementStatus: DISCOUNT_AGREEMENT_LIST_FILTERS.providerAgreementStatus,
      recordStatus: DISCOUNT_AGREEMENT_LIST_FILTERS.recordStatus,
      download: DISCOUNT_AGREEMENT_LIST_FILTERS.download,
    })
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setRows([]);
          return;
        }
        setRows(result.rows.map(mapNormalizedAgreementToListRow));
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [providerId]);

  const agreementRowsById = useMemo(() => {
    const map = new Map<string, AgreementListRow>();
    rows.forEach((row) => {
      const id = String(row.id ?? "").trim();
      if (id) map.set(id, row);
    });
    return map;
  }, [rows]);

  const agreementOptions = useMemo(
    () =>
      rows
        .filter((row) => String(row.id ?? "").trim() && String(row.agreementName ?? "").trim())
        .map(formatDiscountAgreementOption),
    [rows],
  );

  const socOptions = useMemo(
    () => socRows.map(mapProviderSocToDropdownOption),
    [socRows],
  );

  return {
    agreementOptions,
    agreementRowsById,
    agreementsLoading: loading,
    socOptions,
    socLoading,
  };
}
