// src/hooks/useInsurers.ts
import { useQuery } from "@tanstack/react-query";

export interface Insurer {
  id: string;
  name: string;
  code: string;
  insurer_type: "PSU" | "Private";
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

/**
 * Mock insurers store used for local/dev without backend.
 * You can extend or replace these entries as needed.
 */
const MOCK_INSURERS: Insurer[] = [
  {
    id: "ins-001",
    name: "Alpha Insurance Co.",
    code: "ALPHA",
    insurer_type: "Private",
    email: "contact@alpha.example",
    phone: "+91-111-111-1111",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ins-002",
    name: "Beta State Insurer",
    code: "BETA",
    insurer_type: "PSU",
    email: "info@beta.example",
    phone: "+91-222-222-2222",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ins-003",
    name: "Gamma Assurance",
    code: "GAMMA",
    insurer_type: "Private",
    email: "hello@gamma.example",
    phone: "+91-333-333-3333",
    status: "inactive",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * useInsurers
 * - Returns a list of insurers (mocked).
 * - Filters to active insurers by default and sorts by name.
 * - Simulates a small network delay to behave like an async query.
 */
export function useInsurers(opts?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: ["insurers", opts?.includeInactive ?? false],
    queryFn: async () => {
      // simulate network latency
      await new Promise((res) => setTimeout(res, 250));

      const list = MOCK_INSURERS.slice(); // copy
      const filtered = opts?.includeInactive ? list : list.filter((i) => i.status === "active");
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      return filtered as Insurer[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * useInsurerOptions
 * - Convenience mapper for form select components: { label, value }[]
 */
export function useInsurerOptions(opts?: { includeInactive?: boolean }) {
  const query = useInsurers(opts);
  const insurers = query.data ?? [];
  return insurers.map((insurer) => ({
    label: insurer.name,
    value: insurer.id,
  }));
}
