import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import type { Control } from "react-hook-form";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import {
  getNetworkModeDateBounds,
  updateMasterFormExtra,
} from "../utils/addProviderMasterPageHelpers";
import {
  INSURER_PROVIDER_NETWORK_MODE_FIELDS,
  type NetworkModeField,
} from "../utils/insurerProviderNetworkModeFormConfig";
import type { MasterFormState } from "../utils/providerMasterFunctions";

type NetworkModeFieldsGridProps = {
  form: MasterFormState;
  setForm: React.Dispatch<React.SetStateAction<MasterFormState>>;
  control: Control<{
    insurerProviderNetworkModeType: string;
    insurerProviderNetworkTariffType: string;
    insurerId: string;
    recordStatus: string;
  }>;
  insurerOptions: Array<{ label: string; value: string }>;
  selectLabel: string;
  effectiveFrom: string;
  effectiveTo: string;
};

function renderNetworkModeField(
  field: NetworkModeField,
  props: NetworkModeFieldsGridProps,
) {
  const { form, setForm, control, insurerOptions, selectLabel, effectiveFrom, effectiveTo } =
    props;
  const fieldValue = form.extra[field.name];

  if (field.type === "checkbox") {
    return (
      <label
        key={field.name}
        className="flex min-h-9 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
      >
        <input
          type="checkbox"
          checked={Boolean(fieldValue)}
          onChange={(event) =>
            updateMasterFormExtra(setForm, field.name, event.target.checked)
          }
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="input-label font-normal text-black">
          {field.label}
          {field.required ? " *" : ""}
        </span>
      </label>
    );
  }

  if (field.type === "dropdown") {
    const options =
      field.dynamicOptions === "insurer" ? insurerOptions : (field.options ?? []);
    return (
      <div key={field.name} className="block">
        <DropdownSelect
          control={control}
          name={field.name}
          label={field.label}
          options={options}
          defaultValue={selectLabel}
          value={String(fieldValue ?? "")}
          isRequired={field.required}
          onChange={(value) => updateMasterFormExtra(setForm, field.name, String(value))}
          className="text-xs"
        />
      </div>
    );
  }

  if (field.type === "date") {
    const bounds = getNetworkModeDateBounds(field.name, effectiveFrom, effectiveTo);
    return (
      <ProviderDatePicker
        key={field.name}
        label={field.label}
        isRequired={field.required}
        value={String(fieldValue ?? "").trim().slice(0, 10)}
        max={bounds.max}
        min={bounds.min}
        onChange={(event) => updateMasterFormExtra(setForm, field.name, event.target.value)}
      />
    );
  }

  return (
    <Input
      key={field.name}
      label={field.label}
      isRequired={field.required}
      value={String(fieldValue ?? "")}
      onChange={(event) => updateMasterFormExtra(setForm, field.name, event.target.value)}
    />
  );
}

export default function NetworkModeFieldsGrid(props: NetworkModeFieldsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
      {INSURER_PROVIDER_NETWORK_MODE_FIELDS.map((field) =>
        renderNetworkModeField(field, props),
      )}
    </div>
  );
}
