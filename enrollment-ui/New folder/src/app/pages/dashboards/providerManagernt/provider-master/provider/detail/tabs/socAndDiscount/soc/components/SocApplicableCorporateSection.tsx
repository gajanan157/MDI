import { BuildingOffice2Icon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { SocCorporateSelection } from "../utils/socAgreementCorporateRules";

type SocApplicableCorporateSectionProps = {
  corporates: SocCorporateSelection[];
  className?: string;
};

export function SocApplicableCorporateSection({
  corporates,
  className = "",
}: Readonly<SocApplicableCorporateSectionProps>) {
  const { t } = useTranslation();
  const C = "providerMaster.soc.applicableCorporate";

  return (
    <div className={`flex min-w-0 flex-col ${className}`.trim()}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm">
        <div className="flex shrink-0 items-center gap-1.5 border-b border-slate-200/80 px-2 py-1">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <BuildingOffice2Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
          <h3 className="truncate text-[11px] font-semibold text-slate-900">
            {t(`${C}.title`)}
          </h3>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-2 py-1.5">
          {corporates.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-2 py-3 text-center">
              <ClipboardDocumentListIcon className="mb-0.5 h-5 w-5 text-slate-300" aria-hidden />
              <p className="text-[11px] font-medium text-slate-600">
                {t(`${C}.noCorporatesYet`)}
              </p>
            </div>
          ) : (
            <ul className="min-h-0 flex-1 space-y-1 overflow-auto">
              {corporates.map((corporate) => (
                <li
                  key={corporate.id}
                  className="rounded-md border border-slate-100 bg-slate-50/80 px-2 py-1 text-[11px] text-slate-800"
                >
                  {corporate.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
