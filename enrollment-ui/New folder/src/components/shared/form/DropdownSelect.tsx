import React, { useMemo, useState, useEffect, useRef } from "react";
import Select, { MultiValue, SingleValue, components } from "react-select";
import CreatableSelect from "react-select/creatable";
import { Controller } from "react-hook-form";

interface Option {
  value: string | number;
  label: string | number | React.ReactNode;
  /** Used for search when `label` is a React node. */
  searchText?: string;
}

function getOptionSearchText(option: Option | null | undefined): string {
  if (!option) return "";
  if (option.searchText != null && String(option.searchText).trim() !== "") {
    return String(option.searchText);
  }
  if (typeof option.label === "string" || typeof option.label === "number") {
    return String(option.label);
  }
  return String(option.value ?? "");
}

interface DropdownProps {
  label?: string | number;
  options: Option[] | any[];
  value?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  name: string;
  onSelect?: (value: string | number | any | (string | number)[] | any) => void;
  className?: string;
  errors?: any;
  requestPayload?: any;
  isRequired?: boolean;
  defaultValue?: string;
  multiselect?: boolean;
  disabled?: boolean;
  formClassName?: string;
  payload?: any;
  children?: any;
  control: any;
  rules?: any;
  inline?: boolean;
  menuIsOpen?: boolean;
  fontWeight?: string;
  name_key?: string;
  setValue?: any;
  isErrorSize?: boolean;
  is_select_checkbox?: boolean;
  isAll?: boolean;

  enableSearchFetch?: boolean;
  fetchPayload?: any;
  filterKey?: string;
  isToolTip?: string;
  menuPlacement?: "auto" | "bottom" | "top";
  onMenuClose?: () => void;
  multiselectHorizontalScroll?: boolean;
  allowCustomValue?: boolean;
  /** Checkbox multi-select: show a Select all toggle at the top of the menu. */
  showSelectAllInMenu?: boolean;
  isClearable?: boolean;
  isFull?: boolean;
}

