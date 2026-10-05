import type { ProviderMasterKey } from "./masterConfig";

export type ProviderMasterActivityLogEntry = {
  id: string;
  changedAt: string;
  changedBy: string;
  recordCode: string;
  recordName: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  action: string;
};

export type ProviderMasterActivityLogContext = {
  masterKey: ProviderMasterKey;
  masterTitle: string;
};
