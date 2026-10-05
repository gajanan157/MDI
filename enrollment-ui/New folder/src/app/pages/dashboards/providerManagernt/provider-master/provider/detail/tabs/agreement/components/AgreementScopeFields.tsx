import type { ReactNode } from "react";
import type { UseFormRegister } from "react-hook-form";
import { Radio } from "@/components/ui";
import type { AgreementFullFormValues } from "../utils/agreementFormConfig";
import type { AgreementFormLogic } from "../hooks/useAgreement";

type ScopeRadioOption = { label: string; value: string };

function resolveShowScopeTable(
  isHospital: boolean,
  showSelectedIcScopeUi: boolean,
  applicableScope: string,
  selectedIcLabelCount: number,
  hasScopeRows: boolean,
): boolean {
  if (isHospital) return hasScopeRows;
  if (
    showSelectedIcScopeUi &&
    (applicableScope === "SELECTED_INSURER" || applicableScope === "PSU") &&
    (selectedIcLabelCount > 0 || hasScopeRows)
  ) {
    return true;
  }
  return !showSelectedIcScopeUi && hasScopeRows;
}

function renderScopeRadioControls(
  hideScopeRadio: boolean,
  scopeRadioOptions: ScopeRadioOption[],
  register: UseFormRegister<AgreementFullFormValues>,
  isScopeOptionDisabled: (value: string) => boolean,
) {
  if (hideScopeRadio) {
    return <input type="hidden" {...register("applicableScope")} />;
  }
  if (scopeRadioOptions.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {scopeRadioOptions.map((opt) => (
        <Radio
          key={opt.value}
          label={opt.label}
          {...register("applicableScope")}
          value={opt.value}
          disabled={isScopeOptionDisabled(String(opt.value))}
        />
      ))}
    </div>
  );
}

function renderScopeIcChips({
  isHospital,
  rows,
  selectedIcLabelList,
  canRemove,
  onRemoveIc,
}: {
  isHospital: boolean;
  rows: AgreementFormLogic["selectedIcInvolvementRows"]["rows"];
  selectedIcLabelList: string[];
  canRemove: boolean;
  onRemoveIc?: (insurerId: string) => void;
}): ReactNode {
  if (isHospital) return null;

  if (rows.length > 0) {
    return (
      <div className="flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1">
        {rows.map((row, idx) => (
          <span
            key={`${row.insurerId || row.name}-${idx}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-800"
          >
            {row.name}
            {canRemove && row.insurerId && !row.insurerId.startsWith("all-") ? (
              <button
                type="button"
                className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600"
                onClick={() => onRemoveIc?.(row.insurerId)}
                aria-label={`Remove ${row.name}`}
              >
                ×
              </button>
            ) : null}
          </span>
        ))}
      </div>
    );
  }

  if (selectedIcLabelList.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1">
      {selectedIcLabelList.map((name, idx) => (
        <span
          key={`${name}-${idx}`}
          className="inline-flex shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-800"
        >
          {name}
        </span>
      ))}
    </div>
  );
}

type AgreementScopeFieldsProps = {
  isHospital: boolean;
  applicableScope: string;
  register: UseFormRegister<AgreementFullFormValues>;
  scopeRadioOptions: ScopeRadioOption[];
  showSelectedIcScopeUi: boolean;
  scopeIcDropdown: ReactNode;
  involvementTable: ReactNode;
  selectedIcLabelList: string[];
  selectedIcInvolvementRows: AgreementFormLogic["selectedIcInvolvementRows"];
  isScopeOptionDisabled: (value: string) => boolean;
  hideScopeIcList?: boolean;
  onRemoveIc?: (insurerId: string) => void;
};

export function AgreementScopeFields({
  isHospital,
  applicableScope,
  register,
  scopeRadioOptions,
  showSelectedIcScopeUi,
  scopeIcDropdown,
  involvementTable,
  selectedIcLabelList,
  selectedIcInvolvementRows,
  isScopeOptionDisabled,
  hideScopeIcList = false,
  onRemoveIc,
}: Readonly<AgreementScopeFieldsProps>) {
  const hasScopeRows = selectedIcInvolvementRows.rows.length > 0;
  const hideScopeRadio =
    scopeRadioOptions.length === 1 && scopeIcDropdown != null;
  const showScopeTable =
    !hideScopeIcList && resolveShowScopeTable(
      isHospital,
      showSelectedIcScopeUi,
      applicableScope,
      selectedIcLabelList.length,
      hasScopeRows,
    );
  const canRemove = typeof onRemoveIc === "function";

  return (
    <div className="space-y-1.5 px-3 py-1.5">
      <div
        className={`flex min-w-0 flex-wrap gap-x-3 gap-y-2 ${
          scopeIcDropdown ? "items-end" : "items-center"
        }`}
      >
        {renderScopeRadioControls(
          hideScopeRadio,
          scopeRadioOptions,
          register,
          isScopeOptionDisabled,
        )}
        {scopeIcDropdown}
      </div>
      {showScopeTable ? (
        <div className="space-y-1.5 pt-0.5">
          {renderScopeIcChips({
            isHospital,
            rows: selectedIcInvolvementRows.rows,
            selectedIcLabelList,
            canRemove,
            onRemoveIc,
          })}
          {hasScopeRows ? involvementTable : null}
        </div>
      ) : null}
    </div>
  );
}
