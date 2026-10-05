import { Button } from "@/components/ui/Button";

export interface ActionButtonProps {
  /** Button label text */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant/color */
  variant?: "approve" | "pendency" | "reverse" | "reject" | "custom";
  /** Custom background color class (e.g., "bg-purple-600") */
  bgColor?: string;
  /** Custom hover color class (e.g., "hover:bg-purple-700") */
  hoverColor?: string;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Confirmation message before action (optional) */
  confirmMessage?: string;
  /** Additional className */
  className?: string;
  /** Icon component (optional) */
  icon?: React.ReactNode;
}

/**
 * Reusable Action Button Component
 *
 * Used for approval workflow actions like Approve, Reject, Reverse to Maker, etc.
 * Can be customized for different modules.
 *
 * @example
 * ```tsx
 * <ActionButton
 *   label="Approve"
 *   onClick={handleApprove}
 *   variant="approve"
 *   disabled={!canApprove}
 * />
 * ```
 */
export default function ActionButton({
  label,
  onClick,
  variant = "custom",
  bgColor,
  hoverColor,
  disabled = false,
  confirmMessage,
  className = "",
  icon,
}: ActionButtonProps) {
  const handleClick = () => {
    if (confirmMessage) {
      if (window.confirm(confirmMessage)) {
        onClick();
      }
    } else {
      onClick();
    }
  };

  // Default color classes based on variant
  const getColorClasses = () => {
    if (bgColor && hoverColor) {
      return `${bgColor} ${hoverColor}`;
    }

    switch (variant) {
      case "approve":
        return "bg-green-600 hover:bg-green-700";
      case "pendency":
        return "bg-orange-500 hover:bg-orange-600";
      case "reverse":
        return "bg-blue-600 hover:bg-blue-700";
      case "reject":
        return "bg-red-600 hover:bg-red-700";
      default:
        return bgColor && hoverColor
          ? `${bgColor} ${hoverColor}`
          : "bg-gray-600 hover:bg-gray-700";
    }
  };

  return (
    <Button
      onClick={handleClick}
      color="primary"
      variant="filled"
      className={`rounded-md px-2 py-1 text-xs font-medium text-white ${getColorClasses()} ${className}`}
      disabled={disabled}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {label}
    </Button>
  );
}
