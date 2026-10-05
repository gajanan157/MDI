import { CustomLoader } from "./CustomLoader";

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  className?: string;
  spinnerSize?: string;
}

/**
 * Global Loading State Component
 * Reusable loading indicator that can be used across all pages
 * 
 * @example
 * ```tsx
 * <LoadingState 
 *   message="Loading data..." 
 *   subMessage="Please wait"
 * />
 * ```
 */
export function LoadingState({
  message = "Loading...",
  subMessage,
  className = "",
  spinnerSize,
}: LoadingStateProps) {
  const displayMessage = subMessage ? `${message} ${subMessage}` : message;
  
  return (
    <div className={className || "flex h-full w-full items-center justify-center"}>
      <CustomLoader
        isLoading={true}
        message={displayMessage}
        logoSize={spinnerSize ? "size-20" : "size-28"}
        progressBarWidth="w-64"
      />
    </div>
  );
}

export default LoadingState;

