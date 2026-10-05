import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import type { DiscountTypeMasterRecord } from "@/store/features/discountTypeMaster/discountTypeMasterTypes";
import { createSocDiscountTypeOptions } from "../../../../../../../shared/providerMasterI18n";
import { getOpdMasterDiscountTypeOptions } from "../utils/discountBulkConfig";
import {
  selectIpdDiscountTypeMasterList,
  selectOpdDiscountTypeMasterList,
} from "../utils/discountSelectorUtils";

function toOption(row: DiscountTypeMasterRecord): {
  value: string;
  label: string;
  masterId: string;
} {
  return {
    value: row.value,
    label: row.name || row.code || row.id,
    masterId: row.id,
  };
}

export function useDiscountTypeMasterOptions() {
  const { t } = useTranslation();
  const ipdList = useAppSelector(selectIpdDiscountTypeMasterList);
  const opdList = useAppSelector(selectOpdDiscountTypeMasterList);
  const loading = useAppSelector(
    (state) => state.discountTypeMaster?.loading ?? false,
  );

  const fallbackIpd = useMemo(
    () => createSocDiscountTypeOptions(t).filter((option) => option.value),
    [t],
  );
  const fallbackOpd = useMemo(() => getOpdMasterDiscountTypeOptions(), []);

  const ipdDiscountTypeOptions = useMemo(() => {
    const active = ipdList.filter((row) => row.recordStatus !== "INACTIVE");
    return active.length > 0 ? active.map(toOption) : fallbackIpd;
  }, [fallbackIpd, ipdList]);

  const opdDiscountTypeOptions = useMemo(() => {
    const active = opdList.filter((row) => row.recordStatus !== "INACTIVE");
    return active.length > 0 ? active.map(toOption) : fallbackOpd;
  }, [fallbackOpd, opdList]);

  return {
    ipdDiscountTypeOptions,
    opdDiscountTypeOptions,
    loading,
  };
}
