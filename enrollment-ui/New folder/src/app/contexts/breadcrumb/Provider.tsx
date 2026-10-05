import { ReactNode, useState } from "react";
import { BreadcrumbContext } from "./context";
import { BreadcrumbItem } from "@/components/shared/Breadcrumbs";

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [titleAboveBreadcrumb, setTitleAboveBreadcrumb] = useState<string | null>(null);

  return (
    <BreadcrumbContext
      value={{
        breadcrumbs,
        setBreadcrumbs,
        titleAboveBreadcrumb,
        setTitleAboveBreadcrumb,
      }}
    >
      {children}
    </BreadcrumbContext>
  );
}