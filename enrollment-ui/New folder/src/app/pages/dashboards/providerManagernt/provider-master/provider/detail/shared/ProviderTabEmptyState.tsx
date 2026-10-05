import type { ComponentType } from "react";
import { Button } from "@/components/ui";
import { PROVIDER_FORM_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";

type ProviderTabEmptyStateProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  canWrite?: boolean;
  onAction?: () => void;
};

export function ProviderTabEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  canWrite = false,
  onAction,
}: Readonly<ProviderTabEmptyStateProps>) {
  const showAction = Boolean(canWrite && actionLabel && onAction);

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-blue-200/80 bg-gradient-to-b from-blue-50/50 to-white px-4 py-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description.trim() ? (
        <p className="mt-0.5 max-w-md text-xs text-slate-600">{description}</p>
      ) : null}
      {showAction ? (
        <Button
          type="button"
          color="primary"
          variant="filled"
          className={`mt-3 ${PROVIDER_FORM_BUTTON_CLASS} shadow-sm`}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
