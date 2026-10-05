import { OfficeTypeBadge } from "./OfficeBadges";
import clsx from "clsx";

interface OfficeDetailsCardProps {
  officeType: "HO" | "RO" | "DO" | "UO" | "OTHER";
  level: number;
  typeConfig: {
    bg: string;
    border: string;
  };
}

export function OfficeDetailsCard({
  officeType,
  level,
  typeConfig,
}: Readonly<OfficeDetailsCardProps>) {
  return (
    <div
      className={clsx(
        "rounded-md p-2 border-2 transition-all shadow-sm h-full flex flex-col",
        typeConfig.bg,
        typeConfig.border
      )}
    >
      <h4 className="text-xs font-semibold text-foreground mb-1.5 pb-0.5 border-b border-border">
        Office Details
      </h4>
      <div className="space-y-1.5 text-xs mt-1.5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Type:</span>
          <OfficeTypeBadge type={officeType} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Level:</span>
          <span className="text-foreground font-semibold text-xs">
            L{level + 1}
          </span>
        </div>
      </div>
    </div>
  );
}

