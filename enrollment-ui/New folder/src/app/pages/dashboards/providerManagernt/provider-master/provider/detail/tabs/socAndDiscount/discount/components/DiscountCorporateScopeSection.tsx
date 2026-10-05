import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import type { DiscountCorporateNamedItem, DiscountFormValues } from "../types/discountTypes";
import { isGipsaPpnDiscountScopeLocked, isInsurerBipartiteDiscountScopeHidden, usesPsuInsurerScopeLabels } from "../../../agreement/utils/agreementHelpers";
import { humanDiscountLabel } from "../utils/discountDisplayLabel";
import {
  DISCOUNT_FIELD_CONTROL_CLASS,
  DISCOUNT_SCOPE_DROPDOWN_FORM_CLASS,
} from "../utils/discountConfig";
import { DiscountControlledDropdown } from "./DiscountControlledDropdown";
import { DiscountViewChipList } from "./DiscountViewChips";
import { useDiscountCorporateOptions } from "../hooks/useDiscountCorporateOptions";
import {
  getInsurersWithConfiguredCorporates,
} from "../utils/discountScopeHelpers";

type DiscountCorporateScopeSectionProps = {
  form: UseFormReturn<DiscountFormValues>;
  values: DiscountFormValues;
  /** GIC Standard: hide Step 2 (Corporates); corporate scope is forced to All policyholders. */
  hideCorporateStep?: boolean;
  insurerOptions: { value: string; label: string }[];
  effectiveInsurerIds: string[];
  optionsByInsurerId: Record<string, { value: string; label: string }[]>;
  labelOf: (options: { value: string; label: string }[], value: string) => string;
  onInsurerSelectionChange: (insurerIds: string[]) => void;
  syncCorporateInsurersFromInsuranceCo: (insurerIds: string[]) => void;
  namedCorporates?: DiscountCorporateNamedItem[];
  namedInsurers?: { id: string; name: string }[];
};

const SCOPE_SECTION_CLASS =
  "flex flex-col overflow-visible rounded border border-gray-200 bg-white";
const SCOPE_SECTION_HEADER_CLASS = "shrink-0 bg-white px-3 pt-2 pb-0.5";
const SCOPE_SECTION_TITLE_CLASS = "text-[12px] font-semibold text-slate-800";
const SCOPE_SECTION_BODY_CLASS = "flex flex-1 flex-col space-y-1.5 bg-white px-3 py-2";

