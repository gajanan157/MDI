import { useCallback } from "react";
import { normalizeApiErrorBody } from "@/app/api/apiService";
import {
  getProviderContactPerson,
  isProviderContactPersonOwnerNotFound,
  patchProviderContactPersons,
} from "@/store/features/provider/providerAPI";
import { showErrorMessage, showSuccessMessage } from "@/utils/errorHandler";
import type { HospitalDetailRecord } from "../../hospitalData";
import { splitMultiValueContactParts } from "../schemas";
import { applyProviderContactPersonsToDetail } from "../utils/viewHospitalHelpers";

type ContactPersonRow = NonNullable<
  HospitalDetailRecord["providerContactPersons"]
>[number];

type UseViewHospitalContactHandlersArgs = {
  id: string | undefined;
  providerProfile: HospitalDetailRecord | null;
  hospital: HospitalDetailRecord | null;
  setProviderProfile: React.Dispatch<
    React.SetStateAction<HospitalDetailRecord | null>
  >;
  setHospital: React.Dispatch<
    React.SetStateAction<HospitalDetailRecord | null>
  >;
  setOwnerContactOwnerNotFound: React.Dispatch<React.SetStateAction<boolean>>;
  setOwnerContactNotFoundMessage: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  ownerFetchedForIdRef: React.MutableRefObject<string | null>;
};

function applyContactResponseToState(
  prev: HospitalDetailRecord | null,
  contactPersons: ContactPersonRow[],
): HospitalDetailRecord | null {
  return prev
    ? applyProviderContactPersonsToDetail(prev, contactPersons)
    : prev;
}

