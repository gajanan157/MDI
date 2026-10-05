import type { TFunction } from "i18next";
import * as yup from "yup";
import { FILE_SIZE } from "../../../../enrollmentsystem/dashboard/components/CreateCorporateInwardForm";
import {
  PROVIDER_INWARD_TPA_BRANCH_NAME,
  PROVIDER_NETWORK_DEPARTMENT_NAME,
} from "../../../shared/providerInwardDefaults";

const ROHINI_EXCEL_MIME = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const ROHINI_EXCEL_ACCEPT =
  ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function isExcelByName(file: File): boolean {
  const n = file.name.toLowerCase();
  return n.endsWith(".xls") || n.endsWith(".xlsx");
}

export function createRohiniInwardFormSchema(t: TFunction) {
  return yup.object().shape({
    documents: yup
      .mixed()
      .test("required", t("providerMaster.rohiniMaster.uploadForm.atLeastOneFile"), (value: unknown) => {
        const v = value as FileList | undefined;
        return !!(v && v.length > 0);
      })
      .test("fileSize", t("providerMaster.rohiniMaster.uploadForm.fileSizeMax"), (value: unknown) => {
        if (!value) return true;
        return Array.from(value as FileList).every((file) => file.size <= FILE_SIZE);
      })
      .test(
        "fileType",
        t("providerMaster.rohiniMaster.uploadForm.excelOnly"),
        (value: unknown) => {
          if (!value) return true;
          return Array.from(value as FileList).every((file) => {
            if (ROHINI_EXCEL_MIME.includes(file.type as (typeof ROHINI_EXCEL_MIME)[number])) {
              return true;
            }
            if (!file.type || file.type === "") {
              return isExcelByName(file);
            }
            return false;
          });
        },
      ),
  });
}

export function getRohiniInwardContextError(t: TFunction, branchMissing: boolean, departmentMissing: boolean) {
  if (branchMissing) {
    return t("providerMaster.rohiniMaster.uploadForm.branchNotAvailable", {
      branch: PROVIDER_INWARD_TPA_BRANCH_NAME,
    });
  }
  if (departmentMissing) {
    return t("providerMaster.rohiniMaster.uploadForm.departmentNotAvailable", {
      department: PROVIDER_NETWORK_DEPARTMENT_NAME,
    });
  }
  return t("providerMaster.rohiniMaster.uploadForm.branchDepartmentLoading");
}

export function getRohiniInwardContextWarning(
  t: TFunction,
  branchMissing: boolean,
  departmentMissing: boolean,
) {
  if (branchMissing) {
    return t("providerMaster.rohiniMaster.uploadForm.couldNotResolveBranch", {
      branch: PROVIDER_INWARD_TPA_BRANCH_NAME,
    });
  }
  if (departmentMissing) {
    return t("providerMaster.rohiniMaster.uploadForm.couldNotResolveDepartment", {
      department: PROVIDER_NETWORK_DEPARTMENT_NAME,
    });
  }
  return t("providerMaster.rohiniMaster.uploadForm.branchDepartmentLoading");
}
