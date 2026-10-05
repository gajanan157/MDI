import clsx from "clsx";
import type { ReactNode } from "react";
import {
  DISCOUNT_SCOPE_CONTROL_SLOT_CLASS,
  DISCOUNT_SCOPE_FIELD_LABEL_CLASS,
} from "../utils/discountConfig";

type DiscountScopeTopRowFieldProps = {
  label: string;
  controlId?: string;
  required?: boolean;
  hideLabel?: boolean;
  children: ReactNode;
};

export function DiscountScopeTopRowField({
  label,
  controlId,
  required = false,
  hideLabel = false,
  children,
}: Readonly<DiscountScopeTopRowFieldProps>) {
  return (
    <div className="flex w-full min-w-0 flex-col">
      <label
        htmlFor={controlId}
        className={clsx(
          DISCOUNT_SCOPE_FIELD_LABEL_CLASS,
          hideLabel && "invisible select-none",
        )}
      >
        {label}
        {required ? (
          <span className="ms-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <div className={DISCOUNT_SCOPE_CONTROL_SLOT_CLASS}>{children}</div>
    </div>
  );
}
