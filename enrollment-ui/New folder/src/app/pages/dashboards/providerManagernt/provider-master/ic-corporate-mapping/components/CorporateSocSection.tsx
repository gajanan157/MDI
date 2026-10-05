import { CloudArrowUpIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import { isEffectiveFromOnOrBeforeEffectiveTo } from "../../../shared/effectiveDateRange";

type CorporateSocSectionProps = {
  variant: "compact" | "standard";
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
};

type CorporateSocUploadFormProps = Pick<
  CorporateSocSectionProps,
  "variant" | "socFileCorporate" | "setSocFileCorporate" | "handleSocUploadCorporate"
>;

function CorporateSocUploadForm({
  variant,
  socFileCorporate,
  setSocFileCorporate,
  handleSocUploadCorporate,
}: Readonly<CorporateSocUploadFormProps>) {
  const isCompact = variant === "compact";

  return (
    <div
      className={
        isCompact
          ? "mt-1 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2"
          : "mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
      }
    >
      <label
        className={
          isCompact
            ? "flex min-h-[56px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded border-2 border-dashed border-gray-300 bg-gray-50/80 px-3 py-2 text-[10px] hover:border-primary-400 hover:bg-primary-50/30"
            : "flex min-h-[70px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/80 px-4 py-3 transition-all hover:border-primary-400 hover:bg-primary-50/30"
        }
      >
        <CloudArrowUpIcon className={isCompact ? "h-5 w-5 text-gray-400" : "h-6 w-6 text-gray-400"} />
        <span className={isCompact ? undefined : "text-[11px] font-medium text-gray-700"}>
          {isCompact ? "Drag file or click" : "Drag file here or click"}
        </span>
        {!isCompact ? (
          <span className="text-[11px] text-gray-500">.pdf, .doc, .docx (max 10MB)</span>
        ) : null}
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(event) => setSocFileCorporate(event.target.files?.[0] ?? null)}
        />
      </label>
      <div className={isCompact ? "flex flex-col gap-0.5" : "flex flex-col gap-1 sm:justify-center"}>
        {socFileCorporate ? (
          <p className={`truncate ${isCompact ? "text-[10px]" : "text-[11px]"} text-gray-600`}>
            {socFileCorporate.name}
          </p>
        ) : null}
        <Button
          type="button"
          color="primary"
          disabled={!socFileCorporate}
          onClick={handleSocUploadCorporate}
          className={
            isCompact ? "gap-1 px-1.5 py-0.5 text-[11px]" : "shrink-0 gap-1.5 px-2 py-1 text-xs"
          }
        >
          <CloudArrowUpIcon className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"} /> Upload SOC
        </Button>
      </div>
    </div>
  );
}

type CorporateSocPostUploadFormProps = Pick<
  CorporateSocSectionProps,
  | "variant"
  | "socAppliedCorporate"
  | "socEffectiveFromCorporate"
  | "setSocEffectiveFromCorporate"
  | "socEffectiveToCorporate"
  | "setSocEffectiveToCorporate"
  | "setSocAppliedCorporate"
>;

