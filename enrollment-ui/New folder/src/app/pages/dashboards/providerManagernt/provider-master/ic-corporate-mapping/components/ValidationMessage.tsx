import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

type ProviderValidationMessageProps = {
  error: string | null;
  successMessage?: string;
  onDismiss: () => void;
  className?: string;
};

export default function ProviderValidationMessage({
  error,
  successMessage = "Validate hospital list successfully.",
  onDismiss,
  className = "mt-2",
}: Readonly<ProviderValidationMessageProps>) {
  const isError = Boolean(error);

  return (
    <div
      className={`${className} flex items-start gap-2 rounded-lg border px-2.5 py-1.5 ${
        isError ? "border-red-200 bg-red-50/80" : "border-green-200 bg-green-50/80"
      }`}
    >
      {isError ? (
        <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      ) : (
        <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
      )}
      <p className={`flex-1 text-xs font-medium ${isError ? "text-red-800" : "text-green-800"}`}>
        {error ?? successMessage}
      </p>
      <button
        type="button"
        className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        onClick={onDismiss}
        aria-label="Dismiss message"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

