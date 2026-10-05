import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { StatusEditVerifyBar } from "../../shared/StatusEditVerifyBar";
import { ProviderTabLoadingState } from "../../shared/ProviderTabLoadingState";
import type { HospitalDetailRecord } from "../../../hospitalData";
import type {
  ProviderInfrastructure,
  ProviderInfrastructurePatchPayload,
} from "@/store/features/providerInfrastructure/providerInfrastructureTypes";
import type {
  ProviderManpower,
  ProviderManpowerPatchPayload,
} from "@/store/features/providerManpower/providerManpowerTypes";
import type {
  ProviderFacility,
  ProviderFacilityPatchPayload,
} from "@/store/features/providerFacility/providerFacilityTypes";
import { InfrastructureSummaryCards } from "./components/InfrastructureSummaryCards";
import { InfrastructureEmbeddedGrid } from "./components/InfrastructureEmbeddedGrid";
import {
  InfraFacilitySubTabBar,
  type InfraFacilitySubTab,
} from "./components/InfraFacilitySubTabBar";
import type { InfrastructureCategoryFormValues, InfrastructureCategoryGroup } from "./utils/infrastructureCategoryTypes";
import {
  applyFormItemsToCategoryGroups,
  buildInfrastructureCategoryGroups,
  flattenInfrastructureCategoryGroups,
  resolveInfrastructureApiItems,
} from "./utils/mergeInfrastructureCategoryItems";
import { buildInfrastructureSummaryStats } from "./utils/infrastructureSummaryStats";
import { ManpowerSection } from "./manpower/components/ManpowerSection";
import { ManpowerSummaryCards } from "./manpower/components/ManpowerSummaryCards";
import {
  createEmptyManpowerFormRow,
  manpowerFormRowsFromApi,
  manpowerPatchPayloadFromForm,
} from "./manpower/utils/manpowerFormMapper";
import { buildManpowerSummaryStats } from "./manpower/utils/manpowerSummaryStats";
import type { ManpowerFormRow } from "./manpower/utils/manpowerTypes";
import { FacilitySection } from "./facility/components/FacilitySection";
import { FacilitySummaryCards } from "./facility/components/FacilitySummaryCards";
import {
  createEmptyFacilityFormRow,
  facilityFormRowsFromApi,
  facilityPatchPayloadFromForm,
} from "./facility/utils/facilityFormMapper";
import { buildFacilitySummaryStats } from "./facility/utils/facilitySummaryStats";
import type { FacilityFormRow } from "./facility/utils/facilityTypes";
// TEMP: Rooms & Beds section disabled for now — restore this block + the
// other "TEMP: Rooms & Beds" markers below to bring it back.
// import { RoomBedSection } from "./rooms/components/RoomBedSection";
// import {
//   createEmptyRoomBedFormRow,
//   roomBedFormRowsFromApi,
//   roomBedPatchPayloadFromForm,
// } from "./rooms/utils/roomBedFormMapper";
// import type { RoomBedFormRow } from "./rooms/utils/roomBedTypes";
// import { buildRoomBedSummaryStats } from "./rooms/utils/roomBedSummaryStats";
// TEMP: Equipment Assets section disabled for now — restore this block + the
// other "TEMP: Equipment Assets" markers below to bring it back.
// import { EquipmentAssetSection } from "./equipment/components/EquipmentAssetSection";
// import {
//   createEmptyEquipmentAssetFormRow,
//   equipmentAssetFormRowsFromApi,
//   equipmentAssetPatchPayloadFromForm,
// } from "./equipment/utils/equipmentAssetFormMapper";
// import type { EquipmentAssetFormRow } from "./equipment/utils/equipmentAssetTypes";

type InfrastructureAndFacilityTabProps = {
  providerId?: string;
  hospital: HospitalDetailRecord | null;
  infrastructure: ProviderInfrastructure | null;
  manpower?: ProviderManpower | null;
  facility?: ProviderFacility | null;
  loading?: boolean;
  saving?: boolean;
  manpowerLoading?: boolean;
  manpowerSaving?: boolean;
  facilityLoading?: boolean;
  facilitySaving?: boolean;
  canWrite: boolean;
  canVerify?: boolean;
  providerBarSection: React.ReactNode;
  onSave?: (payload: ProviderInfrastructurePatchPayload) => Promise<boolean>;
  onSaveManpower?: (payload: ProviderManpowerPatchPayload) => Promise<boolean>;
  onSaveFacility?: (payload: ProviderFacilityPatchPayload) => Promise<boolean>;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
};

