import React from "react";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { Page } from "@/components/shared/Page";
import Dashboard from "./components/Dashboard";


const RetailInward: React.FC = () => {
  useBreadcrumb([
    { title: "Dashboard", path: "enrolment-system/dashboard" },
    { title: "Retail Inward" },
  ]);
  return (
    <Page title="Retail Inward">
      <Dashboard />
    </Page>
  );
};

export default RetailInward;