function ScopeRadioOption({
  name,
  checked,
  label,
  onChange,
  disabled = false,
  variant = "plain",
}: Readonly<{
  name: string;
  checked: boolean;
  label: string;
  onChange: () => void;
  disabled?: boolean;
  variant?: "plain" | "pill";
}>) {
  if (variant === "pill") {
    return (
      <label
        className={clsx(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1 text-xs transition-colors",
          checked
            ? "bg-purple-100 text-purple-700"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200/80",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <input
          type="radio"
          name={name}
          className="h-3 w-3 shrink-0 border-gray-300 text-primary-600"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
        <span className="font-medium">{label}</span>
      </label>
    );
  }

  return (
    <label
      className={clsx(
        "inline-flex cursor-pointer items-center gap-1.5 text-[11px]",
        checked ? "text-gray-900" : "text-gray-700",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input
        type="radio"
        name={name}
        className="h-3.5 w-3.5 shrink-0 border-gray-300 text-primary-600 focus:ring-primary-500"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className="font-medium">{label}</span>
    </label>
  );
}

type ScopeDropdownOption = { value: string; label: string; searchText?: string };

type InsurerScopeStepProps = {
  form: UseFormReturn<DiscountFormValues>;
  insurerAll: boolean;
  allInsurerScopeLabel: string;
  selectedInsurerScopeLabel: string;
  allInsurerScopeHintKey: string;
  isGipsaScopeLocked: boolean;
  insurerOptions: { value: string; label: string }[];
  insurerScopeError: string;
  visibleInsurerChips: { id: string; name: string }[];
  allInsurerIdsCount: number;
  onSelectAllInsurers: () => void;
  onSelectSpecificInsurers: () => void;
  onInsurerDropdownChange: (value: unknown) => void;
  onRemoveInsurer: (insurerId: string) => void;
};

/** Step 1 — insurer-company scope (all vs. selected + configured-corporate chips). */
function InsurerScopeStep({
  form,
  insurerAll,
  allInsurerScopeLabel,
  selectedInsurerScopeLabel,
  allInsurerScopeHintKey,
  isGipsaScopeLocked,
  insurerOptions,
  insurerScopeError,
  visibleInsurerChips,
  allInsurerIdsCount,
  onSelectAllInsurers,
  onSelectSpecificInsurers,
  onInsurerDropdownChange,
  onRemoveInsurer,
}: Readonly<InsurerScopeStepProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";

  return (
    <section className={SCOPE_SECTION_CLASS}>
      <div className={SCOPE_SECTION_HEADER_CLASS}>
        <p className={SCOPE_SECTION_TITLE_CLASS}>{t(`${D}.fields.insuranceScopeStep`)}</p>
      </div>
      <div className={SCOPE_SECTION_BODY_CLASS}>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <ScopeRadioOption
            name="discount-insurer-scope"
            variant="pill"
            checked={!!insurerAll}
            label={allInsurerScopeLabel}
            onChange={onSelectAllInsurers}
          />
          <ScopeRadioOption
            name="discount-insurer-scope"
            variant="pill"
            checked={!insurerAll}
            label={selectedInsurerScopeLabel}
            disabled={isGipsaScopeLocked}
            onChange={onSelectSpecificInsurers}
          />
          {!insurerAll && !isGipsaScopeLocked ? (
            <div className="min-w-[12rem] flex-1">
              <DropdownSelect
                name="insurerIds"
                control={form.control}
                options={insurerOptions}
                defaultValue={t(`${D}.fields.searchInsurers`)}
                multiselect
                is_select_checkbox
                showSelectAllInMenu
                multiselectHorizontalScroll
                menuPlacement="auto"
                className={DISCOUNT_FIELD_CONTROL_CLASS}
                formClassName={DISCOUNT_SCOPE_DROPDOWN_FORM_CLASS}
                errors={insurerScopeError ? { message: insurerScopeError } : undefined}
                onChange={onInsurerDropdownChange}
              />
            </div>
          ) : null}
        </div>

        {visibleInsurerChips.length > 0 ? (
          <div className="space-y-1">
            {insurerAll ? (
              <p className="text-[10px] font-medium text-gray-600">
                {t(`${D}.fields.${allInsurerScopeHintKey}`, {
                  count: visibleInsurerChips.length,
                })}
              </p>
            ) : null}
            <DiscountViewChipList
              items={visibleInsurerChips}
              tone="sky"
              onRemove={
                isGipsaScopeLocked
                  ? undefined
                  : (item) => {
                      if (item.id) onRemoveInsurer(item.id);
                    }
              }
              removeLabelFor={(item) =>
                t(`${D}.fields.removeNamed`, {
                  name: item.name,
                  defaultValue: `Remove ${item.name}`,
                })
              }
            />
          </div>
        ) : null}
        {visibleInsurerChips.length === 0 && insurerAll ? (
          <p className="flex-1 rounded-sm border border-gray-200 bg-gray-50 px-2 py-1.5 text-[10px] text-gray-700">
            {t(`${D}.fields.${allInsurerScopeHintKey}`, { count: allInsurerIdsCount })}
          </p>
        ) : null}
      </div>
    </section>
  );
}

type CorporateScopeStepProps = {
  form: UseFormReturn<DiscountFormValues>;
  corporateAll: boolean;
  isGipsaScopeLocked: boolean;
  corporateScopeInsurerIds: string[];
  activeInsurerDropdownOptions: ScopeDropdownOption[];
  activeCorporateInsurerId: string;
  activeInsurerLabel: string;
  activeCorporateDropdownOptions: { value: string; label: string }[];
  configuredCorporateItems: {
    insurerId: string;
    insurerLabel: string;
    corporateId: string;
    corporateLabel: string;
  }[];
  onSelectAllPolicyholders: () => void;
  onSelectSpecificCorporates: () => void;
  onActiveCorporateInsurerIdChange: (insurerId: string) => void;
  onActiveCorporatesChange: (next: string[]) => void;
  onRemoveCorporate: (insurerId: string, corporateId: string) => void;
};

/** Step 2 — corporate scope for the selected insurers. */
function CorporateScopeStep({
  form,
  corporateAll,
  isGipsaScopeLocked,
  corporateScopeInsurerIds,
  activeInsurerDropdownOptions,
  activeCorporateInsurerId,
  activeInsurerLabel,
  activeCorporateDropdownOptions,
  configuredCorporateItems,
  onSelectAllPolicyholders,
  onSelectSpecificCorporates,
  onActiveCorporateInsurerIdChange,
  onActiveCorporatesChange,
  onRemoveCorporate,
}: Readonly<CorporateScopeStepProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";

  const removeLabelFor = (corporateLabel: string) =>
    t(`${D}.fields.removeNamed`, {
      name: corporateLabel,
      defaultValue: `Remove ${corporateLabel}`,
    });

  return (
    <section className={SCOPE_SECTION_CLASS}>
      <div className={SCOPE_SECTION_HEADER_CLASS}>
        <p className={SCOPE_SECTION_TITLE_CLASS}>{t(`${D}.fields.corporateScopeStep`)}</p>
      </div>
      <div className={SCOPE_SECTION_BODY_CLASS}>
        {corporateScopeInsurerIds.length === 0 ? (
          <p className="flex-1 rounded-sm border border-dashed border-gray-300 bg-gray-50 px-2 py-3 text-[10px] text-amber-700">
            {t(`${D}.fields.selectInsurersFirst`)}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              <ScopeRadioOption
                name="discount-corporate-scope"
                variant="pill"
                checked={!!corporateAll}
                label={t(`${D}.fields.allPolicyholders`)}
                onChange={onSelectAllPolicyholders}
              />
              <ScopeRadioOption
                name="discount-corporate-scope"
                variant="pill"
                checked={!corporateAll}
                label={t(`${D}.fields.selectedCorporates`)}
                disabled={isGipsaScopeLocked}
                onChange={onSelectSpecificCorporates}
              />
            </div>

            {corporateAll || isGipsaScopeLocked ? (
              <p className="flex-1 rounded-sm border border-gray-200 bg-gray-50 px-2 py-1.5 text-[10px] text-gray-700">
                {t(`${D}.fields.allPolicyholdersForSelectedIc`)}
              </p>
            ) : (
              <div className="min-h-0 flex-1 space-y-2.5">
                <div className="grid grid-cols-1 items-end gap-x-3 gap-y-1 sm:grid-cols-2">
                  <div className="min-w-0">
                    <DiscountControlledDropdown
                      label={t(`${D}.fields.corporateInsurer`)}
                      isRequired
                      options={activeInsurerDropdownOptions}
                      value={activeCorporateInsurerId}
                      onChange={onActiveCorporateInsurerIdChange}
                      className={DISCOUNT_FIELD_CONTROL_CLASS}
                      formClassName={DISCOUNT_SCOPE_DROPDOWN_FORM_CLASS}
                      defaultValue={t(`${D}.fields.selectCorporateInsurer`)}
                    />
                  </div>
                  <div className="min-w-0">
                    {activeCorporateInsurerId ? (
                      <DropdownSelect
                        key={activeCorporateInsurerId}
                        name={`corporateIdsByInsurer.${activeCorporateInsurerId}`}
                        name_key={`corporateIdsByInsurer.${activeCorporateInsurerId}`}
                        control={form.control}
                        label={t(`${D}.fields.corporateForIcNamed`, {
                          insurer: activeInsurerLabel,
                        })}
                        isRequired
                        options={activeCorporateDropdownOptions}
                        defaultValue={t(`${D}.fields.selectCorporate`)}
                        multiselect
                        is_select_checkbox
                        showSelectAllInMenu
                        multiselectHorizontalScroll
                        menuPlacement="auto"
                        className={DISCOUNT_FIELD_CONTROL_CLASS}
                        formClassName={DISCOUNT_SCOPE_DROPDOWN_FORM_CLASS}
                        onChange={(value) => {
                          const next = (Array.isArray(value) ? value : [])
                            .map(String)
                            .filter(Boolean);
                          onActiveCorporatesChange(next);
                        }}
                      />
                    ) : (
                      <DiscountControlledDropdown
                        label={t(`${D}.fields.corporate`)}
                        isRequired
                        options={[]}
                        value=""
                        onChange={() => undefined}
                        className={DISCOUNT_FIELD_CONTROL_CLASS}
                        formClassName={DISCOUNT_SCOPE_DROPDOWN_FORM_CLASS}
                        defaultValue={t(`${D}.fields.selectCorporate`)}
                        disabled
                      />
                    )}
                  </div>
                </div>

                {configuredCorporateItems.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-medium text-gray-600">
                      {t(`${D}.fields.configuredCorporates`)}
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {configuredCorporateItems.map((item) => (
                        <li key={`${item.insurerId}-${item.corporateId}`}>
                          <span className="inline-flex max-w-full items-start gap-1 rounded-sm border border-violet-200 bg-violet-50 px-2 py-1">
                            <button
                              type="button"
                              title={`${item.corporateLabel} · ${item.insurerLabel}`}
                              onClick={() =>
                                onActiveCorporateInsurerIdChange(item.insurerId)
                              }
                              className="inline-flex min-w-0 cursor-pointer flex-col text-left"
                            >
                              <span className="max-w-[16rem] truncate text-[11px] font-medium text-violet-900">
                                {item.corporateLabel}
                              </span>
                              <span className="max-w-[16rem] truncate text-[10px] text-violet-700">
                                {item.insurerLabel}
                              </span>
                            </button>
                            <button
                              type="button"
                              aria-label={removeLabelFor(item.corporateLabel)}
                              title={removeLabelFor(item.corporateLabel)}
                              onClick={() =>
                                onRemoveCorporate(item.insurerId, item.corporateId)
                              }
                              className="shrink-0 cursor-pointer leading-none text-violet-500 hover:text-violet-800"
                            >
                              ×
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export function DiscountCorporateScopeSection({
  form,
  values,
  hideCorporateStep = false,
  insurerOptions,
  effectiveInsurerIds,
  optionsByInsurerId,
  labelOf,
  onInsurerSelectionChange,
  syncCorporateInsurersFromInsuranceCo,
  namedCorporates = [],
  namedInsurers = [],
}: Readonly<DiscountCorporateScopeSectionProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const usesPsuLabels = usesPsuInsurerScopeLabels(values.agreementName);
  const isGipsaScopeLocked = isGipsaPpnDiscountScopeLocked(values.agreementName);
  const isInsurerBipartiteScopeHidden = isInsurerBipartiteDiscountScopeHidden(
    values.agreementName,
  );
  const allInsurerScopeLabel = t(`${D}.fields.${usesPsuLabels ? "allPsu" : "allIc"}`);
  const selectedInsurerScopeLabel = t(
    `${D}.fields.${usesPsuLabels ? "selectedPsu" : "selectedIc"}`,
  );
  const allInsurerScopeHintKey = usesPsuLabels ? "allPsuHint" : "allIcHint";
  const [activeCorporateInsurerId, setActiveCorporateInsurerId] = useState("");
  const [insurerScopeError, setInsurerScopeError] = useState("");
  const selectedInsurerIdsBeforeAllRef = useRef<string[]>([]);
  const corporateOptionsInsurerIds = useMemo(
    () => (activeCorporateInsurerId ? [activeCorporateInsurerId] : []),
    [activeCorporateInsurerId],
  );
  const { optionsByInsurerId: loadedOptionsByInsurerId } = useDiscountCorporateOptions({
    enabled: !values.corporateAll && Boolean(activeCorporateInsurerId),
    insurerIds: corporateOptionsInsurerIds,
  });
  const resolvedOptionsByInsurerId = useMemo(
    () => ({ ...optionsByInsurerId, ...loadedOptionsByInsurerId }),
    [loadedOptionsByInsurerId, optionsByInsurerId],
  );

  const allInsurerIds = useMemo(
    () => (insurerOptions ?? []).map((option) => option.value).filter(Boolean),
    [insurerOptions],
  );

  const corporateIdsByInsurer = useMemo(
    () => values.corporateIdsByInsurer ?? {},
    [values.corporateIdsByInsurer],
  );

  const corporateScopeInsurerIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...effectiveInsurerIds,
          ...getInsurersWithConfiguredCorporates(corporateIdsByInsurer),
        ]),
      ),
    [corporateIdsByInsurer, effectiveInsurerIds],
  );

  useEffect(() => {
    if (!activeCorporateInsurerId) return;
    if (
      corporateScopeInsurerIds.length === 0 ||
      !corporateScopeInsurerIds.includes(activeCorporateInsurerId)
    ) {
      setActiveCorporateInsurerId("");
    }
  }, [activeCorporateInsurerId, corporateScopeInsurerIds]);

  // Clear the insurer-scope error once the corporate configuration changes
  // (e.g. the conflicting corporate is removed).
  useEffect(() => {
    setInsurerScopeError("");
  }, [corporateIdsByInsurer]);

  // GIC Standard: Step 2 is hidden and corporate scope is always All policyholders.
  useEffect(() => {
    if (!hideCorporateStep || values.corporateAll) return;
    form.setValue("corporateAll", true, { shouldDirty: true });
    form.setValue("corporateInsurerIds", []);
    form.setValue("corporateIdsByInsurer", {});
  }, [hideCorporateStep, values.corporateAll, form]);

  const namedInsurerById = useMemo(() => {
    const map = new Map<string, string>();
    namedInsurers.forEach((item) => {
      const name = humanDiscountLabel(item.name, item.id);
      if (item.id && name) map.set(item.id, name);
    });
    return map;
  }, [namedInsurers]);

  const namedCorporateByKey = useMemo(() => {
    const map = new Map<string, DiscountCorporateNamedItem>();
    namedCorporates.forEach((item) => {
      if (!item.id) return;
      map.set(`${item.insurerId}|${item.id}`, item);
      if (!map.has(item.id)) map.set(item.id, item);
    });
    return map;
  }, [namedCorporates]);

  const resolveInsurerLabel = useCallback(
    (insurerId: string) =>
      namedInsurerById.get(insurerId) ||
      humanDiscountLabel(labelOf(insurerOptions, insurerId), ""),
    [insurerOptions, labelOf, namedInsurerById],
  );

  const resolveCorporateLabel = (insurerId: string, corporateId: string) => {
    const named =
      namedCorporateByKey.get(`${insurerId}|${corporateId}`) ??
      namedCorporateByKey.get(corporateId);
    return (
      humanDiscountLabel(named?.name, "") ||
      humanDiscountLabel(labelOf(resolvedOptionsByInsurerId[insurerId] ?? [], corporateId), "")
    );
  };

  const activeInsurerLabel =
    resolveInsurerLabel(activeCorporateInsurerId) || activeCorporateInsurerId;

  const activeInsurerDropdownOptions = useMemo(
    () => [
      {
        value: "",
        label: t(`${D}.fields.selectCorporateInsurer`),
        searchText: t(`${D}.fields.selectCorporateInsurer`),
      },
      ...(corporateScopeInsurerIds ?? []).map((insurerId) => {
        const count = corporateIdsByInsurer[insurerId]?.length ?? 0;
        const insurerLabel = resolveInsurerLabel(insurerId) || insurerId;
        return {
          value: insurerId,
          label: count > 0 ? `${insurerLabel} (${count})` : insurerLabel,
          searchText: insurerLabel,
        };
      }),
    ],
    [corporateIdsByInsurer, corporateScopeInsurerIds, resolveInsurerLabel, t],
  );

  const configuredCorporateItems = corporateScopeInsurerIds.flatMap((insurerId) => {
    const corpIds = corporateIdsByInsurer[insurerId] ?? [];
    const insurerLabel = resolveInsurerLabel(insurerId);
    return corpIds
      .map((corporateId) => {
        const corporateLabel = resolveCorporateLabel(insurerId, corporateId);
        if (!corporateLabel || !insurerLabel) return null;
        return { insurerId, insurerLabel, corporateId, corporateLabel };
      })
      .filter(
        (item): item is {
          insurerId: string;
          insurerLabel: string;
          corporateId: string;
          corporateLabel: string;
        } => item != null,
      );
  });

  const activeCorporateDropdownOptions = useMemo(() => {
    const merged = new Map<string, string>();
    (resolvedOptionsByInsurerId[activeCorporateInsurerId] ?? []).forEach((option) => {
      const label = humanDiscountLabel(option.label, option.value);
      if (option.value && label) merged.set(option.value, label);
    });
    namedCorporates.forEach((item) => {
      if (item.insurerId && item.insurerId !== activeCorporateInsurerId) return;
      const label = humanDiscountLabel(item.name, item.id);
      if (item.id && label) merged.set(item.id, label);
    });
    return Array.from(merged.entries()).map(([value, label]) => ({ value, label }));
  }, [activeCorporateInsurerId, namedCorporates, resolvedOptionsByInsurerId]);

  const visibleInsurerChips = effectiveInsurerIds
    .filter((insurerId) => !(corporateIdsByInsurer[insurerId]?.length > 0))
    .map((insurerId) => ({
      id: insurerId,
      name: resolveInsurerLabel(insurerId),
    }))
    .filter((item) => item.name);

  const removeInsurer = (insurerId: string) => {
    if (isGipsaScopeLocked) return;
    const configuredCorporates = form.getValues("corporateIdsByInsurer")?.[insurerId] ?? [];
    if (configuredCorporates.length > 0) return;
    const nextIds = effectiveInsurerIds.filter((id) => id !== insurerId);
    if (values.insurerAll) {
      form.setValue("insurerAll", false, { shouldDirty: true });
    }
    form.setValue("insurerIds", nextIds, { shouldDirty: true });
    onInsurerSelectionChange(nextIds);
    if (activeCorporateInsurerId === insurerId) {
      setActiveCorporateInsurerId("");
    }
  };

  const removeCorporate = (insurerId: string, corporateId: string) => {
    const remaining = (form.getValues("corporateIdsByInsurer")?.[insurerId] ?? []).filter(
      (id) => id !== corporateId,
    );
    updateCorporatesForInsurer(insurerId, remaining);
  };

  const setInsurerAll = (allIc: boolean) => {
    if (allIc) {
      const current = (form.getValues("insurerIds") ?? []).map((id) => id.trim()).filter(Boolean);
      const isAlreadyAll =
        current.length === allInsurerIds.length &&
        allInsurerIds.every((id) => current.includes(id));
      if (!isAlreadyAll) {
        selectedInsurerIdsBeforeAllRef.current = current;
      }
      form.setValue("insurerAll", true, { shouldDirty: true });
      form.setValue("insurerIds", allInsurerIds, { shouldDirty: true });
      if (!form.getValues("corporateAll")) {
        syncCorporateInsurersFromInsuranceCo(allInsurerIds);
      }
      return;
    }

    const restored = selectedInsurerIdsBeforeAllRef.current.filter((id) =>
      allInsurerIds.includes(id),
    );
    const current = (form.getValues("insurerIds") ?? []).map((id) => id.trim()).filter(Boolean);
    const nextIds = restored.length > 0 ? restored : current;
    selectedInsurerIdsBeforeAllRef.current = [];
    form.setValue("insurerAll", false, { shouldDirty: true });
    form.setValue("insurerIds", nextIds, { shouldDirty: true });
    if (!form.getValues("corporateAll")) {
      onInsurerSelectionChange(nextIds);
    }
  };

  const setCorporateAll = (allPolicyholders: boolean) => {
    form.setValue("corporateAll", allPolicyholders, { shouldDirty: true });
    if (allPolicyholders) {
      form.setValue("corporateInsurerIds", []);
      form.setValue("corporateIdsByInsurer", {});
      return;
    }
    syncCorporateInsurersFromInsuranceCo(effectiveInsurerIds);
  };

  const updateCorporatesForInsurer = (insurerId: string, next: string[]) => {
    const prevByInsurer = form.getValues("corporateIdsByInsurer") ?? {};
    const nextByInsurer = {
      ...prevByInsurer,
      [insurerId]: next,
    };
    form.setValue(
      "corporateIdsByInsurer",
      nextByInsurer,
      { shouldDirty: true, shouldValidate: true },
    );

    // Once an insurer has specific corporates, it is corporate-scoped and must
    // NOT also appear in the Step 1 "Selected IC" list (the two are disjoint).
    if (next.length > 0) {
      const wasInsurerAll = form.getValues("insurerAll");
      if (wasInsurerAll) {
        form.setValue("insurerAll", false, { shouldDirty: true });
        form.setValue(
          "insurerIds",
          allInsurerIds.filter((id) => id !== insurerId),
          { shouldDirty: true, shouldValidate: true },
        );
      } else {
        const current = form.getValues("insurerIds") ?? [];
        if (current.includes(insurerId)) {
          form.setValue(
            "insurerIds",
            current.filter((id) => id !== insurerId),
            { shouldDirty: true, shouldValidate: true },
          );
        }
      }
    }

    const currentCorporateInsurers = form.getValues("corporateInsurerIds") ?? [];
    if (next.length === 0) {
      form.setValue(
        "corporateInsurerIds",
        currentCorporateInsurers.filter((id) => id !== insurerId),
        { shouldDirty: true },
      );
      return;
    }
    if (!currentCorporateInsurers.includes(insurerId)) {
      form.setValue("corporateInsurerIds", [...currentCorporateInsurers, insurerId], {
        shouldDirty: true,
      });
    }
  };

  const handleInsurerScopeDropdownChange = (value: unknown) => {
    const next = (Array.isArray(value) ? value : []).map(String).filter(Boolean);
    const insurersWithCorporates = new Set(
      getInsurersWithConfiguredCorporates(corporateIdsByInsurer),
    );
    const blocked = next.filter((id) => insurersWithCorporates.has(id));
    if (blocked.length > 0) {
      const allowed = next.filter((id) => !insurersWithCorporates.has(id));
      form.setValue("insurerIds", allowed, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setInsurerScopeError(
        t(`${D}.fields.insurerHasCorporatesError`, {
          name: blocked.map((id) => resolveInsurerLabel(id) || id).join(", "),
        }),
      );
      onInsurerSelectionChange(allowed);
      return;
    }
    setInsurerScopeError("");
    onInsurerSelectionChange(next);
  };

  if (!values.agreementId?.trim()) {
    return (
      <p className="text-[10px] text-amber-700">
        {t(`${D}.fields.selectAgreementOrWaitInsurers`)}
      </p>
    );
  }

  if (insurerOptions.length === 0) {
    return (
      <p className="text-[10px] text-amber-700">
        {t(`${D}.fields.noInsurersOnAgreement`)}
      </p>
    );
  }

  return (
    <div
      className={clsx(
        "grid grid-cols-1 items-stretch gap-2",
        !isInsurerBipartiteScopeHidden && !hideCorporateStep && "lg:grid-cols-2",
      )}
    >
      {isInsurerBipartiteScopeHidden ? null : (
        <InsurerScopeStep
          form={form}
          insurerAll={!!values.insurerAll}
          allInsurerScopeLabel={allInsurerScopeLabel}
          selectedInsurerScopeLabel={selectedInsurerScopeLabel}
          allInsurerScopeHintKey={allInsurerScopeHintKey}
          isGipsaScopeLocked={isGipsaScopeLocked}
          insurerOptions={insurerOptions}
          insurerScopeError={insurerScopeError}
          visibleInsurerChips={visibleInsurerChips}
          allInsurerIdsCount={allInsurerIds.length}
          onSelectAllInsurers={() => setInsurerAll(true)}
          onSelectSpecificInsurers={() => setInsurerAll(false)}
          onInsurerDropdownChange={handleInsurerScopeDropdownChange}
          onRemoveInsurer={removeInsurer}
        />
      )}

      {hideCorporateStep ? null : (
        <CorporateScopeStep
          form={form}
          corporateAll={!!values.corporateAll}
          isGipsaScopeLocked={isGipsaScopeLocked}
          corporateScopeInsurerIds={corporateScopeInsurerIds}
          activeInsurerDropdownOptions={activeInsurerDropdownOptions}
          activeCorporateInsurerId={activeCorporateInsurerId}
          activeInsurerLabel={activeInsurerLabel}
          activeCorporateDropdownOptions={activeCorporateDropdownOptions}
          configuredCorporateItems={configuredCorporateItems}
          onSelectAllPolicyholders={() => setCorporateAll(true)}
          onSelectSpecificCorporates={() => setCorporateAll(false)}
          onActiveCorporateInsurerIdChange={setActiveCorporateInsurerId}
          onActiveCorporatesChange={(next) =>
            updateCorporatesForInsurer(activeCorporateInsurerId, next)
          }
          onRemoveCorporate={removeCorporate}
        />
      )}
    </div>
  );
}
