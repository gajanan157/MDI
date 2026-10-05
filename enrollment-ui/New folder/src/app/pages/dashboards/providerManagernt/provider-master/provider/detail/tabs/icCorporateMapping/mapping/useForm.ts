import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchCorporateDatas } from "@/store/features/Broker/BrokerSlice";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import { IC_MAPPING_FORM_DEFAULTS } from "./config";
import type { IcMappingFormState } from "../types";

export function useIcMappingTabData(
  enabled = false,
  options?: { loadCorporates?: boolean },
) {
  const dispatch = useAppDispatch();
  const loadCorporates = options?.loadCorporates ?? true;
  const { corporateData } = useAppSelector((state) => state.broker);
  const insurerList = useAppSelector((s) => s.insurerList);

  const insurerOptions = useMemo(
    () =>
      insurerList.insurerList
        ?.filter((i: { insurerId?: string; insurerName?: string }) =>
          Boolean(i.insurerId?.trim() && i.insurerName?.trim()),
        )
        .map((i: { insurerId?: string; insurerName?: string }) => ({
          value: i.insurerId,
          label: i.insurerName,
        })) ?? [],
    [insurerList.insurerList],
  );

  const corporateList = useMemo(
    () =>
      (corporateData ?? []).map((group: { corporateName?: string; corporateId?: string }) => ({
        label: group.corporateName,
        value: group.corporateId,
      })),
    [corporateData],
  );

  useEffect(() => {
    if (!enabled || !loadCorporates) return;
    if ((corporateData?.length ?? 0) > 0) return;
    dispatch(fetchCorporateDatas({ onlyName: true }));
  }, [dispatch, enabled, loadCorporates, corporateData]);

  useEffect(() => {
    if (!enabled) return;
    if (insurerList.loading) return;
    if ((insurerList.insurerList?.length ?? 0) > 0) return;
    dispatch(fetchInsurerList());
  }, [dispatch, enabled, insurerList.insurerList, insurerList.loading]);

  return { insurerOptions, corporateList, insurerListLoading: insurerList.loading };
}

function buildSelectFormFingerprint(icName: string, corporateIds: string[]): string {
  return `${icName}::${JSON.stringify(corporateIds)}`;
}

function buildMetaFormFingerprint(partyCodeStatus: string, empanelmentSource: string): string {
  return `${partyCodeStatus}::${empanelmentSource}`;
}

export function useIcMappingCreateForm() {
  const [icMappingForm, setIcMappingForm] = useState<IcMappingFormState>(IC_MAPPING_FORM_DEFAULTS);
  const [icMappingDateOrderError, setIcMappingDateOrderError] = useState("");
  const [icMappingShowFieldErrors, setIcMappingShowFieldErrors] = useState(false);

  const icMappingSelectForm = useForm<{ icName: string; corporateIds: string[] }>({
    defaultValues: { icName: "", corporateIds: [] },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const icMappingMetaSelectForm = useForm<{
    partyCodeStatus: string;
    empanelmentSource: string;
  }>({
    defaultValues: {
      partyCodeStatus: IC_MAPPING_FORM_DEFAULTS.partyCodeStatus,
      empanelmentSource: IC_MAPPING_FORM_DEFAULTS.empanelmentSource,
    },
  });

  const selectSyncFingerprintRef = useRef(
    buildSelectFormFingerprint("", []),
  );
  const metaSyncFingerprintRef = useRef(
    buildMetaFormFingerprint(
      IC_MAPPING_FORM_DEFAULTS.partyCodeStatus,
      IC_MAPPING_FORM_DEFAULTS.empanelmentSource,
    ),
  );

  const icMappingSelectFormRef = useRef(icMappingSelectForm);
  icMappingSelectFormRef.current = icMappingSelectForm;
  const icMappingMetaSelectFormRef = useRef(icMappingMetaSelectForm);
  icMappingMetaSelectFormRef.current = icMappingMetaSelectForm;

  const resetSelectForm = useCallback(() => {
    selectSyncFingerprintRef.current = buildSelectFormFingerprint("", []);
    icMappingSelectFormRef.current.reset({ icName: "", corporateIds: [] });
  }, []);

  const resetMetaForm = useCallback(() => {
    metaSyncFingerprintRef.current = buildMetaFormFingerprint(
      IC_MAPPING_FORM_DEFAULTS.partyCodeStatus,
      IC_MAPPING_FORM_DEFAULTS.empanelmentSource,
    );
    icMappingMetaSelectFormRef.current.reset({
      partyCodeStatus: IC_MAPPING_FORM_DEFAULTS.partyCodeStatus,
      empanelmentSource: IC_MAPPING_FORM_DEFAULTS.empanelmentSource,
    });
  }, []);

  // One-way sync: local form state -> react-hook-form (detail load, programmatic updates).
  useEffect(() => {
    const nextName = icMappingForm.icName ?? "";
    const nextCorporateIds = icMappingForm.corporateIds ?? [];
    const fingerprint = buildSelectFormFingerprint(nextName, nextCorporateIds);
    if (selectSyncFingerprintRef.current === fingerprint) return;

    const selectForm = icMappingSelectFormRef.current;
    const currentName = selectForm.getValues("icName") ?? "";
    const currentCorporateIds = selectForm.getValues("corporateIds") ?? [];
    if (
      currentName === nextName &&
      JSON.stringify(currentCorporateIds) === JSON.stringify(nextCorporateIds)
    ) {
      selectSyncFingerprintRef.current = fingerprint;
      return;
    }

    selectSyncFingerprintRef.current = fingerprint;
    selectForm.setValue("icName", nextName, {
      shouldValidate: false,
      shouldDirty: false,
    });
    selectForm.setValue("corporateIds", nextCorporateIds, {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [icMappingForm.icName, icMappingForm.corporateIds]);

  useEffect(() => {
    const nextPartyCodeStatus = icMappingForm.partyCodeStatus ?? "";
    const nextEmpanelmentSource = icMappingForm.empanelmentSource ?? "";
    const fingerprint = buildMetaFormFingerprint(nextPartyCodeStatus, nextEmpanelmentSource);
    if (metaSyncFingerprintRef.current === fingerprint) return;

    const metaForm = icMappingMetaSelectFormRef.current;
    const currentPartyCodeStatus = metaForm.getValues("partyCodeStatus") ?? "";
    const currentEmpanelmentSource = metaForm.getValues("empanelmentSource") ?? "";
    if (
      currentPartyCodeStatus === nextPartyCodeStatus &&
      currentEmpanelmentSource === nextEmpanelmentSource
    ) {
      metaSyncFingerprintRef.current = fingerprint;
      return;
    }

    metaSyncFingerprintRef.current = fingerprint;
    metaForm.setValue("partyCodeStatus", nextPartyCodeStatus, {
      shouldValidate: false,
      shouldDirty: false,
    });
    metaForm.setValue("empanelmentSource", nextEmpanelmentSource, {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [icMappingForm.partyCodeStatus, icMappingForm.empanelmentSource]);

  return {
    icMappingForm,
    setIcMappingForm,
    icMappingSelectForm,
    icMappingMetaSelectForm,
    resetSelectForm,
    resetMetaForm,
    icMappingDateOrderError,
    setIcMappingDateOrderError,
    icMappingShowFieldErrors,
    setIcMappingShowFieldErrors,
  };
}
