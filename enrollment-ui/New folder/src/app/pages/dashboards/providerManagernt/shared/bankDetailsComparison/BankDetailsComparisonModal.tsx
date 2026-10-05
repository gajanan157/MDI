import { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import {
  BuildingLibraryIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  IdentificationIcon,
  InformationCircleIcon,
  MapPinIcon,
  PencilSquareIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { PROVIDER_FORM_BUTTON_CLASS } from "../providerButtonStyles";
import type { BankComparisonFilter, BankComparisonRow, BankComparisonStatus } from "./types";
import {
  countBankComparisonMatches,
  countBankComparisonMismatches,
  getBankComparisonStatus,
} from "./utils";

export type BankDetailsComparisonModalProps = {
  open: boolean;
  onClose: () => void;
  rows: BankComparisonRow[];
  loading?: boolean;
  subtitle?: string;
  providerColumnLabel?: string;
  insurerColumnLabel?: string;
  mobileInsurerColumnLabel?: string;
  onRequestUpdate?: () => void;
};

const FIELD_ICONS: Record<string, typeof UserIcon> = {
  accountHolderName: UserIcon,
  accountNumber: CreditCardIcon,
  ifscCode: BuildingLibraryIcon,
  accountType: DocumentTextIcon,
  bankName: BuildingLibraryIcon,
  branch: MapPinIcon,
  pan: IdentificationIcon,
};

function ComparisonStatusBadge({
  status,
  t,
}: Readonly<{ status: BankComparisonStatus; t: (key: string) => string }>) {
  if (status === "notApplicable") {
    return (
      <span className="inline-flex min-w-[52px] items-center justify-center gap-0.5 rounded-full border border-slate-200 bg-slate-50 px-1 py-0.5 text-[8px] font-medium text-slate-600 sm:min-w-0 sm:gap-1 sm:px-2 sm:text-[10px]">
        <InformationCircleIcon className="size-3 sm:size-3.5" aria-hidden />
        {t("providerMaster.bankDetailsComparison.statusNotApplicable")}
      </span>
    );
  }

  if (status === "match") {
    return (
      <span className="inline-flex min-w-[52px] items-center justify-center gap-0.5 rounded-full border border-emerald-200 bg-emerald-50 px-1 py-0.5 text-[8px] font-medium text-emerald-700 sm:min-w-0 sm:gap-1 sm:px-2 sm:text-[10px]">
        <CheckCircleIcon className="size-3 sm:size-3.5" aria-hidden />
        {t("providerMaster.bankDetailsComparison.statusMatch")}
      </span>
    );
  }

  return (
    <span className="inline-flex min-w-[52px] items-center justify-center gap-0.5 rounded-full border border-red-200 bg-red-50 px-1 py-0.5 text-[8px] font-medium text-red-700 sm:min-w-0 sm:gap-1 sm:px-2 sm:text-[10px]">
      <XCircleIcon className="size-3 sm:size-3.5" aria-hidden />
      {t("providerMaster.bankDetailsComparison.statusMismatch")}
    </span>
  );
}

function rowToneClass(status: BankComparisonStatus): string {
  if (status === "mismatch") return "border-red-100 bg-red-50/60";
  if (status === "notApplicable") return "border-slate-100 bg-slate-50/50";
  return "border-emerald-100 bg-emerald-50/30";
}

function rowTableToneClass(status: BankComparisonStatus): string {
  if (status === "mismatch") return "bg-red-50/40";
  if (status === "notApplicable") return "bg-slate-50/40";
  return "bg-white";
}

function FilterChip({
  label,
  active,
  onClick,
  activeClassName,
  idleClassName,
}: Readonly<{
  label: string;
  active: boolean;
  onClick: () => void;
  activeClassName: string;
  idleClassName: string;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
        active ? activeClassName : idleClassName,
      )}
    >
      {label}
    </button>
  );
}

function MobileComparisonGuidance({
  show,
  onRequestUpdate,
}: Readonly<{ show: boolean; onRequestUpdate?: () => void }>) {
  if (!show) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/50 p-2.5">
      <InformationCircleIcon
        className="mt-0.5 size-4 shrink-0 text-blue-600"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-slate-800">How to proceed?</p>
        <p className="mt-0.5 text-[9px] leading-relaxed text-slate-500">
          Please review the mismatched details. You can request an update or proceed
          if everything looks correct.
        </p>
      </div>
      {onRequestUpdate ? (
        <button
          type="button"
          onClick={onRequestUpdate}
          className="inline-flex shrink-0 items-center gap-1 rounded border border-blue-200 bg-white px-2 py-1.5 text-[9px] font-semibold text-blue-600 hover:bg-blue-50"
        >
          <PencilSquareIcon className="size-3" aria-hidden />
          Request Update
        </button>
      ) : null}
    </div>
  );
}

