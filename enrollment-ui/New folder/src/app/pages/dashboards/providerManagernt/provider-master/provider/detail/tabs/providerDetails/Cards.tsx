import clsx from "clsx";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { FieldArrayWithId, UseFormReturn } from "react-hook-form";
import { Checkbox, Input, Textarea } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import { shiftProviderDate } from "@/app/pages/dashboards/providerManagernt/shared/dateFormat";
import {
  DETAIL_ROW_EMPTY_PLACEHOLDER,
  DetailRow,
  ProviderSectionCard,
} from "../../shared/DetailRow";
import type {
  CertificatesEditFormValues,
  ContactFormValues,
  GeneralInfoFormValues,
} from "../../schemas";
import type { ProviderDetailCertificate } from "../../../hospitalData";
import type { ProviderDetailsFromApi } from "../../utils/providerDetailSectionMerges";
import {
  CARE_TIER_OPTIONS,
  CERTIFICATE_STATUS_OPTIONS,
  getAddressViewFields,
  getProviderInformationViewFields,
  GRADE_OPTIONS,
  OWNERSHIP_TYPE_OPTIONS,
  PROVIDER_LOCATION_TYPE_OPTIONS,
  type DetailFieldConfig,
} from "./config";
import { createProviderDetailsFieldLabels } from "../../../../../shared/providerMasterI18n";
import { useProviderDetailsPincodeLookup } from "./useProviderDetailsPincodeLookup";
import {
  PROVIDER_SECTION_COLLAPSED_BODY_CLASS,
  PROVIDER_SECTION_EXPANDED_BODY_CLASS,
  PROVIDER_SECTION_INITIAL_CERTIFICATE_COUNT,
  PROVIDER_SECTION_INITIAL_FIELD_COUNT,
  getRenderableDetailFields,
  sliceDetailFieldsForSection,
} from "./config";
import type { ContactViewFields } from "./helpers";
import {
  buildTelephoneDisplay,
  createTelephoneChangeHandler,
  formatCertificateDisplayValue,
  formatCertificateDateDisplay,
  getCertificateStatusVariant,
  handleFaxInput,
  isClinicalEstablishmentCertificate,
  mergeCertificateTypeOptions,
} from "./helpers";
import { isSingleSpecialtyProviderCategory } from "./options";
import { viewProviderCertificate } from "./certificateDocumentApi";

function ProviderFormCheckboxField({
  label,
  registration,
}: Readonly<{
  label: string;
  registration: ReturnType<UseFormReturn<GeneralInfoFormValues>["register"]>;
}>) {
  return (
    <div className="min-w-0">
      <span
        className="input-label invisible block select-none font-medium text-black"
        aria-hidden="true"
      >
        Flags
      </span>
      <div className="mt-[3px] flex h-8 w-full items-center gap-4 rounded-md border border-slate-300 bg-white px-3">
        <Checkbox
          label={label}
          {...registration}
          classNames={{
            label: "cursor-pointer gap-2 !text-[11px] font-normal",
            labelText: "!text-[11px] font-normal text-black",
          }}
        />
      </div>
    </div>
  );
}

