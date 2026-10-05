import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { formatToDDMMMYYYY } from "@/app/pages/dashboards/providerManagernt/shared/dateFormat";
import { DETAIL_ROW_EMPTY_PLACEHOLDER } from "../../../../shared/DetailRow";
import { formatAgreementNameForDisplay } from "../../../../shared/agreementTypeChip.helpers";
import {
  SOC_DETAIL_TABLE_LABEL_CELL_CLASS,
  SOC_DETAIL_TABLE_ROW_CLASS,
  SOC_DETAIL_TABLE_VALUE_CELL_CLASS,
} from "../utils/socDetailTheme";

function formatSocViewDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") return "";
  return formatToDDMMMYYYY(trimmed);
}

function SocKeyValueRow({
  label,
  value,
  className = "",
}: Readonly<{ label: string; value?: string; className?: string }>) {
  const isEmpty =
    value == null ||
    (typeof value === "string" && ["", "—", DETAIL_ROW_EMPTY_PLACEHOLDER].includes(value.trim()));
  const display = isEmpty ? DETAIL_ROW_EMPTY_PLACEHOLDER : value;

  return (
    <div className={`${SOC_DETAIL_TABLE_ROW_CLASS} ${className}`.trim()}>
      <dt
        className={`w-[42%] shrink-0 ${SOC_DETAIL_TABLE_LABEL_CELL_CLASS} whitespace-nowrap`}
      >
        {label}
      </dt>
      <dd className={`w-[58%] ${SOC_DETAIL_TABLE_VALUE_CELL_CLASS}`}>{display}</dd>
    </div>
  );
}

type SocDetailViewFieldsProps = {
  agreementName?: string;
  startDate: string;
  endDate: string;
  lastUpdatedOn: string;
  showCorporateFields?: boolean;
  showDetailsInsurer?: boolean;
  isCorporateSoc?: boolean;
  corporateInsurerName?: string;
  corporateNames?: string[];
};

export function SocDetailViewFields({
  agreementName,
  startDate,
  endDate,
  lastUpdatedOn,
  showCorporateFields = true,
  showDetailsInsurer = false,
  isCorporateSoc = false,
  corporateInsurerName,
  corporateNames = [],
}: Readonly<SocDetailViewFieldsProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.details";
  const corporateDisplay = corporateNames.filter((name) => name.trim()).join(", ");

  return (
    <dl className="grid grid-cols-1 overflow-hidden sm:grid-cols-6">
      <SocKeyValueRow
        className="sm:col-span-6"
        label={t(`${D}.agreementName`)}
        value={agreementName ? formatAgreementNameForDisplay(agreementName) : undefined}
      />
      <SocKeyValueRow
        className="sm:col-span-2"
        label={t(`${D}.startDateView`)}
        value={formatSocViewDate(startDate)}
      />
      <SocKeyValueRow
        className="sm:col-span-2"
        label={t(`${D}.endDateView`)}
        value={formatSocViewDate(endDate)}
      />
      <SocKeyValueRow
        className="sm:col-span-2"
        label={t(`${D}.lastUpdatedOnView`)}
        value={formatSocViewDate(lastUpdatedOn)}
      />
      {showCorporateFields ? (
        <SocKeyValueRow
          className="sm:col-span-2"
          label={t(`${D}.corporate`)}
          value={isCorporateSoc ? t(`${D}.corporateYes`) : t(`${D}.corporateNo`)}
        />
      ) : null}
      {showDetailsInsurer || (showCorporateFields && isCorporateSoc) ? (
        <SocKeyValueRow
          className="sm:col-span-2"
          label={t(`${D}.insurerPsu`)}
          value={corporateInsurerName}
        />
      ) : null}
      {showCorporateFields && isCorporateSoc ? (
        <SocKeyValueRow
          className="sm:col-span-4"
          label={t(`${D}.corporateName`)}
          value={corporateDisplay}
        />
      ) : null}
    </dl>
  );
}

type SocApplicableTableRow = {
  id: string;
  name: string;
  effectiveFrom: string;
  corporate?: string;
};

type SocApplicableIcTableProps = {
  rows: SocApplicableTableRow[];
  /** Corporate SOC layout: Corporate (left) + Effective Date (right); insurer shown above. */
  corporateLayout?: boolean;
  showActions?: boolean;
  onRemoveRow?: (id: string) => void;
  onEditRow?: (id: string) => void;
};

