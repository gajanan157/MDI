import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchProviderBedTypesAPI,
  fetchProviderClinicalSpecialtiesAPI,
  fetchProviderContactPersonRolesAPI,
  fetchProviderSystemOfMedicineAPI,
  type FetchProviderClinicalSpecialtyParams,
} from "./providerClinicalSpecialtiesAPI";
import type {
  ProviderBedTypeOption,
  ProviderClinicalSpecialtiesResponse,
  ProviderClinicalSpecialtyOption,
  ProviderContactPersonRoleOption,
  ProviderSystemOfMedicineOption,
} from "./providerClinicalSpecialtiesTypes";

interface ProviderClinicalSpecialtiesState {
  clinicalSpecialtiesList: ProviderClinicalSpecialtyOption[];
  systemOfMedicineList: ProviderSystemOfMedicineOption[];
  bedTypeList: ProviderBedTypeOption[];
  contactPersonRoleList: ProviderContactPersonRoleOption[];
  loading: boolean;
  error: string | null;
}

const initialState: ProviderClinicalSpecialtiesState = {
  clinicalSpecialtiesList: [],
  systemOfMedicineList: [],
  bedTypeList: [],
  contactPersonRoleList: [],
  loading: false,
  error: null,
};

function str(item: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = item[key];
    if (value != null && String(value).trim() !== "") return String(value);
  }
  return "";
}

function extractRows(payload: ProviderClinicalSpecialtiesResponse | null | undefined): unknown[] {
  const root = payload?.data;
  if (Array.isArray(root)) return root;
  if (root && typeof root === "object") {
    const r = root as Record<string, unknown>;
    if (Array.isArray(r.data)) return r.data;
    if (Array.isArray(r.content)) return r.content;
    if (Array.isArray(r.items)) return r.items;
    if (Array.isArray(r.records)) return r.records;
  }
  return [];
}

export const fetchProviderClinicalSpecialties = createAsyncThunk<
  ProviderClinicalSpecialtiesResponse | null,
  FetchProviderClinicalSpecialtyParams | boolean | undefined
>(
  "providerClinicalSpecialties/fetch",
  async (arg) => {
    const params: FetchProviderClinicalSpecialtyParams =
      typeof arg === "boolean"
        ? { onlyName: arg }
        : (arg ?? {});
    return fetchProviderClinicalSpecialtiesAPI(params);
  },
);

export const fetchProviderSystemOfMedicine = createAsyncThunk<
  ProviderClinicalSpecialtiesResponse | null,
  boolean | undefined
>(
  "providerClinicalSpecialties/fetchSystemOfMedicine",
  async (onlyName = true) => {
    const response = await fetchProviderSystemOfMedicineAPI(onlyName);
    return response;
  },
);

export const fetchProviderBedTypes = createAsyncThunk<
  ProviderClinicalSpecialtiesResponse | null,
  boolean | undefined
>(
  "providerClinicalSpecialties/fetchBedTypes",
  async (onlyName = true) => {
    const response = await fetchProviderBedTypesAPI(onlyName);
    return response;
  },
);

export const fetchProviderContactPersonRoles = createAsyncThunk<
  ProviderClinicalSpecialtiesResponse | null,
  boolean | undefined
>(
  "providerClinicalSpecialties/fetchContactPersonRoles",
  async (onlyName = true) => {
    const response = await fetchProviderContactPersonRolesAPI(onlyName);
    return response;
  },
);

const providerClinicalSpecialtiesSlice = createSlice({
  name: "providerClinicalSpecialties",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderClinicalSpecialties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderClinicalSpecialties.fulfilled, (state, action) => {
        const rows = extractRows(action.payload as ProviderClinicalSpecialtiesResponse | null);
        state.clinicalSpecialtiesList = rows
          .map((row) => {
            const item = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
            const name = str(
              item,
              "specialtyName",
              "providerClinicalSpecialityName",
              "providerClinicalSpecialtyName",
              "clinicalSpecialityName",
              "clinicalSpecialtyName",
              "name",
            );
            const id =
              str(
                item,
                "providerClinicalSpecialityId",
                "providerClinicalSpecialtyId",
                "clinicalSpecialityId",
                "clinicalSpecialtyId",
                "id",
              ) || name;
            if (!name) return null;
            return { id, name };
          })
          .filter(Boolean) as ProviderClinicalSpecialtyOption[];
        state.loading = false;
      })
      .addCase(fetchProviderSystemOfMedicine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderSystemOfMedicine.fulfilled, (state, action) => {
        const rows = extractRows(action.payload as ProviderClinicalSpecialtiesResponse | null);
        state.systemOfMedicineList = rows
          .map((row) => {
            if (typeof row === "string") {
              const name = row.trim();
              if (!name) return null;
              return { id: name, name };
            }
            const item = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
            const name = str(
              item,
              "systemOfMedicineName",
              "providerSystemOfMedicineName",
              "medicineName",
              "name",
            );
            const id =
              str(
                item,
                "systemOfMedicineId",
                "providerSystemOfMedicineId",
                "medicineId",
                "id",
              ) || name;
            if (!name) return null;
            return { id, name };
          })
          .filter(Boolean) as ProviderSystemOfMedicineOption[];
        state.loading = false;
      })
      .addCase(fetchProviderBedTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderBedTypes.fulfilled, (state, action) => {
        const rows = extractRows(action.payload as ProviderClinicalSpecialtiesResponse | null);
        state.bedTypeList = rows
          .map((row) => {
            const item = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
            const name = str(
              item,
              "providerBedTypeName",
              "bedTypeName",
              "name",
            );
            const id =
              str(
                item,
                "providerBedTypeId",
                "bedTypeId",
                "id",
              ) || name;
            if (!name) return null;
            return { id, name };
          })
          .filter(Boolean) as ProviderBedTypeOption[];
        state.loading = false;
      })
      .addCase(fetchProviderContactPersonRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderContactPersonRoles.fulfilled, (state, action) => {
        const rows = extractRows(action.payload as ProviderClinicalSpecialtiesResponse | null);
        state.contactPersonRoleList = rows
          .map((row) => {
            const item = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
            const name = str(
              item,
              "providerContactPersonRoleName",
              "providerContactPersonRole",
              "contactPersonRoleName",
              "roleName",
              "name",
            );
            const id =
              str(
                item,
                "providerContactPersonRoleId",
                "contactPersonRoleId",
                "roleId",
                "id",
              ) || name;
            if (!name) return null;
            return { id, name };
          })
          .filter(Boolean) as ProviderContactPersonRoleOption[];
        state.loading = false;
      })
      .addCase(fetchProviderClinicalSpecialties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch provider clinical specialties";
      })
      .addCase(fetchProviderSystemOfMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch provider system of medicine";
      })
      .addCase(fetchProviderBedTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch provider bed types";
      })
      .addCase(fetchProviderContactPersonRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch provider contact person roles";
      });
  },
});

export default providerClinicalSpecialtiesSlice.reducer;
