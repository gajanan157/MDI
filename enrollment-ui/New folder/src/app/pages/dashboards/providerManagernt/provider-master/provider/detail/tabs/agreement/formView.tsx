import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { PROVIDER_ACTION_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import {
  DetailRow,
  DETAIL_ROW_EMPTY_PLACEHOLDER,
  ProviderSectionCard,
} from "../../shared/DetailRow";
import { AGREEMENT_FORM_TYPE_OPTIONS } from "./utils/agreementFormConfig";
import type { AgreementFullFormValues } from "./utils/agreementFormConfig";
import {
  getAgreementNameFlags,
  resolveEmpanelmentDateLabelKey,
  shouldShowRemarksBesideApplicableScope,
  usesPpnStateCityFields,
} from "./utils/agreementHelpers";
import { formatAgreementNameForDisplay } from "../../shared/agreementTypeChip.helpers";
import { formatToDDMMMYYYY } from "../../../../../shared/dateFormat";
import type { AgreementFormLogic } from "./hooks/useAgreement";
import { formatPpnPlaceName } from "./utils/agreementGipsaPpnNormalizer";

type AgreementFormViewProps = {
  logic: AgreementFormLogic;
  values: AgreementFullFormValues;
  onViewDocument?: () => void;
  onDownloadDocument?: () => void;
  onViewSupportingDocument?: () => void;
  onDownloadSupportingDocument?: () => void;
};

/** Header + ~4 insurer rows in GIPSA paired layout. */
const GIPSA_PAIRED_PANEL_SCROLL_CLASS =
  "max-h-[9rem] overflow-y-auto overflow-x-auto";

const EMPTY_VALUE_PLACEHOLDER = "_";

function displayOrDash(value: unknown): string {
  const val = String(value ?? "").trim();
  if (
    !val ||
    val === "—" ||
    val === "-" ||
    val === DETAIL_ROW_EMPTY_PLACEHOLDER ||
    val === EMPTY_VALUE_PLACEHOLDER
  ) {
    return EMPTY_VALUE_PLACEHOLDER;
  }
  return val;
}

function getVisibleSlice<T>(items: T[], showAll: boolean, limit = 4): T[] {
  if (showAll) return items;
  return items.slice(0, limit);
}

function getScopeScrollClass(
  showGipsaRemarksBesideScope: boolean,
  scopeRowCount: number,
): string {
  if (showGipsaRemarksBesideScope) {
    return GIPSA_PAIRED_PANEL_SCROLL_CLASS;
  }
  if (scopeRowCount > 4) {
    return "mt-0.5 max-h-28 overflow-y-auto overflow-x-auto";
  }
  return "mt-0.5 overflow-x-auto";
}

function buildScopeInvolvementRows(
  involvementRows: AgreementFormLogic["selectedIcInvolvementRows"]["rows"],
) {
  return involvementRows;
}

type AgreementFormViewLayoutSections = {
  termsSectionCard: ReactNode;
  scopeSectionCard: ReactNode;
  documentSectionCard: ReactNode;
  remarksSectionCard: ReactNode;
  gipsaRemarksSectionCard: ReactNode;
};

function renderAgreementFormViewLayout(
  showGipsaRemarksBesideScope: boolean,
  showRemarksBesideScope: boolean,
  sections: AgreementFormViewLayoutSections,
): ReactNode {
  const {
    termsSectionCard,
    scopeSectionCard,
    documentSectionCard,
    remarksSectionCard,
    gipsaRemarksSectionCard,
  } = sections;

  if (showGipsaRemarksBesideScope) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
          {termsSectionCard}
          {documentSectionCard}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
          {scopeSectionCard}
          {gipsaRemarksSectionCard}
        </div>
      </div>
    );
  }

  if (showRemarksBesideScope) {
    return (
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:items-stretch">
        <div className="space-y-2">
          {termsSectionCard}
          {scopeSectionCard}
        </div>
        <div className="flex flex-col gap-2">
          {documentSectionCard}
          <div className="mt-auto">{remarksSectionCard}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:items-start">
      <div className="space-y-2">
        {termsSectionCard}
        {documentSectionCard}
      </div>
      <div className="space-y-2">
        {scopeSectionCard}
        {remarksSectionCard}
      </div>
    </div>
  );
}

