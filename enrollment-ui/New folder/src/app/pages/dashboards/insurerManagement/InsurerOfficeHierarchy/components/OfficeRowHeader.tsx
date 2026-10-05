import {
  ChevronDownIcon,
  ChevronRightIcon,
  MapPinIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { OfficeTypeBadge } from "./OfficeBadges";

interface ContactPerson {
  name: string;
  email?: string;
  phone?: string;
  designation?: string;
}

interface OfficeRowHeaderProps {
  officeName: string;
  officeType: "HO" | "RO" | "DO" | "UO" | "OTHER";
  level: number;
  parentName?: string;
  city?: string;
  state?: string;
  contacts?: ContactPerson[];
  effectiveFrom?: string;
  effectiveTo?: string;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export function OfficeRowHeader({
  officeName,
  officeType,
  level,
  parentName,
  city,
  state,
  contacts,
  effectiveFrom,
  effectiveTo,
  hasChildren,
  isExpanded,
  onToggle,
}: Readonly<OfficeRowHeaderProps>) {
  // Indent per level (8px keeps nesting readable on mobile without overflow)
  const indentPx = level * 8;

  return (
    <div
      className="flex-1 min-w-0 cursor-pointer focus:outline-none active:outline-none focus-visible:outline-none py-0.5"
      onClick={() => {
        if (hasChildren) {
          onToggle();
        }
      }}
      onFocus={(e) => e.target.blur()}
      tabIndex={-1}
    >
      {/* Mobile: stacked layout for clarity; Desktop: single flex row */}
      <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        {/* Row 1: Chevron + Name + Badge (always) */}
        <div className="flex min-w-0 items-center gap-2">
          {hasChildren && (
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors sm:w-5 sm:h-5 touch-manipulation">
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-primary font-semibold sm:h-3 sm:w-3" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-muted-foreground sm:h-3 sm:w-3" />
              )}
            </div>
          )}
          {!hasChildren && (
            <div className="h-8 w-8 flex items-center justify-center sm:h-5 sm:w-5 shrink-0">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 border border-border" />
            </div>
          )}
          <h3
            className="font-semibold text-sm text-foreground min-w-0 break-words sm:truncate sm:text-xs"
            style={{ marginLeft: level > 0 ? `${indentPx}px` : undefined }}
            title={officeName}
          >
            {officeName}
          </h3>
          <OfficeTypeBadge type={officeType} />
        </div>

        {/* Row 2 (mobile) / inline (desktop): Under parent */}
        {parentName && (
          <span className="text-xs text-muted-foreground pl-10 sm:pl-0">
            Under: <span className="font-medium">{parentName}</span>
          </span>
        )}

        {/* Row 3 (mobile) / inline (desktop): Location */}
        {(city || state) && (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0 pl-10 sm:pl-0">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="break-words">
              {city && state ? `${city}, ${state}` : city || state}
            </span>
          </span>
        )}

        {/* Row 4 (mobile) / inline (desktop): Contact(s) */}
        {contacts && contacts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pl-10 sm:pl-0">
            {contacts[0] && (
              <span className="text-xs text-foreground font-medium inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 max-w-full">
                <UserIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate min-w-0">{contacts[0].name}</span>
                {contacts[0].designation && (
                  <span className="text-muted-foreground font-normal truncate max-w-[100px] sm:max-w-none" title={contacts[0].designation}>
                    ({contacts[0].designation})
                  </span>
                )}
              </span>
            )}
            {contacts.length > 1 && (
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <UserIcon className="h-3.5 w-3.5 shrink-0" />
                +{contacts.length - 1} more
              </span>
            )}
          </div>
        )}

        {/* Dates */}
        {(effectiveFrom || effectiveTo) && (
          <span className="text-xs text-muted-foreground truncate pl-10 sm:pl-0 sm:order-last" style={indentPx > 0 ? { paddingLeft: `calc(2.5rem + ${indentPx}px)` } : undefined}>
            {effectiveFrom && effectiveTo
              ? `${effectiveFrom} - ${effectiveTo}`
              : effectiveFrom || effectiveTo}
          </span>
        )}
      </div>
    </div>
  );
}

