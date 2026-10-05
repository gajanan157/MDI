import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import CommonSearch, { SearchField } from "@/app/pages/dashboards/CommonSearch";
import {
  normalizeInsurerHierarchy,
  flattenHierarchy,
  type Office,
} from "./utils/hierarchyUtils";
import { LoadingState } from "@/components/shared/LoadingState";
import { OfficeAccordionItem } from "./components/OfficeAccordionItem";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
  clearHierarchy,
  searchOfficeHierarchy,
} from "@/store/features/officeHierarchy/officeHierarchySlice";
import { useHierarchyData } from "./hooks/useHierarchyData";

export default function InsurerOfficeHierarchy() {
  const dispatch = useAppDispatch();
  const {
    hierarchyList: reduxHierarchyList,
    error: reduxError,
    loading: reduxLoading,
  } = useAppSelector((state) => state.officeHierarchy);

  // Use the hook with api_Dummy_Data - this will show hierarchy immediately
  const {
    data: hookData,
    loading: hookLoading,
    error: hookError,
  } = useHierarchyData();

  // Use hook data if available, otherwise fall back to Redux data
  const hierarchyList = hookData.length > 0 ? hookData : reduxHierarchyList;
  const loading = hookLoading || reduxLoading;
  const error = hookError || reduxError;
  const [searchFilters] = useState<Record<string, any>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [lastSearchedOfficeId, setLastSearchedOfficeId] = useState<
    string | null
  >(null);
  const [hasSearched, setHasSearched] = useState(false);
  /** Prevents auto "path to searched office" from re-running on every `normalizedHierarchy` memo refresh and wiping Expand All / manual toggles. */
  const pathExpandedForSearchIdRef = useRef<string | null>(null);

  const { parentOffices, childOffices, subChildOffices } = useAppSelector(
    (state) => state.insurerOffice,
  );

  // Configure search method: "GET" for query params, "POST" for request body
  // Change this to "GET" to use GET method with query parameters

  // Convert search filters to SearchFilters format
  const searchFiltersForHierarchy = useMemo(
    () => ({
      officeName: searchFilters.officeName || "",
      officeCode: searchFilters.officeCode || "",
      officeType: searchFilters.officeType || "",
      contactPerson: searchFilters.contactPerson || "",
      status: searchFilters.status || "",
    }),
    [searchFilters],
  );

  // Helper function to recursively extract offices of a specific type
  const extractOfficesByType = useCallback(
    (offices: Office[], targetType: string): Office[] => {
      const result: Office[] = [];

      const traverse = (officeList: Office[]) => {
        officeList.forEach((office) => {
          const officeType = office.office_type?.toUpperCase();
          if (officeType === targetType) {
            result.push(office);
          }
          // Also check children recursively
          if (office.children && office.children.length > 0) {
            traverse(office.children);
          }
        });
      };

      traverse(offices);
      return result;
    },
    [],
  );

  // Helper function to find top level offices (HO > RO > DO priority)
  const findTopLevelOffices = useCallback(
    (offices: Office[]): Office[] => {
      if (!offices || offices.length === 0) return [];

      // Priority: HO > RO > DO
      // Check for HO offices first (at root level)
      const hoOffices = offices.filter((office) => {
        const type = office.office_type?.toUpperCase();
        return type === "HO";
      });
      if (hoOffices.length > 0) {
        return hoOffices;
      }

      // If no HO at root, check for RO offices at root
      const roOffices = offices.filter((office) => {
        const type = office.office_type?.toUpperCase();
        return type === "RO";
      });
      if (roOffices.length > 0) {
        return roOffices;
      }

      // If no RO at root, check for DO offices at root
      const doOffices = offices.filter((office) => {
        const type = office.office_type?.toUpperCase();
        return type === "DO";
      });
      if (doOffices.length > 0) {
        return doOffices;
      }

      // If no HO/RO/DO at root, check if HO has RO children - extract RO from HO
      const hoWithChildren = offices.find((office) => {
        const type = office.office_type?.toUpperCase();
        return type === "HO" && office.children && office.children.length > 0;
      });
      if (hoWithChildren) {
        const roFromHo = extractOfficesByType([hoWithChildren], "RO");
        if (roFromHo.length > 0) {
          return roFromHo;
        }
      }

      // Check if RO has DO children - extract DO from RO
      const roWithChildren = offices.find((office) => {
        const type = office.office_type?.toUpperCase();
        return (
          (type === "RO" || type === "HO") &&
          office.children &&
          office.children.length > 0
        );
      });
      if (roWithChildren) {
        const doFromRo = extractOfficesByType([roWithChildren], "DO");
        if (doFromRo.length > 0) {
          return doFromRo;
        }
      }

      // If none found, return all (fallback)
      return offices;
    },
    [extractOfficesByType],
  );

  // Normalize hierarchy - hookData is already in Office[] format, Redux data might need normalization
  const normalizedHierarchy = useMemo(() => {
    let rawHierarchy: Office[] = [];

    // If data comes from hook (transformed from api_Dummy_Data), it's already in Office[] format
    if (hookData.length > 0) {
      rawHierarchy = hookData;
    }
    // If data comes from Redux, check if it needs normalization
    else if (Array.isArray(hierarchyList) && hierarchyList.length > 0) {
      // Check if it's already in Office[] format (has office_code, office_name, etc.)
      const isOfficeFormat =
        hierarchyList[0]?.office_code && hierarchyList[0]?.office_name;
      if (isOfficeFormat) {
        rawHierarchy = hierarchyList;
      } else {
        // Otherwise normalize it (it's in API format)
        rawHierarchy = normalizeInsurerHierarchy(hierarchyList);
      }
    }

    // Find and return top level offices (HO > RO > DO)
    const topLevelOffices = findTopLevelOffices(rawHierarchy);
    return topLevelOffices;
  }, [hierarchyList, hookData, findTopLevelOffices]);



  useEffect(() => {
    if (!lastSearchedOfficeId) {
      pathExpandedForSearchIdRef.current = null;
      return;
    }
    if (normalizedHierarchy.length === 0) return;
    if (pathExpandedForSearchIdRef.current === lastSearchedOfficeId) {
      return;
    }
    const expandedSet = expandTillLastSearchedOffice(
      normalizedHierarchy,
      lastSearchedOfficeId,
    );
    setExpandedIds(expandedSet);
    pathExpandedForSearchIdRef.current = lastSearchedOfficeId;
  }, [lastSearchedOfficeId, normalizedHierarchy]);

  const filteredOffices = useMemo(() => {
    return flattenHierarchy(
      normalizedHierarchy,
      expandedIds,
      searchFiltersForHierarchy,
    );
  }, [normalizedHierarchy, expandedIds, searchFiltersForHierarchy]);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  /** Must use the same tree as `flattenHierarchy` / accordion (`normalizedHierarchy`), not raw `hierarchyList`
   * (API shape / top-level extraction can differ; ids must match `office.id` in the UI). */
  const expandAll = useCallback(() => {
    const allIds = new Set<string>();
    const traverse = (offices: Office[]) => {
      offices.forEach((office: Office) => {
        if (office.children?.length) {
          if (office.id) allIds.add(office.id);
          traverse(office.children);
        }
      });
    };
    traverse(normalizedHierarchy);
    setExpandedIds(allIds);
  }, [normalizedHierarchy]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Search fields configuration with dynamic child office type using dependsOn
  const searchFields: SearchField[] = [
    {
      name: "insurerId",
      label: "Insurer Name",
      type: "dropdown",
      options: [],
    },
    {
      name: "officeCode",
      label: "Office Code",
      type: "text",
    },
    {
      name: "officeType",
      label: "Office Type",
      type: "dropdown",
      options: [
        { label: "All Types", value: "" },
        { label: "Regional Office", value: "RO" },
        { label: "Divisional Office", value: "DO" },
        { label: "Underwriting Office", value: "UO" },
      ],
    },
    {
      name: "office",
      label: "Office",
      type: "dropdown",
      dependsOn: "officeType",
      getOptions: (
        officeType: string,
        watch?: (name: string) => any,
        insurerOfficeList?: any[],
        officeBuckets?: any,
      ) => {
        if (!officeType) {
          return [{ label: "Select office type first", value: "" }];
        }
        const parentOffices = officeBuckets?.parentOffices;
        if (!parentOffices || parentOffices.length === 0) {
          return [{ label: "No offices found", value: "" }];
        }

        return [
          { label: "Select Office", value: "" },
          ...parentOffices.map((office: any) => ({
            label: office.officeName,
            value: office.insurerOfficeId,
          })),
        ];
      },
    },
    {
      name: "childOfficeType",
      label: "Child Office Type",
      type: "dropdown",
      dependsOn: "officeType",
      getLabel: (parentType: string) => {
        if (parentType === "RO") return "Child Office Type (DO/UO)";
        if (parentType === "DO") return "Child Office Type (UO)";
        // UO doesn't have children, so this label won't be shown
        return "Child Office Type";
      },
      getOptions: (parentType: string) => {
        // UO is the last level in hierarchy - no children after UO
        if (parentType === "UO") {
          return []; // Don't show child office type options for UO
        }
        if (parentType === "RO") {
          return [
            { label: "All Types", value: "" },
            { label: "Divisional Office", value: "DO" },
            { label: "Underwriting Office", value: "UO" },
          ];
        } else if (parentType === "DO") {
          return [
            { label: "All Types", value: "" },
            { label: "Underwriting Office", value: "UO" },
          ];
        }
        return [];
      },
    },
    {
      name: "childOffice",
      label: "Child Office",
      type: "dropdown",
      dependsOn: "childOfficeType",
      getOptions: (
        childOfficeType: string,
        watch?: (name: string) => any,
        insurerOfficeList?: any[],
        officeBuckets?: any,
      ) => {
        if (!childOfficeType) {
          return [{ label: "Select child office type first", value: "" }];
        }
        const childOffices = officeBuckets?.childOffices;

        if (!Array.isArray(childOffices) || childOffices.length === 0) {
          return [{ label: "No offices found", value: "" }];
        }

        return [
          { label: "Select Office", value: "" },
          ...childOffices.map((office: any) => ({
            label: office.officeName,
            value: office.insurerOfficeId,
          })),
        ];
      },
    },
    {
      name: "subChildOfficeType",
      label: "Sub Child Office Type",
      type: "dropdown",
      dependsOn: "childOfficeType",
      getLabel: (childType: string, watch?: (name: string) => any) => {
        // Only show label if path is RO -> DO -> UO
        const parentType = watch ? watch("officeType") : "";
        if (parentType === "RO" && childType === "DO") {
          return "Sub Child Office Type (UO)";
        }
        // UO is last level, so this label won't be shown for UO
        return "Sub Child Office Type";
      },
      getOptions: (childType: string, watch?: (name: string) => any) => {
        // UO is the last level - no sub child office type after UO
        // Only show Sub Child Office Type if path is RO -> DO -> UO
        const parentType = watch ? watch("officeType") : "";

        // Only show if parent is RO and child is DO (path: RO -> DO -> UO)
        // If childType is UO, don't show sub child (UO is the last level)
        if (childType === "UO") {
          return []; // UO is last, no sub children
        }

        if (parentType === "RO" && childType === "DO") {
          return [
            { label: "All Types", value: "" },
            { label: "Underwriting Office", value: "UO" },
          ];
        }
        // For all other cases, don't show Sub Child
        return [];
      },
    },
    {
      name: "subChildOffice",
      label: "Sub Child Office",
      type: "dropdown",
      dependsOn: "subChildOfficeType",
      getOptions: (
        subChildOfficeType: string,
        watch?: (name: string) => any,
        insurerOfficeList?: any[],
        officeBuckets?: any,
      ) => {
        if (!subChildOfficeType) {
          return [{ label: "Select sub child office type first", value: "" }];
        }
        const subChildOffices = officeBuckets?.subChildOffices;

        if (!Array.isArray(subChildOffices) || subChildOffices.length === 0) {
          return [{ label: "No offices found", value: "" }];
        }

        return [
          { label: "Select Office", value: "" },
          ...subChildOffices.map((office: any) => ({
            label: office.officeName,
            value: office.insurerOfficeId,
          })),
        ];
      },
    },
  ];

  const findOfficeFromBuckets = (
    id: string,
    officeBuckets?: {
      parentOffices?: any[];
      childOffices?: any[];
      subChildOffices?: any[];
    },
  ) => {
    const all = [
      ...(officeBuckets?.parentOffices ?? []),
      ...(officeBuckets?.childOffices ?? []),
      ...(officeBuckets?.subChildOffices ?? []),
    ];

    return all.find((o) => o.insurerOfficeId === id) ?? null;
  };

  const expandTillLastSearchedOffice = (
    offices: Office[],
    targetId: string,
  ): Set<string> => {
    const expanded = new Set<string>();

    const dfs = (nodes: Office[]): boolean => {
      for (const node of nodes) {
        if (node.id === targetId) {
          return true; // stop at searched office (do NOT expand it)
        }

        if (node.children && node.children.length > 0) {
          if (dfs(node.children)) {
            expanded.add(node.id); // expand ONLY parents
            return true;
          }
        }
      }
      return false;
    };

    dfs(offices);
    return expanded;
  };

  const handleSearch = useCallback(
    (data: Record<string, any>, meta?: { isReset?: boolean }) => {
      const isReset =
        meta?.isReset === true ||
        Object.keys(data).length === 0 ||
        Object.values(data).every(
          (v) => v === "" || v === null || v === undefined,
        );

      if (isReset) {
        dispatch(clearHierarchy());
        setHasSearched(false);
        setLastSearchedOfficeId(null);
        pathExpandedForSearchIdRef.current = null;
        setExpandedIds(new Set());

        return;
      }

      const searchData = data;

      // 🔹 determine LAST selected office ID

      const selectedOfficeId = searchData.subChildOffice || searchData.childOffice || searchData.office || null;
      const officeTypeToSend = data.subChildOfficeType  ? data?.subChildOfficeType :data?.childOfficeType ? data?.childOfficeType:data.officeType

      // 🔹 find office from dropdown data (NOT hierarchy)
      const selectedOffice = selectedOfficeId
        ? findOfficeFromBuckets(selectedOfficeId, {
            parentOffices,
            childOffices,
            subChildOffices,
          })
        : null;

      const queryObj = {
        insurerId: searchData.insurerId ?? null,
        insurerOfficeId: selectedOffice?.insurerOfficeId ?? null,
        insurerOfficeCode: data?.officeCode ?? null,
        insurerOfficeType: officeTypeToSend ?? null,
        insurerOfficeContactPerson: searchData.contactPerson || null,
      };
      dispatch(searchOfficeHierarchy({ queryObj }));
      setHasSearched(true);
      setLastSearchedOfficeId(selectedOfficeId);
      pathExpandedForSearchIdRef.current = null;
    },
    [dispatch, parentOffices, childOffices, subChildOffices],
  );

  // Error state
  if (error) {
    return (
      <Page title="Insurer Hierarchy">
        <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
          <CompactPageHeader
            title="Insurer Office Hierarchy"
            statusBadge="Error"
          />
          <Card className="border-border flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-destructive mb-2 text-sm font-semibold">
                Error loading hierarchy
              </div>
              <div className="text-muted-foreground text-xs">{error}</div>
            </div>
          </Card>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Insurer Hierarchy">
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title="Insurer Office Hierarchy"
          totalRecords={filteredOffices.length}
          recordLabel="Offices"
          statusBadge="Hierarchy Tree"
        >
          <Button
            type="button"
            color="primary"
            variant="outlined"
            className="flex h-7 items-center gap-1 px-2 text-xs"
            onClick={expandAll}
            title="Expand All"
          >
            <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" />
            <span>Expand All</span>
          </Button>
          <Button
            type="button"
            color="primary"
            variant="outlined"
            className="flex h-7 items-center gap-1 px-2 text-xs"
            onClick={collapseAll}
            title="Collapse All"
          >
            <ChevronUpIcon className="h-3.5 w-3.5 shrink-0" />
            <span>Collapse All</span>
          </Button>
        </CompactPageHeader>

        <CommonSearch
          fields={searchFields}
          onSearch={handleSearch}
          showToggleButton={false}
          isOpen={true}
          isSubmitting={loading && hasSearched}
          isInsurer={true}
        />

        {/* Global Loader */}
        {loading && hasSearched && (
          <div className="flex items-center justify-center py-6">
            <LoadingState
              message="Loading hierarchy data..."
              subMessage="Please wait"
              className="w-full"
            />
          </div>
        )}

        {!loading && hasSearched && filteredOffices.length === 0 && (
          <Card className="border-border">
            <div className="flex h-48 items-center justify-center">
              <div className="text-center">
                <div className="text-muted-foreground mb-1 text-xs">
                  No data found
                </div>
                <div className="text-muted-foreground text-xs">
                  Try adjusting your search filters
                </div>
              </div>
            </div>
          </Card>
        )}

        {!loading &&
          ((hookData.length > 0 && !hasSearched) ||
            (hasSearched && filteredOffices.length > 0)) && (
            <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-2xs dark:border-dark-600 dark:bg-dark-800 overflow-y-auto">
              <div className="relative space-y-1">
                {filteredOffices.map((office) => {
                  const validServicingAllocation =
                    office.servicing_allocation === "corporate" ||
                    office.servicing_allocation === "retail" ||
                    office.servicing_allocation === "both"
                      ? office.servicing_allocation
                      : undefined;

                  return (
                    <OfficeAccordionItem
                      key={office.id}
                      office={{
                        ...office,
                        servicing_allocation: validServicingAllocation,
                      }}
                      isExpanded={expandedIds.has(office.id)}
                      onToggle={handleToggle}
                    />
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </Page>
  );
}
