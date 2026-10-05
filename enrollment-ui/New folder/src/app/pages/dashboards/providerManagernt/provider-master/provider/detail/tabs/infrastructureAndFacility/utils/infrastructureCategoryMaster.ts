import infrastructureMaster from "./infrastructure-master.json";

export type InfrastructureMasterType = {
  name: string;
  description: string;
};

export type InfrastructureMasterCategory = {
  id: string;
  name: string;
  types: InfrastructureMasterType[];
};

export const INFRASTRUCTURE_CATEGORY_MASTER =
  infrastructureMaster as InfrastructureMasterCategory[];
