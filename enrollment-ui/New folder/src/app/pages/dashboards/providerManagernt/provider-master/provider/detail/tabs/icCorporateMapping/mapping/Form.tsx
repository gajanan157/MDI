import type { UseFormReturn } from "react-hook-form";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import DropdownSelect from "@/components/shared/form/DropdownSelect";

import { Input, Textarea } from "@/components/ui";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import { showErrorMessage } from "@/utils/errorHandler";

import { EMPANELMENT_SOURCE_OPTIONS } from "./config";

import type { IcMappingFormState, ItemWithIdName } from "../types";

import { SupportingDocumentField } from "../restriction/Fields";
import { syncIcMappingFieldErrors } from "./icMappingFieldSync";
import { fetchInsurerNetworkModeValues } from "../api";

function normalizeCorporateIds(
  value: string | number | (string | number)[] | undefined,
): string[] {
  if (Array.isArray(value)) return value.map((id) => String(id));
  if (value) return [String(value)];
  return [];
}

type IcMappingCreateFormProps = {
  providerId?: string;
  mappingVariant?: "ic" | "corporate";
  icMappingForm: IcMappingFormState;
  setIcMappingForm: React.Dispatch<React.SetStateAction<IcMappingFormState>>;
  icMappingSelectForm: UseFormReturn<{ icName: string; corporateIds: string[] }>;
  icMappingMetaSelectForm: UseFormReturn<{
    partyCodeStatus: string;
    empanelmentSource: string;
  }>;
  icMappingDateOrderError: string;
  setIcMappingDateOrderError: (v: string) => void;
  showFieldErrors?: boolean;
  insuranceCompanies: ItemWithIdName[];
  corporateList?: { value?: string; label?: string }[];
  networkModeLoading: boolean;
  insurerListLoading?: boolean;
  icProviderCodeLoading?: boolean;
  isViewMode?: boolean;
  isExistingMapping?: boolean;
  saving: boolean;
  detailLoading?: boolean;
};

