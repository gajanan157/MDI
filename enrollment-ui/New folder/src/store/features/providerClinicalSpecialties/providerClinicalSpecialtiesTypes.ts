export interface ProviderClinicalSpecialtyOption {
  id: string;
  name: string;
}

export interface ProviderSystemOfMedicineOption {
  id: string;
  name: string;
}

export interface ProviderBedTypeOption {
  id: string;
  name: string;
}

export interface ProviderContactPersonRoleOption {
  id: string;
  name: string;
}

export interface ProviderClinicalSpecialtiesResponse {
  status?: string;
  message?: string;
  statusCode?: number;
  data?: unknown;
}
