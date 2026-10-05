import clsx from "clsx";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { enforceExclusiveIpdDiscountTypes } from "../utils/discountBulkConfig";
import {
  resolveDiscountTypeTone,
  sortDiscountTypeOptions,
} from "../utils/discountTypeStyles";

type DiscountTypeOption = { label: string; value: string };

export type DiscountTypePickerGroup = {
  id: string;
  title: string;
  options: DiscountTypeOption[];
};

type DiscountTypePickerProps = {
  value: string[];
  onChange: (next: string[]) => void;
  options?: DiscountTypeOption[];
  groups?: DiscountTypePickerGroup[];
};

function TypeOptionCard({
  option,
  selected,
  onToggle,
}: Readonly<{
  option: DiscountTypeOption;
  selected: boolean;
  onToggle: () => void;
}>) {
  const tone = resolveDiscountTypeTone(option.value);

  return (
    <label
      className={clsx(
        "flex h-full w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-sm border px-1.5 py-1 transition-all",
        selected
          ? tone.selectedCard
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80",
      )}
    >
      <span
        className={clsx(
          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border",
          selected ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-white",
        )}
        aria-hidden
      >
        {selected ? <CheckIcon className="h-2.5 w-2.5" /> : null}
      </span>
      <input type="checkbox" className="sr-only" checked={selected} onChange={onToggle} />
      <span
        className={clsx(
          "inline-flex min-w-0 flex-1 cursor-pointer truncate rounded-sm px-1.5 py-0.5 text-[9px] font-medium leading-tight sm:text-[10px]",
          tone.chip,
        )}
        title={option.label}
      >
        {option.label}
      </span>
    </label>
  );
}

function groupGridClass(groupId: string): string {
  if (groupId === "opd") {
    return "grid w-full grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6 [&>*]:min-w-0";
  }
  if (groupId === "ipd") {
    return "grid w-full grid-cols-2 gap-1.5 sm:grid-cols-4 [&>*]:min-w-0";
  }
  return "grid w-full grid-cols-5 gap-1.5 [&>*]:min-w-0";
}

export function DiscountTypePicker({
  value,
  onChange,
  options = [],
  groups,
}: Readonly<DiscountTypePickerProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const resolvedGroups: DiscountTypePickerGroup[] =
    groups?.filter((group) => group.options.some((option) => option.value)) ??
    (options.length
      ? [{ id: "all", title: "", options }]
      : []);
  const showTitles = resolvedGroups.length > 1;

  const toggle = (typeId: string) => {
    if (value.includes(typeId)) {
      onChange(value.filter((entry) => entry !== typeId));
      return;
    }
    onChange(enforceExclusiveIpdDiscountTypes([...value, typeId], typeId));
  };

  if (resolvedGroups.length === 0) return null;

  return (
    <fieldset className="w-full space-y-1.5">
      <legend className="sr-only">{t(`${D}.typeMultiSelect`)}</legend>
      {resolvedGroups.map((group) => {
        const orderedOptions = sortDiscountTypeOptions(
          group.options.filter((option) => option.value),
        );
        return (
          <div key={group.id}>
            {showTitles && group.title ? (
              <p className="mb-1 text-[10px] font-medium text-gray-700">{group.title}</p>
            ) : null}
            <div className={groupGridClass(group.id)}>
              {orderedOptions.map((option) => (
                <TypeOptionCard
                  key={option.value}
                  option={option}
                  selected={value.includes(option.value)}
                  onToggle={() => toggle(option.value)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}
