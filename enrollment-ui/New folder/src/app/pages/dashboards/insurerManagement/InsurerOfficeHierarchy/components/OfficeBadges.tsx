import { memo } from "react";

interface OfficeBadgeProps {
  type: string;
}

export const OfficeTypeBadge = memo(({ type }: OfficeBadgeProps) => {
  const colorMap: Record<string, string> = {
    HO: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20",
    RO: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20",
    DO: "bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20",
    UO: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
    OTHER: "bg-muted text-muted-foreground border border-border"
  };
  
  return (
    <span className={`inline-flex rounded-full px-1.5 py-0.5 text-xs font-medium ${colorMap[type] || colorMap.OTHER}`}>
      {type}
    </span>
  );
});

OfficeTypeBadge.displayName = "OfficeTypeBadge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = memo(({ status }: StatusBadgeProps) => {
  const isActive = status === "active";
  
  return (
    <span className={`inline-flex rounded-full px-1.5 py-0.5 text-xs font-medium border ${
      isActive 
        ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20" 
        : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
    }`}>
      {status}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";
