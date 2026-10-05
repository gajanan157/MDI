import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import type { DiscountFormLayout } from "./discountFormBlockHelpers";

type DiscountApplyToAllSectionProps = {
  layout: DiscountFormLayout;
  discountAppliedToAll?: boolean;
  onApplyToAll?: () => void;
};

export function DiscountApplyToAllSection({
  layout,
  discountAppliedToAll,
  onApplyToAll,
}: Readonly<DiscountApplyToAllSectionProps>) {
  return (
    <div className="space-y-2 border-t border-gray-100 pt-2">
      {discountAppliedToAll ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/80 px-2 py-1.5">
          <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-600" />
          <span className="text-sm font-semibold text-green-800">Discount applied to all.</span>
        </div>
      ) : null}
      {onApplyToAll ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outlined"
            className={layout.applyButton}
            onClick={onApplyToAll}
          >
            Apply to all
          </Button>
        </div>
      ) : null}
    </div>
  );
}
