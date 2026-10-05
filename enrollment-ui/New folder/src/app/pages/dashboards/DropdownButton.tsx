import React, { useState, useRef, useEffect } from "react";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";

export interface DropdownItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface DropdownButtonProps {
  buttonLabel: string;
  items: DropdownItem[];
  disabled?: boolean;
  title?: string;
  pending?: boolean;
  pendingLabel?: string;
  /** `sm` matches provider toolbar buttons (`h-8`); `md` is the default enrollment size. */
  size?: "sm" | "md";
  className?: string;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  buttonLabel,
  items,
  disabled = false,
  title,
  pending = false,
  pendingLabel = "Exporting…",
  size = "md",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = pending ? pendingLabel : buttonLabel;
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="relative inline-block" ref={dropdownRef} title={title}>
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => {
          if (disabled || pending) return;
          setOpen(!open);
        }}
        className={twMerge(
          "flex items-center gap-2 rounded-lg font-semibold shadow-md transition",
          size === "sm"
            ? "h-8 px-4 py-0 text-xs shadow-sm"
            : "px-6 py-2 text-xs",
          disabled || pending
            ? "cursor-not-allowed bg-gray-300 text-gray-500"
            : "cursor-pointer bg-green-600 text-white hover:bg-green-700",
          className,
        )}
      >
        <ArrowDownTrayIcon className={iconClass} />
        {displayLabel}
        <ChevronDownIcon
          className={`${iconClass} transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && !disabled && !pending && (
        <div className="absolute left-0 mt-3 w-full bg-white rounded-xl shadow-lg border py-2 z-50">
          {items?.map((item, index) => (
            <button
              key={index+1}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className="cursor-pointer flex items-center gap-3 w-full px-4 py-2 text-xs text-left hover:bg-gray-100 transition"
            >
              {item.icon}
              <span className="text-gray-700 font-medium">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
