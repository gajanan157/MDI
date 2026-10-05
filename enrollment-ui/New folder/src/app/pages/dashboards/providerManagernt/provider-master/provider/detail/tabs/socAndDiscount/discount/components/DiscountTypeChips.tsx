import clsx from "clsx";
import { resolveDiscountTypeTone, sortDiscountTypeOptions } from "../utils/discountTypeStyles";

type DiscountTypeChipsProps = {
  typeIds: string[];
  options: { value: string; label: string }[];
};

export function DiscountTypeChips({ typeIds, options }: Readonly<DiscountTypeChipsProps>) {
  if (typeIds.length === 0) return null;

  const labelByValue = new Map(options.map((option) => [option.value, option.label]));
  const orderedIds = sortDiscountTypeOptions(
    typeIds.map((id) => ({ value: id, label: labelByValue.get(id) ?? id })),
  ).map((entry) => entry.value);

  return (
    <div className="flex flex-wrap gap-1.5">
      {orderedIds.map((typeId) => {
        const tone = resolveDiscountTypeTone(typeId);
        return (
          <span
            key={typeId}
            className={clsx(
              "inline-flex max-w-full truncate rounded-sm px-2 py-1 text-[11px] font-medium",
              tone.chip,
            )}
            title={labelByValue.get(typeId) ?? typeId}
          >
            {labelByValue.get(typeId) ?? typeId}
          </span>
        );
      })}
    </div>
  );
}
