import { useEffect, useMemo } from "react";
import { fetchEscalationMatrixdepartment } from "@/store/features/escalationMatrix/matrixSlice";
import { fetchTPABranches } from "@/store/features/tpa/tpaSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import type { CtcRecordMis } from "@/store/features/escalationMatrix/matrixTypes";
import type { TPABranch } from "@/store/features/tpa/tpaTypes";

export const PROVIDER_NETWORK_DEPARTMENT_NAME = "Provider Network";
export const PROVIDER_INWARD_TPA_BRANCH_NAME = "Pune-HO";

type BranchOption = TPABranch & { id?: string; name?: string };

function getBranchDisplayName(branch: {
  name?: string;
  branchName?: string;
}): string {
  return String(branch.name ?? branch.branchName ?? "").trim();
}

function getBranchId(branch: { id?: string; tpaBranchId?: string }): string {
  return String(branch.id ?? branch.tpaBranchId ?? "").trim();
}

export function resolveProviderNetworkDepartmentId(
  departments: CtcRecordMis[] | undefined,
): string {
  const match = departments?.find(
    (item) =>
      String(item.departmentName ?? "")
        .trim()
        .toLowerCase() === PROVIDER_NETWORK_DEPARTMENT_NAME.toLowerCase(),
  );
  return match?.departmentId ?? "";
}

export function resolvePuneHoBranchId(branches: BranchOption[] | undefined): string {
  const match = branches?.find(
    (branch) =>
      getBranchDisplayName(branch).toLowerCase() ===
      PROVIDER_INWARD_TPA_BRANCH_NAME.toLowerCase(),
  );
  return match ? getBranchId(match) : "";
}

export function mapTpaBranchesToSelectOptions(
  branches: BranchOption[] | undefined,
): { label: string; value: string }[] {
  return (
    branches
      ?.map((branch) => {
        const value = getBranchId(branch);
        const label = getBranchDisplayName(branch);
        if (!value || !label) return null;
        return { label, value };
      })
      .filter((option): option is { label: string; value: string } => option != null) ?? []
  );
}

/** Loads TPA branch (Pune-HO) and department (Provider Network) for provider inward / scan upload. */
export function useProviderInwardContextIds() {
  const dispatch = useAppDispatch();
  const { depertment } = useAppSelector((state) => state.matrix);
  const { branches } = useAppSelector((state) => state.tpa);

  const hasDepartments = (depertment?.length ?? 0) > 0;
  const hasBranches = (branches?.length ?? 0) > 0;

  // Separate effects so resolving one list does not re-dispatch the other.
  useEffect(() => {
    if (!hasDepartments) {
      dispatch(fetchEscalationMatrixdepartment());
    }
  }, [dispatch, hasDepartments]);

  useEffect(() => {
    if (!hasBranches) {
      dispatch(fetchTPABranches({ onlyNames: true, size: 200, recordStatus: "Active" }));
    }
  }, [dispatch, hasBranches]);

  const departmentId = useMemo(
    () => resolveProviderNetworkDepartmentId(depertment),
    [depertment],
  );
  const inwardReceivedTpaBranchId = useMemo(
    () => resolvePuneHoBranchId(branches as BranchOption[]),
    [branches],
  );
  const tpaBranchOptions = useMemo(
    () => mapTpaBranchesToSelectOptions(branches as BranchOption[]),
    [branches],
  );

  const departmentsLoaded = (depertment?.length ?? 0) > 0;
  const branchesLoaded = (branches?.length ?? 0) > 0;

  return {
    departmentId,
    inwardReceivedTpaBranchId,
    tpaBranchOptions,
    ready: Boolean(departmentId && inwardReceivedTpaBranchId),
    departmentsLoaded,
    branchesLoaded,
    departmentMissing: departmentsLoaded && !departmentId,
    branchMissing: branchesLoaded && !inwardReceivedTpaBranchId,
  };
}
