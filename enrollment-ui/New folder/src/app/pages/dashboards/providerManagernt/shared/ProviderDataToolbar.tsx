import { Fragment, type ReactNode } from "react";
import type { TFunction } from "i18next";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/ui";
import CheckListButton from "@/app/pages/dashboards/insurerManagement/IcCheckList/CheckListButton";
import DropdownButton from "@/app/pages/dashboards/DropdownButton";
import { PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS } from "./providerButtonStyles";
import {
  toolbarOutlinedButtonClass,
  toolbarPrimaryButtonClass,
  toolbarSuccessButtonClass,
} from "./providerDataToolbar.constants";

export type ToolbarButtonConfig = {
  type: "button";
  key: string;
  label: string;
  onClick: () => void;
  variant: "success-filled" | "primary-filled" | "outlined";
  icon?: ReactNode;
  disabled?: boolean;
  title?: string;
  /** When true, shows `pendingLabel` instead of `label` (e.g. Exporting…). */
  pending?: boolean;
  pendingLabel?: string;
  /**
   * Extra Tailwind classes for the button (height, width, padding, text size/font, colors).
   * Merged with defaults via `tailwind-merge`, so you can override e.g. `h-8` → `h-9`.
   */
  className?: string;
};

export type ToolbarSearchConfig = {
  type: "search";
  key: string;
  open: boolean;
  onToggle: () => void;
  openLabel?: string;
  closedLabel?: string;
  className?: string;
};

export type ToolbarCustomConfig = {
  type: "custom";
  key: string;
  node: ReactNode;
};

export type ToolbarDownloadReportConfig = {
  type: "download-report";
  key: string;
  buttonLabel?: string;
  items: Array<{
    label: string;
    icon: ReactNode;
    onClick: () => void;
  }>;
  disabled?: boolean;
  title?: string;
  pending?: boolean;
  pendingLabel?: string;
};

export type ProviderToolbarItem =
  | ToolbarButtonConfig
  | ToolbarSearchConfig
  | ToolbarCustomConfig
  | ToolbarDownloadReportConfig;

function pickItems(
  items: Array<ProviderToolbarItem | null | undefined | false>,
): ProviderToolbarItem[] {
  return items.filter((x): x is ProviderToolbarItem => Boolean(x));
}

function renderItem(item: ProviderToolbarItem, t: TFunction) {
  if (item.type === "search") {
    return (
      <CheckListButton
        key={item.key}
        onClick={item.onToggle}
        label={
          item.open
            ? (item.openLabel ?? t("providerMaster.button.hideSearch"))
            : (item.closedLabel ?? t("providerMaster.button.search"))
        }
        bgColor="bg-blue-600"
        textColor="text-white"
        size="text-xs"
        className={twMerge(PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS, item.className)}
        isSearch
      />
    );
  }
  if (item.type === "custom") {
    return <Fragment key={item.key}>{item.node}</Fragment>;
  }

  if (item.type === "download-report") {
    return (
      <DropdownButton
        key={item.key}
        buttonLabel={item.buttonLabel ?? t("providerMaster.button.downloadReport")}
        items={item.items}
        disabled={item.disabled}
        title={item.title}
        pending={item.pending}
        pendingLabel={item.pendingLabel}
        size="sm"
      />
    );
  }

  const label =
    item.pending && item.pendingLabel != null ? item.pendingLabel : item.label;

  if (item.variant === "success-filled") {
    return (
      <Button
        key={item.key}
        type="button"
        color="success"
        variant="filled"
        className={twMerge(toolbarSuccessButtonClass, item.className)}
        disabled={item.disabled}
        title={item.title}
        onClick={item.onClick}
      >
        {item.icon}
        {label}
      </Button>
    );
  }

  if (item.variant === "primary-filled") {
    return (
      <Button
        key={item.key}
        type="button"
        color="primary"
        className={twMerge(toolbarPrimaryButtonClass, item.className)}
        disabled={item.disabled}
        title={item.title}
        onClick={item.onClick}
      >
        {item.icon}
        {label}
      </Button>
    );
  }

  return (
    <Button
      key={item.key}
      type="button"
      variant="outlined"
      className={twMerge(toolbarOutlinedButtonClass, item.className)}
      disabled={item.disabled}
      title={item.title}
      onClick={item.onClick}
    >
      {item.icon}
      {label}
    </Button>
  );
}

export type ProviderDataToolbarProps = {
  /**
   * `split` — full-width row with optional `leading` (left) and `items` (right).
   * `actions-only` — only the action button group (for tab bars that already provide the outer row).
   */
  layout?: "split" | "actions-only";
  leading?: ReactNode;
  items: Array<ProviderToolbarItem | null | undefined | false>;
  className?: string;
  actionsClassName?: string;
};

export function ProviderDataToolbar({
  layout = "split",
  leading,
  items,
  className,
  actionsClassName,
}: Readonly<ProviderDataToolbarProps>) {
  const { t } = useTranslation();
  const list = pickItems(items);

  if (layout === "actions-only") {
    return (
      <div
        className={clsx(
          "flex shrink-0 flex-wrap items-center gap-2",
          actionsClassName,
          className,
        )}
      >
        {list.map((item) => renderItem(item, t))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-4",
        className,
      )}
    >
      {leading != null && leading !== false ? (
        <div className="min-w-0 shrink-0">{leading}</div>
      ) : null}
      <div
        className={clsx(
          "flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2",
          actionsClassName,
        )}
      >
        {list.map((item) => renderItem(item, t))}
      </div>
    </div>
  );
}
