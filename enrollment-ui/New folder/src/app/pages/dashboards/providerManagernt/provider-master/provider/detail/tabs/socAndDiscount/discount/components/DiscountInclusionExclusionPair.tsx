import { useTranslation } from "react-i18next";
import {
  BillScopeMultiSelect,
  type BillScopeOption,
} from "../../../../../../ic-corporate-mapping/components/BillScopeMultiSelect";
import { withOppositeSelectionDisabled } from "../utils/discountInclusionExclusionHelpers";

type DiscountInclusionExclusionPairProps = {
  inclusion: string[];
  exclusion: string[];
  onInclusionChange: (next: string[]) => void;
  onExclusionChange: (next: string[]) => void;
  uniqueOptions: BillScopeOption[];
};

export function DiscountInclusionExclusionPair({
  inclusion,
  exclusion,
  onInclusionChange,
  onExclusionChange,
  uniqueOptions,
}: Readonly<DiscountInclusionExclusionPairProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const selectedInclusions = inclusion ?? [];
  const selectedExclusions = exclusion ?? [];
  const inclusionOptions = withOppositeSelectionDisabled(
    uniqueOptions,
    selectedExclusions,
    t(`${D}.alreadySelectedInExclusion`),
  );
  const exclusionOptions = withOppositeSelectionDisabled(
    uniqueOptions,
    selectedInclusions,
    t(`${D}.alreadySelectedInInclusion`),
  );

  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-1 lg:grid-cols-2">
      <BillScopeMultiSelect
        label={t(`${D}.inclusion`)}
        placeholder={t(`${D}.searchInclusion`)}
        value={selectedInclusions}
        onChange={(next) => {
          const blocked = new Set(selectedExclusions);
          onInclusionChange(next.filter((code) => !blocked.has(code)));
        }}
        options={inclusionOptions}
        size="sm"
      />
      <BillScopeMultiSelect
        label={t(`${D}.exclusion`)}
        placeholder={t(`${D}.searchExclusion`)}
        value={selectedExclusions}
        onChange={(next) => {
          const blocked = new Set(selectedInclusions);
          onExclusionChange(next.filter((code) => !blocked.has(code)));
        }}
        options={exclusionOptions}
        size="sm"
      />
    </div>
  );
}
