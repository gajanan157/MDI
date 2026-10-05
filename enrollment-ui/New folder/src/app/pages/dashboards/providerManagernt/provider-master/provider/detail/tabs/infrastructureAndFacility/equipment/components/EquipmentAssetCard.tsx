import { useState } from "react";
import {
  ChevronDownIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  equipmentAssetAlerts,
  equipmentAssetRowWarning,
  formatDisplayDate,
} from "../utils/equipmentAssetFormMapper";
import {
  EQUIPMENT_OPERATIONAL_STATUS_OPTIONS,
  type EquipmentAssetFormRow,
} from "../utils/equipmentAssetTypes";
import {
  DateField,
  GroupLabel,
  NumberField,
  SelectField,
  TextField,
  ToggleField,
} from "./EquipmentAssetFields";

type EquipmentAssetCardProps = {
  row: EquipmentAssetFormRow;
  isEditMode: boolean;
  defaultOpen?: boolean;
  onChange: (rowKey: string, patch: Partial<EquipmentAssetFormRow>) => void;
  onRemove: (rowKey: string) => void;
};

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Inactive: "bg-slate-100 text-slate-600 ring-slate-200",
  "Under Maintenance": "bg-amber-50 text-amber-700 ring-amber-200",
};

export function EquipmentAssetCard({
  row,
  isEditMode,
  defaultOpen = false,
  onChange,
  onRemove,
}: Readonly<EquipmentAssetCardProps>) {
  const [open, setOpen] = useState(defaultOpen || isEditMode);
  const expanded = isEditMode || open;

  const set = (patch: Partial<EquipmentAssetFormRow>) => onChange(row.rowKey, patch);
  const alerts = equipmentAssetAlerts(row);
  const warning = equipmentAssetRowWarning(row);
  const statusClass =
    STATUS_STYLES[row.operationalStatus] ?? "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-2 px-2.5 py-1.5">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary-50 text-primary-600">
          <CpuChipIcon className="h-4 w-4" />
        </span>

        <button
          type="button"
          onClick={() => !isEditMode && setOpen((prev) => !prev)}
          className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left"
        >
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[12.5px] font-bold text-slate-900">
              {row.equipmentType || "New equipment"}
            </span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide ring-1 ${statusClass}`}
            >
              {row.operationalStatus || "—"}
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-x-2 text-[10.5px] text-slate-500">
            <span>SN: {row.serialNumber || "—"}</span>
            <span className="text-slate-300">•</span>
            <span>Model: {row.modelNumber || "—"}</span>
            <span className="text-slate-300">•</span>
            <span>Qty: {row.quantity || "—"}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          {alerts.map((alert) => (
            <span
              key={alert.label}
              className={`hidden items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold sm:inline-flex ${
                alert.level === "danger"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <ExclamationTriangleIcon className="h-3 w-3" />
              {alert.label}
            </span>
          ))}
          {isEditMode ? (
            <button
              type="button"
              aria-label="Remove equipment"
              onClick={() => onRemove(row.rowKey)}
              className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          ) : (
            <ChevronDownIcon
              className={`h-4 w-4 text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className="flex flex-wrap gap-1 px-2.5 pb-1.5 sm:hidden">
          {alerts.map((alert) => (
            <span
              key={alert.label}
              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold ${
                alert.level === "danger"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <ExclamationTriangleIcon className="h-3 w-3" />
              {alert.label}
            </span>
          ))}
        </div>
      ) : null}

      {expanded ? (
        <div className="border-t border-slate-100 bg-slate-50/60 px-2.5 py-2">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4">
            <GroupLabel>Identification</GroupLabel>
            <SelectField
              label="Equipment type"
              value={row.equipmentType}
              options={row.equipmentType ? [row.equipmentType] : [""]}
              onChange={(value) => set({ equipmentType: value })}
              readOnly
            />
            <TextField
              label="Serial number"
              value={row.serialNumber}
              onChange={(value) => set({ serialNumber: value })}
              readOnly={!isEditMode}
              placeholder="Manufacturer serial no."
            />
            <TextField
              label="Model number"
              value={row.modelNumber}
              onChange={(value) => set({ modelNumber: value })}
              readOnly={!isEditMode}
            />
            <NumberField
              label="Quantity"
              value={row.quantity}
              onChange={(value) => set({ quantity: value })}
              readOnly={!isEditMode}
            />

            <GroupLabel>Status &amp; lifecycle</GroupLabel>
            <SelectField
              label="Operational status"
              value={row.operationalStatus}
              options={EQUIPMENT_OPERATIONAL_STATUS_OPTIONS}
              onChange={(value) => set({ operationalStatus: value })}
              readOnly={!isEditMode}
            />
            <DateField
              label="Purchase date"
              value={row.purchaseDate}
              displayValue={formatDisplayDate(row.purchaseDate)}
              onChange={(value) => set({ purchaseDate: value })}
              readOnly={!isEditMode}
            />
            <DateField
              label="Installation date"
              value={row.installationDate}
              displayValue={formatDisplayDate(row.installationDate)}
              onChange={(value) => set({ installationDate: value })}
              readOnly={!isEditMode}
            />
            <DateField
              label="Licence valid to"
              value={row.validTo}
              displayValue={formatDisplayDate(row.validTo)}
              onChange={(value) => set({ validTo: value })}
              readOnly={!isEditMode}
            />

            <GroupLabel>Annual maintenance contract (AMC)</GroupLabel>
            <ToggleField
              label="Under AMC"
              checked={row.amcFlag}
              onChange={(checked) => set({ amcFlag: checked })}
              readOnly={!isEditMode}
            />
            <DateField
              label="AMC valid from"
              value={row.amcValidFrom}
              displayValue={formatDisplayDate(row.amcValidFrom)}
              onChange={(value) => set({ amcValidFrom: value })}
              readOnly={!isEditMode}
              disabled={!row.amcFlag}
            />
            <DateField
              label="AMC valid to"
              value={row.amcValidTo}
              displayValue={formatDisplayDate(row.amcValidTo)}
              onChange={(value) => set({ amcValidTo: value })}
              readOnly={!isEditMode}
              disabled={!row.amcFlag}
            />
            <div className="hidden lg:block" />

            <GroupLabel>Calibration &amp; maintenance</GroupLabel>
            <ToggleField
              label="Calibration required"
              checked={row.calibrationRequiredFlag}
              onChange={(checked) => set({ calibrationRequiredFlag: checked })}
              readOnly={!isEditMode}
            />
            <DateField
              label="Last calibration"
              value={row.lastCalibrationDate}
              displayValue={formatDisplayDate(row.lastCalibrationDate)}
              onChange={(value) => set({ lastCalibrationDate: value })}
              readOnly={!isEditMode}
              disabled={!row.calibrationRequiredFlag}
            />
            <DateField
              label="Next calibration"
              value={row.nextCalibrationDate}
              displayValue={formatDisplayDate(row.nextCalibrationDate)}
              onChange={(value) => set({ nextCalibrationDate: value })}
              readOnly={!isEditMode}
              disabled={!row.calibrationRequiredFlag}
            />
            <DateField
              label="Maintenance due"
              value={row.maintenanceDueDate}
              displayValue={formatDisplayDate(row.maintenanceDueDate)}
              onChange={(value) => set({ maintenanceDueDate: value })}
              readOnly={!isEditMode}
            />

            <GroupLabel>Documentation</GroupLabel>
            <div className="col-span-2 sm:col-span-1">
              <TextField
                label="Supporting document"
                value={row.supportingDocument}
                onChange={(value) => set({ supportingDocument: value })}
                readOnly={!isEditMode}
                placeholder="File name / reference"
              />
            </div>
            <div className="col-span-2 sm:col-span-2 lg:col-span-3">
              <TextField
                label="Remarks"
                value={row.remarks}
                onChange={(value) => set({ remarks: value })}
                readOnly={!isEditMode}
              />
            </div>
          </div>

          {warning ? (
            <p className="mt-2 flex items-center gap-1 text-[10.5px] font-medium text-amber-700">
              <ExclamationTriangleIcon className="h-3.5 w-3.5" />
              {warning}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
