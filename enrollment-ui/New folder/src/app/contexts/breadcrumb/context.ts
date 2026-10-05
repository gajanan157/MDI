import { createSafeContext } from "@/utils/createSafeContext";
import { BreadcrumbItem } from "@/components/shared/Breadcrumbs";

export interface BreadcrumbContextValue {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  /** Optional title shown above the breadcrumb (e.g. active tab name) */
  titleAboveBreadcrumb: string | null;
  setTitleAboveBreadcrumb: (title: string | null) => void;
}

export const [BreadcrumbContext, useBreadcrumbContext] =
  createSafeContext<BreadcrumbContextValue>(
    "useBreadcrumbContext must be used within BreadcrumbProvider"
  );