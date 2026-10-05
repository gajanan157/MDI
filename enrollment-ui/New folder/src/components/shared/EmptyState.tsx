import { Button } from "@/components/ui";
import clsx from "clsx";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Empty State Component
 * Displays a consistent empty state message with optional icon and action
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<DocumentIcon />}
 *   title="No offices found"
 *   description="Get started by adding your first office"
 *   action={{ label: "Add Office", onClick: handleAdd }}
 * />
 * ```
 */
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={clsx(
      "flex flex-col items-center justify-center py-12 px-4",
      className
    )}>
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-dark-400">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-gray-900 dark:text-dark-50 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} color="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

