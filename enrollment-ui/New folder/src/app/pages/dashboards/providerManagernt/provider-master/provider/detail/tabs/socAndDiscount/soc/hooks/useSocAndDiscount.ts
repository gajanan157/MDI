import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { SOC_SAMPLE_PDF_URL } from "../../../../utils/viewHospitalConfig";
import {
  NEW_SOC_INTERNAL_ID,
  type SocApplicableIc,
  type SocDetailRecord,
  type SocGipsaSocVariant,
  type SocVersionItem,
} from "../data/socListData";
import {
  buildApplicableIcsFromScope,
  buildApplicableIcsSummary,
  DISCOUNT_FORM_DEFAULTS,
  extractSelectedIcIdsFromApplicableIcs,
  filterPsuInsurerOptions,
  inferSocApplicableIcScopeFromSummary,
  type DiscountFormValues,
  type SocAgreementNavigationPayload,
  type SocAgreementNavInsurerMapping,
  type SocApplicableIcScope,
  type SocCorporateSelection,
} from "../utils/socConfig";
import {
  buildApplicableIcsSummaryFromRows,
  isSocCorporateEligible,
  isSocSaveDisabled,
  normalizeSocAgreementInsurerMappings,
  resolveApplicableIcsForCorporateMode,
  shouldAutoPopulateApplicableIcsFromAgreement,
  validateSocSave,
} from "../utils/socAgreementCorporateRules";
import { getAgreementNameFlags } from "../../../agreement/utils/agreementHelpers";
import {
  useSocDocumentUpload,
  useSocInsurerOptions,
} from "./socSupportHooks";

export {
  useSocCorporateOptions,
  useSocDetailFromUrl,
  useSocNavigation,
} from "./socSupportHooks";

