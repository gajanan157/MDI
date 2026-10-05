import { Button } from "@/components/ui/Button";
import { useDisclosure } from "@/hooks";
import {
  fetchInwardDatasOnlyDropdown,
  fetchPolicyECardTempleteDropdown
} from "@/store/features/Broker/BrokerSlice";
import { fetchInsurers } from "@/store/features/insurer/insurerSlice";
import { fetchInsurerOffices } from "@/store/features/insurerOffice/insurerOfficeSlice";
import {
  clearCityList,
  fetchCitiesByState,
  fetchStates,
} from "@/store/features/stateCity/stateCitySlice";
import { fetchTPABranches } from "@/store/features/tpa/tpaSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef } from "react";
import { Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { ecardSchema, InsurerFormValues, insurerSchema } from "./schema";
import CommonSearchField from "./commonSearch/CommonSearchField";
import {
  getSearchActionsLayout,
  shouldRenderSearchField,
} from "./commonSearch/commonSearchFieldHelpers";
import { useCommonSearchPincodeLookup } from "./commonSearch/useCommonSearchPincodeLookup";
import { useCommonSearchCityLookup } from "./commonSearch/useCommonSearchCityLookup";

export interface Option {
  label: string;
  value: string;
}

export interface SearchField {
  name: string;
  isRequired?: boolean;
  label: string;
  type: "text" | "dropdown" | "date";
  /** Restrict text input to digits only while typing. */
  numericOnly?: boolean;
  options?: Option[];
  isMulti?: boolean;
  rules?: Record<string, any>;
  useVirtualized?: boolean;
  dependsOn?: string; // Field name this field depends on
  /**
   * When set with `dependsOn`, the field is shown only if the parent value
   * equals one of these (e.g. show Network Source only when Network Type is NETWORK).
   */
  dependsOnValues?: string[];
  getOptions?: (
    dependsOnValue: string,
    watch?: (name: string) => any,
    insurerOfficeList?: any[],
    officeBuckets?: {
      parentOffices?: any[];
      childOffices?: any[];
      subChildOffices?: any[];
    },
  ) => Option[]; // Function to get options based on dependent field value, with optional watch function and Redux list
  getLabel?: (dependsOnValue: string, watch?: (name: string) => any) => string; // Function to get label based on dependent field value, with optional watch function
  /** Initial form value for this field. */
  defaultValue?: string;
  /** When true, the field cannot be edited (e.g. locked filter values). */
  disabled?: boolean;
  /** Allow a dropdown value to be entered when it is not in the option list. */
  allowCustomValue?: boolean;
}

interface CommonSearchProps {
  fields: SearchField[];
  onSearch: (data: Record<string, any>) => void;
  isSubmitting?: boolean;
  isInsurer?: boolean;
  isTemplateNames?: boolean;
  isState?: boolean;
  /** Optional heading shown above the filter fields. */
  title?: string;
  showToggleButton?: boolean;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  setIsShow?: Dispatch<SetStateAction<boolean>>;
  renderSearchButton?: (toggle: () => void, isOpen: boolean) => React.ReactNode;
  onFieldChange?: (
    fieldName: string,
    value: any,
    allValues: Record<string, any>,
  ) => void; // Callback when any field changes
  /** When true, Apply runs search even if every field is empty (e.g. list-all / clear filters). */
  allowEmptySearch?: boolean;
  /** Called when the user clicks Reset, after fields are reset to their defaults. */
  onReset?: () => void;
  /** When true, Clear/Apply buttons render on a row below the filter fields. */
  actionsBelow?: boolean;
  /** Keep date calendars in DOM tree � required inside modals/dialogs. */
  disableDatePortal?: boolean;
}
const typedResolver = yupResolver(insurerSchema) as unknown as Resolver<
  InsurerFormValues,
  any,
  InsurerFormValues
>;
const typedResolverForEcard = yupResolver(ecardSchema) as unknown as Resolver<
  any,
  any,
  any
>;

const CommonSearch: React.FC<CommonSearchProps> = ({
  fields,
  onSearch,
  isSubmitting = false,
  isTemplateNames = false,
  isInsurer = false,
  isState = false,
  showToggleButton = true,
  defaultOpen = false,
  isOpen: externalIsOpen,
  onToggle: externalToggle,
  renderSearchButton,
  onFieldChange,
  setIsShow,
  allowEmptySearch = false,
  actionsBelow = false,
  disableDatePortal = false,
  onReset,
}) => {
  // When showToggleButton is false, default to closed (hidden)
  const effectiveDefaultOpen = showToggleButton ? defaultOpen : false;
  const [internalIsOpen, { toggle: internalToggle }] =
    useDisclosure(effectiveDefaultOpen);
  const { t } = useTranslation();


  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggle = externalToggle || internalToggle;
  const location = useLocation();
  const isOfficeHierarchy = [
    "/insurer-management/office-hierarchy",
    "/enrolment-system/policy-search",
  ].includes(location?.pathname);

  const requiredPaths = [
    "/insurer-management/office-hierarchy",
    "/enrolment-system/policy-search",
  ];

  const fieldDefaultValues = useMemo(() => {
    const defaults: Record<string, string> = {};
    fields.forEach((field) => {
      defaults[field.name] =
        field.defaultValue != null && String(field.defaultValue).trim() !== ""
          ? String(field.defaultValue)
          : "";
    });
    return defaults;
  }, [fields]);

  const formMethods = useForm<any>({
    ...(location.pathname === "/enrolment-system/e-card-configuration"
      ? {
        resolver: typedResolverForEcard,
        defaultValues: fieldDefaultValues,
      }
      : isOfficeHierarchy
        ? {
          resolver: typedResolver,
          defaultValues: fieldDefaultValues,
        }
        : {
          defaultValues: fieldDefaultValues,
        }),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
    setValue,
  } = formMethods;
  const dispatch = useAppDispatch();
  const { insurerMainList } = useAppSelector((state) => state.insurer);
  const {
    list: insurerOfficeList,
    parentOffices,
    childOffices,
    subChildOffices,
  } = useAppSelector((state) => state.insurerOffice);
  const { cityList } = useAppSelector((state) => state.stateCity);
  // Log when insurerOfficeList changes (dummy data loaded)
  const insurerListNew = insurerMainList?.map((i: any) => ({
    value: i?.id,
    label: i?.name,
  }));
  const stateNameWatch = watch("state");
  const providerNetworkTypeWatch = watch("providerNetworkType");
  const networkSourceWatch = watch("networkSource");
  const officeTypeWatch = watch("officeType");
  const insurerIdWatch = watch("insurerId");
  const corporateId = watch("corporateId");
  const policyId = watch("policyId");
  const childOfficeTypeWatch = watch("childOfficeType");
  const BranchName = watch("branchDropdown");

  useEffect(() => {
    if (isTemplateNames !== undefined) {
      dispatch(
        fetchPolicyECardTempleteDropdown({
          insurerId: insurerIdWatch,
          corporateId: corporateId,
          policyId: policyId,
        })
      );
    }
  }, [isTemplateNames, insurerIdWatch, corporateId, policyId]);

  const hasPincodeField = useMemo(
    () => fields.some((field) => field.name === "pincode"),
    [fields],
  );
  const hasCityField = useMemo(
    () => fields.some((field) => field.name === "city"),
    [fields],
  );

  const { depertment } = useAppSelector((state) => state.matrix);
  const depertmentOptions = depertment?.map((state: any) => ({
    label: state?.departmentName,
    value: state?.departmentId,
  }));


  const departmentField: SearchField = {
    name: "depertmentDropdown",
    label: "Depertment",
    type: "dropdown",
    options: depertmentOptions,
    isMulti: false,
  };

  useEffect(() => {
    if (isInsurer) {
      if (location?.pathname === "/insurer-management/office-hierarchy") {
        dispatch(
          fetchInsurers({ size: "100", queryObj: { insurerType: "PSU" } }),
        );
      } else {
        dispatch(fetchInsurers({ size: "100" }));
      }
    }
    if (isState) {
      dispatch(fetchStates());
    }
  }, [isInsurer, isState, dispatch]);
  // Track previous state value to detect changes
  const prevStateRef = useRef<string | undefined>(undefined);
  const cityAutofillLockRef = useRef(false);

  const syncPrevState = useCallback((stateName: string) => {
    prevStateRef.current = stateName;
  }, []);

  const setCityAutofillLock = useCallback((locked: boolean) => {
    cityAutofillLockRef.current = locked;
  }, []);

  useCommonSearchPincodeLookup(watch, setValue, hasPincodeField, {
    syncPrevState,
  });

  useCommonSearchCityLookup(watch, setValue, hasCityField && hasPincodeField, {
    syncPrevState,
    setAutofillLock: setCityAutofillLock,
  });

  useEffect(() => {
    if (stateNameWatch) {
      if (
        prevStateRef.current !== undefined &&
        prevStateRef.current !== stateNameWatch &&
        !cityAutofillLockRef.current
      ) {
        setValue("city", "", { shouldDirty: false });
        // Keep typed pincode when city/state are autofill-locked (pincode-first search).
        if (!hasPincodeField || !fields.some((f) => f.name === "state" && f.disabled)) {
          setValue("pincode", "", { shouldDirty: false });
        }
      }
      prevStateRef.current = stateNameWatch;
      // Avoid wiping city-search results while city autofill is applying.
      if (!cityAutofillLockRef.current) {
        dispatch(fetchCitiesByState({ stateName: stateNameWatch, size: 2000 }));
      }
      return;
    }

    if (cityAutofillLockRef.current) return;

    setValue("city", "", { shouldDirty: false });
    if (!hasPincodeField || !fields.some((f) => f.name === "state" && f.disabled)) {
      setValue("pincode", "", { shouldDirty: false });
    }
    prevStateRef.current = undefined;
    dispatch(clearCityList());
  }, [stateNameWatch, dispatch, setValue, hasPincodeField, fields]);

  // Provider list: Network Source only for NETWORK; clear when type changes.
  const prevProviderNetworkTypeRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!fields.some((field) => field.name === "networkSource")) return;
    const next = String(providerNetworkTypeWatch ?? "").trim();
    if (
      prevProviderNetworkTypeRef.current !== undefined &&
      prevProviderNetworkTypeRef.current !== next
    ) {
      setValue("networkSource", "", { shouldDirty: false });
      setValue("insurerIds", [], { shouldDirty: false });
    }
    prevProviderNetworkTypeRef.current = next || undefined;
  }, [providerNetworkTypeWatch, fields, setValue]);

  // Provider list: Insurer Company only when Network Source is INSURER.
  const prevNetworkSourceRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!fields.some((field) => field.name === "insurerIds")) return;
    const next = String(networkSourceWatch ?? "").trim();
    if (
      prevNetworkSourceRef.current !== undefined &&
      prevNetworkSourceRef.current !== next
    ) {
      setValue("insurerIds", [], { shouldDirty: false });
    }
    prevNetworkSourceRef.current = next || undefined;
  }, [networkSourceWatch, fields, setValue]);

  // Watch for office selection to fetch child offices
  const officeWatch = watch("office");
  const childOfficeWatch = watch("childOffice");
  const subChildOfficeTypeWatch = watch("subChildOfficeType");

  const lastOfficeTypeRef = useRef<string>("");
  useEffect(() => {
    if (!officeTypeWatch) return;

    const payloadObj: Record<string, any> = {
      officeType: officeTypeWatch, // officeType
      onlyNames: true,
      level: "PARENT",
    };

    if (insurerIdWatch) {
      payloadObj.insurerId = insurerIdWatch;
    }

    const payload = { ...payloadObj };
    const key = JSON.stringify(payload);

    if (lastOfficeTypeRef.current === key) {
      return; // Skip duplicate request
    }

    lastOfficeTypeRef.current = key;
    dispatch(fetchInsurerOffices(payload));
  }, [insurerIdWatch, officeTypeWatch, dispatch]);

  const lastChildOfficeTypeRef = useRef<string>("");
  useEffect(() => {
    if (!childOfficeTypeWatch || !officeWatch) return;

    const payloadObj: Record<string, any> = {
      officeType: childOfficeTypeWatch, // childOfficeType
      officeId: officeWatch, // parent office ID
      level: "CHILD",
      onlyNames: true,
    };

    if (insurerIdWatch) {
      payloadObj.insurerId = insurerIdWatch;
    }

    const payload = { ...payloadObj };
    const key = JSON.stringify(payload);

    if (lastChildOfficeTypeRef.current === key) {
      return; // Skip duplicate request
    }

    lastChildOfficeTypeRef.current = key;
    dispatch(fetchInsurerOffices(payload));
  }, [insurerIdWatch, childOfficeTypeWatch, officeWatch, dispatch]);

  const lastSubChildOfficeTypeRef = useRef<string>("");
  useEffect(() => {
    if (!subChildOfficeTypeWatch || !childOfficeWatch) return;

    const payloadObj: Record<string, any> = {
      officeType: subChildOfficeTypeWatch,
      officeId: childOfficeWatch,
      level: "SUB_CHILD",
      onlyNames: true,
    };
    if (insurerIdWatch) {
      payloadObj.insurerId = insurerIdWatch;
    }

    const payload = { ...payloadObj };
    const key = JSON.stringify(payload);

    if (lastSubChildOfficeTypeRef.current === key) {
      return; // Skip duplicate request
    }

    lastSubChildOfficeTypeRef.current = key;
    dispatch(fetchInsurerOffices(payload));
  }, [insurerIdWatch, subChildOfficeTypeWatch, childOfficeWatch, dispatch]);

  // Watch for office and childOffice field changes and trigger onFieldChange callback
  const prevOfficeRef = useRef<any>(undefined);
  const prevChildOfficeRef = useRef<any>(undefined);

  useEffect(() => {
    if (onFieldChange && officeWatch !== prevOfficeRef.current) {
      prevOfficeRef.current = officeWatch;
      const allValues = watch();
      onFieldChange("office", officeWatch, allValues);
    }
  }, [officeWatch, onFieldChange, watch]);

  useEffect(() => {
    if (onFieldChange && childOfficeWatch !== prevChildOfficeRef.current) {
      prevChildOfficeRef.current = childOfficeWatch;
      const allValues = watch();
      onFieldChange("childOffice", childOfficeWatch, allValues);
    }
  }, [childOfficeWatch, onFieldChange, watch]);

  const onSubmit = (data: any) => {
    const hasValues = Object?.values(data)?.some(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (!Array.isArray(value) || value?.length > 0),
    );
    if (allowEmptySearch || hasValues) {
      onSearch(data);
    }
  };
  const handleReset = () => {
    reset(fieldDefaultValues);
    onReset?.();

    if (location?.pathname === "/tpa-management/branches") {
      dispatch(fetchTPABranches({ recordStatus: "Active" }));
      return;
    }

    if (setIsShow) {
      setIsShow(false);
      return;
    }

    onSearch(fieldDefaultValues);
  };

  const fetchInwardDropdown = (value: string) => {
    dispatch(fetchInwardDatasOnlyDropdown({ inwardNo: value }));
  };


  const fields2: SearchField[] = useMemo(() => {
    const branchField = fields?.find((f) => f.name === "branchDropdown");
    const selectedBranch = branchField?.options?.find(
      (option) => option.value === BranchName,
    );
    if (selectedBranch?.label === "Pune-HO" && depertmentOptions?.length) {
      return [...fields, departmentField];
    }

    return fields;
  }, [fields, BranchName, depertmentOptions]);

  const officeBuckets = useMemo(
    () => ({ parentOffices, childOffices, subChildOffices }),
    [parentOffices, childOffices, subChildOffices],
  );
  const lgGridColumns = fields2.length === 5 ? 5 : 4;
  const visibleFieldCount = fields2.filter((field) =>
    shouldRenderSearchField(field, {
      field,
      watch,
      insurerOfficeList,
      officeBuckets,
      insurerListNew,
      cityList,
      stateNameWatch,
    }),
  ).length;
  const { gridClass: actionsGridClass, wraps: actionsWrap } =
    getSearchActionsLayout(visibleFieldCount, lgGridColumns);

  useEffect(() => {
    const lockedDefaults = Object.fromEntries(
      fields
        .filter(
          (field) =>
            field.defaultValue != null && String(field.defaultValue).trim() !== "",
        )
        .map((field) => [field.name, String(field.defaultValue)]),
    );
    if (Object.keys(lockedDefaults).length === 0) return;
    reset((current: Record<string, string>) => ({ ...current, ...lockedDefaults }));
  }, [fields, reset]);
  return (
    <div className="w-full">
      {/* Search Toggle Button - Render via prop or default */}
      {showToggleButton &&
        renderSearchButton &&
        renderSearchButton(toggle, isOpen)}
      {showToggleButton && !renderSearchButton && (
        <div className="mb-4 flex justify-start">
          <Button
            type="button"
            onClick={toggle}
            color="primary"
            className="flex items-center gap-2 p-1.5 text-[11px]"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span>{isOpen ? "Hide Search" : "Search"}</span>
          </Button>
        </div>
      )}
      <div
        className={`overflow-hidden transition-all duration-150 ease-out ${isOpen ?? "mt-0"
          }`}
        style={{
          maxHeight: isOpen ? "1000px" : "0",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0)" : "translateY(-2px)",
          transition:
            "max-height 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full rounded-lg border bg-white px-3 py-0.5 shadow-sm"
        >
          <div className={`grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-1 ${lgGridColumns === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"} lg:gap-1`}>
            {fields2?.map((field) => (
              <CommonSearchField
                key={field.name}
                field={field}
                watch={watch}
                register={register}
                control={control}
                errors={errors}
                insurerOfficeList={insurerOfficeList}
                officeBuckets={officeBuckets}
                insurerListNew={insurerListNew}
                cityList={cityList}
                stateNameWatch={stateNameWatch}
                pathname={location.pathname}
                requiredPaths={requiredPaths}
                fetchInwardDropdown={fetchInwardDropdown}
                disableDatePortal={disableDatePortal}
              />
            ))}

            {!actionsBelow ? (
              <div
                className={`flex justify-end gap-2 ${
                  actionsWrap
                    ? "items-center py-0"
                    : "min-h-[60px] items-end"
                } ${actionsGridClass}`}
              >
                <Button
                  type="button"
                  color="primary"
                  className="p-1.5 text-[11px]"
                  onClick={handleReset}
                >
                  {t("branch.searchButton.reset")}
                </Button>

                <Button
                  color="primary"
                  type="submit"
                  className="p-1.5 text-[11px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("branch.searchButton.applying") : t("branch.searchButton.apply")}
                </Button>
              </div>
            ) : null}
          </div>

          {actionsBelow ? (
            <div className="mt-3 flex justify-end gap-3 border-t border-slate-100 pt-3">
              <Button
                type="button"
                color="primary"
                variant="outlined"
                className="p-1.5 text-[11px]"
                onClick={handleReset}
              >
                {t("branch.searchButton.reset")}
              </Button>

              <Button
                color="primary"
                type="submit"
                className="p-1.5 text-[11px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("branch.searchButton.applying") : t("branch.searchButton.apply")}
              </Button>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
};

export default CommonSearch;
