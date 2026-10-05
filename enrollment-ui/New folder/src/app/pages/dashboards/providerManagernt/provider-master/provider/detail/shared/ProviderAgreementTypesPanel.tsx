import { Fragment, useId } from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import {
  AGREEMENT_TYPE_CHIP_VISIBLE_LIMIT,
  formatAgreementTypeLabel,
  resolveAgreementTypeChipTone,
} from "./agreementTypeChip.helpers";

type ProviderAgreementTypesPanelProps = {
  agreementTypes: string[];
};

function AgreementTypeChip({ label }: Readonly<{ label: string }>) {
  const display = formatAgreementTypeLabel(label);
  const tone = resolveAgreementTypeChipTone(label);

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium ${tone.wrapper}`}
      title={display}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
      <span className="min-w-0 truncate">{display}</span>
    </span>
  );
}

export function ProviderAgreementTypesPanel({
  agreementTypes,
}: Readonly<ProviderAgreementTypesPanelProps>) {
  const { t } = useTranslation();
  const panelId = useId();

  const uniqueTypes = agreementTypes
    .map((label) => label.trim())
    .filter(Boolean)
    .filter((label, index, list) => list.indexOf(label) === index);

  const visibleTypes = uniqueTypes.slice(0, AGREEMENT_TYPE_CHIP_VISIBLE_LIMIT);
  const hiddenTypes = uniqueTypes.slice(AGREEMENT_TYPE_CHIP_VISIBLE_LIMIT);
  const hiddenCount = hiddenTypes.length;

  return (
    <section
      aria-labelledby={panelId}
      data-testid="provider-agreement-types-panel"
      className="border-t border-slate-200 bg-slate-50/80 px-3 py-1.5"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex shrink-0 items-center gap-1">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-600 text-white">
            <DocumentTextIcon className="h-3 w-3" aria-hidden />
          </span>
          <h2
            id={panelId}
            className="text-[10px] font-semibold uppercase tracking-wider text-slate-500"
          >
            {t("providerMaster.agreement.agreementTypesTitle")}
          </h2>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {uniqueTypes.length === 0 ? (
            <span className="text-[11px] text-slate-500">
              {t("providerMaster.agreement.noAgreementTypes")}
            </span>
          ) : (
            <>
              {visibleTypes.map((label) => (
                <AgreementTypeChip key={label} label={label} />
              ))}

              {hiddenCount > 0 ? (
                <Popover className="relative">
                  <PopoverButton
                    type="button"
                    className="inline-flex items-center rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-500"
                    aria-label={t("providerMaster.agreement.moreAgreementTypesAria", {
                      count: hiddenCount,
                    })}
                  >
                    {t("providerMaster.agreement.moreAgreementTypes", { count: hiddenCount })}
                  </PopoverButton>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-150"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <PopoverPanel className="absolute left-0 z-20 mt-1 w-[min(100vw-2rem,18rem)] rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                      <div className="flex flex-wrap gap-1.5">
                        {hiddenTypes.map((label) => (
                          <AgreementTypeChip key={label} label={label} />
                        ))}
                      </div>
                    </PopoverPanel>
                  </Transition>
                </Popover>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