/** IC names that have blacklisted the provider, or a placeholder when none. */
function resolveBlacklistedByIcs(hospital: HospitalDetailRecord | null): string[] {
  const names = hospital?.blacklistedByIcNames;
  return names && names.length > 0 ? names : ["No IC information available"];
}

/** Picks one of three values by the active sub-tab. */
function pickBySubTab<T>(
  subTab: InfraFacilitySubTab,
  choices: { manpower: T; facility: T; infrastructure: T },
): T {
  if (subTab === "manpower") return choices.manpower;
  if (subTab === "facility") return choices.facility;
  return choices.infrastructure;
}

type InfraFacilitySummaryProps = {
  activeSubTab: InfraFacilitySubTab;
  loading: boolean;
  manpowerLoading: boolean;
  facilityLoading: boolean;
  summaryStats: React.ComponentProps<typeof InfrastructureSummaryCards>["stats"];
  manpowerStats: React.ComponentProps<typeof ManpowerSummaryCards>["stats"];
  facilityStats: React.ComponentProps<typeof FacilitySummaryCards>["stats"];
};

/** Summary cards for whichever sub-tab is active (hidden while that tab loads). */
function InfraFacilitySummary({
  activeSubTab,
  loading,
  manpowerLoading,
  facilityLoading,
  summaryStats,
  manpowerStats,
  facilityStats,
}: Readonly<InfraFacilitySummaryProps>) {
  if (activeSubTab === "infrastructure" && !loading) {
    return <InfrastructureSummaryCards stats={summaryStats} className="min-w-0" />;
  }
  if (activeSubTab === "manpower" && !manpowerLoading) {
    return <ManpowerSummaryCards stats={manpowerStats} className="min-w-0" />;
  }
  if (activeSubTab === "facility" && !facilityLoading) {
    return <FacilitySummaryCards stats={facilityStats} className="min-w-0" />;
  }
  return null;
}

