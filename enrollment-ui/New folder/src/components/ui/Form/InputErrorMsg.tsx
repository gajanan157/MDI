// Import Dependencies
import clsx from "clsx";
import { ReactNode } from "react";

// ----------------------------------------------------------------------

export type InputErrorMsgProps = {
  when: boolean;
  children: ReactNode;
  className?: string;
};

export function InputErrorMsg({
  when,
  children,
  className,
}: InputErrorMsgProps) {
  return when ? (
    <span
      className={clsx(
        "input-text-error  text-[10px] text-error dark:text-error-lighter",
        className,
      )}
    >
      {children}
    </span>
  ) : null;
}
