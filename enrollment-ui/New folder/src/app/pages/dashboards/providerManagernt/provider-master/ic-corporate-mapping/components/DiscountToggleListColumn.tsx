import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { Controller, type Control, type ControllerRenderProps, type UseFormSetValue } from "react-hook-form";
import { Checkbox } from "@/components/ui";
import { PercentageInputWithLabel } from "../../provider/detail/shared/PercentageInputWithLabel";
import { BillScopeMultiSelect } from "./BillScopeMultiSelect";
import {
  getSelectOptionLabel,
  prunePercentRecord,
  type PercentRecord,
  type SelectOption,
} from "./discountOpdBlockHelpers";

type DiscountToggleListColumnProps<TFieldValues extends Record<string, unknown>> = {
  control: Control<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  enabledFieldName: keyof TFieldValues & string;
  listFieldName: keyof TFieldValues & string;
  enabled: boolean;
  checkboxLabel: string;
  listLabel: string;
  listPlaceholder: string;
  options: SelectOption[];
  selectedList: string[];
  percents: PercentRecord;
  setPercents: Dispatch<SetStateAction<PercentRecord>>;
  size: "sm" | "md";
  selectClassName: string;
  labelTextCls: string;
  cardCls: string;
  percentPanelCls: string;
  percentControlSize: "sm" | "md";
  percentInputClass: string;
  columnLayout?: "inline" | "stacked";
  hideListLabel?: boolean;
};

function handleToggleChange<TFieldValues extends Record<string, unknown>>(
  event: ChangeEvent<HTMLInputElement>,
  field: ControllerRenderProps<TFieldValues>,
  listFieldName: keyof TFieldValues & string,
  setValue: UseFormSetValue<TFieldValues>,
  setPercents: Dispatch<SetStateAction<PercentRecord>>,
) {
  const checked = event.target.checked;
  field.onChange(checked);
  if (checked) return;

  setValue(listFieldName as never, [] as never);
  setPercents({});
}

function handleListChange<TFieldValues extends Record<string, unknown>>(
  next: string[],
  field: ControllerRenderProps<TFieldValues>,
  setPercents: Dispatch<SetStateAction<PercentRecord>>,
) {
  field.onChange(next as never);
  setPercents((prev) => prunePercentRecord(prev, next));
}

function handlePercentChange(
  value: string,
  nextPercent: string,
  setPercents: Dispatch<SetStateAction<PercentRecord>>,
) {
  setPercents((prev) => ({ ...prev, [value]: nextPercent }));
}

type DiscountPercentInputsProps = {
  selectedList: string[];
  options: SelectOption[];
  percents: PercentRecord;
  setPercents: Dispatch<SetStateAction<PercentRecord>>;
  percentPanelCls: string;
  percentControlSize: "sm" | "md";
  percentInputClass: string;
};

function DiscountPercentInputs({
  selectedList,
  options,
  percents,
  setPercents,
  percentPanelCls,
  percentControlSize,
  percentInputClass,
}: Readonly<DiscountPercentInputsProps>) {
  return (
    <div className={percentPanelCls}>
      <div className="grid grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2">
        {selectedList.map((value) => (
          <PercentageInputWithLabel
            key={value}
            label={getSelectOptionLabel(options, value)}
            value={percents[value] ?? ""}
            onChange={(nextPercent) => handlePercentChange(value, nextPercent, setPercents)}
            controlSize={percentControlSize}
            className={percentInputClass}
          />
        ))}
      </div>
    </div>
  );
}

export function DiscountToggleListColumn<TFieldValues extends Record<string, unknown>>({
  control,
  setValue,
  enabledFieldName,
  listFieldName,
  enabled,
  checkboxLabel,
  listLabel,
  listPlaceholder,
  options,
  selectedList,
  percents,
  setPercents,
  size,
  selectClassName,
  labelTextCls,
  cardCls,
  percentPanelCls,
  percentControlSize,
  percentInputClass,
  columnLayout = "inline",
  hideListLabel = false,
}: DiscountToggleListColumnProps<TFieldValues>) {
  const toggleControl = (
    <Controller
      name={enabledFieldName as never}
      control={control}
      render={({ field }) => (
        <Checkbox
          label={checkboxLabel}
          checked={!!field.value}
          onChange={(event) =>
            handleToggleChange(event, field, listFieldName, setValue, setPercents)
          }
          classNames={{
            label: "items-start gap-1.5",
            labelText: `${labelTextCls} font-semibold text-gray-800 whitespace-nowrap leading-tight`,
          }}
        />
      )}
    />
  );

  const listControl = (
    <Controller
      name={listFieldName as never}
      control={control}
      render={({ field }) => (
        <BillScopeMultiSelect
          label={hideListLabel ? "" : listLabel}
          placeholder={listPlaceholder}
          value={(field.value as string[] | undefined) ?? []}
          disabled={!enabled}
          onChange={(next) => handleListChange(next, field, setPercents)}
          options={options}
          size={size}
          selectClassName={selectClassName}
        />
      )}
    />
  );

  return (
    <div className={cardCls}>
      {columnLayout === "stacked" ? (
        <div className="flex min-w-0 flex-col gap-1">
          <div className="shrink-0">{toggleControl}</div>
          <div className="min-w-0">{listControl}</div>
        </div>
      ) : (
        <div className="grid grid-cols-[auto,minmax(0,1fr)] items-start gap-x-2.5">
          <div className="shrink-0 pt-1">{toggleControl}</div>
          <div className="min-w-0">{listControl}</div>
        </div>
      )}

      {enabled && selectedList.length > 0 ? (
        <DiscountPercentInputs
          selectedList={selectedList}
          options={options}
          percents={percents}
          setPercents={setPercents}
          percentPanelCls={percentPanelCls}
          percentControlSize={percentControlSize}
          percentInputClass={percentInputClass}
        />
      ) : null}
    </div>
  );
}
