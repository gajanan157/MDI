import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import type { Control } from "react-hook-form";
import {
  getIdentifierFieldValue,
  updateMasterFormExtra,
} from "../utils/addProviderMasterPageHelpers";
import { DISCOUNT_TYPE_SERVICE_TYPE_FIELD } from "../utils/discountTypeFormConfig";
import {
  DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD,
  DISCOUNT_SUBTYPE_TYPE_NAME_FIELD,
} from "../utils/discountSubtypeFormConfig";
import { DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD } from "../utils/discountInclusionExclusionFormConfig";
import {
  DEFAULT_VALUE_DATA_TYPE,
  IDENTIFIER_EXTRA_FIELDS,
} from "../utils/identifierTypeFormConfig";
import type { MasterFormState } from "../utils/providerMasterFunctions";
import type { ProviderMasterRecordStatus } from "../utils/masterConfig";

type DefaultMasterFieldsSectionProps = {
  form: MasterFormState;
  setForm: React.Dispatch<React.SetStateAction<MasterFormState>>;
  statusControl: Control<{ recordStatus: ProviderMasterRecordStatus }>;
  identifierControl: Control<{ valueDataType: string; identifierLevel: string }>;
  discountTypeControl: Control<{ providerDiscountTypeMasterId: string }>;
  inclusionExclusionTypeControl: Control<{ providerInclusionExclusionType: string }>;
  codeLabel: string;
  nameLabel: string;
  descriptionLabel: string;
  statusLabel: string;
  serviceTypeLabel: string;
  discountTypeLabel: string;
  inclusionExclusionTypeLabel: string;
  selectLabel: string;
  statusOptions: Array<{ label: string; value: string }>;
  discountTypeOptions: Array<{ label: string; value: string }>;
  inclusionExclusionTypeOptions: Array<{ label: string; value: string }>;
  isIdentifierTypeMaster: boolean;
  isDiscountTypeMaster: boolean;
  isDiscountSubtypeMaster: boolean;
  isDiscountInclusionExclusionMaster: boolean;
};

function IdentifierExtraFieldsGrid({
  form,
  setForm,
  identifierControl,
  selectLabel,
}: Pick<
  DefaultMasterFieldsSectionProps,
  "form" | "setForm" | "identifierControl" | "selectLabel"
>) {
  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-2 border-t border-gray-100 pt-2 sm:grid-cols-2 xl:grid-cols-4">
      {IDENTIFIER_EXTRA_FIELDS.map((field) => {
        if (field.type === "checkbox") {
          return (
            <label
              key={field.name}
              className="flex min-h-9 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={Boolean(form.extra[field.name])}
                onChange={(event) =>
                  updateMasterFormExtra(setForm, field.name, event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="input-label font-normal text-black">{field.label}</span>
            </label>
          );
        }

        if (field.type === "dropdown") {
          return (
            <div key={field.name} className="block">
              <DropdownSelect
                control={identifierControl}
                name={field.name}
                label={field.label}
                options={field.options ?? []}
                defaultValue={
                  field.name === "identifierLevel" ? selectLabel : undefined
                }
                value={getIdentifierFieldValue(field, form.extra, DEFAULT_VALUE_DATA_TYPE)}
                isRequired={field.required}
                onChange={(value) => updateMasterFormExtra(setForm, field.name, String(value))}
                className="text-xs"
              />
            </div>
          );
        }

        return (
          <Input
            key={field.name}
            label={field.label}
            isRequired={field.required}
            value={String(form.extra[field.name] ?? "")}
            onChange={(event) => updateMasterFormExtra(setForm, field.name, event.target.value)}
          />
        );
      })}
    </div>
  );
}

export default function DefaultMasterFieldsSection({
  form,
  setForm,
  statusControl,
  identifierControl,
  discountTypeControl,
  inclusionExclusionTypeControl,
  codeLabel,
  nameLabel,
  descriptionLabel,
  statusLabel,
  serviceTypeLabel,
  discountTypeLabel,
  inclusionExclusionTypeLabel,
  selectLabel,
  statusOptions,
  discountTypeOptions,
  inclusionExclusionTypeOptions,
  isIdentifierTypeMaster,
  isDiscountTypeMaster,
  isDiscountSubtypeMaster,
  isDiscountInclusionExclusionMaster,
}: Readonly<DefaultMasterFieldsSectionProps>) {
  const usesDiscountLayout =
    isDiscountTypeMaster || isDiscountSubtypeMaster || isDiscountInclusionExclusionMaster;
  return (
    <>
      <div
        className={
          usesDiscountLayout
            ? "grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 xl:grid-cols-5"
            : "grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 xl:grid-cols-4"
        }
      >
        {isDiscountSubtypeMaster ? (
          <div className="block">
            <DropdownSelect
              control={discountTypeControl}
              name={DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD}
              label={discountTypeLabel}
              options={discountTypeOptions}
              defaultValue={selectLabel}
              value={String(form.extra[DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD] ?? "")}
              isRequired
              onChange={(value) => {
                const nextId = String(value);
                const selected = discountTypeOptions.find((option) => option.value === nextId);
                setForm((prev) => ({
                  ...prev,
                  extra: {
                    ...prev.extra,
                    [DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD]: nextId,
                    [DISCOUNT_SUBTYPE_TYPE_NAME_FIELD]: selected?.label ?? "",
                  },
                }));
              }}
              className="text-xs"
            />
          </div>
        ) : null}
        <Input
          label={codeLabel}
          value={form.code}
          isRequired={isIdentifierTypeMaster || usesDiscountLayout}
          onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
        />
        {isDiscountTypeMaster ? (
          <Input
            label={serviceTypeLabel}
            value={String(form.extra[DISCOUNT_TYPE_SERVICE_TYPE_FIELD] ?? "")}
            isRequired
            onChange={(event) =>
              updateMasterFormExtra(setForm, DISCOUNT_TYPE_SERVICE_TYPE_FIELD, event.target.value)
            }
          />
        ) : null}
        {isDiscountInclusionExclusionMaster ? (
          <div className="block">
            <DropdownSelect
              control={inclusionExclusionTypeControl}
              name={DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD}
              label={inclusionExclusionTypeLabel}
              options={inclusionExclusionTypeOptions}
              defaultValue={selectLabel}
              value={String(form.extra[DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD] ?? "")}
              isRequired
              onChange={(value) =>
                updateMasterFormExtra(
                  setForm,
                  DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD,
                  String(value),
                )
              }
              className="text-xs"
            />
          </div>
        ) : null}
        <Input
          label={nameLabel}
          value={form.name}
          isRequired={isIdentifierTypeMaster || usesDiscountLayout}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <Input
          label={descriptionLabel}
          value={form.description}
          isRequired={isIdentifierTypeMaster}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
        />
        <div className="block">
          <DropdownSelect
            control={statusControl}
            name="recordStatus"
            label={statusLabel}
            options={statusOptions}
            value={form.recordStatus}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                recordStatus: String(value) as ProviderMasterRecordStatus,
              }))
            }
            className="text-xs"
          />
        </div>
      </div>

      {isIdentifierTypeMaster && (
        <IdentifierExtraFieldsGrid
          form={form}
          setForm={setForm}
          identifierControl={identifierControl}
          selectLabel={selectLabel}
        />
      )}
    </>
  );
}
