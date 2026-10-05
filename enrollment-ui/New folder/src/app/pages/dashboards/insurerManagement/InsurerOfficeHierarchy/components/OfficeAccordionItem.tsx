import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { TreeConnectors } from "./TreeConnectors";
import { OfficeRowHeader } from "./OfficeRowHeader";
import { OfficeDetailsCard } from "./OfficeDetailsCard";
import { ServiceDetailsCard } from "./ServiceDetailsCard";
import { ContactInfoCard } from "./ContactInfoCard";
import { ContactPersonsCard } from "./ContactPersonsCard";

interface ServiceType {
  name: string;
  label: string;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  label?: string;
}

export type ServicingAllocation = "corporate" | "retail" | "both";
export interface OfficeAccordionItemProps {
  office: any;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

const getOfficeTypeConfig = (type: string) => {
  switch (type) {
    case "HO":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/20",
        border: "border-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        badge:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      };
    case "RO":
      return {
        bg: "bg-green-50 dark:bg-green-950/20",
        border: "border-green-200 dark:border-green-800",
        icon: "text-green-600 dark:text-green-400",
        badge:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      };
    case "DO":
      return {
        bg: "bg-purple-50 dark:bg-purple-950/20",
        border: "border-purple-200 dark:border-purple-800",
        icon: "text-purple-600 dark:text-purple-400",
        badge:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      };
    case "UO":
      return {
        bg: "bg-orange-50 dark:bg-orange-950/20",
        border: "border-orange-200 dark:border-orange-800",
        icon: "text-orange-600 dark:text-orange-400",
        badge:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-900/20",
        border: "border-gray-200 dark:border-gray-800",
        icon: "text-gray-600 dark:text-gray-400",
        badge: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
  }
};

export function OfficeAccordionItem({
  office,
  isExpanded,
  onToggle,
}: Readonly<OfficeAccordionItemProps>) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isServiceDetailsExpanded, setIsServiceDetailsExpanded] =
    useState(false);
  const typeConfig = getOfficeTypeConfig(office.office_type);

  const verticalLineLeft = office.level * 12 + 6; // ~connector column width per level + offset

  return (
    <div className="border-border/60 group relative border-b last:border-b-0">
      {office.hasChildren && isExpanded && (
        <div
          className="bg-primary/40 dark:bg-primary/30 absolute top-10 bottom-0 z-0 w-0.5"
          style={{ left: `${verticalLineLeft}px` }}
        />
      )}

      <div className="hover:bg-muted/40 bg-background/50 group-hover:bg-muted/50 relative z-10 flex min-h-[40px] min-w-0 items-center gap-1.5 overflow-hidden px-2 py-2 transition-all focus:outline-none focus-visible:outline-none active:outline-none sm:min-h-0 sm:gap-2 sm:px-2 sm:py-1.5">
        <TreeConnectors level={office.level} />
        <OfficeRowHeader
          officeName={office.office_name}
          officeType={office.office_type}
          level={office.level}
          parentName={office.parentName}
          city={office.city}
          state={office.state}
          contacts={office.contacts}
          effectiveFrom={office.effectiveFrom}
          effectiveTo={office.effectiveTo}
          hasChildren={office.hasChildren || false}
          isExpanded={isExpanded}
          onToggle={() => onToggle(office.id)}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsInfoOpen(!isInfoOpen);
          }}
          className={clsx(
            "border-border/50 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-all sm:h-6 sm:w-6",
            "hover:bg-primary/10 hover:border-primary/50 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0",
            isInfoOpen && "bg-primary/10 border-primary/50",
          )}
          title={isInfoOpen ? "Hide info" : "Show info"}
          aria-label={isInfoOpen ? "Hide details" : "Show details"}
        >
          <ChevronDownIcon
            className={clsx(
              "text-muted-foreground h-4 w-4 transition-transform duration-200 sm:h-3.5 sm:w-3.5",
              isInfoOpen && "text-primary rotate-180",
            )}
          />
        </button>
      </div>

      {isInfoOpen && (
        <div className="bg-muted/10 border-border/40 relative border-t px-2 pt-2 pb-3 sm:pt-1.5 sm:pb-2">
          <div
            className="bg-primary/30 dark:bg-primary/20 absolute top-0 bottom-0 w-0.5"
            style={{ left: `${verticalLineLeft}px` }}
          />
          <div
            className="pl-0"
          >
            {(() => {
              const hasServiceContent =
                office?.servicing_allocation ||
                (office.serviceTypes &&
                  Object.values(office.serviceTypes).filter(
                    (s: any) => s?.enabled,
                  ).length > 0) ||
                office.service_period;
              const servicesArray: ServiceType[] = Object.entries(
                office?.serviceTypes ?? {},
              )
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, service]: any) => service?.enabled)
                .map(([key, service]: any) => ({
                  name: key,
                  label: key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c: any) => c.toUpperCase()),
                  enabled: service.enabled,
                  startDate: service.startDate,
                  endDate: service.endDate,
                }));

              const gridCols = hasServiceContent
                ? isServiceDetailsExpanded
                  ? "lg:grid-cols-[100px_240px_1fr_250px] lg:gap-2 xl:grid-cols-[100px_240px_1fr_250px] xl:gap-2"
                  : "lg:grid-cols-[100px_240px_1fr_120px] lg:gap-2 xl:grid-cols-[100px_240px_1fr_120px] xl:gap-2"
                : "lg:grid-cols-[100px_240px_1fr] lg:gap-2 xl:grid-cols-[100px_240px_1fr] xl:gap-2";

              return (
                <div
                  className={clsx(
                    "grid w-full grid-cols-1 items-stretch gap-2 sm:grid-cols-2",
                    gridCols,
                  )}
                >
                  <div className="flex min-w-40">
                    <OfficeDetailsCard
                      officeType={office.office_type}
                      level={office.level}
                      typeConfig={typeConfig}
                    />
                  </div>

                  <div className="flex min-w-[180px]">
                    <ContactInfoCard
                      contactInfo={office.contactInfo}
                      phone={office.phone}
                      email={office.email}
                      city={office.city}
                      state={office.state}
                      address={office.address}
                      addressUse={office.addressUse}
                      addressType={office.addressType}
                    />
                  </div>

                  <div className="flex min-w-0 overflow-hidden">
                    <ContactPersonsCard contacts={office.contacts} />
                  </div>

                  {hasServiceContent && (
                    <div
                      className={clsx(
                        "flex",
                        isServiceDetailsExpanded
                          ? "min-w-[250px]"
                          : "min-w-[120px]",
                      )}
                    >
                      <ServiceDetailsCard
                        servicing_allocation={office.servicing_allocation}
                        services={servicesArray}
                        service_period={office.service_period}
                        isExpanded={isServiceDetailsExpanded}
                        onToggle={setIsServiceDetailsExpanded}
                      />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
