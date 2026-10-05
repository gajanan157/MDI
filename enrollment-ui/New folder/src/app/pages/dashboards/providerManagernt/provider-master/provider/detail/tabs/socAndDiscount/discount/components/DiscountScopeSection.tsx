import clsx from "clsx";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { DiscountSectionCard } from "./DiscountSectionCard";
import { DiscountCorporateScopeSection } from "./DiscountCorporateScopeSection";
import { DiscountServiceTypeOption } from "./DiscountIpdOpdExclusiveCheckboxes";
import { DiscountScopeTopRowField } from "./DiscountScopeTopRowField";
import type { DiscountCorporateNamedItem, DiscountFormValues } from "../types/discountTypes";
import type { DiscountAgreementOption } from "../hooks/useDiscountFormOptions";
import { isDiscountCorporateStepHidden } from "../../../agreement/utils/agreementHelpers";
import {
  DISCOUNT_COMPACT_INPUT_CLASSNAMES,
  DISCOUNT_COMPACT_SUBSECTION_CLASS,
  DISCOUNT_FIELD_CONTROL_CLASS,
  DISCOUNT_SCOPE_CONTROL_SLOT_CLASS,
  DISCOUNT_SCOPE_DROPDOWN_FORM_CLASS,
  DISCOUNT_SCOPE_FIELD_LABEL_CLASS,
  DISCOUNT_SCOPE_TOP_ROW_GRID_CLASS,
  DISCOUNT_SECTION_BODY_CLASS,
} from "../utils/discountConfig";

type DiscountScopeSectionProps = {
  form: UseFormReturn<DiscountFormValues>;
  values: DiscountFormValues;
  agreementOptions: DiscountAgreementOption[];
  applyAgreementSelection: (agreementId: string) => void;
  agreementDisabled?: boolean;
  insurerOptions: { value: string; label: string }[];
  effectiveInsurerIds: string[];
  optionsByInsurerId: Record<string, { value: string; label: string }[]>;
  labelOf: (options: { value: string; label: string }[], value: string) => string;
  onInsurerSelectionChange: (insurerIds: string[]) => void;
  syncCorporateInsurersFromInsuranceCo: (insurerIds: string[]) => void;
  onClearIpd?: () => void;
  onClearOpd?: () => void;
  namedCorporates?: DiscountCorporateNamedItem[];
  namedInsurers?: { id: string; name: string }[];
};

export function DiscountScopeSection({
  form,
  values,
  agreementOptions,
  applyAgreementSelection,
  agreementDisabled = false,
  insurerOptions,
  effectiveInsurerIds,
  optionsByInsurerId,
  labelOf,
  onInsurerSelectionChange,
  syncCorporateInsurersFromInsuranceCo,
  onClearIpd,
  onClearOpd,
  namedCorporates = [],
  namedInsurers = [],
}: Readonly<DiscountScopeSectionProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const hideCorporateStep = isDiscountCorporateStepHidden(values.agreementName);

  return (
    <DiscountSectionCard
      title={t(`${D}.sections.scope`)}
      bodyClassName={DISCOUNT_SECTION_BODY_CLASS}
    >
      <div className={DISCOUNT_SCOPE_TOP_ROW_GRID_CLASS}>
        <DiscountScopeTopRowField
          label={t(`${D}.fields.agreementName`)}
          controlId="agreementId"
          required
        >
          <DropdownSelect
            name="agreementId"
            name_key="agreementId"
            control={form.control}
            options={agreementOptions}
            isRequired
            disabled={agreementDisabled}
            defaultValue={t(`${D}.fields.selectAgreementName`)}
            className={DISCOUNT_FIELD_CONTROL_CLASS}
            formClassName={`${DISCOUNT_SCOPE_DROPDOWN_FORM_CLASS} [&_.select-form__option]:!h-auto [&_.select-form__option]:!py-1.5`}
            menuPlacement="auto"
            onChange={(value) => {
              applyAgreementSelection(String(value ?? ""));
            }}
          />
        </DiscountScopeTopRowField>

        <DiscountScopeTopRowField
          label={t(`${D}.fields.agreementType`)}
          controlId="discount-agreement-type"
        >
          <Input
            id="discount-agreement-type"
            value={values.agreementType}
            readOnly
            disabled
            className={DISCOUNT_FIELD_CONTROL_CLASS}
            classNames={DISCOUNT_COMPACT_INPUT_CLASSNAMES}
            placeholder={t(`${D}.fields.agreementTypeFromAgreement`)}
          />
        </DiscountScopeTopRowField>

        <div className="flex w-full min-w-0 flex-col sm:col-span-2 lg:col-span-2">
          {!values.ipdEnabled && !values.opdEnabled ? (
            <p
              className={clsx(DISCOUNT_SCOPE_FIELD_LABEL_CLASS, "!text-red-600")}
              role="alert"
            >
              {t(`${D}.fields.selectServiceType`)}
            </p>
          ) : (
            <span
              className={clsx(DISCOUNT_SCOPE_FIELD_LABEL_CLASS, "invisible select-none")}
              aria-hidden
            >
              &nbsp;
            </span>
          )}
          <div className="grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-2">
            <div className={DISCOUNT_SCOPE_CONTROL_SLOT_CLASS}>
              <DiscountServiceTypeOption
                form={form}
                kind="ipd"
                ipdEnabled={!!values.ipdEnabled}
                opdEnabled={!!values.opdEnabled}
                onClearIpd={onClearIpd}
                onClearOpd={onClearOpd}
              />
            </div>
            <div className={DISCOUNT_SCOPE_CONTROL_SLOT_CLASS}>
              <DiscountServiceTypeOption
                form={form}
                kind="opd"
                ipdEnabled={!!values.ipdEnabled}
                opdEnabled={!!values.opdEnabled}
                onClearIpd={onClearIpd}
                onClearOpd={onClearOpd}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-2 border-t border-gray-200 pt-2 ${DISCOUNT_COMPACT_SUBSECTION_CLASS}`}>
        <DiscountCorporateScopeSection
          form={form}
          values={values}
          hideCorporateStep={hideCorporateStep}
          insurerOptions={insurerOptions}
          effectiveInsurerIds={effectiveInsurerIds}
          optionsByInsurerId={optionsByInsurerId}
          labelOf={labelOf}
          onInsurerSelectionChange={onInsurerSelectionChange}
          syncCorporateInsurersFromInsuranceCo={syncCorporateInsurersFromInsuranceCo}
          namedCorporates={namedCorporates}
          namedInsurers={namedInsurers}
        />
      </div>
    </DiscountSectionCard>
  );
}