export function InfrastructureAndFacilityTab({
  providerId,
  hospital,
  infrastructure,
  manpower = null,
  facility = null,
  loading = false,
  saving = false,
  manpowerLoading = false,
  manpowerSaving = false,
  facilityLoading = false,
  facilitySaving = false,
  canWrite,
  canVerify = canWrite,
  providerBarSection,
  onSave,
  onSaveManpower,
  onSaveFacility,
  verifyDisabled = false,
  verifyDisabledTitle,
}: Readonly<InfrastructureAndFacilityTabProps>) {
  const [activeSubTab, setActiveSubTab] = useState<InfraFacilitySubTab>("infrastructure");
  const [isViewMode, setIsViewMode] = useState(true);
  const [editableGroups, setEditableGroups] = useState<InfrastructureCategoryGroup[]>([]);
  const [manpowerEditRows, setManpowerEditRows] = useState<ManpowerFormRow[]>([]);
  const [facilityEditRows, setFacilityEditRows] = useState<FacilityFormRow[]>([]);
  // TEMP: Rooms & Beds section disabled for now.
  // const [roomBedEditRows, setRoomBedEditRows] = useState<RoomBedFormRow[]>([]);
  // TEMP: Equipment Assets section disabled for now.
  // const [equipmentEditRows, setEquipmentEditRows] = useState<EquipmentAssetFormRow[]>(
  //   [],
  // );

  const isInfrastructureSubTab = activeSubTab === "infrastructure";
  const isFacilitySubTab = activeSubTab === "facility";
  const isManpowerSubTab = activeSubTab === "manpower";

  const apiItems = useMemo(
    () => resolveInfrastructureApiItems(infrastructure, true),
    [infrastructure],
  );

  const categoryGroups = useMemo(
    () => buildInfrastructureCategoryGroups(apiItems),
    [apiItems],
  );

  const categoryForm = useForm<InfrastructureCategoryFormValues>({
    defaultValues: { items: [] },
  });

  const watchedFormItems = categoryForm.watch("items");

  const displayGroups = useMemo(
    () =>
      isViewMode
        ? categoryGroups
        : applyFormItemsToCategoryGroups(editableGroups, watchedFormItems),
    [categoryGroups, editableGroups, isViewMode, watchedFormItems],
  );

  const isInfrastructureEditMode = isInfrastructureSubTab && !isViewMode;
  // TEMP: Rooms & Beds section disabled for now.
  // const savedRoomBedRows = useMemo(
  //   () => roomBedFormRowsFromApi(infrastructure),
  //   [infrastructure],
  // );
  // const roomBedRows = isInfrastructureEditMode ? roomBedEditRows : savedRoomBedRows;

  // TEMP: Equipment Assets section disabled for now.
  // const savedEquipmentRows = useMemo(
  //   () => equipmentAssetFormRowsFromApi(infrastructure),
  //   [infrastructure],
  // );
  // const equipmentRows = isInfrastructureEditMode
  //   ? equipmentEditRows
  //   : savedEquipmentRows;

  const summaryStats = useMemo(
    () => buildInfrastructureSummaryStats(displayGroups),
    [displayGroups],
  );

  const savedManpowerRows = useMemo(() => manpowerFormRowsFromApi(manpower), [manpower]);
  const isManpowerEditMode = isManpowerSubTab && !isViewMode;
  const manpowerRows = isManpowerEditMode ? manpowerEditRows : savedManpowerRows;
  const manpowerStats = useMemo(
    () => buildManpowerSummaryStats(manpowerRows),
    [manpowerRows],
  );

  const savedFacilityRows = useMemo(() => facilityFormRowsFromApi(facility), [facility]);
  const isFacilityEditMode = isFacilitySubTab && !isViewMode;
  const facilityRows = isFacilityEditMode ? facilityEditRows : savedFacilityRows;
  const facilityStats = useMemo(
    () => buildFacilitySummaryStats(facilityRows),
    [facilityRows],
  );

  const resetCategoryForm = useCallback(
    (groups: InfrastructureCategoryGroup[]) => {
      categoryForm.reset({
        items: flattenInfrastructureCategoryGroups(groups),
      });
    },
    [categoryForm],
  );

  const handleEdit = useCallback(() => {
    if (isManpowerSubTab) {
      setManpowerEditRows(savedManpowerRows.map((row) => ({ ...row })));
      setIsViewMode(false);
      return;
    }
    if (isFacilitySubTab) {
      setFacilityEditRows(savedFacilityRows.map((row) => ({ ...row })));
      setIsViewMode(false);
      return;
    }
    setEditableGroups(categoryGroups);
    resetCategoryForm(categoryGroups);
    // TEMP: Rooms & Beds section disabled for now.
    // setRoomBedEditRows(savedRoomBedRows.map((row) => ({ ...row })));
    // TEMP: Equipment Assets section disabled for now.
    // setEquipmentEditRows(savedEquipmentRows.map((row) => ({ ...row })));
    setIsViewMode(false);
  }, [
    categoryGroups,
    isFacilitySubTab,
    isManpowerSubTab,
    resetCategoryForm,
    savedFacilityRows,
    savedManpowerRows,
  ]);

  const handleCancel = useCallback(() => {
    setEditableGroups(categoryGroups);
    resetCategoryForm(categoryGroups);
    setManpowerEditRows([]);
    setFacilityEditRows([]);
    // TEMP: Rooms & Beds section disabled for now.
    // setRoomBedEditRows([]);
    // TEMP: Equipment Assets section disabled for now.
    // setEquipmentEditRows([]);
    setIsViewMode(true);
  }, [categoryGroups, resetCategoryForm]);

  const handleSubTabChange = (subTab: InfraFacilitySubTab) => {
    if (!isViewMode) {
      handleCancel();
    }
    setActiveSubTab(subTab);
  };

  const handleManpowerRowChange = useCallback(
    (rowKey: string, patch: Partial<ManpowerFormRow>) => {
      setManpowerEditRows((prev) =>
        prev.map((row) => (row.rowKey === rowKey ? { ...row, ...patch } : row)),
      );
    },
    [],
  );

  const handleManpowerAddRow = useCallback(
    (manpowerType: string, employmentType: string) => {
      setManpowerEditRows((prev) => {
        const row = createEmptyManpowerFormRow(manpowerType, employmentType);
        if (prev.some((existing) => existing.rowKey === row.rowKey)) return prev;
        return [...prev, row];
      });
    },
    [],
  );

  const handleManpowerRemoveRow = useCallback((rowKey: string) => {
    setManpowerEditRows((prev) => prev.filter((row) => row.rowKey !== rowKey));
  }, []);

  const handleFacilityRowChange = useCallback(
    (rowKey: string, patch: Partial<FacilityFormRow>) => {
      setFacilityEditRows((prev) =>
        prev.map((row) => (row.rowKey === rowKey ? { ...row, ...patch } : row)),
      );
    },
    [],
  );

  const handleFacilityAddRow = useCallback(
    (facilityCategory: string, facilityType: string) => {
      setFacilityEditRows((prev) => {
        const row = createEmptyFacilityFormRow(facilityCategory, facilityType);
        if (prev.some((existing) => existing.rowKey === row.rowKey)) return prev;
        return [...prev, row];
      });
    },
    [],
  );

  const handleFacilityRemoveRow = useCallback((rowKey: string) => {
    setFacilityEditRows((prev) => prev.filter((row) => row.rowKey !== rowKey));
  }, []);

  // TEMP: Rooms & Beds section disabled for now.
  // const handleRoomBedRowChange = useCallback(
  //   (rowKey: string, patch: Partial<RoomBedFormRow>) => {
  //     setRoomBedEditRows((prev) =>
  //       prev.map((row) => (row.rowKey === rowKey ? { ...row, ...patch } : row)),
  //     );
  //   },
  //   [],
  // );
  //
  // const handleRoomBedAddRow = useCallback((roomType: string) => {
  //   setRoomBedEditRows((prev) => {
  //     const row = createEmptyRoomBedFormRow(roomType);
  //     if (prev.some((existing) => existing.rowKey === row.rowKey)) return prev;
  //     return [...prev, row];
  //   });
  // }, []);
  //
  // const handleRoomBedRemoveRow = useCallback((rowKey: string) => {
  //   setRoomBedEditRows((prev) => prev.filter((row) => row.rowKey !== rowKey));
  // }, []);

  // TEMP: Equipment Assets section disabled for now.
  // const handleEquipmentRowChange = useCallback(
  //   (rowKey: string, patch: Partial<EquipmentAssetFormRow>) => {
  //     setEquipmentEditRows((prev) =>
  //       prev.map((row) => (row.rowKey === rowKey ? { ...row, ...patch } : row)),
  //     );
  //   },
  //   [],
  // );
  //
  // const handleEquipmentAddRow = useCallback((equipmentType: string) => {
  //   setEquipmentEditRows((prev) => [
  //     ...prev,
  //     createEmptyEquipmentAssetFormRow(equipmentType),
  //   ]);
  // }, []);
  //
  // const handleEquipmentRemoveRow = useCallback((rowKey: string) => {
  //   setEquipmentEditRows((prev) => prev.filter((row) => row.rowKey !== rowKey));
  // }, []);

  const handleSaveInfrastructure = categoryForm.handleSubmit(async () => {
    if (!onSave) {
      setIsViewMode(true);
      return;
    }
    // Category infrastructure PATCH API is not wired yet — keep edit UX for create/demo.
    const ok = await onSave({
      // TEMP: Rooms & Beds section disabled for now.
      // roomBedDetailList: roomBedPatchPayloadFromForm(roomBedEditRows),
      // TEMP: Equipment Assets section disabled for now.
      // equipmentAssetList: equipmentAssetPatchPayloadFromForm(equipmentEditRows),
    });
    if (ok) {
      // TEMP: Rooms & Beds section disabled for now.
      // setRoomBedEditRows([]);
      // TEMP: Equipment Assets section disabled for now.
      // setEquipmentEditRows([]);
      setIsViewMode(true);
    }
  });

  const handleSaveManpower = useCallback(async () => {
    if (!onSaveManpower) {
      setIsViewMode(true);
      return;
    }
    const ok = await onSaveManpower(manpowerPatchPayloadFromForm(manpowerEditRows));
    if (ok) {
      setManpowerEditRows([]);
      setIsViewMode(true);
    }
  }, [manpowerEditRows, onSaveManpower]);

  const handleSaveFacility = useCallback(async () => {
    if (!onSaveFacility) {
      setIsViewMode(true);
      return;
    }
    const ok = await onSaveFacility(facilityPatchPayloadFromForm(facilityEditRows));
    if (ok) {
      setFacilityEditRows([]);
      setIsViewMode(true);
    }
  }, [facilityEditRows, onSaveFacility]);

  const handleSave = () => {
    if (isManpowerSubTab) {
      handleSaveManpower();
      return;
    }
    if (isFacilitySubTab) {
      handleSaveFacility();
      return;
    }
    handleSaveInfrastructure();
  };

  const providerStatus = hospital?.status ?? "";
  const blacklistedByIcs = resolveBlacklistedByIcs(hospital);

  const sectionSaving = pickBySubTab(activeSubTab, {
    manpower: manpowerSaving,
    facility: facilitySaving,
    infrastructure: saving,
  });
  const sectionLoading = pickBySubTab(activeSubTab, {
    manpower: manpowerLoading,
    facility: facilityLoading,
    infrastructure: loading,
  });

  const summaryContent = (
    <InfraFacilitySummary
      activeSubTab={activeSubTab}
      loading={loading}
      manpowerLoading={manpowerLoading}
      facilityLoading={facilityLoading}
      summaryStats={summaryStats}
      manpowerStats={manpowerStats}
      facilityStats={facilityStats}
    />
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-0.5 overflow-hidden bg-gray-50 p-1">
      {providerBarSection}
      <StatusEditVerifyBar
        providerStatus={providerStatus}
        blacklistedByIcs={blacklistedByIcs}
        canWrite={canWrite}
        canVerify={canVerify}
        isEditMode={!isViewMode}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        saveDisabled={sectionSaving}
        saveDisabledTitle={sectionSaving ? "Saving…" : undefined}
        verifyDisabled={verifyDisabled}
        verifyDisabledTitle={verifyDisabledTitle}
        auditLog={{ providerId, tabId: "infrastructure-facility" }}
        middleContent={summaryContent}
        trailingContent={
          <InfraFacilitySubTabBar
            activeSubTab={activeSubTab}
            onSubTabChange={handleSubTabChange}
          />
        }
      />

      {isManpowerSubTab ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ManpowerSection
            rows={manpowerRows}
            isEditMode={isManpowerEditMode}
            loading={sectionLoading}
            onRowChange={handleManpowerRowChange}
            onAddRow={handleManpowerAddRow}
            onRemoveRow={handleManpowerRemoveRow}
          />
        </div>
      ) : isFacilitySubTab ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <FacilitySection
            rows={facilityRows}
            isEditMode={isFacilityEditMode}
            loading={sectionLoading}
            onRowChange={handleFacilityRowChange}
            onAddRow={handleFacilityAddRow}
            onRemoveRow={handleFacilityRemoveRow}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-lg border border-slate-300/90 bg-white shadow-sm ring-1 ring-slate-900/[0.06]">
            <div
              className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
                isInfrastructureEditMode ? "bg-slate-100/55" : "bg-white"
              }`}
            >
              {loading ? (
                <ProviderTabLoadingState fillHeight={false} compact />
              ) : (
                <InfrastructureEmbeddedGrid
                  groups={displayGroups}
                  isEditMode={!isViewMode}
                  form={categoryForm}
                />
              )}
            </div>
          </div>

          {/* TEMP: Rooms & Beds section disabled for now.
          {loading ? null : (
            <RoomBedSection
              rows={roomBedRows}
              isEditMode={isInfrastructureEditMode}
              onRowChange={handleRoomBedRowChange}
              onAddRow={handleRoomBedAddRow}
              onRemoveRow={handleRoomBedRemoveRow}
            />
          )} */}

          {/* TEMP: Equipment Assets section disabled for now.
          {loading ? null : (
            <EquipmentAssetSection
              rows={equipmentRows}
              isEditMode={isInfrastructureEditMode}
              onRowChange={handleEquipmentRowChange}
              onAddRow={handleEquipmentAddRow}
              onRemoveRow={handleEquipmentRemoveRow}
            />
          )} */}
        </div>
      )}
    </div>
  );
}