export function AgreementFormView({
  logic,
  values: v,
  onViewDocument,
  onDownloadDocument,
  onViewSupportingDocument,
  onDownloadSupportingDocument,
}: Readonly<AgreementFormViewProps>) {
  const { t } = useTranslation();
  const {
    selectedIcInvolvementRows,
  } = logic;
  const [showAllAgreementTerms, setShowAllAgreementTerms] = useState(false);
  const [showAllAgreementDocument, setShowAllAgreementDocument] =
    useState(false);

  const typeLabel =
    AGREEMENT_FORM_TYPE_OPTIONS.find((o) => o.value === v.agreementType)
      ?.label ?? v.agreementType;

  const nameFlags = getAgreementNameFlags(v.agreementName);
  const showGipsaRemarksBesideScope = nameFlags.isGipsaPpnTripartite;
  const showRemarksBesideScope = shouldShowRemarksBesideApplicableScope(nameFlags);
  const gipsaRemarksText = v.remarks?.trim() ?? "";

  const agreementTermDateRows = [
    {
      label: t(resolveEmpanelmentDateLabelKey(nameFlags)),
      value: displayOrDash(formatToDDMMMYYYY(v.empanelmentDate)),
    },
    {
      label: t("providerMaster.agreement.fields.signAgreementSentDate"),
      value: displayOrDash(formatToDDMMMYYYY(v.signAgreementSentDate)),
    },
  ];

  const agreementTermPpnRows = usesPpnStateCityFields(nameFlags)
    ? [
        {
          label: t("providerMaster.agreement.fields.ppnState"),
          value: displayOrDash(
            formatPpnPlaceName((v.ppnStateName ?? v.ppnState ?? "").trim()),
          ),
        },
        {
          label: t("providerMaster.agreement.fields.ppnCity"),
          value: displayOrDash(
            formatPpnPlaceName((v.ppnCityName ?? v.ppnCity ?? "").trim()),
          ),
        },
      ]
    : [];

  const agreementTermRows = [...agreementTermDateRows, ...agreementTermPpnRows];

  const visibleAgreementTermRows = getVisibleSlice(
    agreementTermRows,
    showAllAgreementTerms,
  );

  const agreementDocumentRows = [
    {
      label: t("providerMaster.agreement.fields.agreementCopyAvailable"),
      value: displayOrDash(v.agreementCopyAvailable),
    },
    {
      label: t("providerMaster.agreement.fields.providerSignatoryName"),
      value: displayOrDash(v.providerSignatoryName),
    },
    {
      label: t("providerMaster.agreement.fields.providerSignatoryDesignation"),
      value: displayOrDash(v.providerSignatoryDesignation),
    },
    {
      label: t("providerMaster.agreement.fields.effectiveFrom"),
      value: displayOrDash(formatToDDMMMYYYY(v.effectiveFrom)),
    },
    {
      label: t("providerMaster.agreement.fields.effectiveTo"),
      value: displayOrDash(formatToDDMMMYYYY(v.effectiveTo)),
    },
    {
      label: t("providerMaster.agreement.fields.agreementDurationDays"),
      value: displayOrDash(v.agreementDurationDays),
    },
    {
      label: t("providerMaster.agreement.fields.agreementDocument"),
      value: displayOrDash(v.agreementDocumentName),
      render: (name: string) => (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">{displayOrDash(name)}</p>
            {v.agreementDocumentUploadedOn?.trim() ? (
              <p className="mt-0.5 text-[11px] text-gray-600">
                {t("providerMaster.agreement.uploadedOn", {
                  date: formatToDDMMMYYYY(v.agreementDocumentUploadedOn),
                })}
              </p>
            ) : null}
          </div>
          {name.trim() &&
          name !== DETAIL_ROW_EMPTY_PLACEHOLDER &&
          name !== EMPTY_VALUE_PLACEHOLDER ? (
            <div className="flex shrink-0 flex-wrap gap-1.5">
              {onViewDocument ? (
                <Button
                  type="button"
                  variant="outlined"
                  className={PROVIDER_ACTION_BUTTON_CLASS}
                  onClick={onViewDocument}
                >
                  <EyeIcon className="mr-1 h-3.5 w-3.5" />
                  {t("providerMaster.common.view")}
                </Button>
              ) : null}
              {onDownloadDocument ? (
                <Button
                  type="button"
                  variant="outlined"
                  className={PROVIDER_ACTION_BUTTON_CLASS}
                  onClick={onDownloadDocument}
                >
                  <ArrowDownTrayIcon className="mr-1 h-3.5 w-3.5" />
                  {t("providerMaster.common.download")}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      label: t("providerMaster.agreement.fields.supportingDocument"),
      value: displayOrDash(v.supportingDocumentName),
      render: (name: string) => (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">{displayOrDash(name)}</p>
            {v.supportingDocumentUploadedOn?.trim() ? (
              <p className="mt-0.5 text-[11px] text-gray-600">
                {t("providerMaster.agreement.uploadedOn", {
                  date: formatToDDMMMYYYY(v.supportingDocumentUploadedOn),
                })}
              </p>
            ) : null}
          </div>
          {name.trim() &&
          name !== DETAIL_ROW_EMPTY_PLACEHOLDER &&
          name !== EMPTY_VALUE_PLACEHOLDER ? (
            <div className="flex shrink-0 flex-wrap gap-1.5">
              {onViewSupportingDocument ? (
                <Button
                  type="button"
                  variant="outlined"
                  className={PROVIDER_ACTION_BUTTON_CLASS}
                  onClick={onViewSupportingDocument}
                >
                  <EyeIcon className="mr-1 h-3.5 w-3.5" />
                  {t("providerMaster.common.view")}
                </Button>
              ) : null}
              {onDownloadSupportingDocument ? (
                <Button
                  type="button"
                  variant="outlined"
                  className={PROVIDER_ACTION_BUTTON_CLASS}
                  onClick={onDownloadSupportingDocument}
                >
                  <ArrowDownTrayIcon className="mr-1 h-3.5 w-3.5" />
                  {t("providerMaster.common.download")}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ),
    },
  ];

  const showAgreementDocumentToggle = agreementDocumentRows.length > 4;

  const visibleAgreementDocumentRows = getVisibleSlice(
    agreementDocumentRows,
    showAllAgreementDocument,
  );

  const scopeInvolvementRows = buildScopeInvolvementRows(
    selectedIcInvolvementRows.rows,
  );

  const scopeScrollClass = getScopeScrollClass(
    showGipsaRemarksBesideScope,
    scopeInvolvementRows.length,
  );

  const scopeIcDisplay =
    scopeInvolvementRows.length > 0 ? (
      <div className={scopeScrollClass}>
        <table className="w-full min-w-[220px] table-fixed border-collapse text-left text-[11px]">
          <colgroup>
            <col className="w-[58%]" />
            <col className="w-[42%]" />
          </colgroup>
          <thead className="sticky top-0 z-[1]">
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <th className="px-2 py-1.5 text-left font-semibold">
                {t("providerMaster.agreement.insuranceCompany")}
              </th>
              <th className="px-2 py-1.5 text-left font-semibold">
                {t("providerMaster.agreement.effectiveFromInvolvement")}
              </th>
            </tr>
          </thead>
          <tbody>
            {scopeInvolvementRows.map((r, idx) => (
              <tr
                key={`${r.insurerId || r.name}-${idx}`}
                className="border-b border-gray-100 text-gray-900 last:border-0"
              >
                <td className="px-2 py-1.5 align-top">{r.name}</td>
                <td className="px-2 py-1.5 align-top">
                  {r.effectiveFromIso?.trim()
                    ? formatToDDMMMYYYY(r.effectiveFromIso)
                    : EMPTY_VALUE_PLACEHOLDER}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <span className="inline-block text-gray-500">
        {t("providerMaster.agreement.noInsurerRecordFound", {
          defaultValue: "No insurer record found",
        })}
      </span>
    );

  const termsSectionCard = (
    <ProviderSectionCard
      title={
        <div className="flex items-center justify-between gap-2">
          <span>{t("providerMaster.agreement.sections.terms")}</span>
          {agreementTermRows.length > 4 ? (
            <button
              type="button"
              className="text-primary-600 text-[11px] font-medium hover:underline"
              onClick={() => setShowAllAgreementTerms((open) => !open)}
            >
              {showAllAgreementTerms
                ? t("providerMaster.agreement.seeLess")
                : t("providerMaster.agreement.seeMore")}
            </button>
          ) : null}
        </div>
      }
      titleClassName="text-[11px]"
    >
      <div className="bg-white px-2.5 py-1.5">
        <dl className="space-y-0">
          {visibleAgreementTermRows.map((row) => (
            <DetailRow
              compact
              tone="slate"
              layout="inline"
              key={row.label}
              label={row.label}
              value={row.value}
            />
          ))}
        </dl>
      </div>
    </ProviderSectionCard>
  );

  const documentSectionCard = (
    <ProviderSectionCard
      title={
        <div className="flex items-center justify-between gap-2">
          <span>{t("providerMaster.agreement.sections.document")}</span>
          {showAgreementDocumentToggle ? (
            <button
              type="button"
              className="text-primary-600 text-[11px] font-medium hover:underline"
              onClick={() => setShowAllAgreementDocument((open) => !open)}
            >
              {showAllAgreementDocument
                ? t("providerMaster.agreement.seeLess")
                : t("providerMaster.agreement.seeMore")}
            </button>
          ) : null}
        </div>
      }
      titleClassName="text-[11px]"
    >
      <div className="bg-white px-2.5 py-1.5">
        <dl className="space-y-0">
          {visibleAgreementDocumentRows.map((row) => (
            <DetailRow
              compact
              tone="slate"
              layout="inline"
              key={row.label}
              label={row.label}
              value={row.value}
              render={row.render}
            />
          ))}
        </dl>
      </div>
    </ProviderSectionCard>
  );

  const scopeSectionCard = (
    <ProviderSectionCard
      title={t("providerMaster.agreement.sections.scope")}
      titleClassName="text-[11px]"
      fillHeight={showGipsaRemarksBesideScope}
    >
      <div className="bg-white px-2.5 py-1.5">
        <div className="min-w-0 rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] leading-snug text-gray-900">
          {scopeIcDisplay}
        </div>
      </div>
    </ProviderSectionCard>
  );

  const remarksSectionCard = (
    <ProviderSectionCard
      title={t("providerMaster.agreement.sections.remarks")}
      titleClassName="text-[11px]"
    >
      <div className="bg-white px-2.5 py-1.5">
        <div className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] leading-snug text-gray-900">
          <span className="whitespace-pre-wrap">
            {displayOrDash(v.remarks)}
          </span>
        </div>
      </div>
    </ProviderSectionCard>
  );

  const gipsaRemarksSectionCard = (
    <ProviderSectionCard
      title={t("providerMaster.agreement.sections.remarks")}
      titleClassName="text-[11px]"
      fillHeight
    >
      <div className="bg-white px-2.5 py-1.5">
        <div
          className={`rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] leading-snug ${GIPSA_PAIRED_PANEL_SCROLL_CLASS}`}
        >
          <span
            className={`whitespace-pre-wrap ${
              gipsaRemarksText ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {gipsaRemarksText || t("providerMaster.agreement.noGipsaRemarksAvailable")}
          </span>
        </div>
      </div>
    </ProviderSectionCard>
  );

  return (
    <div className="space-y-2">
      <ProviderSectionCard
        title={t("providerMaster.agreement.sections.basicDetails")}
        titleClassName="text-[11px]"
      >
        <div className="bg-white px-2.5 py-1.5">
          <div className="grid grid-cols-1 gap-x-3 gap-y-0 sm:grid-cols-2">
            <dl className="space-y-0">
              <DetailRow
                compact
                tone="slate"
                layout="inline"
                label={t("providerMaster.agreement.fields.agreementName")}
                value={displayOrDash(formatAgreementNameForDisplay(v.agreementName))}
              />
              <DetailRow
                compact
                tone="slate"
                layout="inline"
                label={t("providerMaster.agreement.fields.agreementVersion")}
                value={displayOrDash(v.agreementVersion)}
              />
            </dl>
            <dl className="space-y-0">  
              <DetailRow
                compact
                tone="slate"
                layout="inline"
                label={t("providerMaster.agreement.fields.agreementType")}
                value={displayOrDash(typeLabel)}
              />
              <DetailRow
                compact
                tone="slate"
                layout="inline"
                label={t("providerMaster.common.status")}
                value={displayOrDash(v.status)}
              />
            </dl>
          </div>
        </div>
      </ProviderSectionCard>

      {renderAgreementFormViewLayout(showGipsaRemarksBesideScope, showRemarksBesideScope, {
        termsSectionCard,
        scopeSectionCard,
        documentSectionCard,
        remarksSectionCard,
        gipsaRemarksSectionCard,
      })}
    </div>
  );
}
