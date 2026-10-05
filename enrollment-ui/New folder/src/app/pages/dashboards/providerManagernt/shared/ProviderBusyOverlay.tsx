export type ProviderBusyOverlayProps = {
  open: boolean;
  /** Shown next to the spinner (e.g. "Preparing export…", "Validating…"). */
  message?: string;
};

const defaultMessage = "Preparing export…";

/** Full-screen dimmed overlay with spinner — exports, validation, or other blocking work. */
export function ProviderBusyOverlay({
  open,
  message = defaultMessage,
}: Readonly<ProviderBusyOverlayProps>) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="rounded-xl bg-white px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium text-gray-700">{message}</span>
        </div>
      </div>
    </div>
  );
}
