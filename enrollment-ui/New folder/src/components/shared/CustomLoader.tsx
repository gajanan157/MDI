import Logo from "@/assets/appLogo.svg?react";
import { Progress } from "@/components/ui";
import clsx from "clsx";

interface CustomLoaderProps {
  /**
   * Whether to show the loader
   */
  isLoading?: boolean;
  /**
   * Custom message to display below the loader
   */
  message?: string;
  /**
   * Whether to show as full screen overlay (for global loading)
   */
  fullScreen?: boolean;
  /**
   * Custom className for the container
   */
  className?: string;
  /**
   * Size of the logo
   */
  logoSize?: string;
  /**
   * Width of the progress bar
   */
  progressBarWidth?: string;
}

/**
 * Custom Loading Component
 * Displays the app logo with a progress bar below it
 * Can be used for global loading, page loading, table loading, and API loading
 */
export function CustomLoader({
  isLoading = true,
  message,
  fullScreen = false,
  className,
  logoSize = "size-28",
  progressBarWidth = "w-64",
}: CustomLoaderProps) {
  if (!isLoading) {
    return null;
  }

  const content = (
    <div className="flex flex-col items-center">
      <Logo className={clsx(logoSize, "text-slate-700 dark:text-slate-300")} />
      <Progress
        color="primary"
        isIndeterminate
        animationDuration="1s"
        className={clsx("mt-2 h-1", progressBarWidth)}
      />
      {message && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={clsx(
          "fixed inset-0 z-[9998] grid h-full w-full place-content-center bg-white/95 backdrop-blur-sm dark:bg-dark-900/95",
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex h-full w-full items-center justify-center",
        className
      )}
    >
      {content}
    </div>
  );
}

export default CustomLoader;

