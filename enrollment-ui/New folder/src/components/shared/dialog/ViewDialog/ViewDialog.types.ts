import type { ReactNode } from "react";

export type FieldItem = {
  label: string;
  value: string | number | ReactNode;
  /**
   * In a 2-column grid: `2` = full width. In a 3-column grid: `2` = two columns, `3` = full width.
   */
  colSpan?: 1 | 2 | 3;
};

export type ViewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FieldItem[];
  /**
   * Optional footer content (buttons, actions, etc.)
   * Kept generic for reusability.
   */
  footer?: ReactNode;
  /** Optional loading state for the body */
  isLoading?: boolean;
  /** Field grid columns (default 2) */
  gridColumns?: 2 | 3;
  /** Panel width — default `max-w-lg`. E.g. `max-w-5xl` for wider dialogs. */
  panelClassName?: string;
};
