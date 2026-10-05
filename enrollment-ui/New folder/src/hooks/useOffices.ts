// src/hooks/useOffices.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClientSideId } from "@/utils/createClientSideId";

/* -------------------- TYPES -------------------- */

export interface Office {
  id: string;
  insurer_id: string;
  office_name: string;
  office_code: string;
  office_type: "head_office" | "branch_office" | "regional_office" | "corporate_office";
  uo_code?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  std_code?: string;
  phone?: string;
  fax?: string;
  status: "active" | "inactive" | "under_review";
  service_start_date?: string;
  service_end_date?: string;
  remarks?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOfficeInput {
  insurer_id: string;
  office_name: string;
  office_code: string;
  office_type: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  std_code?: string;
  phone?: string;
  fax?: string;
  status?: string;
  remarks?: string;
}

/* -------------------- MOCK DATA -------------------- */

const MOCK_OFFICES: Office[] = [
  {
    id: "off-001",
    insurer_id: "ins-001",
    office_name: "Alpha Head Office",
    office_code: "AHO001",
    office_type: "head_office",
    city: "Mumbai",
    state: "Maharashtra",
    address: "123 Alpha Towers, BKC",
    email: "head@alpha.example",
    phone: "022-12345678",
    status: "active",
    created_by: "mock-admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "off-002",
    insurer_id: "ins-002",
    office_name: "Beta Regional Office South",
    office_code: "BRS002",
    office_type: "regional_office",
    city: "Chennai",
    state: "Tamil Nadu",
    address: "Beta Complex, Mount Road",
    email: "south@beta.example",
    phone: "044-87654321",
    status: "under_review",
    created_by: "mock-user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "off-003",
    insurer_id: "ins-002",
    office_name: "Beta Branch Office Pune",
    office_code: "BBP003",
    office_type: "branch_office",
    city: "Pune",
    state: "Maharashtra",
    email: "pune@beta.example",
    status: "inactive",
    created_by: "mock-user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/* -------------------- FETCH (MOCK) -------------------- */

export function useOffices() {
  return useQuery({
    queryKey: ["offices"],
    queryFn: async () => {
      // Simulate latency
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_OFFICES.sort(
        (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
      );
    },
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });
}

/* -------------------- CREATE -------------------- */

export function useCreateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (officeData: CreateOfficeInput) => {
      await new Promise((res) => setTimeout(res, 400));

      const newOffice: Office = {
        id: createClientSideId("mock"),
        insurer_id: officeData.insurer_id,
        office_name: officeData.office_name,
        office_code: officeData.office_code,
        office_type: officeData.office_type as Office["office_type"],
        email: officeData.email,
        address: officeData.address,
        city: officeData.city,
        state: officeData.state,
        pin: officeData.pin,
        std_code: officeData.std_code,
        phone: officeData.phone,
        fax: officeData.fax,
        status: (officeData.status as Office["status"]) || "active",
        remarks: officeData.remarks,
        created_by: "mock-admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      MOCK_OFFICES.unshift(newOffice);
      return newOffice;
    },
    onSuccess: (newOffice) => {
      queryClient.setQueryData<Office[]>(["offices"], (old = []) => [
        newOffice,
        ...old,
      ]);
      toast.success("Office created successfully! (mock)");
    },
    onError: (err: any) => {
      toast.error("Failed to create office: " + (err?.message ?? "unknown"));
    },
  });
}

/* -------------------- UPDATE -------------------- */

export function useUpdateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Office> & { id: string }) => {
      await new Promise((res) => setTimeout(res, 300));

      const office = MOCK_OFFICES.find((o) => o.id === id);
      if (!office) throw new Error("Office not found (mock)");

      Object.assign(office, updates, {
        updated_at: new Date().toISOString(),
      });

      return office;
    },
    onSuccess: (updatedOffice) => {
      queryClient.setQueryData<Office[]>(["offices"], (old = []) =>
        old.map((o) => (o.id === updatedOffice.id ? updatedOffice : o))
      );
      toast.success("Office updated successfully! (mock)");
    },
    onError: (err: any) => {
      toast.error("Failed to update office: " + (err?.message ?? "unknown"));
    },
  });
}

/* -------------------- DELETE -------------------- */

export function useDeleteOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((res) => setTimeout(res, 200));
      const index = MOCK_OFFICES.findIndex((o) => o.id === id);
      if (index === -1) throw new Error("Office not found (mock)");
      MOCK_OFFICES.splice(index, 1);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Office[]>(["offices"], (old = []) =>
        old.filter((o) => o.id !== id)
      );
      toast.success("Office deleted successfully! (mock)");
    },
    onError: (err: any) => {
      toast.error("Failed to delete office: " + (err?.message ?? "unknown"));
    },
  });
}
