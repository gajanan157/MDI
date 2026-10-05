import React from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import { BriefcaseIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { servicesList } from "./AddServiceModal";
import { formatServicingAllocation } from "./addOfficeFormHelpers";

type ServiceRecord = {
  serviceName: string;
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
  servicingAllocationFor?: string;
};

type OfficeServicesSectionProps = {
  title: string;
  addLabel: string;
  noDataLabel: string;
  bothAllocationLabel: string;
  readOnly: boolean;
  readOnlyClassName: string;
  servicesError: string | null;
  servicesData: ServiceRecord[];
  labels: {
    action: string;
    serviceName: string;
    startDate: string;
    endDate: string;
    servicingAllocation: string;
    edit: string;
    remove: string;
  };
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (serviceName: string) => void;
};

function getServiceLabel(name: string) {
  return servicesList.find((item) => item.name === name)?.label;
}

const OfficeServicesSection: React.FC<OfficeServicesSectionProps> = ({
  title,
  addLabel,
  noDataLabel,
  bothAllocationLabel,
  readOnly,
  readOnlyClassName,
  servicesError,
  servicesData,
  labels,
  onAdd,
  onEdit,
  onDelete,
}) => (
  <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
    <div className="bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2.5">
          <SectionTitle
            title={title}
            className="mb-0"
            icon={<BriefcaseIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
          />
          {servicesError && (
            <span className="input-text-error text-error dark:text-error-lighter mb-2 text-[11px]">
              ({servicesError})
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className={`mb-4 flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-600 ${readOnly ? "pointer-events-none opacity-50" : ""}`}
        >
          ➕ {addLabel}
        </button>
      </div>

      <div className="mt-4 hidden md:block">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left text-xs">{labels.action}</th>
              <th className="p-2 text-left text-xs">{labels.serviceName}</th>
              <th className="p-2 text-left text-xs">{labels.startDate}</th>
              <th className="p-2 text-left text-xs">{labels.endDate}</th>
              <th className="p-2 text-left text-xs">{labels.servicingAllocation}</th>
            </tr>
          </thead>
          <tbody>
            {servicesData.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-400">
                  {noDataLabel}
                </td>
              </tr>
            )}
            {servicesData.map((service, index) =>
              service.enabled ? (
                <tr key={service.serviceName} className="border-t capitalize">
                  <td className={`flex items-center gap-2 p-1 ${readOnlyClassName}`}>
                    <button
                      type="button"
                      onClick={() => onEdit(index)}
                      title={labels.edit}
                      className="text-blue-600"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(service.serviceName)}
                      title={labels.remove}
                      className="text-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="p-2 text-xs uppercase">
                    {getServiceLabel(service.serviceName) ?? "—"}
                  </td>
                  <td className="p-2 text-xs">{service.startDate}</td>
                  <td className="p-2 text-xs">{service.endDate}</td>
                  <td className="p-2 text-xs">
                    {formatServicingAllocation(service.servicingAllocationFor, bothAllocationLabel)}
                  </td>
                </tr>
              ) : null,
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 block md:hidden">
        {servicesData.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">{noDataLabel}</p>
        )}
        <div className="flex flex-col gap-3">
          {servicesData.map((service, index) =>
            service.enabled ? (
              <div key={service.serviceName} className="rounded-lg border p-4">
                <div className="flex justify-between">
                  <span>{labels.serviceName}</span>
                  <span>{getServiceLabel(service.serviceName) ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>{labels.startDate}</span>
                  <span>{service.startDate ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>{labels.endDate}</span>
                  <span>{service.endDate ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>{labels.servicingAllocation}</span>
                  <span>
                    {formatServicingAllocation(service.servicingAllocationFor, bothAllocationLabel) ?? "—"}
                  </span>
                </div>
                {!readOnly && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="text-blue-600" onClick={() => onEdit(index)}>
                      {labels.edit}
                    </button>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => onDelete(service.serviceName)}
                    >
                      {labels.remove}
                    </button>
                  </div>
                )}
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  </div>
);

export default OfficeServicesSection;
