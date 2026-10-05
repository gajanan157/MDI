import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui";

type ExclusionFlagCheckboxGroupProps = {
  investigationRequired: boolean;
  emergencyExceptionAllowed: boolean;
  onInvestigationRequiredChange: (checked: boolean) => void;
  onEmergencyExceptionChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Align with neighboring labeled fields in a form grid. */
  alignWithFieldLabel?: boolean;
};

const LABEL_CLASS = "input-label mb-1 block text-[11px] font-medium text-gray-700";
const CHECKBOX_LABEL_CLASS = "!text-[11px] font-normal leading-tight text-black";

export function ExclusionFlagCheckboxGroup({
  investigationRequired,
  emergencyExceptionAllowed,
  onInvestigationRequiredChange,
  onEmergencyExceptionChange,
  disabled = false,
  alignWithFieldLabel = true,
}: Readonly<ExclusionFlagCheckboxGroupProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.excludedProvider.uploadDialog";
  return (
    <div className="min-w-0">
      {alignWithFieldLabel ? (
        <span className={`${LABEL_CLASS} invisible select-none`} aria-hidden="true">
          Flags
        </span>
      ) : null}
      <div className="flex min-h-8 w-full items-center gap-4 rounded-md border border-slate-300 bg-white px-3 py-1">
        <Checkbox
          checked={investigationRequired}
          onChange={(event) => onInvestigationRequiredChange(event.target.checked)}
          disabled={disabled}
          label={t(`${D}.investigationRequired`)}
          classNames={{
            label: "cursor-pointer gap-2 !text-[11px] font-normal",
            labelText: CHECKBOX_LABEL_CLASS,
          }}
        />
        <Checkbox
          checked={emergencyExceptionAllowed}
          onChange={(event) => onEmergencyExceptionChange(event.target.checked)}
          disabled={disabled}
          label={t(`${D}.emergencyException`)}
          classNames={{
            label: "cursor-pointer gap-2 !text-[11px] font-normal",
            labelText: CHECKBOX_LABEL_CLASS,
          }}
        />
      </div>
    </div>
  );
}
