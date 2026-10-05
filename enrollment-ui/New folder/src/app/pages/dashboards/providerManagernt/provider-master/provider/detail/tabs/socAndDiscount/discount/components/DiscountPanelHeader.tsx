import type { ReactNode } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import type { DiscountTypeTone } from "../utils/discountTypeStyles";
import { DiscountTypeIcon } from "./DiscountTypeIcon";

type DiscountPanelHeaderProps = {
  title: string;
  tone: DiscountTypeTone;
  typeId: string;
  isComplete?: boolean;
  showStatus?: boolean;
  isViewMode?: boolean;
  end?: ReactNode;
};

export function DiscountPanelHeader({
  title,
  tone,
  typeId,
  isComplete = false,
  showStatus = false,
  isViewMode = false,
  end,
}: Readonly<DiscountPanelHeaderProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";

  let status: ReactNode = null;
  if (end != null) {
    status = end;
  } else if (!isViewMode && showStatus && isComplete) {
    status = (
      <CheckCircleIcon
        className="h-3.5 w-3.5 shrink-0 text-emerald-600"
        aria-label={t(`${D}.configComplete`)}
      />
    );
  }

  return (
    <div className="flex min-h-[18px] items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white ${tone.badge}`}
          aria-hidden
        >
          <DiscountTypeIcon typeId={typeId} />
        </span>
        <p className={`truncate text-[10px] font-semibold leading-tight ${tone.panelTitle}`}>
          {title}
        </p>
      </div>
      {status}
    </div>
  );
}
