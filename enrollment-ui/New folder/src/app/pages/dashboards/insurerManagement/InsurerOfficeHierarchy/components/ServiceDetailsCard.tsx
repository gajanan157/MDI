import { CalendarIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";

interface ServiceType {
  name: string;
  label: string;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
}

interface ServiceDetailsCardProps {
  servicing_allocation?: "corporate" | "retail" | "both";
  services?: ServiceType[];
  service_period?: string;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

export function ServiceDetailsCard({
  servicing_allocation,
  services,
  service_period,
  isExpanded: controlledExpanded,
  onToggle,
}: Readonly<ServiceDetailsCardProps>) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  
  const handleToggle = () => {
    const newExpanded = !isExpanded;
    if (onToggle) {
      onToggle(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  };

  const hasContent =
    servicing_allocation ||
    (services && services.filter((s) => s.enabled).length > 0) ||
    service_period;
  if (!hasContent) {
    return null;
  }

  return (
    <div className={clsx(
      "overflow-hidden flex flex-col transition-all duration-200 w-full",
      isExpanded 
        ? "bg-linear-to-br from-muted/50 to-muted/30 rounded-md border border-border shadow-sm p-1.5 h-full" 
        : "h-auto"
    )}>
      <div 
        className="flex items-center justify-between shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleToggle}
        title={isExpanded ? "Collapse" : "Expand"}
      >
        <h4 className="text-xs font-semibold text-foreground">Service Details</h4>
        <div className="flex h-4 w-4 items-center justify-center rounded hover:bg-muted/50 transition-colors shrink-0">
          <ChevronDownIcon
            className={clsx(
              "h-3 w-3 text-muted-foreground transition-transform duration-200",
              !isExpanded && "rotate-180"
            )}
          />
        </div>
      </div>
      {isExpanded && (
        <div className="overflow-y-auto space-y-1 text-xs mt-1 border-t border-border pt-1">
        {servicing_allocation && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground font-medium">Allocation:</span>
            <span
              className={clsx(
                "px-1 py-0.5 rounded text-xs font-medium capitalize",
                servicing_allocation === "corporate" &&
                  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                servicing_allocation === "retail" &&
                  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                servicing_allocation === "both" &&
                  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
              )}
            >
              {servicing_allocation}
            </span>
          </div>
        )}

        {/* Services with Start/End Dates */}
        {services && services.filter((s) => s.enabled).length > 0 ? (
          <div className="space-y-1">
            {services
              .filter((service) => service.enabled)
              .map((service, idx) => (
                <div
                  key={idx}
                  className="bg-background/50 rounded p-1 border border-border/50"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CalendarIcon className="h-2.5 w-2.5 text-primary shrink-0" />
                    <span className="text-foreground font-semibold text-xs">
                      {service.label}
                    </span>
                    {service.startDate && (
                      <>
                        <span className="text-muted-foreground text-xs">|</span>
                        <span className="text-muted-foreground text-[10px] font-medium">
                          Start:
                        </span>
                        <span className="text-foreground text-xs">
                          {new Date(service.startDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </>
                    )}
                    {service.endDate && (
                      <>
                        <span className="text-muted-foreground text-xs">|</span>
                        <span className="text-muted-foreground text-[10px] font-medium">
                          End:
                        </span>
                        <span className="text-foreground text-xs">
                          {new Date(service.endDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : service_period ? (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Period:</span>
            <span className="text-foreground font-semibold text-xs">
              {service_period}
            </span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-1">
            No service details
          </div>
        )}
        </div>
      )}
    </div>
  );
}

