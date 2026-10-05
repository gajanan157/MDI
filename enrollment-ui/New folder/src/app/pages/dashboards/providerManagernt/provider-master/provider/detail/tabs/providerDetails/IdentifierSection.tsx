import clsx from "clsx";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Controller, type UseFormReturn } from "react-hook-form";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Input, Switch } from "@/components/ui";
import type {
  GeneralInfoFormValues,
  IdentifierFormRow,
  IdentifiersEditFormValues,
} from "../../schemas";
import { DETAIL_ROW_EMPTY_PLACEHOLDER, DetailRow } from "../../shared/DetailRow";
import type { ProviderOldCodeRow } from "../../../hospitalData";
import type { ProviderDetailsFromApi } from "../../utils/providerDetailSectionMerges";
import { isProviderOldCodeIdentifierType } from "../../utils/sectionMerges/provider/providerDetailIdentifierFieldKeys";
import type { NormalizedProviderDetailIdentifier } from "../../utils/sectionMerges/provider/providerDetailIdentifierNormalizer";
import { parseProviderOldCodePayload } from "../../utils/providerOldCodeUtils";
import { ProviderCard, ProviderCollapsibleSection } from "./Cards";
import { createProviderDetailsFieldLabels } from "../../../../../shared/providerMasterI18n";
import {
  buildProviderIdentifierDetailParts,
  formItemsToNormalized,
  IDENTIFIER_EMPTY_MESSAGE_CLASS,
  IDENTIFIER_LABEL_COL_CLASS,
  IDENTIFIER_META_LABEL_CLASS,
  IDENTIFIER_META_ROW_CLASS,
  IDENTIFIER_META_VALUE_CLASS,
  IDENTIFIER_ROW_MAIN_CLASS,
  IDENTIFIER_SHELL_CLASS,
  IDENTIFIER_STATUS_ACTIVE_CLASS,
  IDENTIFIER_STATUS_INACTIVE_CLASS,
  IDENTIFIER_VALUE_CLASS,
  IDENTIFIER_VALUE_COL_CLASS,
  mapOldProviderCodeIdentifiersToViewRows,
  resolveIdentifierFormIndex,
  splitProviderIdentifierOverviewRows,
} from "./identifierUtils";

function isActiveStatus(status: string): boolean {
  return status.trim().toUpperCase() === "ACTIVE";
}

export function ProviderIdentifierStatusBadge({ status }: Readonly<{ status: string }>) {
  const trimmed = String(status ?? "").trim();
  if (!trimmed) return null;

  return (
    <span
      className={clsx(
        isActiveStatus(trimmed)
          ? IDENTIFIER_STATUS_ACTIVE_CLASS
          : IDENTIFIER_STATUS_INACTIVE_CLASS,
      )}
    >
      {trimmed}
    </span>
  );
}

function buildIdentifierRowKey(identifier: NormalizedProviderDetailIdentifier): string {
  return (
    identifier.providerIdentifierId ||
    `${identifier.identifierTypeName}-${identifier.identifierValue}`
  );
}

type ProviderIdentifierRowProps = {
  identifier: NormalizedProviderDetailIdentifier;
};