export function useViewHospitalContactHandlers({
  id,
  providerProfile,
  hospital,
  setProviderProfile,
  setHospital,
  setOwnerContactOwnerNotFound,
  setOwnerContactNotFoundMessage,
  ownerFetchedForIdRef,
}: UseViewHospitalContactHandlersArgs) {
  const refreshContactPersons = useCallback(async () => {
    if (!id) return false;
    const contactRes = await getProviderContactPerson(id);
    if (!contactRes.success) return false;
    const contactPersons = contactRes.data ?? [];
    setOwnerContactOwnerNotFound(false);
    setOwnerContactNotFoundMessage(null);
    ownerFetchedForIdRef.current = id;
    setProviderProfile((prev) =>
      applyContactResponseToState(prev, contactPersons),
    );
    setHospital((prev) => applyContactResponseToState(prev, contactPersons));
    return true;
  }, [
    id,
    ownerFetchedForIdRef,
    setHospital,
    setOwnerContactNotFoundMessage,
    setOwnerContactOwnerNotFound,
    setProviderProfile,
  ]);

  const saveContactPersons = useCallback(
    async (rows: ContactPersonRow[]) => {
      const normalizeParts = (raw?: string | string[]) =>
        splitMultiValueContactParts(raw)
          .map((v) => v.trim())
          .filter(Boolean);
      if (!id) {
        showErrorMessage({ error: "Provider ID is missing." });
        return false;
      }
      const originalRows =
        providerProfile?.providerContactPersons ??
        hospital?.providerContactPersons ??
        [];
      const originalById = new Map(
        originalRows
          .filter((r) => !!r.providerContactPersonId)
          .map((r) => [r.providerContactPersonId as string, r]),
      );
      const roleIdByRole = new Map<string, string>();
      [...originalRows, ...rows].forEach((row) => {
        const role = row.providerContactPersonRole?.trim();
        const roleId = row.providerContactPersonRoleId?.trim();
        if (role && roleId && !roleIdByRole.has(role)) {
          roleIdByRole.set(role, roleId);
        }
      });
      const changedContacts = rows
        .map((row) => {
          const prev = row.providerContactPersonId
            ? originalById.get(row.providerContactPersonId)
            : undefined;
          const role =
            row.providerContactPersonRole?.trim() ??
            prev?.providerContactPersonRole?.trim() ??
            "";
          const derivedRoleId =
            row.providerContactPersonRoleId?.trim() ||
            (roleIdByRole.get(role) ?? "") ||
            prev?.providerContactPersonRoleId?.trim() ||
            "";
          return {
            providerContactPersonId: row.providerContactPersonId,
            providerContactPersonRoleId: derivedRoleId,
            providerContactPersonRole: role,
            providerContactPersonFullName:
              row.providerContactPersonFullName?.trim() ?? "",
            providerContactPersonDesignation:
              row.providerContactPersonDesignation?.trim() ?? "",
            providerContactPersonTelephoneNo: normalizeParts(
              row.providerContactPersonTelephoneNo,
            ),
            providerContactPersonMobileNo: normalizeParts(
              row.providerContactPersonMobileNo,
            ),
            providerContactPersonEmailId: normalizeParts(
              row.providerContactPersonEmailId,
            ),
          };
        })
        .filter((row) => {
          if (!row.providerContactPersonId) return true;
          const prev = originalById.get(row.providerContactPersonId);
          if (!prev) return true;
          const prevRoleId = prev.providerContactPersonRoleId?.trim() ?? "";
          const prevRole = prev.providerContactPersonRole?.trim() ?? "";
          const prevName = prev.providerContactPersonFullName?.trim() ?? "";
          const prevDesignation =
            prev.providerContactPersonDesignation?.trim() ?? "";
          const prevTelephones = normalizeParts(
            prev.providerContactPersonTelephoneNo,
          );
          const prevMobiles = normalizeParts(
            prev.providerContactPersonMobileNo,
          );
          const prevEmails = normalizeParts(prev.providerContactPersonEmailId);
          return (
            row.providerContactPersonRoleId !== prevRoleId ||
            row.providerContactPersonRole !== prevRole ||
            row.providerContactPersonFullName !== prevName ||
            row.providerContactPersonDesignation !== prevDesignation ||
            JSON.stringify(row.providerContactPersonTelephoneNo) !==
              JSON.stringify(prevTelephones) ||
            JSON.stringify(row.providerContactPersonMobileNo) !==
              JSON.stringify(prevMobiles) ||
            JSON.stringify(row.providerContactPersonEmailId) !==
              JSON.stringify(prevEmails)
          );
        });
      const invalidRoleRows = changedContacts.filter(
        (row) =>
          !row.providerContactPersonRole || !row.providerContactPersonRoleId,
      );
      if (invalidRoleRows.length > 0) {
        showErrorMessage({
          error:
            "Role and Role ID are required for each contact. Please refresh and add/update contacts under a mapped role section.",
        });
        return false;
      }
      const finalContacts = changedContacts.map((row) => ({
        ...row,
        providerContactPersonRoleId:
          row.providerContactPersonRoleId || undefined,
      }));
      if (finalContacts.length === 0) {
        showSuccessMessage("No contact person changes to update.");
        return true;
      }
      const res = await patchProviderContactPersons(id, {
        contactPersons: finalContacts,
      });
      if (!res.success) {
        showErrorMessage({
          status: res.status,
          error:
            (typeof res.error === "string" && res.error.trim()) ||
            normalizeApiErrorBody(
              res.errorPayload ?? res.error,
              "Unable to update contact persons.",
            ),
        });
        return false;
      }
      const contactRes = await getProviderContactPerson(id);
      if (contactRes.success) {
        const contactPersons = contactRes.data ?? [];
        setOwnerContactOwnerNotFound(false);
        ownerFetchedForIdRef.current = id;
        setProviderProfile((prev) =>
          applyContactResponseToState(prev, contactPersons),
        );
        setHospital((prev) =>
          applyContactResponseToState(prev, contactPersons),
        );
      } else {
        setProviderProfile((prev) =>
          prev ? { ...prev, providerContactPersons: rows } : prev,
        );
        setHospital((prev) =>
          prev ? { ...prev, providerContactPersons: rows } : prev,
        );
      }
      showSuccessMessage("Contact persons updated successfully.");
      return true;
    },
    [
      hospital?.providerContactPersons,
      id,
      ownerFetchedForIdRef,
      providerProfile?.providerContactPersons,
      setHospital,
      setOwnerContactOwnerNotFound,
      setProviderProfile,
    ],
  );

  const deleteContactPerson = useCallback(
    async (contactPersonId: string, roleId?: string) => {
      if (!id) {
        showErrorMessage({ error: "Provider ID is missing." });
        return false;
      }
      const res = await patchProviderContactPersons(id, {
        contactPersons: [
          {
            providerContactPersonId: contactPersonId,
            providerContactPersonRoleId: roleId?.trim() || undefined,
            recordStatus: "Deleted",
          },
        ],
      });
      if (!res.success) {
        showErrorMessage({
          status: res.status,
          error:
            (typeof res.error === "string" && res.error.trim()) ||
            normalizeApiErrorBody(
              res.errorPayload ?? res.error,
              "Unable to delete contact person.",
            ),
        });
        return false;
      }
      const contactRes = await getProviderContactPerson(id);
      if (contactRes.success) {
        const contactPersons = contactRes.data ?? [];
        setOwnerContactOwnerNotFound(false);
        setOwnerContactNotFoundMessage(null);
        ownerFetchedForIdRef.current = id;
        setProviderProfile((prev) =>
          applyContactResponseToState(prev, contactPersons),
        );
        setHospital((prev) =>
          applyContactResponseToState(prev, contactPersons),
        );
      } else if (isProviderContactPersonOwnerNotFound(contactRes)) {
        const notFoundMsg =
          (typeof contactRes.error === "string" && contactRes.error.trim()) ||
          normalizeApiErrorBody(
            contactRes.errorPayload,
            "Provider contact person not found.",
          );
        setOwnerContactOwnerNotFound(true);
        setOwnerContactNotFoundMessage(notFoundMsg);
        ownerFetchedForIdRef.current = id;
        setProviderProfile((prev) => applyContactResponseToState(prev, []));
        setHospital((prev) => applyContactResponseToState(prev, []));
      } else {
        setOwnerContactOwnerNotFound(false);
        setOwnerContactNotFoundMessage(null);
        showErrorMessage({
          status: contactRes.status,
          error:
            (typeof contactRes.error === "string" && contactRes.error.trim()) ||
            normalizeApiErrorBody(
              contactRes.errorPayload,
              "Unable to load contact persons information.",
            ),
        });
      }
      showSuccessMessage("Contact person deleted successfully.");
      return true;
    },
    [
      id,
      ownerFetchedForIdRef,
      setHospital,
      setOwnerContactNotFoundMessage,
      setOwnerContactOwnerNotFound,
      setProviderProfile,
    ],
  );

  return {
    refreshContactPersons,
    saveContactPersons,
    deleteContactPerson,
  };
}
