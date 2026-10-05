import {
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "@/components/shared/Pagination";
import {
  createIcMappingGridLabels,
} from "../../../../../../shared/providerMasterI18n";
import {
  IcMappingAgreementCell,
  IcMappingBankMatchCell,
  IcMappingBoolCell,
  IcMappingNetworkStatusCell,
} from "./mappingGridCells";
import {
  getRestrictionActionLabel,
  hasProviderRestriction,
} from "../restriction/utils";
import type { ItemWithIdName } from "../types";

type MappingMobileViewProps = {
  mappingSubTab: "ic" | "corporate";
  rows: ItemWithIdName[];
  canWrite: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onView: (item: ItemWithIdName) => void;
  onRestrictionAction: (item: ItemWithIdName) => void;
  onUnmap: (item: ItemWithIdName) => void;
  onOpenPendingAgreement: (item: ItemWithIdName) => void;
  onCompareBankMatch: (item: ItemWithIdName) => void;
};

function MobileField({
  label,
  value,
}: Readonly<{ label: string; value?: ReactNode }>) {
  const displayValue =
    value == null || (typeof value === "string" && !value.trim()) ? "—" : value;

  return (
    <div className="flex items-start justify-between gap-2 border-b border-slate-100 py-1 last:border-0">
      <dt className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-right text-[11px] text-slate-800">
        {displayValue}
      </dd>
    </div>
  );
}

const ACTION_BUTTON_CLASS =
  "inline-flex h-7 items-center justify-center gap-1 rounded-md border px-2 text-[10px] font-medium";

export function MappingMobileView({
  mappingSubTab,
  rows,
  canWrite,
  page,
  pageSize,
  totalItems,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  onView,
  onRestrictionAction,
  onUnmap,
  onOpenPendingAgreement,
  onCompareBankMatch,
}: Readonly<MappingMobileViewProps>) {
  const { t } = useTranslation();
  const labels = useMemo(() => createIcMappingGridLabels(t), [t]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto py-1">
        {rows.map((item) => {
          const hasRestriction = hasProviderRestriction(item);
          const RestrictionIcon = hasRestriction ? LockClosedIcon : LockOpenIcon;

          return (
            <article
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
            >
              <dl>
                <MobileField
                  label={
                    mappingSubTab === "ic"
                      ? labels.insuranceCompany
                      : labels.corporateName
                  }
                  value={item.name}
                />
                {mappingSubTab === "corporate" ? (
                  <MobileField
                    label={labels.insuranceCompany}
                    value={item.insuranceCompanyName}
                  />
                ) : null}
                <MobileField label={labels.icProviderCode} value={item.icProviderCode} />
                <MobileField label={labels.networkSource} value={item.networkSource} />
                <MobileField label={labels.networkMode} value={item.networkMode} />
                <MobileField label={labels.tariffType} value={item.tariffType} />
                <MobileField
                  label={labels.status}
                  value={
                    <IcMappingNetworkStatusCell
                      providerNetworkIsActive={item.providerNetworkIsActive}
                      cashless={item.cashless}
                      reimbursement={item.reimbursement}
                      labels={labels}
                    />
                  }
                />
                <MobileField
                  label={labels.cashlessStatus}
                  value={
                    <IcMappingBoolCell value={Boolean(item.cashless)} labels={labels} />
                  }
                />
                <MobileField
                  label={labels.reimbursement}
                  value={
                    <IcMappingBoolCell
                      value={Boolean(item.reimbursement)}
                      labels={labels}
                    />
                  }
                />
                <MobileField
                  label={labels.agreementStatus}
                  value={
                    <IcMappingAgreementCell
                      data={item}
                      labels={labels}
                      onOpenPendingAgreement={onOpenPendingAgreement}
                    />
                  }
                />
                <MobileField
                  label={labels.bankMatch}
                  value={
                    <IcMappingBankMatchCell
                      data={item}
                      labels={labels}
                      onCompareBankMatch={onCompareBankMatch}
                    />
                  }
                />
              </dl>

              <div className="mt-1 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-1">
                <button
                  type="button"
                  className={`${ACTION_BUTTON_CLASS} border-blue-200 bg-blue-50 text-blue-600`}
                  onClick={() => onView(item)}
                >
                  <EyeIcon className="h-3.5 w-3.5" />
                  {labels.view}
                </button>
                <button
                  type="button"
                  className={`${ACTION_BUTTON_CLASS} border-amber-200 bg-amber-50 text-amber-700`}
                  title={getRestrictionActionLabel(item)}
                  onClick={() => onRestrictionAction(item)}
                >
                  <RestrictionIcon className="h-3.5 w-3.5" />
                  {getRestrictionActionLabel(item)}
                </button>
                {canWrite ? (
                  <button
                    type="button"
                    className={`${ACTION_BUTTON_CLASS} border-rose-200 bg-rose-50 text-rose-600`}
                    onClick={() => onUnmap(item)}
                  >
                    <NoSymbolIcon className="h-3.5 w-3.5" />
                    {labels.unmap}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
      <Pagination
        className="shrink-0"
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}