/** Owns all SOC & Discount tab state (same role as useAddProviderPage). */
export function useSocAndDiscount(providerId?: string, fetchInsurerOptions = true) {
  const { t } = useTranslation();
  const { insurerOptions, multiSelectOptions, loading: insurerOptionsLoading } =
    useSocInsurerOptions(fetchInsurerOptions);

  const [selectedSocDetail, setSelectedSocDetail] = useState<SocDetailRecord | null>(null);
  const [socInnerTab, setSocInnerTab] = useState<"soc" | "discount">("soc");
  const socForm = useForm<{ socVersionId: string }>({
    defaultValues: { socVersionId: "" },
  });
  const discountFormHook = useForm<DiscountFormValues>({
    defaultValues: DISCOUNT_FORM_DEFAULTS,
  });

  const [discountPercentByCategory, setDiscountPercentByCategory] = useState<
    Record<string, string>
  >({});
  const [opdPercentByKey, setOpdPercentByKey] = useState<Record<string, string>>({});
  const [ipdPercentByKey, setIpdPercentByKey] = useState<Record<string, string>>({});
  const [additionalDiscountPercentByKey, setAdditionalDiscountPercentByKey] = useState<
    Record<string, string>
  >({});
  const [isSocViewMode, setIsSocViewMode] = useState(true);
  const [socLastUpdatedOn, setSocLastUpdatedOn] = useState("");
  const [socStartDate, setSocStartDate] = useState("");
  const [socEndDate, setSocEndDate] = useState("");
  const [socVersionHistory, setSocVersionHistory] = useState<SocVersionItem[]>([]);
  const [, setSelectedSocPdfUrl] = useState<string | undefined>(SOC_SAMPLE_PDF_URL);
  const socSideBySide = true;

  const [applicableIcScope, setApplicableIcScope] =
    useState<SocApplicableIcScope>("selectIc");
  const [selectedApplicableIcIds, setSelectedApplicableIcIds] = useState<string[]>([]);
  const [applicableIcs, setApplicableIcs] = useState<SocApplicableIc[]>([]);
  const [applicableIcsSummary, setApplicableIcsSummary] = useState("");
  const [agreementName, setAgreementName] = useState("");
  const [gipsaSocVariant, setGipsaSocVariant] = useState<SocGipsaSocVariant>("");
  const [isCorporateSoc, setIsCorporateSoc] = useState(false);
  const [selectedCorporateInsurerId, setSelectedCorporateInsurerId] = useState("");
  const [selectedCorporates, setSelectedCorporates] = useState<SocCorporateSelection[]>([]);
  const [agreementInsurerMappings, setAgreementInsurerMappings] = useState<
    SocAgreementNavInsurerMapping[]
  >([]);
  const [lockApplicableIcsFromAgreement, setLockApplicableIcsFromAgreement] =
    useState(false);

  const psuInsurerOptions = useMemo(
    () => filterPsuInsurerOptions(insurerOptions),
    [insurerOptions],
  );

  const syncApplicableIcs = useCallback(
    (scope: SocApplicableIcScope, selectedIds: string[], effectiveFrom: string) => {
      setApplicableIcs(
        buildApplicableIcsFromScope(scope, selectedIds, effectiveFrom, insurerOptions),
      );
      setApplicableIcsSummary(
        buildApplicableIcsSummary(scope, selectedIds, insurerOptions, t),
      );
    },
    [insurerOptions, t],
  );

  useEffect(() => {
    if (isSocViewMode || insurerOptions.length === 0) return;
    if (lockApplicableIcsFromAgreement) return;
    syncApplicableIcs(applicableIcScope, selectedApplicableIcIds, socStartDate);
  }, [
    applicableIcScope,
    insurerOptions,
    isSocViewMode,
    lockApplicableIcsFromAgreement,
    selectedApplicableIcIds,
    socStartDate,
    syncApplicableIcs,
  ]);

  const documentUpload = useSocDocumentUpload({
    providerId,
    socId: selectedSocDetail?.id,
    setSocVersionHistory,
    setSelectedSocPdfUrl,
    setSocVersionId: (id) => socForm.setValue("socVersionId", id),
  });
  const { clearPendingSocDocument } = documentUpload;

  const applySocDetail = useCallback(
    (
      detail: SocDetailRecord,
      options?: { resetInnerTab?: boolean; preferredInnerTab?: "soc" | "discount" },
    ) => {
      setSelectedSocDetail(detail);
      if (options?.resetInnerTab !== false) {
        setSocInnerTab(options?.preferredInnerTab ?? "soc");
      }
      setIsSocViewMode(true);
      clearPendingSocDocument();
      setSocLastUpdatedOn(detail.lastUpdatedOn);
      setSocStartDate(detail.startDate);
      setSocEndDate(detail.endDate);
      setSocVersionHistory(detail.versionHistory.map((v) => ({ ...v })));

      const scope = inferSocApplicableIcScopeFromSummary(detail.applicableIcsSummary);
      const selectedIds = extractSelectedIcIdsFromApplicableIcs(detail.applicableIcs);
      setApplicableIcScope(scope);
      setSelectedApplicableIcIds(selectedIds);
      setApplicableIcs(detail.applicableIcs.map((row) => ({ ...row })));
      setApplicableIcsSummary(detail.applicableIcsSummary);
      setAgreementName(detail.agreementName ?? "");
      setAgreementInsurerMappings([]);
      setGipsaSocVariant(detail.gipsaSocVariant ?? "");
      setIsCorporateSoc(false);
      setSelectedCorporateInsurerId("");
      setSelectedCorporates([]);
      setLockApplicableIcsFromAgreement(false);
      setDiscountPercentByCategory({ ...detail.discountPercentByCategory });
      setOpdPercentByKey({ ...detail.opdPercentByKey });
      setIpdPercentByKey({ ...(detail.ipdPercentByKey ?? {}) });
      setAdditionalDiscountPercentByKey({ ...detail.additionalDiscountPercentByKey });
      discountFormHook.reset({
        discountType: detail.discountType,
        discountCategories: detail.discountCategories,
        ppnDiscount: detail.ppnDiscount,
        billInclusion: detail.billInclusion,
        billExclusion: detail.billExclusion,
        ipdEnabled: detail.ipdEnabled ?? false,
        ipdList: detail.ipdList ?? [],
        opdEnabled: detail.opdEnabled,
        opdList: detail.opdList,
        additionalDiscountEnabled: detail.additionalDiscountEnabled,
        additionalDiscountList: detail.additionalDiscountList,
        tatForDiscount: detail.tatForDiscount,
        discountApplicableOn: detail.discountApplicableOn,
        effectiveFrom: detail.effectiveFrom,
        remarks: detail.remarks,
      });
      const active = detail.versionHistory.find((v) => v.active) ?? detail.versionHistory[0];
      if (active) {
        socForm.setValue("socVersionId", active.id);
        setSelectedSocPdfUrl(active.url);
      }
    },
    [discountFormHook, clearPendingSocDocument, socForm],
  );

  const applySocDetailFromRoute = useCallback(
    (
      detail: SocDetailRecord,
      urlSuffix?: "view" | "edit",
      options?: { preferredInnerTab?: "soc" | "discount" },
    ) => {
      applySocDetail(detail, {
        resetInnerTab: true,
        preferredInnerTab: options?.preferredInnerTab,
      });
      setIsSocViewMode(!(urlSuffix === "edit" || detail.id === NEW_SOC_INTERNAL_ID));
    },
    [applySocDetail],
  );

  const resetSocDetailFormFromSelection = useCallback(() => {
    if (!selectedSocDetail) return;
    applySocDetail(selectedSocDetail, { resetInnerTab: false });
  }, [applySocDetail, selectedSocDetail]);

  const onSelectedApplicableIcIdsChange = useCallback(
    (ids: string[]) => {
      setLockApplicableIcsFromAgreement(false);
      setSelectedApplicableIcIds(ids);
      syncApplicableIcs("selectIc", ids, socStartDate);
      setSelectedCorporateInsurerId("");
      setSelectedCorporates([]);
    },
    [socStartDate, syncApplicableIcs],
  );

  const syncApplicableIcsFromAgreementMappings = useCallback(
    (args: {
      mappings: SocAgreementNavInsurerMapping[];
      isCorporateSoc: boolean;
      selectedInsurerId: string;
      agreementName: string;
    }) => {
      const rows = resolveApplicableIcsForCorporateMode(args.mappings, {
        isCorporateSoc: args.isCorporateSoc,
        selectedInsurerId: args.selectedInsurerId,
        fallbackEffectiveFrom: socStartDate,
      });
      const ids = rows.map((row) => row.insurerId);
      setLockApplicableIcsFromAgreement(true);
      setSelectedApplicableIcIds(ids);
      setApplicableIcs(rows);
      setApplicableIcsSummary(buildApplicableIcsSummaryFromRows(rows, t));
      const flags = getAgreementNameFlags(args.agreementName);
      setApplicableIcScope(flags.isGipsaPpnTripartite ? "gipsa" : "selectIc");
    },
    [socStartDate, t],
  );

  const applyAgreementNameFromNavigation = useCallback(
    (payload: string | SocAgreementNavigationPayload) => {
      const normalized: SocAgreementNavigationPayload =
        typeof payload === "string"
          ? { agreementName: payload, insurerMappings: [] }
          : payload;
      const trimmed = normalized.agreementName.trim();
      const mappings = normalizeSocAgreementInsurerMappings(
        normalized.insurerMappings,
      );

      if (!trimmed && mappings.length === 0) {
        setAgreementName("");
        setAgreementInsurerMappings([]);
        setGipsaSocVariant("");
        setIsCorporateSoc(false);
        setSelectedCorporateInsurerId("");
        setSelectedCorporates([]);
        setLockApplicableIcsFromAgreement(false);
        setSelectedApplicableIcIds([]);
        setApplicableIcs([]);
        setApplicableIcsSummary("");
        setApplicableIcScope("selectIc");
        return;
      }

      if (trimmed) setAgreementName(trimmed);
      setAgreementInsurerMappings(mappings);

      const flags = getAgreementNameFlags(trimmed);
      setIsCorporateSoc(false);
      setSelectedCorporateInsurerId("");
      setSelectedCorporates([]);

      if (mappings.length > 0 && shouldAutoPopulateApplicableIcsFromAgreement()) {
        syncApplicableIcsFromAgreementMappings({
          mappings,
          isCorporateSoc: false,
          selectedInsurerId: "",
          agreementName: trimmed,
        });
        setGipsaSocVariant(flags.isGipsaPpnTripartite ? "ppnSoc" : "");
        return;
      }

      setLockApplicableIcsFromAgreement(false);
      if (flags.isGipsaPpnTripartite) {
        setApplicableIcScope("gipsa");
        setGipsaSocVariant("ppnSoc");
      } else {
        setGipsaSocVariant("");
      }
    },
    [syncApplicableIcsFromAgreementMappings],
  );

  const onDetailsInsurerChange = useCallback(
    (insurerId: string) => {
      const trimmedId = insurerId.trim();
      setSelectedCorporateInsurerId(trimmedId);
      setSelectedCorporates([]);
      if (!isCorporateSoc) return;
      syncApplicableIcsFromAgreementMappings({
        mappings: agreementInsurerMappings,
        isCorporateSoc: true,
        selectedInsurerId: trimmedId,
        agreementName,
      });
    },
    [
      agreementInsurerMappings,
      agreementName,
      isCorporateSoc,
      syncApplicableIcsFromAgreementMappings,
    ],
  );

  const onSocEdit = () => {
    const active = socVersionHistory.find((v) => v.active) ?? socVersionHistory[0];
    if (active) {
      socForm.setValue("socVersionId", active.id);
      setSelectedSocPdfUrl(active.url);
    }
    setIsSocViewMode(false);
  };

  const onSocCancel = () => {
    resetSocDetailFormFromSelection();
    setIsSocViewMode(true);
  };

  const socSaveValidationInput = useMemo(
    () => ({
      agreementName,
      selectedApplicableIcIds,
      isCorporateSoc,
      selectedCorporateInsurerId,
      selectedCorporates,
      socStartDate,
      socEndDate,
    }),
    [
      agreementName,
      selectedApplicableIcIds,
      isCorporateSoc,
      selectedCorporateInsurerId,
      selectedCorporates,
      socStartDate,
      socEndDate,
    ],
  );

  const socSaveDisabled = useMemo(
    () => isSocSaveDisabled(socSaveValidationInput, t),
    [socSaveValidationInput, t],
  );

  const onSocSave = () => {
    const validation = validateSocSave(socSaveValidationInput, t);
    if (!validation.ok) {
      showProviderError(validation.message);
      return;
    }
    const selectedVersionId = socForm.getValues("socVersionId");
    if (selectedVersionId) {
      setSocVersionHistory((prev) =>
        prev.map((v) => ({ ...v, active: v.id === selectedVersionId })),
      );
      const active = socVersionHistory.find((v) => v.id === selectedVersionId);
      if (active) setSelectedSocPdfUrl(active.url);
    }
    setIsSocViewMode(true);
  };

  return {
    selectedSocDetail,
    applySocDetailFromRoute,
    socInnerTab,
    setSocInnerTab,
    socForm,
    discountFormHook,
    discountPercentByCategory,
    setDiscountPercentByCategory,
    opdPercentByKey,
    setOpdPercentByKey,
    ipdPercentByKey,
    setIpdPercentByKey,
    additionalDiscountPercentByKey,
    setAdditionalDiscountPercentByKey,
    isSocViewMode,
    socLastUpdatedOn,
    setSocLastUpdatedOn,
    socStartDate,
    setSocStartDate,
    socEndDate,
    setSocEndDate,
    socVersionHistory,
    socFileInputRef: documentUpload.socFileInputRef,
    pendingSocDocumentFile: documentUpload.pendingSocDocumentFile,
    isSavingSocDocument: documentUpload.isSavingSocDocument,
    onSocFileSelect: documentUpload.handleSocFileSelect,
    onClearPendingSocDocument: clearPendingSocDocument,
    selectedApplicableIcIds,
    onSelectedApplicableIcIdsChange,
    applicableIcs,
    applicableIcsSummary,
    agreementName,
    setAgreementName,
    applyAgreementNameFromNavigation,
    agreementInsurerMappings,
    gipsaSocVariant,
    onGipsaSocVariantChange: setGipsaSocVariant,
    isCorporateSoc,
    onIsCorporateSocChange: (checked: boolean) => {
      if (checked && !isSocCorporateEligible(agreementName)) return;
      setIsCorporateSoc(checked);
      if (!checked) {
        setSelectedCorporateInsurerId("");
        setSelectedCorporates([]);
        syncApplicableIcsFromAgreementMappings({
          mappings: agreementInsurerMappings,
          isCorporateSoc: false,
          selectedInsurerId: "",
          agreementName,
        });
        return;
      }
      setSelectedCorporates([]);
      const onlyInsurerId =
        agreementInsurerMappings.length === 1
          ? agreementInsurerMappings[0]?.insurerId ?? ""
          : "";
      const nextInsurerId = onlyInsurerId || selectedCorporateInsurerId;
      if (onlyInsurerId) {
        setSelectedCorporateInsurerId(onlyInsurerId);
      }
      syncApplicableIcsFromAgreementMappings({
        mappings: agreementInsurerMappings,
        isCorporateSoc: true,
        selectedInsurerId: nextInsurerId,
        agreementName,
      });
    },
    selectedCorporateInsurerId,
    onSelectedCorporateInsurerIdChange: (insurerId: string) => {
      setSelectedCorporateInsurerId(insurerId.trim());
      setSelectedCorporates([]);
    },
    onDetailsInsurerChange,
    selectedCorporates,
    onSelectedCorporatesChange: (items: SocCorporateSelection[]) => {
      setSelectedCorporates(
        items
          .map((item) => ({
            id: item.id.trim(),
            name: item.name.trim() || item.id.trim(),
          }))
          .filter((item) => item.id),
      );
    },
    insurerMultiSelectOptions: multiSelectOptions,
    psuInsurerOptions,
    insurerOptionsLoading,
    lockApplicableIcsFromAgreement,
    socSaveDisabled,
    onSocEdit,
    onSocCancel,
    onSocSave,
    setSelectedSocPdfUrl,
    socSideBySide,
  };
}