export function SocApplicableIcTable({
  rows,
  corporateLayout = false,
  showActions = false,
  onRemoveRow,
  onEditRow,
}: Readonly<SocApplicableIcTableProps>) {
  const { t } = useTranslation();
  const AI = "providerMaster.soc.applicableIc";

  if (corporateLayout) {
    return (
      <div className="overflow-hidden rounded-md border border-slate-200">
        <div className={SOC_DETAIL_TABLE_ROW_CLASS}>
          <div className={`min-w-0 flex-[1.6] ${SOC_DETAIL_TABLE_LABEL_CELL_CLASS}`}>
            {t(`${AI}.corporateColumn`)}
          </div>
          <div className={`min-w-0 flex-1 ${SOC_DETAIL_TABLE_LABEL_CELL_CLASS}`}>
            {t(`${AI}.effectiveDate`)}
          </div>
          {showActions ? (
            <div
              className={`w-[4.75rem] shrink-0 text-center ${SOC_DETAIL_TABLE_LABEL_CELL_CLASS}`}
            >
              {t(`${AI}.action`)}
            </div>
          ) : null}
        </div>
        {rows.map((row) => {
          const corporateDisplay = row.corporate?.trim() || row.name.trim();
          const initial = corporateDisplay.charAt(0).toUpperCase() || "C";
          return (
            <div key={row.id} className={SOC_DETAIL_TABLE_ROW_CLASS}>
              <div className={`min-w-0 flex-[1.6] ${SOC_DETAIL_TABLE_VALUE_CELL_CLASS}`}>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                    {initial}
                  </span>
                  <span className="truncate font-medium">
                    {corporateDisplay || DETAIL_ROW_EMPTY_PLACEHOLDER}
                  </span>
                </div>
              </div>
              <div className={`min-w-0 flex-1 ${SOC_DETAIL_TABLE_VALUE_CELL_CLASS}`}>
                {row.effectiveFrom
                  ? formatToDDMMMYYYY(row.effectiveFrom)
                  : DETAIL_ROW_EMPTY_PLACEHOLDER}
              </div>
              {showActions ? (
                <div
                  className={`flex w-[4.75rem] shrink-0 items-center justify-center gap-1 ${SOC_DETAIL_TABLE_VALUE_CELL_CLASS}`}
                >
                  <button
                    type="button"
                    onClick={() => onEditRow?.(row.id)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                    aria-label={t(`${AI}.editInsurer`, { name: corporateDisplay })}
                    title={t(`${AI}.editInsurer`, { name: corporateDisplay })}
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveRow?.(row.id)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    aria-label={t(`${AI}.removeInsurer`, { name: corporateDisplay })}
                    title={t(`${AI}.removeInsurer`, { name: corporateDisplay })}
                  >
                    <TrashIcon className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <div className={SOC_DETAIL_TABLE_ROW_CLASS}>
        <div className={`min-w-0 flex-[1.4] ${SOC_DETAIL_TABLE_LABEL_CELL_CLASS}`}>
          {t(`${AI}.insurerName`)}
        </div>
        <div className={`min-w-0 flex-1 ${SOC_DETAIL_TABLE_LABEL_CELL_CLASS}`}>
          {t(`${AI}.effectiveFrom`)}
        </div>
        {showActions ? (
          <div
            className={`w-[4.75rem] shrink-0 text-center ${SOC_DETAIL_TABLE_LABEL_CELL_CLASS}`}
          >
            {t(`${AI}.action`)}
          </div>
        ) : null}
      </div>
      {rows.map((row) => {
        const initial = row.name.trim().charAt(0).toUpperCase() || "I";
        return (
          <div key={row.id} className={SOC_DETAIL_TABLE_ROW_CLASS}>
            <div className={`min-w-0 flex-[1.4] ${SOC_DETAIL_TABLE_VALUE_CELL_CLASS}`}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700">
                  {initial}
                </span>
                <span className="truncate font-medium">{row.name}</span>
              </div>
            </div>
            <div className={`min-w-0 flex-1 ${SOC_DETAIL_TABLE_VALUE_CELL_CLASS}`}>
              {row.effectiveFrom ? formatToDDMMMYYYY(row.effectiveFrom) : DETAIL_ROW_EMPTY_PLACEHOLDER}
            </div>
            {showActions ? (
              <div
                className={`flex w-[4.75rem] shrink-0 items-center justify-center gap-1 ${SOC_DETAIL_TABLE_VALUE_CELL_CLASS}`}
              >
                <button
                  type="button"
                  onClick={() => onEditRow?.(row.id)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                  aria-label={t(`${AI}.editInsurer`, { name: row.name })}
                  title={t(`${AI}.editInsurer`, { name: row.name })}
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveRow?.(row.id)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  aria-label={t(`${AI}.removeInsurer`, { name: row.name })}
                  title={t(`${AI}.removeInsurer`, { name: row.name })}
                >
                  <TrashIcon className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
