import type { NewConfigurationFormValues } from "./config";

export type IcProvisionRow = {
  id: string;
  icCode: string;
  configType: string;
  fileType: string;
  matchingFields: string;
  frequency: string;
  commMode: string;
  passwordProtected: boolean;
  formValues?: NewConfigurationFormValues;
};

export const IC_PROVISION_ROWS: IcProvisionRow[] = [
  {
    id: "1",
    icCode: "UIIC",
    configType: "Code Mapping",
    fileType: "CSV",
    matchingFields: "PAN",
    frequency: "Daily",
    commMode: "EMAIL",
    passwordProtected: false,
  },
  {
    id: "2",
    icCode: "NIA",
    configType: "Bank Details",
    fileType: "EXCEL",
    matchingFields: "PAN, ROHINI",
    frequency: "Daily",
    commMode: "EMAIL",
    passwordProtected: false,
  },
  {
    id: "3",
    icCode: "MAGMA",
    configType: "Bank Details",
    fileType: "EXCEL",
    matchingFields: "PAN",
    frequency: "Daily",
    commMode: "EMAIL",
    passwordProtected: false,
  },
];