type ProviderCardProps = {
  title: string;
  children: ReactNode;
  isEditMode?: boolean;
  headerAction?: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function ProviderCard({
  title,
  children,
  isEditMode = false,
  headerAction,
  className,
  bodyClassName,
}: Readonly<ProviderCardProps>) {
  return (
    <div
      className={clsx(
        "min-w-0 overflow-hidden rounded-lg border border-slate-300/90 bg-white shadow-sm ring-1 ring-slate-900/[0.06]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-300/80 bg-gradient-to-r from-slate-200 to-slate-300/70 px-2.5 py-1">
        <h3 className="text-[11px] font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        {headerAction}
      </div>
      <div
        className={clsx(
          isEditMode ? "bg-slate-100/55" : "bg-white",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

type DetailFieldGridProps = {
  fields: DetailFieldConfig[];
  /** When true, rows with no value are omitted (Provider Information, Address). */
  defaultHideWhenEmpty?: boolean;
};

export function DetailFieldGrid({
  fields,
  defaultHideWhenEmpty = false,
}: Readonly<DetailFieldGridProps>) {
  return (
    <>
      {fields.map((field) => (
        <DetailRow
          key={field.label}
          compact
          tone="slate"
          layout="inline"
          label={field.label}
          value={field.value}
          hideWhenEmpty={field.hideWhenEmpty ?? defaultHideWhenEmpty}
        />
      ))}
    </>
  );
}

export function ProviderSectionSeeMoreToggle({
  expanded,
  onToggle,
}: Readonly<{
  expanded: boolean;
  onToggle: () => void;
}>) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="text-primary-600 shrink-0 cursor-pointer text-[11px] font-medium hover:underline"
      onClick={onToggle}
    >
      {expanded
        ? t("providerMaster.agreement.seeLess")
        : t("providerMaster.agreement.seeMore")}
    </button>
  );
}

type ProviderCollapsibleSectionProps = {
  title: string;
  children: ReactNode | ((expanded: boolean) => ReactNode);
  hasMoreContent?: boolean;
  /** Grow to fill leftover space in a stretched column (e.g. Identifier / column balance). */
  fillColumn?: boolean;
  className?: string;
  bodyClassName?: string;
};

export function ProviderCollapsibleSection({
  title,
  children,
  hasMoreContent = false,
  fillColumn = false,
  className,
  bodyClassName,
}: Readonly<ProviderCollapsibleSectionProps>) {
  const [expanded, setExpanded] = useState(false);
  const stretchColumn = fillColumn && !expanded;
  const bodyClass = expanded
    ? PROVIDER_SECTION_EXPANDED_BODY_CLASS
    : PROVIDER_SECTION_COLLAPSED_BODY_CLASS;
  const content = typeof children === "function" ? children(expanded) : children;

  return (
    <ProviderSectionCard
      title={
        <div className="flex items-center justify-between gap-2">
          <span>{title}</span>
          {hasMoreContent ? (
            <ProviderSectionSeeMoreToggle
              expanded={expanded}
              onToggle={() => setExpanded((open) => !open)}
            />
          ) : null}
        </div>
      }
      fillHeight={stretchColumn}
      isExpanded={expanded}
      className={clsx(
        "w-full min-w-0",
        stretchColumn ? "flex h-full min-h-0 flex-1 flex-col" : "h-fit self-start",
        className,
      )}
      titleClassName="text-xs sm:text-[11px]"
    >
      <div
        className={clsx(
          "bg-white px-1.5 py-1.5 sm:px-2.5",
          stretchColumn && "flex min-h-0 flex-1 flex-col",
          bodyClass,
          bodyClassName,
        )}
      >
        {content}
      </div>
    </ProviderSectionCard>
  );
}

type DetailFieldsViewSectionProps = {
  title: string;
  fields: DetailFieldConfig[];
  defaultHideWhenEmpty?: boolean;
};

function DetailFieldsViewSection({
  title,
  fields,
  defaultHideWhenEmpty = false,
}: Readonly<DetailFieldsViewSectionProps>) {
  const renderableFieldCount = getRenderableDetailFields(
    fields,
    defaultHideWhenEmpty,
  ).length;
  const hasMoreContent = renderableFieldCount > PROVIDER_SECTION_INITIAL_FIELD_COUNT;

  return (
    <ProviderCollapsibleSection title={title} hasMoreContent={hasMoreContent}>
      {(expanded) => {
        const { visibleFields } = sliceDetailFieldsForSection(
          fields,
          expanded,
          defaultHideWhenEmpty,
          PROVIDER_SECTION_INITIAL_FIELD_COUNT,
        );
        return (
          <dl className="grid grid-cols-1 gap-x-3 gap-y-0 sm:grid-cols-2">
            <DetailFieldGrid
              fields={visibleFields}
              defaultHideWhenEmpty={defaultHideWhenEmpty}
            />
          </dl>
        );
      }}
    </ProviderCollapsibleSection>
  );
}

type ProviderInformationCardProps = {
  providerDetails: ProviderDetailsFromApi | null;
  generalInfoForm: UseFormReturn<GeneralInfoFormValues>;
  providerTypeOptions: Array<{ label: string; value: string }>;
  providerClassOptions: Array<{ label: string; value: string }>;
  clinicalSpecialtyOptions: Array<{ label: string; value: string }>;
  clinicalSpecialtyOptionsLoading?: boolean;
  systemOfMedicineOptions: Array<{ label: string; value: string }>;
  systemOfMedicineOptionsLoading?: boolean;
  isEditMode: boolean;
};

export function ProviderInformationCard({
  providerDetails,
  generalInfoForm,
  providerTypeOptions,
  providerClassOptions,
  clinicalSpecialtyOptions,
  systemOfMedicineOptions,
  systemOfMedicineOptionsLoading = false,
  clinicalSpecialtyOptionsLoading = false,
  isEditMode,
}: Readonly<ProviderInformationCardProps>) {
  const { t } = useTranslation();
  const labels = useMemo(() => createProviderDetailsFieldLabels(t), [t]);
  const viewFields = getProviderInformationViewFields(
    providerDetails,
    providerTypeOptions,
    providerClassOptions,
    clinicalSpecialtyOptions,
    t,
  );

  const providerCategoryValue = generalInfoForm.watch("providerClass");
  const clinicalSpecialtiesValue = generalInfoForm.watch("clinicalSpecialties");
  const isSingleSpecialtyCategory = isSingleSpecialtyProviderCategory(
    providerCategoryValue,
    providerClassOptions,
  );

  useEffect(() => {
    if (!isEditMode || !isSingleSpecialtyCategory) return;
    const selected = Array.isArray(clinicalSpecialtiesValue)
      ? clinicalSpecialtiesValue.map((id) => String(id).trim()).filter(Boolean)
      : [];
    if (selected.length <= 1) return;
    generalInfoForm.setValue("clinicalSpecialties", [selected[0]], {
      shouldDirty: true,
    });
    generalInfoForm.setValue("providerSubclass", selected[0], {
      shouldDirty: true,
    });
  }, [
    isEditMode,
    isSingleSpecialtyCategory,
    clinicalSpecialtiesValue,
    generalInfoForm,
  ]);

  const handleClinicalSpecialtiesChange = (
    value: string | number | (string | number)[],
  ) => {
    if (isSingleSpecialtyCategory) {
      const id = Array.isArray(value)
        ? String(value[0] ?? "").trim()
        : String(value ?? "").trim();
      generalInfoForm.setValue("clinicalSpecialties", id ? [id] : [], {
        shouldDirty: true,
      });
      generalInfoForm.setValue("providerSubclass", id, { shouldDirty: true });
      return;
    }

    const ids = Array.isArray(value) ? value.map((id) => String(id)) : [];
    generalInfoForm.setValue("providerSubclass", ids[0] ?? "", {
      shouldDirty: true,
    });
  };

  if (isEditMode) {
    return (
      <ProviderCard
        title={t("providerMaster.detailTabs.providerDetails.providerInformation")}
        isEditMode
        bodyClassName="grid grid-cols-1 gap-x-6 gap-y-2 px-2.5 py-2 sm:grid-cols-2"
      >
        <div className="min-w-0 space-y-1.5">
          <Input
            label={labels.providerName}
            {...generalInfoForm.register("providerName")}
            className="h-8 text-xs"
          />
         <DropdownSelect
            control={generalInfoForm.control}
            name="providerOwnershipType"
            label={labels.ownershipType}
            options={OWNERSHIP_TYPE_OPTIONS}
            defaultValue="Ownership Type"
            errors={generalInfoForm.formState.errors?.providerOwnershipType}
            formClassName=""
          />
          {/* <DropdownSelect
            control={generalInfoForm.control}
            name="category"
            label={labels.category}
            options={CATEGORY_OPTIONS}
            defaultValue="Category"
            errors={generalInfoForm.formState.errors?.category}
            formClassName=""
          /> */}
          <DropdownSelect
            control={generalInfoForm.control}
            name="providerInternalGrade"
            label={labels.grade}
            options={GRADE_OPTIONS}
            defaultValue="Grade"
            errors={generalInfoForm.formState.errors?.providerInternalGrade}
            formClassName=""
          />
           <DropdownSelect
            control={generalInfoForm.control}
            name="providerSystemOfMedicineId"
            label={labels.systemOfMedicine}
            options={systemOfMedicineOptions}
            defaultValue="Select"
            errors={generalInfoForm.formState.errors?.providerSystemOfMedicineId}
            formClassName=""
            disabled={systemOfMedicineOptionsLoading}
          />
          <DropdownSelect
            control={generalInfoForm.control}
            name="providerCareTier"
            label={labels.careTier}
            options={CARE_TIER_OPTIONS}
            defaultValue="Care Tier"
            errors={generalInfoForm.formState.errors?.providerCareTier}
            formClassName=""
          />
          {/* <Input
            label={labels.signatoryName}
            {...generalInfoForm.register("providerSignatoryName")}
            className="h-8 text-xs"
            classNames={{ root: "min-w-0" }}
          /> */}
          <Input
            label={labels.tpaServicingBranch}
            {...generalInfoForm.register("tpaServicingBranchName")}
            disabled
            className="h-8 text-xs"
            classNames={{ root: "min-w-0" }}
          />
           
        </div>
        <div className="min-w-0 space-y-1.5">
        <Input
            label={labels.providerCode}
            {...generalInfoForm.register("providerCode")}
            disabled
            className="h-8 text-xs"
          />
          
          <DropdownSelect
            control={generalInfoForm.control}
            name="providerType"
            label={labels.providerType}
            options={providerTypeOptions}
            defaultValue="Provider Type"
            disabled
            formClassName=""
          />
          <DropdownSelect
            control={generalInfoForm.control}
            name="providerClass"
            label={labels.providerCategory}
            options={providerClassOptions}
            defaultValue="Provider Category"
            errors={generalInfoForm.formState.errors?.providerClass}
            formClassName=""
          />
          <DropdownSelect
            control={generalInfoForm.control}
            name="clinicalSpecialties"
            label={labels.clinicalSpeciality}
            options={clinicalSpecialtyOptions}
            defaultValue={
              isSingleSpecialtyCategory ? "Select" : "Select one or more"
            }
            errors={generalInfoForm.formState.errors?.clinicalSpecialties}
            formClassName=""
            multiselect={!isSingleSpecialtyCategory}
            multiselectHorizontalScroll={!isSingleSpecialtyCategory}
            is_select_checkbox={!isSingleSpecialtyCategory}
            disabled={clinicalSpecialtyOptionsLoading}
            onChange={handleClinicalSpecialtiesChange}
          />
           <ProviderFormCheckboxField
            label={labels.dayCare}
            registration={generalInfoForm.register("providerDayCareFlag")}
          />
          {/* <Input
            label={labels.signatoryDesignation}
            {...generalInfoForm.register("providerSignatoryDesignation")}
            className="h-8 text-xs"
            classNames={{ root: "min-w-0" }}
          /> */}
          <Input
            label={labels.serviceEmail}
            {...generalInfoForm.register("tpaServicingBranchEmail")}
            error={generalInfoForm.formState.errors.tpaServicingBranchEmail?.message}
            className="h-8 text-xs"
            classNames={{ root: "min-w-0" }}
          />
           
         
        </div>
       
      </ProviderCard>
    );
  }

  return (
    <DetailFieldsViewSection
      title={t("providerMaster.detailTabs.providerDetails.providerInformation")}
      fields={viewFields}
      defaultHideWhenEmpty
    />
  );
}

type ProviderAddressCardProps = {
  providerDetails: ProviderDetailsFromApi | null;
  generalInfoForm: UseFormReturn<GeneralInfoFormValues>;
  isEditMode: boolean;
};

export function ProviderAddressCard({
  providerDetails,
  generalInfoForm,
  isEditMode,
}: Readonly<ProviderAddressCardProps>) {
  const { t } = useTranslation();
  const labels = useMemo(() => createProviderDetailsFieldLabels(t), [t]);
  const viewFields = getAddressViewFields(providerDetails, t);
  const { watch, setValue } = generalInfoForm;
  useProviderDetailsPincodeLookup(watch, setValue, isEditMode);

  if (isEditMode) {
    return (
      <ProviderCard title={t("providerMaster.detailTabs.providerDetails.addressDetails")} isEditMode bodyClassName="grid grid-cols-1 gap-x-6 gap-y-2 px-2.5 py-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Input
            label={labels.city}
            {...generalInfoForm.register("providerCity")}
            disabled
            className="h-8 text-xs"
          />
          <Input
            label={labels.state}
            {...generalInfoForm.register("providerStateName")}
            disabled
            className="h-8 text-xs"
          />
          <Input
            label={labels.pinCode}
            {...generalInfoForm.register("providerPostalCode")}
            error={generalInfoForm.formState.errors.providerPostalCode?.message}
            className="h-8 text-xs"
            inputMode="numeric"
            maxLength={6}
          />
          <DropdownSelect
            control={generalInfoForm.control}
            name="providerLocationType"
            label={labels.location}
            options={PROVIDER_LOCATION_TYPE_OPTIONS}
            defaultValue="Select"
            errors={generalInfoForm.formState.errors?.providerLocationType}
            className="h-[30px] text-xs"
            formClassName=""
          />
        </div>
        <div className="space-y-1.5">
          <Input
            label={labels.district}
            {...generalInfoForm.register("providerDistrict")}
            className="h-8 text-xs"
          />
          <Input
            label={labels.zone}
            {...generalInfoForm.register("providerZone")}
            className="h-8 text-xs"
          />
          <Textarea
            label={labels.address}
            {...generalInfoForm.register("providerAddress")}
            rows={4}
            classNames={{
              root: "min-w-0",
              input: "min-h-[4.5rem] resize-y",
            }}
          />
        </div>
      </ProviderCard>
    );
  }

  return <DetailFieldsViewSection title={t("providerMaster.detailTabs.providerDetails.addressDetails")} fields={viewFields} />;
}

function renderWebsiteUrlDetailValue(url: string): ReactNode {
  const u = url.trim();
  if (!u || u === "—") return "—";

  const href = /^https?:\/\//i.test(u) ? u : `https://${u}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-700 hover:text-primary-800 underline-offset-2 hover:underline"
    >
      {u}
    </a>
  );
}

type ProviderContactCardProps = {
  providerDetails: ProviderDetailsFromApi | null;
  contactForm: UseFormReturn<ContactFormValues>;
  contactViewFields: ContactViewFields;
  isEditMode: boolean;
};

export function ProviderContactCard({
  providerDetails,
  contactForm,
  contactViewFields,
  isEditMode,
}: Readonly<ProviderContactCardProps>) {
  const { t } = useTranslation();
  const labels = useMemo(() => createProviderDetailsFieldLabels(t), [t]);
  const contact = providerDetails?.providerContactDetail;
  const faxDisplay = (contact?.providerFaxNo ?? []).join(", ");
  const isWebsiteAvailableFlag = contact?.providerWebsiteAvailableFlag ?? false;
  const websiteUrl = contact?.providerWebsiteUrl ?? "";
  const stdCode = contactForm.watch("stdCode");
  const contactNumber = contactForm.watch("contactNumber");
  const isWebsiteAvailable = contactForm.watch("isWebsiteAvailable");
  const telephoneDisplay = buildTelephoneDisplay(stdCode, contactNumber);
  const handleTelephoneChange = useMemo(
    () => createTelephoneChangeHandler(contactForm.setValue),
    [contactForm.setValue],
  );

  if (!isEditMode) {
    return (
      <ProviderContactViewSection
        contactViewFields={contactViewFields}
        faxDisplay={faxDisplay}
        isWebsiteAvailableFlag={isWebsiteAvailableFlag}
        websiteUrl={websiteUrl}
      />
    );
  }

  return (
    <ProviderCard title={t("providerMaster.detailTabs.providerDetails.contactDetails")} isEditMode bodyClassName="min-w-0 space-y-1.5 px-2.5 py-1.5">
      <div className="grid min-w-0 grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-2">
          <Input
            label={labels.email}
            {...contactForm.register("contactEmail")}
            error={contactForm.formState.errors.contactEmail?.message}
            placeholder=""
            className="h-8 text-xs"
            classNames={{ root: "sm:col-span-2" }}
          />
          <Input
            label={labels.telePhoneNo}
            value={telephoneDisplay}
            onChange={handleTelephoneChange}
            placeholder=""
            className="h-8 text-xs"
            error={contactForm.formState.errors.contactNumber?.message}
          />
          <Input
            label={labels.faxNo}
            {...contactForm.register("faxNo")}
            placeholder=""
            className="h-8 text-xs"
            inputMode="tel"
            pattern="^[0-9,;\\s-]*$"
            onInput={handleFaxInput}
            error={contactForm.formState.errors.faxNo?.message}
          />
          <Input
            label={labels.mobNo}
            {...contactForm.register("mobNo")}
            placeholder=""
            className="h-8 text-xs"
            error={contactForm.formState.errors.mobNo?.message}
          />
          <Checkbox
            label={labels.websiteAvailable}
            {...contactForm.register("isWebsiteAvailable")}
            classNames={{ labelText: "text-xs font-medium text-slate-700" }}
          />
          {isWebsiteAvailable ? (
            <Input
              label={labels.websiteUrl}
              {...contactForm.register("websiteUrl")}
              error={contactForm.formState.errors.websiteUrl?.message}
              placeholder="https://"
              className="h-8 text-xs"
              classNames={{ root: "sm:col-span-2" }}
            />
          ) : null}
      </div>
    </ProviderCard>
  );
}

function ProviderContactViewSection({
  contactViewFields,
  faxDisplay,
  isWebsiteAvailableFlag,
  websiteUrl,
}: Readonly<{
  contactViewFields: ContactViewFields;
  faxDisplay: string;
  isWebsiteAvailableFlag: boolean;
  websiteUrl: string;
}>) {
  const { t } = useTranslation();
  const labels = useMemo(() => createProviderDetailsFieldLabels(t), [t]);
  return (
    <ProviderCollapsibleSection title={t("providerMaster.detailTabs.providerDetails.contactDetails")} hasMoreContent={false}>
      {() => (
        <div className="grid min-w-0 grid-cols-1 gap-x-3 gap-y-0 sm:grid-cols-2">
          <DetailRow
            compact
            tone="slate"
            layout="inline"
            valuePosition="leading"
            label={labels.email}
            value={contactViewFields.email}
            render={(email) => (
              <span className="block break-words">
                {email.trim() === "" ? DETAIL_ROW_EMPTY_PLACEHOLDER : email}
              </span>
            )}
          />
          <DetailRow
            compact
            tone="slate"
            layout="inline"
            valuePosition="leading"
            label={labels.telePhoneNo}
            value={contactViewFields.telePhone}
          />
          <DetailRow
            compact
            tone="slate"
            layout="inline"
            valuePosition="leading"
            label={labels.faxNo}
            value={faxDisplay}
          />
          <DetailRow
            compact
            tone="slate"
            layout="inline"
            valuePosition="leading"
            label={labels.mobNo}
            value={contactViewFields.mobNo}
          />
          <DetailRow
            compact
            tone="slate"
            layout="inline"
            valuePosition="leading"
            label={labels.websiteAvailable}
            value={isWebsiteAvailableFlag ? labels.yes : labels.no}
          />
          <DetailRow
            compact
            tone="slate"
            layout="inline"
            label={labels.websiteUrl}
            value={websiteUrl}
            render={renderWebsiteUrlDetailValue}
          />
        </div>
      )}
    </ProviderCollapsibleSection>
  );
}

const CERTIFICATE_CARD_CLASS =
  "border-l-primary-700 rounded-lg border border-l-[3px] border-slate-300/85 bg-white px-2 py-1.5 shadow-sm ring-1 ring-slate-900/[0.05]";

function CertificateViewButton({
  fileMetadataId,
  label,
  missingFileMessage,
}: Readonly<{
  fileMetadataId?: string | null;
  label: string;
  missingFileMessage: string;
}>) {
  return (
    <button
      type="button"
      onClick={() => {
        viewProviderCertificate(fileMetadataId, missingFileMessage).catch(
          () => undefined,
        );
      }}
      className="inline-flex items-center justify-center"
      aria-label={label}
      title={label}
    >
      <EyeIcon className="text-primary-600 h-4 w-4 cursor-pointer" aria-hidden />
    </button>
  );
}

const CERT_STATUS_NOT_REGISTERED_BADGE =
  "inline-flex max-w-full rounded-md bg-rose-100/90 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800 ring-1 ring-rose-300/80";

const CERT_STATUS_POSITIVE_BADGE =
  "inline-flex max-w-full rounded-md bg-emerald-100/90 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-900 ring-1 ring-emerald-300/80";

function CertificatesEmptyMessage() {
  const { t } = useTranslation();
  return (
    <p className="rounded-md border border-slate-300/80 bg-slate-200/40 px-2.5 py-2 text-xs text-slate-700">
      {t("providerMaster.detailTabs.providerDetails.noCertificateAvailable")}
    </p>
  );
}

function CertificateStatusDisplay({ raw }: Readonly<{ raw: string | undefined }>) {
  const { t } = useTranslation();
  const { variant, text } = getCertificateStatusVariant(raw);

  if (variant === "empty") {
    return (
      <span className={CERT_STATUS_NOT_REGISTERED_BADGE}>
        {t("providerMaster.detailTabs.providerDetails.notRegistered")}
      </span>
    );
  }
  if (variant === "positive") {
    return <span className={CERT_STATUS_POSITIVE_BADGE}>{text}</span>;
  }
  if (variant === "muted") {
    return <span className={CERT_STATUS_NOT_REGISTERED_BADGE}>{text}</span>;
  }
  return <span className="text-[11px] font-medium text-slate-900">{text}</span>;
}

function CertificateViewStat({
  label,
  children,
}: Readonly<{
  label: string;
  children: ReactNode;
}>) {
  const isPrimitive =
    typeof children === "string" || typeof children === "number";
  const asText = isPrimitive ? String(children).trim() : "";
  const isEmptyGlyph =
    isPrimitive && (asText === "—" || asText === "-" || asText === "");

  return (
    <div className="min-w-0">
      <div className="text-[11px] leading-tight font-medium text-slate-700">
        {label}
      </div>
      <div
        className={`mt-px min-w-0 text-[11px] leading-tight break-words ${
          isEmptyGlyph ? "text-slate-600" : "text-slate-900"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function CertificateViewCard({ cert }: Readonly<{ cert: ProviderDetailCertificate }>) {
  const { t } = useTranslation();
  const labels = useMemo(() => createProviderDetailsFieldLabels(t), [t]);
  const showRegistrationAct = isClinicalEstablishmentCertificate(cert.type);

  return (
    <div className={CERTIFICATE_CARD_CLASS}>
      <div className="space-y-0.5">
        <div className="flex items-center justify-end">
          <CertificateViewButton
            fileMetadataId={cert.fileMetadataId}
            label={labels.viewCertificate}
            missingFileMessage={t(
              "providerMaster.detailTabs.providerDetails.certificateFileNotAvailable",
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-x-2 gap-y-0.5 sm:grid-cols-2">
          <div
            className={clsx("min-w-0", !showRegistrationAct && "sm:col-span-2")}
          >
            <CertificateViewStat label={labels.certName}>
              {formatCertificateDisplayValue(cert.type)}
            </CertificateViewStat>
          </div>
          {showRegistrationAct ? (
            <div className="min-w-0">
              <CertificateViewStat label={labels.registrationAct}>
                {formatCertificateDisplayValue(cert.providerActName)}
              </CertificateViewStat>
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-x-2 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-4">
          <CertificateViewStat label={labels.registrationNo}>
            {formatCertificateDisplayValue(cert.registrationNo)}
          </CertificateViewStat>
          <CertificateViewStat label={labels.certStatus}>
            <CertificateStatusDisplay raw={cert.status} />
          </CertificateViewStat>
          <CertificateViewStat label={labels.certValidFrom}>
            {formatCertificateDateDisplay(cert.validFrom)}
          </CertificateViewStat>
          <CertificateViewStat label={labels.certValidTo}>
            {formatCertificateDateDisplay(cert.validTo)}
          </CertificateViewStat>
        </div>
      </div>
    </div>
  );
}

function CertificatesViewSection({
  certificates,
}: Readonly<{
  certificates: ProviderDetailCertificate[];
}>) {
  const { t } = useTranslation();
  const hasMoreContent =
    certificates.length > PROVIDER_SECTION_INITIAL_CERTIFICATE_COUNT;

  return (
    <ProviderCollapsibleSection
      title={t("providerMaster.detailTabs.providerDetails.certificates")}
      hasMoreContent={hasMoreContent}
    >
      {(expanded) => {
        if (certificates.length === 0) {
          return <CertificatesEmptyMessage />;
        }

        const visibleCertificates =
          expanded || !hasMoreContent
            ? certificates
            : certificates.slice(0, PROVIDER_SECTION_INITIAL_CERTIFICATE_COUNT);

        return (
          <div className="space-y-1">
            {visibleCertificates.map((cert) => (
              <CertificateViewCard
                key={cert.certificateId ?? cert.type}
                cert={cert}
              />
            ))}
          </div>
        );
      }}
    </ProviderCollapsibleSection>
  );
}

type CertificateEditForm = UseFormReturn<CertificatesEditFormValues>;

function CertificateEditCard({
  index,
  form,
  certificateTypeOptions,
  onRemove,
}: Readonly<{
  index: number;
  form: CertificateEditForm;
  certificateTypeOptions: Array<{ label: string; value: string }>;
  onRemove: () => void;
}>) {
  const { t } = useTranslation();
  const labels = useMemo(() => createProviderDetailsFieldLabels(t), [t]);
  const certType = form.watch(`items.${index}.type`);
  const certStatus = form.watch(`items.${index}.status`);
  const validFrom = form.watch(`items.${index}.validFrom`);
  const validTo = form.watch(`items.${index}.validTo`);
  const validFromMax = shiftProviderDate(validTo, -1);
  const validToMin = shiftProviderDate(validFrom, 1);
  const showRegistrationAct = isClinicalEstablishmentCertificate(certType);
  const mergedCertificateTypeOptions = mergeCertificateTypeOptions(
    certificateTypeOptions,
    certType,
  );
  const certificateStatusOptions = mergeCertificateTypeOptions(
    CERTIFICATE_STATUS_OPTIONS,
    certStatus,
  );
  const certificateId = String(
    form.watch(`items.${index}.certificateId`) ?? "",
  ).trim();
  const canRemove = certificateId === "";
  const itemErrors = form.formState.errors.items?.[index];

  return (
    <div className={CERTIFICATE_CARD_CLASS}>
      <Input
        type="hidden"
        unstyled
        classNames={{ root: "hidden" }}
        {...form.register(`items.${index}.certificateId`)}
      />
      <Input
        type="hidden"
        unstyled
        classNames={{ root: "hidden" }}
        {...form.register(`items.${index}.type`)}
      />
      <Input
        type="hidden"
        unstyled
        classNames={{ root: "hidden" }}
        {...form.register(`items.${index}.fileMetadataId`)}
      />
      <div className="space-y-1">
        <div className="flex items-center justify-end gap-1">
          <CertificateViewButton
            fileMetadataId={form.watch(`items.${index}.fileMetadataId`)}
            label={labels.viewCertificate}
            missingFileMessage={t(
              "providerMaster.detailTabs.providerDetails.certificateFileNotAvailable",
            )}
          />
          {canRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex h-6 w-6 items-center justify-center rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              aria-label={t("providerMaster.detailTabs.providerDetails.removeCertificate")}
              title={t("providerMaster.detailTabs.providerDetails.removeCertificate")}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-2">
          <div
            className={clsx(
              "min-w-0",
              !showRegistrationAct && "sm:col-span-2",
            )}
          >
            <DropdownSelect
              control={form.control}
              name={`items.${index}.type`}
              label={labels.certName}
              options={mergedCertificateTypeOptions}
              defaultValue="Select certificate name"
              errors={itemErrors?.type}
              className="h-[30px] text-xs"
            />
          </div>
          {showRegistrationAct ? (
            <div className="min-w-0">
              <Input
                label={labels.registrationAct}
                className="h-8 text-xs"
                {...form.register(`items.${index}.providerActName`)}
              />
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-2 md:grid-cols-4">
          <div className="min-w-0">
            <Input
              label={labels.registrationNo}
              className="h-8 text-xs"
              {...form.register(`items.${index}.registrationNo`)}
            />
          </div>
          <div className="min-w-0">
            <DropdownSelect
              control={form.control}
              name={`items.${index}.status`}
              label={labels.certStatus}
              options={certificateStatusOptions}
              defaultValue="Select"
              errors={itemErrors?.status}
              className="h-[30px] text-xs"
            />
          </div>
          <div className="min-w-0">
            <ProviderDatePicker
              label={labels.certValidFrom}
              control={form.control}
              name={`items.${index}.validFrom`}
              className="h-8 text-xs"
              max={validFromMax || undefined}
            />
          </div>
          <div className="min-w-0">
            <ProviderDatePicker
              label={labels.certValidTo}
              control={form.control}
              name={`items.${index}.validTo`}
              className="h-8 text-xs"
              min={validToMin || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CertificatesEditList({
  fields,
  form,
  certificateTypeOptions,
  onRemove,
}: Readonly<{
  fields: FieldArrayWithId<CertificatesEditFormValues, "items", "id">[];
  form: CertificateEditForm;
  certificateTypeOptions: Array<{ label: string; value: string }>;
  onRemove: (index: number) => void;
}>) {
  if (fields.length === 0) {
    return (
      <div className="bg-slate-100/55 px-2 py-1.5">
        <CertificatesEmptyMessage />
      </div>
    );
  }

  return (
    <div className="bg-slate-100/55 px-2 py-1.5">
      <div className="space-y-1.5">
        {fields.map((field, index) => (
          <CertificateEditCard
            key={field.id}
            index={index}
            form={form}
            certificateTypeOptions={certificateTypeOptions}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>
    </div>
  );
}

type ProviderCertificatesCardProps = {
  providerDetails: ProviderDetailsFromApi | null;
  isEditMode: boolean;
  certDynamicForm: UseFormReturn<CertificatesEditFormValues>;
  certEditFields: FieldArrayWithId<CertificatesEditFormValues, "items", "id">[];
  certificateTypeOptions: Array<{ label: string; value: string }>;
  onAppendCertificate: () => void;
  onRemoveCertificate: (index: number) => void;
};

export function ProviderCertificatesCard({
  providerDetails,
  isEditMode,
  certDynamicForm,
  certEditFields,
  certificateTypeOptions,
  onAppendCertificate,
  onRemoveCertificate,
}: Readonly<ProviderCertificatesCardProps>) {
  const { t } = useTranslation();
  if (isEditMode) {
    return (
      <ProviderCard
        title={t("providerMaster.detailTabs.providerDetails.certificates")}
        isEditMode
        headerAction={
          <button
            type="button"
            onClick={onAppendCertificate}
            className="border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100 inline-flex h-6 cursor-pointer items-center rounded-md border px-2.5 text-[10px] font-semibold"
          >
            + {t("providerMaster.button.add")}
          </button>
        }
      >
        <CertificatesEditList
          fields={certEditFields}
          form={certDynamicForm}
          certificateTypeOptions={certificateTypeOptions}
          onRemove={onRemoveCertificate}
        />
      </ProviderCard>
    );
  }

  return (
    <CertificatesViewSection certificates={providerDetails?.certificates ?? []} />
  );
}
