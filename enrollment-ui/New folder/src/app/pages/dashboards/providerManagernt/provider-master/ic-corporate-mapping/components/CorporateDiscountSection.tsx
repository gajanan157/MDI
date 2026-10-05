import { CloudArrowUpIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { IcCorporateDiscountFormBlock } from "./DiscountFormBlock";
import { DISCOUNT_TYPE_OPTIONS } from "../discountOptions";

type CorporateDiscountSectionProps = {
  variant: "compact" | "standard";
  control: unknown;
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

type CorporateDiscountUploadFormProps = Pick<
  CorporateDiscountSectionProps,
  | "variant"
  | "discountFileCorporate"
  | "setDiscountFileCorporate"
  | "handleDiscountUploadCorporate"
>;

function CorporateDiscountUploadForm({
  variant,
  discountFileCorporate,
  setDiscountFileCorporate,
  handleDiscountUploadCorporate,
}: Readonly<CorporateDiscountUploadFormProps>) {
  const isCompact = variant === "compact";

  return (
    <div
      className={
        isCompact
          ? "flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2"
          : "flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
      }
    >
      <label
        className={
          isCompact
            ? "flex min-h-[50px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded border-2 border-dashed border-gray-300 bg-gray-50/80 px-3 py-2 text-[10px] hover:border-primary-400 hover:bg-primary-50/30"
            : "flex min-h-[110px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/80 px-6 py-5 transition-all hover:border-primary-400 hover:bg-primary-50/30 hover:shadow-inner"
        }
      >
        <CloudArrowUpIcon className={isCompact ? "h-5 w-5 text-gray-400" : "h-10 w-10 text-gray-400"} />
        <span className={isCompact ? undefined : "text-sm font-medium text-gray-700"}>
          {isCompact ? "Upload discount" : "Upload discount document"}
        </span>
        {!isCompact ? <span className="text-xs text-gray-500">.pdf, .doc, .docx (max 10MB)</span> : null}
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(event) => setDiscountFileCorporate(event.target.files?.[0] ?? null)}
        />
      </label>
      {isCompact ? (
        <Button
          type="button"
          color="primary"
          disabled={!discountFileCorporate}
          onClick={handleDiscountUploadCorporate}
          className="gap-1 px-1.5 py-0.5 text-[11px]"
        >
          <CloudArrowUpIcon className="h-3.5 w-3.5" /> Upload
        </Button>
      ) : (
        <div className="flex flex-col gap-3 sm:justify-center">
          {discountFileCorporate ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="truncate text-xs font-medium text-gray-800" title={discountFileCorporate.name}>
                {discountFileCorporate.name}
              </p>
              <p className="text-xs text-gray-500">{(discountFileCorporate.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : null}
          <Button
            type="button"
            color="primary"
            disabled={!discountFileCorporate}
            onClick={handleDiscountUploadCorporate}
            className="shrink-0 gap-2"
          >
            <CloudArrowUpIcon className="h-5 w-5" /> Upload
          </Button>
        </div>
      )}
    </div>
  );
}

type CorporateDiscountAppliedFormProps = Pick<
  CorporateDiscountSectionProps,
  | "variant"
  | "control"
  | "discountFileCorporate"
  | "discountTypeCorporate"
  | "selectedIcId"
  | "selectedCorporateId"
  | "discountAppliedToAllCorporate"
  | "setDiscountAppliedToAllCorporate"
>;

function CorporateDiscountAppliedForm({
  variant,
  control,
  discountFileCorporate,
  discountTypeCorporate,
  selectedIcId,
  selectedCorporateId,
  discountAppliedToAllCorporate,
  setDiscountAppliedToAllCorporate,
}: Readonly<CorporateDiscountAppliedFormProps>) {
  const isCompact = variant === "compact";

  return (
    <>
      <div
        className={
          isCompact
            ? "flex items-start gap-1.5 rounded border border-green-200 bg-green-50/80 px-2 py-1.5"
            : "flex items-start gap-2 rounded-lg border border-green-200 bg-green-50/80 px-2 py-1.5"
        }
      >
        <CheckCircleIcon
          className={`${isCompact ? "h-3.5 w-3.5 mt-0.5" : "h-5 w-5 mt-0.5"} shrink-0 text-green-600`}
        />
        <div className="min-w-0 flex-1">
          <p className={`${isCompact ? "text-[11px]" : "text-sm"} font-semibold text-green-800`}>
            Discount upload successful.
          </p>
          {discountFileCorporate ? (
            <p
              className={`mt-0.5 break-words ${isCompact ? "text-[10px]" : "text-xs"} text-green-700/90`}
              title={discountFileCorporate.name}
            >
              {discountFileCorporate.name}
            </p>
          ) : null}
        </div>
      </div>
      <div className={isCompact ? "mt-1.5" : "flex flex-col gap-1.5"}>
        <DropdownSelect
          name="discountTypeCorporate"
          control={control}
          options={DISCOUNT_TYPE_OPTIONS}
          label="Discount type"
        />
      </div>
      {discountTypeCorporate ? (
        <IcCorporateDiscountFormBlock
          key={`corp-discount-${variant}-${selectedIcId}-${selectedCorporateId}`}
          discountType={discountTypeCorporate}
          compact={isCompact}
          showApplyToAll={!isCompact}
          discountAppliedToAll={discountAppliedToAllCorporate}
          onApplyToAll={
            setDiscountAppliedToAllCorporate
              ? () => setDiscountAppliedToAllCorporate(true)
              : undefined
          }
        />
      ) : null}
    </>
  );
}

export function CorporateDiscountSection(props: CorporateDiscountSectionProps) {
  if (!props.discountUploadedCorporate) {
    return <CorporateDiscountUploadForm {...props} />;
  }
  return <CorporateDiscountAppliedForm {...props} />;
}
