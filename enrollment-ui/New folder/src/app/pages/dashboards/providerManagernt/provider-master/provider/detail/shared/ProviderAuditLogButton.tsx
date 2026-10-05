import { useState } from "react";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/ui";
import { PROVIDER_ACTION_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import { ProviderAuditLogDialog } from "./ProviderAuditLogDialog";
import type { ProviderAuditLogTabId } from "./providerAuditLog";

type ProviderAuditLogButtonProps = {
  providerId?: string;
  tabId: ProviderAuditLogTabId;
  disabled?: boolean;
  className?: string;
  /** Compact icon+label for grids and dense toolbars. */
  variant?: "default" | "compact";
};

export function ProviderAuditLogButton({
  providerId,
  tabId,
  disabled = false,
  className,
  variant = "default",
}: Readonly<ProviderAuditLogButtonProps>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const isCompact = variant === "compact";

  return (
    <>
      <Button
        type="button"
        variant="outlined"
        className={twMerge(
          isCompact
            ? "h-7 gap-1 rounded-md px-2 text-[10px] font-semibold"
            : PROVIDER_ACTION_BUTTON_CLASS,
          className,
        )}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        onMouseDown={(event) => event.stopPropagation()}
        disabled={disabled || !providerId}
        title={
          !providerId
            ? t("providerMaster.toolbar.auditLogUnavailable")
            : t("providerMaster.toolbar.auditLogTitle")
        }
      >
        <ClipboardDocumentListIcon className={isCompact ? "h-3.5 w-3.5" : "h-3 w-3"} />
        {isCompact
          ? t("providerMaster.toolbar.auditLogShort")
          : t("providerMaster.toolbar.auditLog")}
      </Button>
      {providerId ? (
        <ProviderAuditLogDialog
          open={open}
          onClose={() => setOpen(false)}
          providerId={providerId}
          tabId={tabId}
        />
      ) : null}
    </>
  );
}
