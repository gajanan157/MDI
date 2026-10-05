import { Button } from "@/components/ui";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error State Component
 * Displays a consistent error message with optional retry action
 * 
 * @example
 * ```tsx
 * <ErrorState
 *   error="Failed to load data"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function ErrorState({ 
  error, 
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={clsx(
      "flex flex-col items-center justify-center py-12 px-4",
      className
    )}>
      <ExclamationCircleIcon className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-sm font-medium text-gray-900 dark:text-dark-50 mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
        {error}
      </p>
      {onRetry && (
        <Button onClick={onRetry} color="primary">
          Try Again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;

