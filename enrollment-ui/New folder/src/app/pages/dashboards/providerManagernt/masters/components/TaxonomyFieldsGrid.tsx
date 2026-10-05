import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import type { Control } from "react-hook-form";
import {
  getTaxonomyFieldValue,
  TAXONOMY_FIELDS,
  updateMasterFormExtra,
} from "../utils/addProviderMasterPageHelpers";
import { DEFAULT_TAXONOMY_IS_ACTIVE } from "../utils/taxonomyFormConfig";
import type { MasterFormState } from "../utils/providerMasterFunctions";

type TaxonomyFieldsGridProps = {
  form: MasterFormState;
  setForm: React.Dispatch<React.SetStateAction<MasterFormState>>;
  control: Control<{
    is_active: string;
    provider_type_scope: string;
  }>;
  selectLabel: string;
};

export default function TaxonomyFieldsGrid({
  form,
  setForm,
  control,
  selectLabel,
}: Readonly<TaxonomyFieldsGridProps>) {
  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
      {TAXONOMY_FIELDS.map((field) =>
        field.type === "dropdown" ? (
          <div key={field.name} className="block">
            <DropdownSelect
              control={control}
              name={field.name}
              label={field.label}
              options={field.options ?? []}
              defaultValue={
                field.name === "provider_type_scope" ? selectLabel : undefined
              }
              value={getTaxonomyFieldValue(
                field.name,
                form.extra,
                DEFAULT_TAXONOMY_IS_ACTIVE,
              )}
              isRequired={field.required}
              onChange={(value) => updateMasterFormExtra(setForm, field.name, String(value))}
              className="text-xs"
            />
          </div>
        ) : (
          <Input
            key={field.name}
            label={field.label}
            isRequired={field.required}
            value={String(form.extra[field.name] ?? "")}
            onChange={(event) => updateMasterFormExtra(setForm, field.name, event.target.value)}
          />
        ),
      )}
    </div>
  );
}