export function ProviderIdentifierRow({ identifier }: Readonly<ProviderIdentifierRowProps>) {
  const detailParts = buildProviderIdentifierDetailParts(identifier);

  return (
    <div className={IDENTIFIER_ROW_MAIN_CLASS}>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0">
          <div className={IDENTIFIER_LABEL_COL_CLASS}>{identifier.identifierTypeName}</div>
          <div className={IDENTIFIER_VALUE_COL_CLASS}>
            <span className={IDENTIFIER_VALUE_CLASS}>{identifier.identifierValue}</span>
            <ProviderIdentifierStatusBadge status={identifier.identifierStatus} />
          </div>
        </div>

        {detailParts.length > 0 ? (
          <div className="border-t border-slate-100">
            {detailParts.map((part) => (
              <div key={part.label} className={IDENTIFIER_META_ROW_CLASS}>
                <span className={IDENTIFIER_META_LABEL_CLASS}>{part.label}</span>
                <span className={IDENTIFIER_META_VALUE_CLASS}>{part.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type ProviderIdentifierRelatedListProps = {
  identifiers: NormalizedProviderDetailIdentifier[];
  /** Wrap rows in a bordered shell (primary / unlinked blocks). */
  bordered?: boolean;
};

export function ProviderIdentifierRelatedList({
  identifiers,
  bordered = false,
}: Readonly<ProviderIdentifierRelatedListProps>) {
  if (identifiers.length === 0) return null;

  const rows = identifiers.map((identifier) => (
    <ProviderIdentifierRow key={buildIdentifierRowKey(identifier)} identifier={identifier} />
  ));

  if (bordered) {
    return <div className={IDENTIFIER_SHELL_CLASS}>{rows}</div>;
  }

  return <div>{rows}</div>;
}

function renderProviderOldCodesEditSection({
  hasIdentifierOldCodes,
  identifierForm,
  onRemoveIdentifier,
  providerOldCodeFields,
  generalInfoForm,
}: Readonly<{
  hasIdentifierOldCodes: boolean;
  identifierForm: UseFormReturn<IdentifiersEditFormValues>;
  onRemoveIdentifier: (index: number) => void;
  providerOldCodeFields: ProviderOldCodeRow[];
  generalInfoForm: UseFormReturn<GeneralInfoFormValues>;
}>): ReactNode {
  if (hasIdentifierOldCodes) {
    return (
      <ProviderOldCodesIdentifierEditSection
        identifierForm={identifierForm}
        onRemoveIdentifier={onRemoveIdentifier}
      />
    );
  }
  if (providerOldCodeFields.length > 0) {
    return (
      <ProviderOldCodesEditSection
        generalInfoForm={generalInfoForm}
        providerOldCodeFields={providerOldCodeFields}
      />
    );
  }
  return null;
}

// function ProviderIdentifierStatusInline({ status }: Readonly<{ status: string }>) {
//   const active = isActiveStatus(status);

//   return (
//     <div className="flex items-center gap-1">
//       <ProviderIdentifierStatusDot status={status} />
//       <span className="font-bold text-gray-700">{active ? "Active" : "Inactive"}</span>
//     </div>
//   );
// }

/** Matches Provider Information `DetailRow` layout for edit mode fields. */
function ProviderIdentifierDetailRow({
  label,
  children,
  className,
}: Readonly<{
  label: string;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div className={clsx("flex flex-row items-center border-b text-[10px] last:border-0", className)}>
      <dt className="w-[40%] shrink-0 px-1 py-1 font-medium text-slate-500">{label}</dt>
      <dd className="w-[60%] min-w-0 px-1 py-1 text-slate-900">{children}</dd>
    </div>
  );
}

function ProviderRohiniDetailRow({
  identifier,
}: Readonly<{
  identifier: NormalizedProviderDetailIdentifier;
}>) {
  const { t } = useTranslation();
  const rohiniLabel = createProviderDetailsFieldLabels(t).rohiniNumber;

  return (
    <DetailRow
      compact
      layout="inline"
      label={rohiniLabel}
      value={identifier.identifierValue}
      render={() => (
        <span className="min-w-0 break-all font-mono font-semibold tabular-nums text-slate-900">
          {identifier.identifierValue}
        </span>
      )}
    />
  );
}

type ProviderIdentifierEditContentProps = {
  identifierForm: UseFormReturn<IdentifiersEditFormValues>;
  generalInfoForm: UseFormReturn<GeneralInfoFormValues>;
  providerOldCodeFields: Array<{ id: string }>;
  onRemoveIdentifier: (index: number) => void;
};

function ProviderRohiniEditFields({
  identifierForm,
  index,
  onRemove,
}: Readonly<{
  identifierForm: UseFormReturn<IdentifiersEditFormValues>;
  index: number;
  onRemove?: () => void;
}>) {
  const { t } = useTranslation();
  const labels = createProviderDetailsFieldLabels(t);
  const baseName = `items.${index}` as const;
  const providerIdentifierId = String(
    identifierForm.watch(`${baseName}.providerIdentifierId`) ?? "",
  ).trim();
  const canRemove = providerIdentifierId === "" && Boolean(onRemove);
  const itemErrors = identifierForm.formState.errors.items?.[index];

  return (
    <ProviderIdentifierDetailRow label={labels.rohiniNumber}>
      <input type="hidden" {...identifierForm.register(`${baseName}.providerIdentifierId`)} />
      <input type="hidden" {...identifierForm.register(`${baseName}.identifierTypeName`)} />
      <input type="hidden" {...identifierForm.register(`${baseName}.identifierStatus`)} />
      <input type="hidden" {...identifierForm.register(`${baseName}.verificationReferenceNo`)} />
      <input type="hidden" {...identifierForm.register(`${baseName}.sourceSystem`)} />
      <input type="hidden" {...identifierForm.register(`${baseName}.identifierHolderName`)} />
      <input type="hidden" {...identifierForm.register(`${baseName}.validFrom`)} />
      <input type="hidden" {...identifierForm.register(`${baseName}.validTo`)} />
      <input type="hidden" {...identifierForm.register(`${baseName}.issuingAuthorityName`)} />
      <input type="hidden" {...identifierForm.register(`${baseName}.issueDate`)} />
      <div className="flex min-w-0 flex-nowrap items-center gap-2">
        <Input
          {...identifierForm.register(`${baseName}.identifierValue`)}
          error={itemErrors?.identifierValue?.message}
          className="h-7 min-w-0 flex-1 text-xs"
          classNames={{ root: "min-w-0 flex-1 !min-h-0" }}
        />
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            aria-label={labels.removeRohiniNumber}
            title={labels.removeRohiniNumber}
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </ProviderIdentifierDetailRow>
  );
}

function ProviderOldCodesIdentifierEditSection({
  identifierForm,
  onRemoveIdentifier,
}: Readonly<{
  identifierForm: UseFormReturn<IdentifiersEditFormValues>;
  onRemoveIdentifier: (index: number) => void;
}>) {
  const items = identifierForm.watch("items");
  const oldCodeEntries = items
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => isProviderOldCodeIdentifierType(row.identifierTypeName));

  const activeEntries = oldCodeEntries.filter(({ index: rowIndex }) =>
    isActiveStatus(String(items[rowIndex]?.identifierStatus ?? "")),
  );
  const inactiveEntries = oldCodeEntries.filter(
    ({ index: rowIndex }) => !isActiveStatus(String(items[rowIndex]?.identifierStatus ?? "")),
  );

  const renderEditRow = (index: number, active: boolean) => {
    const baseName = `items.${index}` as const;
    const code = String(identifierForm.watch(`${baseName}.identifierValue`) ?? "").trim();
    const providerIdentifierId = String(
      identifierForm.watch(`${baseName}.providerIdentifierId`) ?? "",
    ).trim();
    const canRemove = providerIdentifierId === "";
    const canEditValue = canRemove;
    const badgeClass = active ? OLD_CODE_BADGE_ACTIVE : OLD_CODE_BADGE_INACTIVE;
    const itemErrors = identifierForm.formState.errors.items?.[index];

    return (
      <div
        key={`old-code-${index}`}
        className="flex min-w-0 items-center justify-between gap-1"
      >
        <input type="hidden" {...identifierForm.register(`${baseName}.providerIdentifierId`)} />
        <input type="hidden" {...identifierForm.register(`${baseName}.identifierTypeName`)} />
        <input type="hidden" {...identifierForm.register(`${baseName}.verificationReferenceNo`)} />
        <input type="hidden" {...identifierForm.register(`${baseName}.sourceSystem`)} />
        <input type="hidden" {...identifierForm.register(`${baseName}.identifierHolderName`)} />
        <input type="hidden" {...identifierForm.register(`${baseName}.validFrom`)} />
        <input type="hidden" {...identifierForm.register(`${baseName}.validTo`)} />
        <input type="hidden" {...identifierForm.register(`${baseName}.issuingAuthorityName`)} />
        <input type="hidden" {...identifierForm.register(`${baseName}.issueDate`)} />
        {canEditValue ? (
          <Input
            {...identifierForm.register(`${baseName}.identifierValue`)}
            error={itemErrors?.identifierValue?.message}
            className="h-7 min-w-0 flex-1 text-xs"
            classNames={{ root: "min-w-0 flex-1 !min-h-0" }}
            placeholder="Enter code"
          />
        ) : (
          <span className={clsx(badgeClass, "min-w-0 truncate")} title={code}>
            {code || DETAIL_ROW_EMPTY_PLACEHOLDER}
          </span>
        )}
        <div className="flex shrink-0 items-center gap-1">
          <Controller
            control={identifierForm.control}
            name={`${baseName}.identifierStatus`}
            render={({ field }) => (
              <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap">
                <Switch
                  checked={isActiveStatus(field.value)}
                  onChange={(event) =>
                    field.onChange(event.target.checked ? "ACTIVE" : "INACTIVE")
                  }
                  aria-label={`${isActiveStatus(field.value) ? "Active" : "Inactive"} — toggle old provider code ${code || String(index)}`}
                />
                {/* <ProviderIdentifierStatusInline status={field.value} /> */}
              </label>
            )}
          />
          {canRemove ? (
            <button
              type="button"
              onClick={() => onRemoveIdentifier(index)}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              aria-label="Remove old provider code"
              title="Remove old provider code"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  const renderEditColumn = (
    active: boolean,
    entries: Array<{ row: IdentifierFormRow; index: number }>,
  ) => (
    <div className={clsx("flex min-w-0 flex-col", OLD_CODES_COLUMN_CLASS)}>
      <ProviderOldCodeColumnHeader active={active} />
      <div className="flex flex-col">
        {entries.length === 0 ? (
          <span className="text-[10px] text-slate-500">{DETAIL_ROW_EMPTY_PLACEHOLDER}</span>
        ) : (
          chunkIntoPairs(entries).map((pair, pairIndex) => (
            <div
              key={`old-code-pair-${pairIndex}`}
              className="grid grid-cols-2 gap-x-2 border-b border-slate-100 py-0.5 last:border-b-0"
            >
              {pair.map(({ index }) => (
                <div key={`old-code-cell-${index}`} className="min-w-0">
                  {renderEditRow(index, active)}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <ProviderOldCodesCardShell>
      <div className="grid grid-cols-2 gap-x-2">
        {renderEditColumn(true, activeEntries)}
        {renderEditColumn(false, inactiveEntries)}
      </div>
    </ProviderOldCodesCardShell>
  );
}

export function ProviderIdentifierEditContent({
  identifierForm,
  generalInfoForm,
  providerOldCodeFields,
  onRemoveIdentifier,
}: Readonly<ProviderIdentifierEditContentProps>) {
  const items = identifierForm.watch("items");
  const { rohiniRows } = useMemo(
    () => splitProviderIdentifierOverviewRows(formItemsToNormalized(items)),
    [items],
  );
  const usedIndexes = new Set<number>();
  const hasIdentifierOldCodes = items.some((row) =>
    isProviderOldCodeIdentifierType(row.identifierTypeName),
  );

  if (items.length === 0 && providerOldCodeFields.length === 0) {
    return <p className={IDENTIFIER_EMPTY_MESSAGE_CLASS}>No identifiers added yet.</p>;
  }

  return (
    <div className="space-y-2">
      {rohiniRows.length > 0 ? (
        <dl className="grid grid-cols-1 gap-x-3 gap-y-0">
          {rohiniRows.map((identifier) => {
            const index = resolveIdentifierFormIndex(items, identifier, usedIndexes);
            if (index < 0) return null;

            return (
              <ProviderRohiniEditFields
                key={identifier.providerIdentifierId || `${identifier.identifierTypeName}-${index}`}
                identifierForm={identifierForm}
                index={index}
                onRemove={() => onRemoveIdentifier(index)}
              />
            );
          })}
        </dl>
      ) : null}

      {renderProviderOldCodesEditSection({
        hasIdentifierOldCodes,
        identifierForm,
        onRemoveIdentifier,
        providerOldCodeFields,
        generalInfoForm,
      })}
    </div>
  );
}

const PROVIDER_OLD_CODES_EMPTY_MESSAGE = "No old provider codes available.";

const OLD_CODES_SHELL_CLASS =
  "min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white";

const OLD_CODES_HEADER_CLASS =
  "border-b border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500";

const OLD_CODES_BODY_CLASS = "bg-white px-2 py-1";

const OLD_CODES_COLUMN_CLASS = "min-w-0 border-l border-slate-200/80 pl-2 first:border-l-0 first:pl-0";

const OLD_CODE_BADGE_ACTIVE =
  "inline-flex max-w-full rounded-md bg-emerald-100/90 px-1.5 py-px font-mono text-[10px] font-semibold tabular-nums text-emerald-900 ring-1 ring-emerald-300/80";

const OLD_CODE_BADGE_INACTIVE =
  "inline-flex max-w-full rounded-md bg-rose-100/85 px-1.5 py-px font-mono text-[10px] font-semibold tabular-nums text-rose-900 ring-1 ring-rose-300/75";

function chunkIntoPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    pairs.push(items.slice(index, index + 2));
  }
  return pairs;
}

/** View mode: identifier API not wired yet — do not render provider-details fields here. */
function IdentifierDetailsEmptyMessage() {
  const { t } = useTranslation();
  return (
    <p className={IDENTIFIER_EMPTY_MESSAGE_CLASS}>
      {t("providerMaster.detailTabs.providerDetails.noIdentifierData")}
    </p>
  );
}

function ProviderOldCodesCardShell({
  children,
  className = "",
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  const { t } = useTranslation();
  return (
    <div className={clsx(OLD_CODES_SHELL_CLASS, className)}>
      <div className={OLD_CODES_HEADER_CLASS}>
        {t("providerMaster.detailTabs.providerDetails.oldProviderCodes")}
      </div>
      <div className={OLD_CODES_BODY_CLASS}>{children}</div>
    </div>
  );
}

function ProviderOldCodeColumnHeader({ active }: Readonly<{ active: boolean }>) {
  const { t } = useTranslation();
  return (
    <div className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold text-slate-600">
      <span
        className={clsx(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          active ? "bg-emerald-500" : "bg-rose-500",
        )}
        aria-hidden
      />
      {active ? t("providerMaster.common.active") : t("providerMaster.common.inactive")}
    </div>
  );
}

function partitionProviderOldCodeRows(rows: ProviderOldCodeRow[]) {
  const activeRows: ProviderOldCodeRow[] = [];
  const inactiveRows: ProviderOldCodeRow[] = [];
  for (const row of rows) {
    if (row.active) {
      activeRows.push(row);
    } else {
      inactiveRows.push(row);
    }
  }
  return { activeRows, inactiveRows };
}

function ProviderOldCodeBadgeList({ rows, active: isActive }: Readonly<{ rows: ProviderOldCodeRow[]; active: boolean }>) {
  const badgeClass = isActive ? OLD_CODE_BADGE_ACTIVE : OLD_CODE_BADGE_INACTIVE;

  if (rows.length === 0) {
    return <span className="text-[10px] text-slate-500">{DETAIL_ROW_EMPTY_PLACEHOLDER}</span>;
  }

  return (
    <ul className="flex flex-row flex-wrap items-center gap-1">
      {rows.map((row, index) => (
        <li key={`${row.code}-${index}`} className="shrink-0">
          <span className={badgeClass} title={row.code}>
            {row.code}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ProviderOldCodesStatusColumn({
  active,
  rows,
}: Readonly<{
  active: boolean;
  rows: ProviderOldCodeRow[];
}>) {
  return (
    <div className={clsx("flex min-w-0 flex-col", OLD_CODES_COLUMN_CLASS)}>
      <ProviderOldCodeColumnHeader active={active} />
      <ProviderOldCodeBadgeList rows={rows} active={active} />
    </div>
  );
}

function ProviderOldCodesTwoColumnLayout({ rows }: Readonly<{ rows: ProviderOldCodeRow[] }>) {
  const { activeRows, inactiveRows } = partitionProviderOldCodeRows(rows);

  return (
    <div className="grid grid-cols-2 gap-x-2">
      <ProviderOldCodesStatusColumn active rows={activeRows} />
      <ProviderOldCodesStatusColumn active={false} rows={inactiveRows} />
    </div>
  );
}

export function ProviderOldCodesViewField({
  rows,
}: Readonly<{
  rows?: ProviderOldCodeRow[];
}>) {
  const oldCodeRows = rows ?? [];

  return (
    <ProviderOldCodesCardShell>
      {oldCodeRows.length === 0 ? (
        <span className="text-[10px] text-slate-500">{DETAIL_ROW_EMPTY_PLACEHOLDER}</span>
      ) : (
        <ProviderOldCodesTwoColumnLayout rows={oldCodeRows} />
      )}
    </ProviderOldCodesCardShell>
  );
}

function ProviderOldCodesEditBlock({
  generalInfoForm,
  providerOldCodeFields,
  showEmptyMessage = true,
}: {
  generalInfoForm: UseFormReturn<GeneralInfoFormValues>;
  providerOldCodeFields: Array<{ id: string }>;
  showEmptyMessage?: boolean;
}) {
  if (providerOldCodeFields.length === 0) {
    if (!showEmptyMessage) return null;
    return (
      <p className="text-[10px] text-slate-500 sm:col-span-2">{PROVIDER_OLD_CODES_EMPTY_MESSAGE}</p>
    );
  }

  const activeIndices = providerOldCodeFields
    .map((field, index) => ({ field, index }))
    .filter(({ index }) => Boolean(generalInfoForm.watch(`providerOldCodes.${index}.active`)));
  const inactiveIndices = providerOldCodeFields
    .map((field, index) => ({ field, index }))
    .filter(({ index }) => !generalInfoForm.watch(`providerOldCodes.${index}.active`));

  const renderEditRow = (field: { id: string }, index: number, isActive: boolean) => {
    const code = generalInfoForm.watch(`providerOldCodes.${index}.code`) ?? "";
    const badgeClass = isActive ? OLD_CODE_BADGE_ACTIVE : OLD_CODE_BADGE_INACTIVE;

    return (
      <div key={field.id} className="flex min-w-0 items-center justify-between gap-1">
        <Input
          type="hidden"
          unstyled
          classNames={{ root: "hidden" }}
          {...generalInfoForm.register(`providerOldCodes.${index}.code`)}
        />
        <span className={clsx(badgeClass, "min-w-0 truncate")} title={code}>
          {code || "—"}
        </span>
        <Controller
          control={generalInfoForm.control}
          name={`providerOldCodes.${index}.active`}
          render={({ field: switchField }) => (
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap">
              <Switch
                checked={Boolean(switchField.value)}
                onChange={(e) => switchField.onChange(e.target.checked)}
                aria-label={`${switchField.value ? "Active" : "Inactive"} — toggle legacy code ${code || String(index)}`}
              />
              {/* <ProviderIdentifierStatusInline
                status={switchField.value ? "ACTIVE" : "INACTIVE"}
              /> */}
            </label>
          )}
        />
      </div>
    );
  };

  const renderEditColumn = (
    active: boolean,
    entries: Array<{ field: { id: string }; index: number }>,
  ) => (
    <div className={clsx("flex min-w-0 flex-col", OLD_CODES_COLUMN_CLASS)}>
      <ProviderOldCodeColumnHeader active={active} />
      <div className="flex flex-col">
        {entries.length === 0 ? (
          <span className="text-[10px] text-slate-500">{DETAIL_ROW_EMPTY_PLACEHOLDER}</span>
        ) : (
          chunkIntoPairs(entries).map((pair, pairIndex) => (
            <div
              key={`legacy-old-code-pair-${pairIndex}`}
              className="grid grid-cols-2 gap-x-2 border-b border-slate-100 py-0.5 last:border-b-0"
            >
              {pair.map(({ field, index }) => (
                <div key={field.id} className="min-w-0">
                  {renderEditRow(field, index, active)}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-x-2">
      {renderEditColumn(true, activeIndices)}
      {renderEditColumn(false, inactiveIndices)}
    </div>
  );
}

export function ProviderOldCodesEditSection({
  generalInfoForm,
  providerOldCodeFields,
  showEmptyMessage = true,
}: {
  generalInfoForm: UseFormReturn<GeneralInfoFormValues>;
  providerOldCodeFields: Array<{ id: string }>;
  showEmptyMessage?: boolean;
}) {
  if (providerOldCodeFields.length === 0 && !showEmptyMessage) return null;

  return (
    <ProviderOldCodesCardShell>
      <ProviderOldCodesEditBlock
        generalInfoForm={generalInfoForm}
        providerOldCodeFields={providerOldCodeFields}
        showEmptyMessage={showEmptyMessage}
      />
    </ProviderOldCodesCardShell>
  );
}

export function ProviderIdentifierCard({
  providerDetails,
  generalInfoForm,
  identifierForm,
  providerOldCodeFields,
  onRemoveIdentifier,
  isEditMode,
}: {
  providerDetails: ProviderDetailsFromApi | null;
  generalInfoForm: UseFormReturn<GeneralInfoFormValues>;
  identifierForm: UseFormReturn<IdentifiersEditFormValues>;
  providerOldCodeFields: Array<{ id: string }>;
  onRemoveIdentifier: (index: number) => void;
  isEditMode: boolean;
}) {
  const { t } = useTranslation();
  const identifierTitle = t("providerMaster.detailTabs.providerDetails.identifierDetails");
  const identifiers = providerDetails?.identifiers ?? [];

  if (isEditMode) {
    return (
      <ProviderCard
        title={identifierTitle}
        isEditMode
        bodyClassName="px-2 py-1.5"
      >
        <ProviderIdentifierEditContent
          identifierForm={identifierForm}
          generalInfoForm={generalInfoForm}
          providerOldCodeFields={providerOldCodeFields}
          onRemoveIdentifier={onRemoveIdentifier}
        />
      </ProviderCard>
    );
  }

  return (
    <ProviderCollapsibleSection
      title={identifierTitle}
      hasMoreContent={false}
    >
      {identifiers.length === 0 &&
      (parseProviderOldCodePayload(providerDetails?.providerOldCode)?.length ?? 0) === 0 ? (
        <IdentifierDetailsEmptyMessage />
      ) : (
        <ProviderIdentifierViewContent
          identifiers={identifiers}
          legacyOldCodes={parseProviderOldCodePayload(providerDetails?.providerOldCode) ?? []}
        />
      )}
    </ProviderCollapsibleSection>
  );
}

function ProviderIdentifierViewContent({
  identifiers,
  legacyOldCodes = [],
}: Readonly<{
  identifiers: NormalizedProviderDetailIdentifier[];
  legacyOldCodes?: ProviderOldCodeRow[];
}>) {
  const { rohiniRows, oldCodeRows } = useMemo(
    () => splitProviderIdentifierOverviewRows(identifiers),
    [identifiers],
  );
  const identifierOldCodeViewRows = useMemo(
    () => mapOldProviderCodeIdentifiersToViewRows(oldCodeRows),
    [oldCodeRows],
  );
  const oldCodeViewRows =
    identifierOldCodeViewRows.length > 0 ? identifierOldCodeViewRows : legacyOldCodes;

  if (rohiniRows.length === 0 && oldCodeViewRows.length === 0) {
    return <IdentifierDetailsEmptyMessage />;
  }

  return (
    <div className="space-y-2">
      {rohiniRows.length > 0 ? (
        <dl className="grid grid-cols-1 gap-x-3 gap-y-0 sm:grid-cols-2">
          {rohiniRows.map((identifier) => (
            <ProviderRohiniDetailRow
              key={buildIdentifierRowKey(identifier)}
              identifier={identifier}
            />
          ))}
        </dl>
      ) : null}
      {oldCodeViewRows.length > 0 ? (
        <ProviderOldCodesViewField rows={oldCodeViewRows} />
      ) : null}
    </div>
  );
}