function CorporateSocEffectiveDatesForm({
  isCompact,
  socEffectiveFromCorporate,
  setSocEffectiveFromCorporate,
  socEffectiveToCorporate,
  setSocEffectiveToCorporate,
  effectiveFromMax,
  effectiveToMin,
  canApplySoc,
  onApply,
}: Readonly<{
  isCompact: boolean;
  socEffectiveFromCorporate: string;
  setSocEffectiveFromCorporate: (value: string) => void;
  socEffectiveToCorporate: string;
  setSocEffectiveToCorporate: (value: string) => void;
  effectiveFromMax?: string;
  effectiveToMin?: string;
  canApplySoc: boolean;
  onApply: () => void;
}>) {
  return (
    <div
      className={
        isCompact
          ? "flex flex-col gap-1.5 rounded border border-blue-100 bg-blue-50/40 px-2 py-1.5"
          : "flex flex-col gap-2 rounded border border-blue-100 bg-blue-50/40 px-2.5 py-2"
      }
    >
      <div className={isCompact ? "grid gap-1.5 sm:grid-cols-2" : "grid gap-2 sm:grid-cols-2"}>
        <ProviderDatePicker
          label="Effective from"
          isRequired
          value={socEffectiveFromCorporate}
          max={effectiveFromMax}
          onChange={(event) => setSocEffectiveFromCorporate(event.target.value)}
          className={
            isCompact
              ? "mt-0.5 w-full text-[11px]"
              : "text-xs"
          }
        />
        <ProviderDatePicker
          label={isCompact ? "Effective to" : "Effective to (optional)"}
          value={socEffectiveToCorporate}
          min={effectiveToMin}
          onChange={(event) => setSocEffectiveToCorporate(event.target.value)}
          className={
            isCompact
              ? "mt-0.5 w-full text-[11px]"
              : "text-xs"
          }
        />
      </div>
      {isCompact ? (
        <div className="flex justify-end">
          <Button
            type="button"
            color="primary"
            className="gap-1 px-1.5 py-0.5 text-[11px]"
            disabled={!canApplySoc}
            onClick={onApply}
          >
            Apply SOC to all
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function CorporateSocPostUploadForm({
  variant,
  socAppliedCorporate,
  socEffectiveFromCorporate,
  setSocEffectiveFromCorporate,
  socEffectiveToCorporate,
  setSocEffectiveToCorporate,
  setSocAppliedCorporate,
}: Readonly<CorporateSocPostUploadFormProps>) {
  const isCompact = variant === "compact";
  const effectiveFromMax = socEffectiveToCorporate?.trim()
    ? socEffectiveToCorporate.trim().slice(0, 10)
    : undefined;
  const effectiveToMin = socEffectiveFromCorporate?.trim()
    ? socEffectiveFromCorporate.trim().slice(0, 10)
    : undefined;
  const canApplySoc =
    Boolean(socEffectiveFromCorporate) &&
    isEffectiveFromOnOrBeforeEffectiveTo(socEffectiveFromCorporate, socEffectiveToCorporate);

  return (
    <div className={isCompact ? "mt-1.5 flex flex-col gap-1.5" : "mt-2 flex flex-col gap-2"}>
      <div
        className={
          isCompact
            ? "flex items-center gap-1.5 rounded border border-green-200 bg-green-50/80 px-2 py-1.5"
            : "flex items-center gap-2 rounded border border-green-200 bg-green-50/80 px-2.5 py-2"
        }
      >
        <CheckCircleIcon
          className={isCompact ? "h-3.5 w-3.5 text-green-600" : "h-4 w-4 shrink-0 text-green-600"}
        />
        <p className={`${isCompact ? "text-[11px]" : "text-xs"} font-semibold text-green-800`}>
          SOC upload successfully.
        </p>
      </div>
      {!socAppliedCorporate ? (
        <CorporateSocEffectiveDatesForm
          isCompact={isCompact}
          socEffectiveFromCorporate={socEffectiveFromCorporate}
          setSocEffectiveFromCorporate={setSocEffectiveFromCorporate}
          socEffectiveToCorporate={socEffectiveToCorporate}
          setSocEffectiveToCorporate={setSocEffectiveToCorporate}
          effectiveFromMax={effectiveFromMax}
          effectiveToMin={effectiveToMin}
          canApplySoc={canApplySoc}
          onApply={() => setSocAppliedCorporate(true)}
        />
      ) : (
        <div
          className={
            isCompact
              ? "flex items-center gap-1.5 rounded border border-green-200 bg-green-50/80 px-2 py-1.5"
              : "flex items-center gap-2 rounded border border-green-200 bg-green-50/80 px-2.5 py-2"
          }
        >
          <CheckCircleIcon
            className={isCompact ? "h-3.5 w-3.5 text-green-600" : "h-4 w-4 shrink-0 text-green-600"}
          />
          <p className={`${isCompact ? "text-[11px]" : "text-xs"} font-semibold text-green-800`}>
            SOC applied to all.
          </p>
        </div>
      )}
    </div>
  );
}

export function CorporateSocSection(props: CorporateSocSectionProps) {
  if (!props.socUploadedCorporate) {
    return <CorporateSocUploadForm {...props} />;
  }
  return <CorporateSocPostUploadForm {...props} />;
}
