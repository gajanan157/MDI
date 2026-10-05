import clsx from "clsx";
import { PROVIDER_ACTION_BUTTON_CLASS } from "./providerButtonStyles";

/** Shared outlined + disabled styling for export-style toolbar buttons. */
export const toolbarOutlinedButtonClass = clsx(
  PROVIDER_ACTION_BUTTON_CLASS,
  "rounded-lg border-gray-300",
  "disabled:!cursor-not-allowed disabled:!border-gray-200 disabled:!bg-gray-100 disabled:!text-gray-400 disabled:!opacity-100",
  "dark:disabled:!border-dark-500 dark:disabled:!bg-dark-600/60 dark:disabled:!text-dark-400",
);

export const toolbarSuccessButtonClass =
  `${PROVIDER_ACTION_BUTTON_CLASS} rounded-lg !font-normal !tracking-normal shadow-sm`;

/** Default primary toolbar button; override pieces via item `className` (merged with twMerge). */
export const toolbarPrimaryButtonClass = `${PROVIDER_ACTION_BUTTON_CLASS} rounded-lg`;
