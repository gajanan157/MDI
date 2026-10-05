import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { CorporateDiscountSection } from "./CorporateDiscountSection";
import { CorporateSocSection } from "./CorporateSocSection";

type CorporateSocDiscountDocumentPanelProps = {
  variant: "compact" | "standard";
  control: unknown;
  socUploadedCorporate: boolean;
  socFileCorporate: File | null;
  setSocFileCorporate: (file: File | null) => void;
  handleSocUploadCorporate: () => void;
  socAppliedCorporate: boolean;
  socEffectiveFromCorporate: string;
  setSocEffectiveFromCorporate: (value: string) => void;
  socEffectiveToCorporate: string;
  setSocEffectiveToCorporate: (value: string) => void;
  setSocAppliedCorporate: (value: boolean) => void;
  discountUploadedCorporate: boolean;
  discountFileCorporate: File | null;
  setDiscountFileCorporate: (file: File | null) => void;
  handleDiscountUploadCorporate: () => void;
  discountTypeCorporate: string;
  selectedIcId: string;
  selectedCorporateId: string;
  discountAppliedToAllCorporate?: boolean;
  setDiscountAppliedToAllCorporate?: (value: boolean) => void;
};

function CorporateSocDiscountPanelHeader({ isCompact }: Readonly<{ isCompact: boolean }>) {
  return (
    <div className={isCompact ? "border-b border-gray-200 px-2.5 py-2" : undefined}>
      <div className="flex items-center gap-1.5">
        <DocumentArrowUpIcon className={isCompact ? "h-3.5 w-3.5 text-gray-600" : "h-4 w-4 text-gray-600"} />
        <h3 className={`${isCompact ? "text-xs" : "text-sm"} font-semibold text-gray-800`}>
          SOC &amp; discount document
        </h3>
      </div>
      <p className={`mt-0.5 ${isCompact ? "text-[10px]" : "text-[11px]"} text-gray-500`}>
        SOC and discount are enabled by default.
      </p>
      <div
        className={
          isCompact
            ? "mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1"
            : "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5"
        }
      >
        <span
          className={`inline-flex items-center rounded bg-blue-50 px-2 py-0.5 ${isCompact ? "text-[11px]" : "text-xs"} font-medium text-blue-700`}
        >
          Apply SOC
        </span>
        <span
          className={`inline-flex items-center rounded bg-blue-50 px-2 py-0.5 ${isCompact ? "text-[11px]" : "text-xs"} font-medium text-blue-700`}
        >
          Apply discount
        </span>
        <div className="ml-auto flex gap-1">
          <Button
            type="button"
            variant="outlined"
            className={isCompact ? "gap-0.5 px-2 py-0.5 text-[11px]" : "gap-1 px-2.5 py-1 text-xs"}
          >
            Cancel
          </Button>
          <Button
            type="button"
            color="primary"
            className={isCompact ? "gap-0.5 px-2 py-0.5 text-[11px]" : "gap-1 px-2.5 py-1 text-xs"}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CorporateSocDiscountDocumentPanel({
  variant,
  control,
  socUploadedCorporate,
  socFileCorporate,
  setSocFileCorporate,
  handleSocUploadCorporate,
  socAppliedCorporate,
  socEffectiveFromCorporate,
  setSocEffectiveFromCorporate,
  socEffectiveToCorporate,
  setSocEffectiveToCorporate,
  setSocAppliedCorporate,
  discountUploadedCorporate,
  discountFileCorporate,
  setDiscountFileCorporate,
  handleDiscountUploadCorporate,
  discountTypeCorporate,
  selectedIcId,
  selectedCorporateId,
  discountAppliedToAllCorporate,
  setDiscountAppliedToAllCorporate,
}: Readonly<CorporateSocDiscountDocumentPanelProps>) {
  const isCompact = variant === "compact";

  return (
    <div
      className={
        isCompact
          ? "flex flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm ring-1 ring-gray-200/50"
          : "flex flex-col rounded-xl border border-gray-200 bg-gray-50/50"
      }
    >
      <CorporateSocDiscountPanelHeader isCompact={isCompact} />

      <div className={isCompact ? "space-y-2 p-2" : "space-y-2 p-1.5"}>
        <div className={`rounded ${isCompact ? "border border-gray-200 bg-white p-2" : "rounded-lg border border-gray-200 bg-white p-2.5"}`}>
          <h4
            className={`${isCompact ? "mb-1.5 pb-1 text-[11px]" : "mb-2 pb-1.5 text-xs"} border-b border-gray-100 font-semibold text-gray-700`}
          >
            SOC
          </h4>
          <p className={`mt-1.5 ${isCompact ? "text-[10px]" : "text-[11px]"} font-medium text-gray-500`}>
            — or upload one SOC for all{isCompact ? "" : " providers"} —
          </p>
          <CorporateSocSection
            variant={variant}
            socUploadedCorporate={socUploadedCorporate}
            socFileCorporate={socFileCorporate}
            setSocFileCorporate={setSocFileCorporate}
            handleSocUploadCorporate={handleSocUploadCorporate}
            socAppliedCorporate={socAppliedCorporate}
            socEffectiveFromCorporate={socEffectiveFromCorporate}
            setSocEffectiveFromCorporate={setSocEffectiveFromCorporate}
            socEffectiveToCorporate={socEffectiveToCorporate}
            setSocEffectiveToCorporate={setSocEffectiveToCorporate}
            setSocAppliedCorporate={setSocAppliedCorporate}
          />
        </div>

        <div className={`rounded ${isCompact ? "border border-gray-200 bg-white p-2" : "rounded-lg border border-gray-200 bg-white p-2.5"}`}>
          <h4
            className={`${isCompact ? "mb-1.5 pb-1 text-[11px]" : "mb-2 pb-1.5 text-xs"} border-b border-gray-100 font-semibold text-gray-700`}
          >
            Discount
          </h4>
          <div className={`flex flex-col ${isCompact ? "gap-1.5" : "gap-2"}`}>
            <CorporateDiscountSection
              variant={variant}
              control={control}
              discountUploadedCorporate={discountUploadedCorporate}
              discountFileCorporate={discountFileCorporate}
              setDiscountFileCorporate={setDiscountFileCorporate}
              handleDiscountUploadCorporate={handleDiscountUploadCorporate}
              discountTypeCorporate={discountTypeCorporate}
              selectedIcId={selectedIcId}
              selectedCorporateId={selectedCorporateId}
              discountAppliedToAllCorporate={discountAppliedToAllCorporate}
              setDiscountAppliedToAllCorporate={setDiscountAppliedToAllCorporate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
