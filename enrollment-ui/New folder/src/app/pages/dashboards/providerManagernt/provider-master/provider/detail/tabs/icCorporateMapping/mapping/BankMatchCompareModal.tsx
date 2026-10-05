import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getProviderBankAccount } from "@/store/features/provider/providerAPI";
import {
  BankDetailsComparisonModal,
  buildBankComparisonRows,
  useBankComparisonFieldLabels,
} from "@/app/pages/dashboards/providerManagernt/shared/bankDetailsComparison";
import type { BankComparisonRow } from "@/app/pages/dashboards/providerManagernt/shared/bankDetailsComparison";
import type { ItemWithIdName } from "../types";

type BankMatchCompareModalProps = {
  open: boolean;
  providerId?: string;
  mappingItem: ItemWithIdName | null;
  onClose: () => void;
  onRequestUpdate?: () => void;
};

export function BankMatchCompareModal({
  open,
  providerId,
  mappingItem,
  onClose,
  onRequestUpdate,
}: Readonly<BankMatchCompareModalProps>) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<BankComparisonRow[]>([]);
  const fieldLabels = useBankComparisonFieldLabels(t);

  useEffect(() => {
    if (!open) {
      setRows([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const resolvedProviderId = providerId?.trim();
      let providerBank: Record<string, unknown> | null = null;

      if (resolvedProviderId) {
        try {
          providerBank = await getProviderBankAccount(resolvedProviderId);
        } catch {
          providerBank = null;
        }
      }

      if (cancelled) return;
      setRows(buildBankComparisonRows(providerBank, fieldLabels));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, providerId, fieldLabels]);

  const insurerLabel = mappingItem?.name?.trim()
    ? t("providerMaster.bankDetailsComparison.insurerColumnWithName", {
        name: mappingItem.name.trim(),
      })
    : t("providerMaster.bankDetailsComparison.insurerColumnDefault");

  return (
    <BankDetailsComparisonModal
      open={open}
      onClose={onClose}
      rows={rows}
      loading={loading}
      subtitle={mappingItem?.name?.trim() || undefined}
      providerColumnLabel={t("providerMaster.bankDetailsComparison.providerColumnDefault")}
      insurerColumnLabel={insurerLabel}
      mobileInsurerColumnLabel="Insurer"
      onRequestUpdate={onRequestUpdate}
    />
  );
}
