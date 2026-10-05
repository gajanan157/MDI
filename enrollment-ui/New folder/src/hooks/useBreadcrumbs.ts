import { useEffect } from "react";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { BreadcrumbItem } from "@/components/shared/Breadcrumbs";

/**
 * Hook to set breadcrumbs for the current page
 * @param breadcrumbs Array of breadcrumb items to display in the header
 *
 * @example
 * tsx
 * useBreadcrumb([
 *   { title: "Branch Module", path: "/tpa-management" },
 *   { title: "Add Branch" }
 * ]);
 *
 */
export function useBreadcrumb(breadcrumbs: BreadcrumbItem[]) {
  const { setBreadcrumbs } = useBreadcrumbContext();
  useEffect(() => {
    setBreadcrumbs(breadcrumbs);

    // Clear breadcrumbs when component unmounts
    return () => setBreadcrumbs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(breadcrumbs), setBreadcrumbs]);
}
