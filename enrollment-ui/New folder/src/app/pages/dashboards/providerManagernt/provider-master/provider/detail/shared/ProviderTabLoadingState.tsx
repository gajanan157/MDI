import { CustomLoader } from "@/components/shared/CustomLoader";

type ProviderTabLoadingStateProps = {
  message?: string;
  /** Stretch to fill remaining tab height (default true). */
  fillHeight?: boolean;
  /** Smaller logo for nested sections inside a card. */
  compact?: boolean;
};

/** Shared loading state for provider detail tabs — uses app default CustomLoader. */
export function ProviderTabLoadingState({
  message = "Loading...",
  fillHeight = true,
  compact = false,
}: Readonly<ProviderTabLoadingStateProps>) {
  let containerClass = "min-h-[16rem]";
  if (fillHeight) {
    containerClass = "min-h-0 flex-1";
  } else if (compact) {
    containerClass = "py-4";
  }
  const logoSize = compact ? "size-20" : "size-28";
  const progressBarWidth = compact ? "w-48" : "w-64";

  return (
    <div
      className={containerClass}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <CustomLoader
        isLoading
        message={message}
        logoSize={logoSize}
        progressBarWidth={progressBarWidth}
        className="h-full w-full"
      />
    </div>
  );
}