export function BankDetailsComparisonModal({
  open,
  onClose,
  rows,
  loading = false,
  subtitle,
  providerColumnLabel,
  insurerColumnLabel,
  mobileInsurerColumnLabel,
  onRequestUpdate,
}: Readonly<BankDetailsComparisonModalProps>) {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<BankComparisonFilter>("all");

  useEffect(() => {
    if (open) setActiveFilter("all");
  }, [open]);

  const mismatchCount = countBankComparisonMismatches(rows);
  const matchCount = countBankComparisonMatches(rows);

  const filteredRows = useMemo(() => {
    if (activeFilter === "matched") {
      return rows.filter((row) => getBankComparisonStatus(row) === "match");
    }
    if (activeFilter === "mismatched") {
      return rows.filter((row) => getBankComparisonStatus(row) === "mismatch");
    }
    return rows;
  }, [activeFilter, rows]);

  const providerLabel =
    providerColumnLabel ?? t("providerMaster.bankDetailsComparison.providerColumnDefault");
  const insurerLabel =
    insurerColumnLabel ?? t("providerMaster.bankDetailsComparison.insurerColumnDefault");
  const mobileInsurerLabel = mobileInsurerColumnLabel ?? insurerLabel;

  const hasMismatches = mismatchCount > 0;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="mx-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5 sm:max-h-[calc(100dvh-2rem)]">
              <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 sm:size-10">
                    <BuildingLibraryIcon className="size-5 text-blue-600" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900">
                      {t("providerMaster.bankDetailsComparison.title")}
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {subtitle ??
                        t("providerMaster.bankDetailsComparison.subtitle")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                  onClick={onClose}
                  aria-label={t("providerMaster.toolbar.close")}
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>

              {!loading && rows.length > 0 ? (
                <div
                  className={clsx(
                    "flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4",
                    hasMismatches
                      ? "border-red-100 bg-red-50/70"
                      : "border-emerald-100 bg-emerald-50/70",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {hasMismatches ? (
                      <ExclamationTriangleIcon className="size-4 shrink-0 text-red-600" />
                    ) : (
                      <CheckCircleIcon className="size-4 shrink-0 text-emerald-600" />
                    )}
                    <p
                      className={clsx(
                        "text-xs font-medium",
                        hasMismatches ? "text-red-700" : "text-emerald-700",
                      )}
                    >
                      {hasMismatches
                        ? t("providerMaster.bankDetailsComparison.summaryMismatch", {
                            count: mismatchCount,
                          })
                        : t("providerMaster.bankDetailsComparison.allMatched")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FilterChip
                      label={t("providerMaster.bankDetailsComparison.all")}
                      active={activeFilter === "all"}
                      onClick={() => setActiveFilter("all")}
                      activeClassName="border-blue-300 bg-blue-50 text-blue-800"
                      idleClassName="border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    />
                    <FilterChip
                      label={`${matchCount} ${t("providerMaster.bankDetailsComparison.matched")}`}
                      active={activeFilter === "matched"}
                      onClick={() => setActiveFilter("matched")}
                      activeClassName="border-emerald-300 bg-emerald-50 text-emerald-800"
                      idleClassName="border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                    />
                    <FilterChip
                      label={`${mismatchCount} ${t("providerMaster.bankDetailsComparison.mismatched")}`}
                      active={activeFilter === "mismatched"}
                      onClick={() => setActiveFilter("mismatched")}
                      activeClassName="border-red-300 bg-red-50 text-red-800"
                      idleClassName="border-red-200 bg-white text-red-700 hover:bg-red-50"
                    />
                  </div>
                </div>
              ) : null}

              <div className="min-h-0 flex-1 overflow-auto px-3 py-2.5 sm:max-h-[58vh] sm:px-4 sm:py-3">
                {loading ? (
                  <p className="text-sm text-gray-500">
                    {t("providerMaster.icMapping.formToolbar.loading")}
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 md:hidden">
                      <div className="grid grid-cols-[68px_minmax(0,1fr)_14px_minmax(0,1fr)_auto_12px] items-end gap-1 px-2 text-[8px] font-semibold uppercase leading-tight text-slate-500">
                        <span>
                          {t("providerMaster.bankDetailsComparison.columns.field")}
                        </span>
                        <span>{providerLabel}</span>
                        <span aria-hidden />
                        <span>{mobileInsurerLabel}</span>
                        <span className="text-center">
                          {t("providerMaster.bankDetailsComparison.columns.status")}
                        </span>
                        <span aria-hidden />
                      </div>
                      {filteredRows.map((row) => {
                        const FieldIcon = FIELD_ICONS[row.fieldKey] ?? DocumentTextIcon;
                        const status = getBankComparisonStatus(row);
                        return (
                          <article
                            key={row.fieldKey}
                            className={clsx(
                              "grid min-h-12 grid-cols-[68px_minmax(0,1fr)_14px_minmax(0,1fr)_auto_12px] items-center gap-1 rounded-lg border px-2 py-2",
                              rowToneClass(status),
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-violet-50">
                                <FieldIcon
                                  className="size-3.5 text-violet-600"
                                  aria-hidden
                                />
                              </span>
                              <span className="break-words text-[9px] font-semibold leading-tight text-slate-700">
                                {row.field}
                              </span>
                            </div>
                            <span className="min-w-0 break-words text-[9px] leading-tight text-slate-700">
                              {row.provider || "—"}
                            </span>
                            <ArrowsRightLeftIcon
                              className="size-3.5 text-slate-400"
                              aria-hidden
                            />
                            <span
                              className={clsx(
                                "min-w-0 break-words text-[9px] leading-tight",
                                status === "mismatch"
                                  ? "font-semibold text-red-600"
                                  : "text-slate-700",
                              )}
                            >
                              {row.insurer || "—"}
                            </span>
                            <ComparisonStatusBadge status={status} t={t} />
                            <ChevronDownIcon
                              className="size-3 text-slate-500"
                              aria-hidden
                            />
                          </article>
                        );
                      })}

                      <MobileComparisonGuidance
                        show={hasMismatches}
                        onRequestUpdate={onRequestUpdate}
                      />
                    </div>

                    <table className="hidden min-w-full border-collapse overflow-hidden rounded-lg border border-gray-200 text-xs md:table">
                      <thead>
                        <tr className="bg-indigo-50/80 text-left text-gray-700">
                          <th className="px-3 py-2 font-semibold">
                            {t("providerMaster.bankDetailsComparison.columns.field")}
                          </th>
                          <th className="px-3 py-2 font-semibold">{providerLabel}</th>
                          <th className="px-3 py-2 font-semibold">{insurerLabel}</th>
                          <th className="px-3 py-2 text-center font-semibold">
                            {t("providerMaster.bankDetailsComparison.columns.status")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row) => {
                          const FieldIcon = FIELD_ICONS[row.fieldKey] ?? DocumentTextIcon;
                          const status = getBankComparisonStatus(row);
                          return (
                            <tr
                              key={row.fieldKey}
                              className={clsx(
                                "border-t border-gray-100",
                                rowTableToneClass(status),
                              )}
                            >
                              <td className="px-3 py-2.5 font-medium text-gray-800">
                                <span className="inline-flex items-center gap-1.5">
                                  <FieldIcon
                                    className="size-3.5 text-gray-500"
                                    aria-hidden
                                  />
                                  {row.field}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-gray-700">
                                {row.provider || "—"}
                              </td>
                              <td
                                className={clsx(
                                  "px-3 py-2.5",
                                  status === "mismatch"
                                    ? "font-medium text-red-700"
                                    : "text-gray-700",
                                )}
                              >
                                {row.insurer || "—"}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <ComparisonStatusBadge status={status} t={t} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="flex items-center gap-4 md:hidden">
                  <span className="inline-flex items-center gap-1 text-[9px] text-slate-600">
                    <CheckCircleIcon className="size-3.5 text-emerald-600" />
                    {t("providerMaster.bankDetailsComparison.statusMatch")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] text-slate-600">
                    <XCircleIcon className="size-3.5 text-red-600" />
                    {t("providerMaster.bankDetailsComparison.statusMismatch")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] text-slate-600">
                    <InformationCircleIcon className="size-3.5 text-slate-500" />
                    {t("providerMaster.bankDetailsComparison.statusNotApplicable")}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outlined"
                  className={PROVIDER_FORM_BUTTON_CLASS}
                  onClick={onClose}
                >
                  {t("providerMaster.toolbar.close")}
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