const DropdownSelect: React.FC<DropdownProps> = ({
  isErrorSize,
  errors,
  label,
  options,
  onChange,
  name,
  onSelect,
  className,
  defaultValue,
  payload,
  multiselect = false,
  disabled = false,
  isRequired = false,
  isFull = false,
  isClearable = false,
  control,
  rules,
  is_select_checkbox = false,
  formClassName = "",
  fontWeight = "medium",
  menuPlacement = "bottom",
  name_key = "",
  setValue,
  inline,
  value = "",
  enableSearchFetch = false,
  isAll = false,
  fetchPayload = {},
  onMenuClose,
  multiselectHorizontalScroll = false,
  allowCustomValue = false,
  showSelectAllInMenu = false,
}) => {
  const [searchInput, setSearchInput] = useState(payload?.payload?.query || "");
  const [dropdownOptions, setDropdownOptions] = useState<Option[]>(
    options || [],
  );

  useEffect(() => {
    setDropdownOptions((prev) => {
      const next = options || [];
      if (
        prev.length === next.length &&
        prev.every(
          (item, index) =>
            item.value === next[index]?.value && item.label === next[index]?.label,
        )
      ) {
        return prev;
      }
      return next;
    });
  }, [options]);

  const handleSelectChange = (
    selectedOption: SingleValue<Option> | MultiValue<Option> | any,
    field: any,
    optionsArr: Option[],
  ) => {
    let finalSelection = selectedOption;

    const value: any = multiselect
      ? (selectedOption as MultiValue<Option> | null)?.map(
        (option) => option.value,
      ) ?? []
      : (selectedOption as SingleValue<Option>)?.value;

    if (isAll) {
      const hasAll = selectedOption?.some((opt: any) => opt.value === "All");
      if (hasAll) {
        finalSelection = optionsArr;
      }
      const valueArray = finalSelection?.map((opt: any) => opt.value);
      field.onChange(valueArray);
      setSearchInput("");
    } else {
      field.onChange(value);
      if (!multiselect) {
        if (name_key && setValue && selectedOption && !multiselect) {
          const labelForKey =
            typeof selectedOption?.label === "string" ||
              typeof selectedOption?.label === "number"
              ? selectedOption.label
              : getOptionSearchText(selectedOption);
          if (labelForKey) {
            setValue(name_key, labelForKey);
          }
        }
      }

      if (onChange) {
        onChange(value);
      }
      if (onSelect) {
        onSelect({ ...selectedOption, value, name });
      }
      setSearchInput("");
    }
  };

  const handleInputChange = (inputValue: string, actionMeta: any) => {
    setSearchInput(inputValue);
    const isMatchFound = dropdownOptions.some((opt: Option) =>
      getOptionSearchText(opt).toLowerCase().includes(inputValue.toLowerCase()),
    );

    if (!inputValue.trim() && actionMeta?.action === "input-change") {
      if (enableSearchFetch && fetchPayload) {
        fetchPayload("");
      }
      return;
    }
    if (!isMatchFound && enableSearchFetch && fetchPayload) {
      fetchPayload(inputValue);
    }
  };

  const customStyles: any = useMemo(() => {
    const scrollX = multiselect && multiselectHorizontalScroll;
    return {
      control: (provided: any, state: any) => ({
        ...provided,
        fontWeight: state.isDisabled ? 700 : 400,
        color: state.isDisabled ? "#000" : "black",
        backgroundColor: state.isDisabled ? "#e9eef5" : provided.backgroundColor,
        opacity: state.isDisabled ? 0.7 : 1,
        padding: "0.08rem",
        borderRadius: "4px",
        borderWidth: "1px",
        borderColor: state.isDisabled
          ? "#cad5e2"
          : state.menuIsOpen || state.isFocused
            ? "#cdcdcd"
            : provided.borderColor,
        minHeight: scrollX ? "36px" : "34px",
        maxHeight: scrollX ? "42px" : "200px",
        overflowX: scrollX ? "hidden" : "hidden",
        overflowY: scrollX ? "hidden" : "auto",
        flexWrap: scrollX ? "nowrap" : "wrap",
        height: scrollX ? provided.height : "auto",
        boxShadow: state.isFocused
          ? "0 0 0 1px rgba(0,0,0,0.04)"
          : provided.boxShadow,
      }),
      ...(scrollX
        ? {
          valueContainer: (provided: any) => ({
            ...provided,
            flexWrap: "nowrap",
            overflowX: "auto",
            overflowY: "hidden",
            flex: "1 1 0%",
            minWidth: 0,
            maxHeight: "38px",
            WebkitOverflowScrolling: "touch",
          }),
          indicatorsContainer: (provided: any) => ({
            ...provided,
            flexShrink: 0,
          }),
          multiValue: (provided: any) => ({
            ...provided,
            flexShrink: 0,
          }),
          multiValueLabel: (provided: any) => ({
            ...provided,
            whiteSpace: "nowrap",
          }),
        }
        : multiselect
          ? {
            valueContainer: (provided: any) => ({
              ...provided,
              flexWrap: "wrap",
              overflow: "visible",
              maxHeight: "none",
            }),
          }
          : {}),
      menu: (provided: any) => ({
        ...provided,
        backgroundColor: "#ffffff", // solid white background
        borderRadius: "5px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
        zIndex: 9999,
        // keep menuPosition="fixed" behavior OK
      }),
      menuList: (provided: any) => ({
        ...provided,
        backgroundColor: "#ffffff",
        maxHeight: "240px",
        zIndex: 9999,
        padding: 0,
      }),
      option: (provided: any, state: any) => ({
        ...provided,
        padding: "10px 12px",
        fontSize: "12px",
        cursor: state.isDisabled ? "not-allowed" : "pointer",
        backgroundColor: state.isDisabled
          ? "#f8fafc"
          : state.isSelected
            ? "#e6e6e6"
            : state.isFocused
              ? "#f3f3f3"
              : "#ffffff",
        color: state.isDisabled ? "#94a3b8" : "#111827",
        opacity: state.isDisabled ? 0.8 : 1,
      }),
      menuPortal: (provided: any) => ({
        ...provided,
        zIndex: 9999,
        backgroundColor: "transparent", // the menuPortal container itself can be transparent; menu/menuList are white
      }),
    };
  }, [multiselect, multiselectHorizontalScroll]);

  const getValue = (field: any) => {

    if (multiselect) {
      if (!Array.isArray(field?.value) || field.value.length === 0) {
        return [];
      }
      return options?.filter((option) =>
        (field.value as (string | number)[]).includes(option?.value),
      );
    } else {
      const rawValue = Array.isArray(field?.value) ? field.value[0] : field?.value;
      const checkDetails =
        options?.find((option) => option?.value === rawValue) ??
        options?.find(
          (option) =>
            String(option?.value ?? "").toLowerCase() ===
            String(rawValue ?? "").toLowerCase(),
        );
      if (checkDetails) return checkDetails;
      if (
        allowCustomValue &&
        rawValue != null &&
        String(rawValue).trim() !== ""
      ) {
        return { value: rawValue, label: rawValue };
      }
      return null;
    }

  };
  const selectWrapperRef = useRef<HTMLDivElement>(null);

  const Option = (props: any) => {
    return (
      <div>
        <components.Option {...props} className="d-flex items-center p-0">
          <div className="flex items-center gap-2 px-2 py-1">
            <input type="checkbox" checked={props.isSelected} readOnly />
            <label className="text-[13px]">{props.label}</label>
          </div>
        </components.Option>
      </div>
    );
  };

  const CheckboxMenuList = (props: any) => {
    const selected = (props.getValue?.() ?? []) as Option[];
    const query = String(props.selectProps?.inputValue ?? "").trim().toLowerCase();
    const selectable = ((props.options ?? []) as Option[]).filter(
      (option) =>
        option != null &&
        option.value !== "" &&
        option.value != null &&
        !Boolean((option as { isDisabled?: boolean; disabled?: boolean }).isDisabled) &&
        !Boolean((option as { isDisabled?: boolean; disabled?: boolean }).disabled),
    );
    const visible = query
      ? selectable.filter((option) =>
        getOptionSearchText(option).toLowerCase().includes(query),
      )
      : selectable;
    const visibleValues = new Set(visible.map((option) => option.value));
    const allVisibleSelected =
      visible.length > 0 &&
      visible.every((option) => selected.some((item) => item.value === option.value));

    const applySelection = (next: Option[]) => {
      props.setValue(next, "select-option");
    };

    const handleSelectAllToggle = (event: React.MouseEvent | React.ChangeEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const kept = selected.filter((item) => !visibleValues.has(item.value));
      if (allVisibleSelected) {
        applySelection(kept);
        return;
      }
      applySelection([...kept, ...visible]);
    };

    return (
      <components.MenuList {...props}>
        {visible.length > 0 || selectable.length > 0 ? (
          <div
            className="sticky top-0 z-10 flex items-center border-b border-gray-200 bg-white px-2 py-1.5"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-gray-800">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 border-gray-300 text-primary-600"
                checked={allVisibleSelected}
                onChange={handleSelectAllToggle}
              />
              Select all
            </label>
          </div>
        ) : null}
        {props.children}
      </components.MenuList>
    );
  };

  const callOnFocus = () => { };
  const callOnBlur = () => { };

  const RenderSelect = ({ field }: any) => {
    const selectedValue = getValue(field);
    const SelectComponent = allowCustomValue ? CreatableSelect : Select;

    const menuPortalTarget = typeof document !== "undefined" ? document.body : undefined;
    return (
      <div className="flex flex-col">
        <div className="mt-[3px] h-auto w-full mb-1" ref={selectWrapperRef}>
          <SelectComponent
            classNamePrefix="select-form"
            isDisabled={disabled}
            isMulti={multiselect}
            isClearable={isClearable}
            value={selectedValue}
            onChange={(selectedOption: any) =>
              handleSelectChange(selectedOption, field, dropdownOptions)
            }
            styles={customStyles}
            options={dropdownOptions}
            isOptionDisabled={(option: any) =>
              Boolean(option?.isDisabled ?? option?.disabled)
            }
            onInputChange={(e: string, actionMeta: any) =>
              handleInputChange(e, actionMeta)
            }
            onFocus={() => {
              selectWrapperRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });

              callOnFocus?.();
            }}
            menuShouldScrollIntoView={true}
            placeholder={
              defaultValue === "Reporting Office Type"
                ? defaultValue
                : defaultValue != null && String(defaultValue).trim() !== ""
                  ? String(defaultValue)
                  : "Select..."
            }
            className={`${className ?? ""} ${multiselect ? "select-form--multi" : ""} ${multiselect && multiselectHorizontalScroll ? "select-form--multi-scroll-x" : ""} ${!errors?.message ? "" : "border-error border"} select-form-containers rounded-md text-[12px]`}
            onBlur={callOnBlur}
            inputValue={searchInput}
            components={{
              ...(is_select_checkbox ? { Option } : {}),
              ...(is_select_checkbox && multiselect && showSelectAllInMenu
                ? { MenuList: CheckboxMenuList }
                : {}),
              IndicatorSeparator: () => null,
            }}
            isSearchable
            filterOption={(option: any, rawInput: string) => {
              const query = rawInput.trim().toLowerCase();
              if (!query) return true;
              return getOptionSearchText(option.data as Option)
                .toLowerCase()
                .includes(query);
            }}
            isValidNewOption={
              allowCustomValue
                ? (inputValue: string) => {
                  const normalizedInput = inputValue.trim().toLowerCase();
                  return (
                    normalizedInput.length > 0 &&
                    !dropdownOptions.some((option) => {
                      const valueText = String(option.value)
                        .trim()
                        .toLowerCase();
                      const labelText = getOptionSearchText(option)
                        .trim()
                        .toLowerCase();
                      return (
                        valueText === normalizedInput ||
                        labelText === normalizedInput
                      );
                    })
                  );
                }
                : undefined
            }
            menuPosition="fixed"
            closeMenuOnSelect={!(is_select_checkbox && multiselect)}
            hideSelectedOptions={
              !(is_select_checkbox && multiselect) ? true : false
            }
            menuPlacement={menuPlacement}
            menuPortalTarget={menuPortalTarget}
            onMenuClose={onMenuClose}
          />
        </div>
        {errors && (
          <div className="flex items-start">
            <p
              className={`input-text-error text-error dark:text-error-lighter mt-0.5 text-left text-[10px] leading-3 ${isErrorSize ? "text-[11px]" : "text-xsm"} `}
            >
              {errors.message}
            </p>
          </div>
        )}
      </div>
    );
  };


  return (
    <div
      className={`flex ${inline ? "items-center space-x-2" : "flex-col"
        } ${isFull ? "w-full" : ""} ${formClassName}`}

    >
      {label && (
        <label
          className={`input-label dropdown-label inline-flex items-center font-normal font-${fontWeight} text-[14px] text-black`}
          htmlFor={name}
        >
          {label}
          {isRequired && (
            <span className="ms-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={value}
        render={RenderSelect}
      />
    </div>
  );
};

export default DropdownSelect;
