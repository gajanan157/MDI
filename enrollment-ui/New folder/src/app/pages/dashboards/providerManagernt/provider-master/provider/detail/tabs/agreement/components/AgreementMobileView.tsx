import { useEffect, useMemo, useState } from "react";
import { EyeIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import Pagination from "@/components/shared/Pagination";
import { formatProviderDateTimeDisplay } from "../../../../../../shared/dateFormat";
import { formatUnderscoredLabel } from "../../../../../../shared/dashboard";
import {
  getAgreementColumnLabel,
} from "../../../../../../shared/providerMasterI18n";
import { formatAgreementNameForDisplay } from "../../../shared/agreementTypeChip.helpers";
import type { AgreementListRow } from "../utils/agreementHelpers";

type AgreementMobileViewProps = {
  rows: AgreementListRow[];
  onView: (id: string) => void;
  onOpenSocDiscount: (row: AgreementListRow) => void;
  onAddDiscount: (row: AgreementListRow) => void;
  pageSizeOptions: number[];
  defaultPageSize: number;
};

function getStatusTone(status: string) {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "terminated") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

function getSocDiscountTone(status: string | undefined | null) {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "complete" || normalized === "completed") {
    return "text-green-600";
  }
  return "text-amber-600";
}

function formatSocDiscountLabel(
  status: string | undefined | null,
  t: (key: string) => string,
) {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "complete" || normalized === "completed") {
    return t("providerMaster.agreement.socDiscountComplete");
  }
  return t("providerMaster.agreement.socDiscountPending");
}

function AgreementStatusBadge({ status }: Readonly<{ status: string }>) {
  const normalized = status.trim().toLowerCase();
  const tone = getStatusTone(normalized);

  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status || "—"}
    </span>
  );
}

function MobileField({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-slate-100 py-1 last:border-0">
      <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-right text-xs text-slate-800">
        {children}
      </dd>
    </div>
  );
}

export function AgreementMobileView({
  rows,
  onView,
  onOpenSocDiscount,
  onAddDiscount,
  pageSizeOptions,
  defaultPageSize,
}: Readonly<AgreementMobileViewProps>) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visibleRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [page, pageSize, rows]);

  const label = (key: Parameters<typeof getAgreementColumnLabel>[0]) =>
    getAgreementColumnLabel(key, t);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain py-1 [-webkit-overflow-scrolling:touch]">
        {visibleRows.map((row) => (
          <article
            key={row.id}
            className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
          >
            <dl>
              <MobileField label={label("agreementName")}>
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:underline"
                  onClick={() => onView(row.id)}
                >
                  {formatAgreementNameForDisplay(row.agreementName)}
                </button>
              </MobileField>
              <MobileField label={label("type")}>{row.type || "—"}</MobileField>
              <MobileField label={label("scope")}>
                {formatUnderscoredLabel(row.scope) || "—"}
              </MobileField>
              <MobileField label={label("effectiveFromDisplay")}>
                {formatProviderDateTimeDisplay(row.effectiveFromDisplay) || "—"}
              </MobileField>
              <MobileField label={label("status")}>
                <AgreementStatusBadge status={row.status} />
              </MobileField>
              <MobileField label={label("socDiscountStatus")}>
                <button
                  type="button"
                  className={`font-semibold capitalize underline-offset-2 hover:underline ${getSocDiscountTone(row.socDiscountStatus)}`}
                  onClick={() => onOpenSocDiscount(row)}
                >
                  {formatSocDiscountLabel(row.socDiscountStatus, t)}
                </button>
              </MobileField>
              <MobileField label={label("discount")}>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                  title={t("providerMaster.agreement.addDiscount")}
                  aria-label={t("providerMaster.agreement.addDiscount")}
                  onClick={() => onAddDiscount(row)}
                >
                  <PlusIcon className="h-4 w-4" aria-hidden />
                </button>
              </MobileField>
            </dl>
            <div className="mt-1 border-t border-slate-100 pt-1">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                onClick={() => onView(row.id)}
              >
                <EyeIcon className="h-4 w-4" aria-hidden />
                {t("providerMaster.button.view")}
              </button>
            </div>
          </article>
        ))}
      </div>
      <Pagination
        className="shrink-0"
        page={page}
        pageSize={pageSize}
        totalItems={rows.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}