export function IcMappingCreateForm({
  providerId,
  mappingVariant = "ic",
  icMappingForm,
  setIcMappingForm,
  icMappingSelectForm,
  icMappingMetaSelectForm,
  icMappingDateOrderError,
  setIcMappingDateOrderError,
  showFieldErrors = false,
  insuranceCompanies,
  corporateList = [],
  networkModeLoading,
  insurerListLoading = false,
  icProviderCodeLoading = false,
  isViewMode = false,
  isExistingMapping = false,
  saving,
  detailLoading = false,
}: Readonly<IcMappingCreateFormProps>) {
  const { t } = useTranslation();
  const [icProviderCodeError, setIcProviderCodeError] = useState("");
  const [touchedFields, setTouchedFields] = useState({
    icProviderCode: false,
    effectiveFrom: false,
  });

  const icProviderCodeInvalidMessage = useMemo(
    () =>
      t(
        "providerMaster.icMapping.validation.icProviderCodeAlphanumeric",
        "Only letters, numbers, and hyphen are allowed",
      ),
    [t],
  );

  const insuranceCompanyOptions = useMemo(
    () =>
      insuranceCompanies.map((ic) => ({
        value: ic.id,
        label: ic.name,
      })),
    [insuranceCompanies],
  );

  useEffect(() => {
    const fieldErrors = syncIcMappingFieldErrors(icMappingForm, {
      touchedFields,
      showRequiredErrors: showFieldErrors,
      icProviderCodeInvalidMessage,
    });
    setIcProviderCodeError(fieldErrors.icProviderCode);
    setIcMappingDateOrderError(fieldErrors.effectiveFrom);
  }, [
    icMappingForm,
    icMappingForm.icProviderCode,
    icMappingForm.effectiveFrom,
    icProviderCodeInvalidMessage,
    setIcMappingDateOrderError,
    showFieldErrors,
    touchedFields,
  ]);

  const effectiveFromError = icMappingDateOrderError;
  const isCorporateVariant = mappingVariant === "corporate";
  const fieldDisabled = isViewMode || saving || detailLoading;
  const entityLocked = isViewMode || isExistingMapping || saving || detailLoading;
  const hasSelectedIc = Boolean(icMappingForm.icName.trim());
  const isNewMappingForm = !isExistingMapping && !isViewMode;
  const [localNetworkModeLoading, setLocalNetworkModeLoading] = useState(false);
  const networkModeRequestRef = useRef(0);
  const lastFetchedInsurerRef = useRef("");
  const isNetworkModeLoading = isNewMappingForm
    ? localNetworkModeLoading
    : networkModeLoading;

  const loadNetworkModeForInsurer = useCallback(
    async (insurerId: string) => {
      const requestInsurerId = String(insurerId ?? "").trim();
      if (!requestInsurerId) {
        setIcMappingForm((prev) => ({ ...prev, networkMode: "", tariffType: "" }));
        return;
      }

      const requestId = ++networkModeRequestRef.current;
      setLocalNetworkModeLoading(true);
      try {
        const values = await fetchInsurerNetworkModeValues(requestInsurerId);
        if (networkModeRequestRef.current !== requestId) return;

        setIcMappingForm((prev) => ({
          ...prev,
          networkMode: values.networkMode,
          tariffType: values.tariffType,
        }));
      } catch (error) {
        if (networkModeRequestRef.current !== requestId) return;
        showErrorMessage({
          error: error instanceof Error ? error.message : undefined,
        });
        setIcMappingForm((prev) => ({ ...prev, networkMode: "", tariffType: "" }));
      } finally {
        if (networkModeRequestRef.current === requestId) {
          setLocalNetworkModeLoading(false);
        }
      }
    },
    [setIcMappingForm],
  );

  useEffect(() => {
    if (!isNewMappingForm) return;

    const insurerId = String(icMappingForm.icName ?? "").trim();
    if (!insurerId) {
      lastFetchedInsurerRef.current = "";
      setLocalNetworkModeLoading(false);
      return;
    }

    if (icMappingForm.networkMode.trim() && icMappingForm.tariffType.trim()) {
      lastFetchedInsurerRef.current = insurerId;
      setLocalNetworkModeLoading(false);
      return;
    }

    if (lastFetchedInsurerRef.current === insurerId) return;
    lastFetchedInsurerRef.current = insurerId;

    loadNetworkModeForInsurer(insurerId).catch(() => undefined);
  }, [
    icMappingForm.icName,
    icMappingForm.networkMode,
    icMappingForm.tariffType,
    isNewMappingForm,
    loadNetworkModeForInsurer,
  ]);

  const handleInsuranceCompanyChange = (selectedValue: string | number | (string | number)[]) => {
    const next = String(selectedValue ?? "").trim();
    lastFetchedInsurerRef.current = "";
    setIcMappingForm((prev) => ({
      ...prev,
      icName: next,
      corporateIds: isCorporateVariant ? [] : prev.corporateIds,
      networkMode: "",
      tariffType: "",
    }));
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {isCorporateVariant ? (
          <>
            <DropdownSelect
              label="Insurance Company"
              name_key="icName"
              defaultValue={insurerListLoading ? "Loading..." : "Select IC"}
              options={insuranceCompanyOptions}
              control={icMappingSelectForm.control}
              rules={{ required: "Insurance Company is required" }}
              name="icName"
              className="h-[42px] rounded-lg"
              isRequired
              disabled={entityLocked || saving || insurerListLoading}
              onChange={handleInsuranceCompanyChange}
            />
            <DropdownSelect
              label="Corporate"
              name_key="corporateName"
              defaultValue="Select Corporate"
              options={corporateList}
              control={icMappingSelectForm.control}
              rules={{
                validate: (value: string[] | undefined) =>
                  Array.isArray(value) && value.some((id) => String(id).trim() !== "")
                    ? true
                    : "Corporate is required",
              }}
              name="corporateIds"
              className="h-[42px] rounded-lg"
              isRequired
              multiselect={!isExistingMapping}
              multiselectHorizontalScroll={!isExistingMapping}
              is_select_checkbox={!isExistingMapping}
              disabled={entityLocked || saving || !hasSelectedIc}
              value={icMappingForm.corporateIds}
              onChange={(value) =>
                setIcMappingForm((prev) => ({
                  ...prev,
                  corporateIds: normalizeCorporateIds(value),
                }))
              }
            />
          </>
        ) : (
          <DropdownSelect
            label="Insurance Company"
            name_key="icName"
            defaultValue={insurerListLoading ? "Loading..." : "Select IC"}
            options={insuranceCompanyOptions}
            control={icMappingSelectForm.control}
            rules={{ required: "Insurance Company is required" }}
            name="icName"
            className="h-[42px] rounded-lg"
            isRequired
            disabled={entityLocked || saving || insurerListLoading}
            onChange={handleInsuranceCompanyChange}
          />
        )}

        <Input
          label="IC Provider Code"
          value={icMappingForm.icProviderCode ?? ""}
          placeholder={icProviderCodeLoading ? "Loading..." : ""}
          autoComplete="off"
          error={icProviderCodeError}
          onChange={(e) => {
            const next = e.target.value;
            setIcMappingForm((prev) => ({ ...prev, icProviderCode: next }));
            if (next.trim()) {
              setTouchedFields((prev) => ({ ...prev, icProviderCode: true }));
            }
          }}
          onBlur={() =>
            setTouchedFields((prev) => ({ ...prev, icProviderCode: true }))
          }
          disabled={fieldDisabled || icProviderCodeLoading}
        />

        <DropdownSelect
          label="Empanelment Source"
          name_key="empanelmentSource"
          defaultValue="Select"
          options={EMPANELMENT_SOURCE_OPTIONS}
          control={icMappingMetaSelectForm.control}
          name="empanelmentSource"
          className="h-[42px] rounded-lg"
          isRequired
          disabled={fieldDisabled}
          value={icMappingForm.empanelmentSource}
          onChange={(value) =>
            setIcMappingForm((prev) => ({
              ...prev,
              empanelmentSource: String(value ?? ""),
            }))
          }
        />

        <Input
          label="Network Mode"
          isRequired
          value={icMappingForm.networkMode}
          placeholder={isNetworkModeLoading ? "Loading..." : ""}
          readOnly
          disabled
        />

        <Input
          label="Tariff Type"
          isRequired
          value={icMappingForm.tariffType}
          placeholder={isNetworkModeLoading ? "Loading..." : ""}
          readOnly
          disabled
        />

        <ProviderDatePicker
          label="Effective From"
          isRequired
          value={icMappingForm.effectiveFrom}
          onChange={(e) => {
            setIcMappingForm((prev) => ({ ...prev, effectiveFrom: e.target.value }));
          }}
          onBlur={() =>
            setTouchedFields((prev) => ({ ...prev, effectiveFrom: true }))
          }
          error={effectiveFromError}
          disabled={fieldDisabled}
        />

        <SupportingDocumentField
          providerId={providerId}
          icMappingForm={icMappingForm}
          setIcMappingForm={setIcMappingForm}
          disabled={fieldDisabled}
          isRequired
        />

        <div className="md:col-span-2 xl:col-span-4">
          <Textarea
            label="Remarks"
            value={icMappingForm.remarks}
            onChange={(e) => setIcMappingForm((prev) => ({ ...prev, remarks: e.target.value }))}
            rows={3}
            placeholder="Enter remarks"
            disabled={fieldDisabled}
            isRequired
          />
        </div>
      </div>
    </div>
  );
}
