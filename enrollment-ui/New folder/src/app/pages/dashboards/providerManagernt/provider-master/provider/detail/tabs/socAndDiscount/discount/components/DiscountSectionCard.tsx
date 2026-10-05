import type { ReactNode } from "react";
import clsx from "clsx";
import {
  AGREEMENT_FORM_CARD_CLASS,
  AGREEMENT_FORM_SECTION_HEADER_CLASS,
  AGREEMENT_FORM_SECTION_TITLE_CLASS,
} from "../../../agreement/utils/agreementFormConfig";

type DiscountSectionCardProps = {
  title: string;
  children: ReactNode;
  bodyClassName?: string;
  /** Lighter card for nested blocks inside a parent section (no outer shadow). */
  nested?: boolean;
};

export function DiscountSectionCard({
  title,
  children,
  bodyClassName = "px-3 py-1.5",
  nested = false,
}: Readonly<DiscountSectionCardProps>) {
  return (
    <div
      className={clsx(
        nested
          ? "overflow-hidden rounded border border-gray-200 bg-white"
          : AGREEMENT_FORM_CARD_CLASS,
      )}
    >
      <div className={AGREEMENT_FORM_SECTION_HEADER_CLASS}>
        <h3 className={AGREEMENT_FORM_SECTION_TITLE_CLASS}>{title}</h3>
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
