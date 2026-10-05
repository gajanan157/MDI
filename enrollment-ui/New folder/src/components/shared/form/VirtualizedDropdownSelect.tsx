import { useState, useEffect, useMemo } from "react";
import Select, { MultiValue, SingleValue } from "react-select";
import { Controller } from "react-hook-form";

// Dynamic import to avoid Vite pre-bundling issues
let FixedSizeList: any;
const loadReactWindow = async () => {
  if (!FixedSizeList) {
    const module = await import("react-window");
    FixedSizeList = (module as any).FixedSizeList;
  }
  return FixedSizeList;
};

interface Option {
  value: string | number;
  label: string | number;
}

interface VirtualizedDropdownProps {
  label?: string | number;
  options: Option[] | any[];
  value?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  name: string;
  onSelect?: (value: string | number | any | (string | number)[]) => void;
  className?: string;
  errors?: any;
  isRequired?: boolean;
  defaultValue?: string;
  multiselect?: boolean;
  disabled?: boolean;
  formClassName?: string;
  placeholder?: string;
  control: any;
  rules?: any;
  name_key?: string;
  setValue?: any;
  fontWeight?: string;
  inline?: boolean;
  menuPlacement?: "auto" | "bottom" | "top";
  height?: number; // Height for virtualized list
}

// Virtualized Option component for react-window
const VirtualizedOption = ({ index, style, data }: any) => {
  try {
    const { options = [], getValue, onChange } = data || {};
    const option = options[index];
    if (!option) return null;
    
    const selectedValue = getValue ? getValue() : null;
    const isSelected = selectedValue && (
      Array.isArray(selectedValue) 
        ? selectedValue.some((sv: any) => sv?.value === option.value)
        : selectedValue?.value === option.value
    );

    return (
      <div
        style={style}
        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
          isSelected ? "bg-blue-50" : ""
        }`}
        onClick={() => {
          if (onChange && option) {
            onChange(option, { action: "select-option", option });
          }
        }}
      >
        {option.label || option.value || ""}
      </div>
    );
  } catch (error) {
    console.error("Error in VirtualizedOption:", error);
    return <div style={style} className="px-3 py-2">Error loading option</div>;
  }
};

// Custom MenuList component using react-window
const VirtualizedMenuList = (props: any) => {
  const { options = [], maxHeight, getValue } = props;
  const itemHeight = 35; // Height per item
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [listWidth, setListWidth] = useState(300); // Default width
  const [ListComponent, setListComponent] = useState<any>(null);

  // Load react-window dynamically
  useEffect(() => {
    loadReactWindow().then((List) => {
      setListComponent(() => List);
    });
  }, []);

  // Find the index of the selected option
  useEffect(() => {
    try {
      if (!getValue || !options || !Array.isArray(options)) return;
      
      const selectedValue = getValue();
      if (selectedValue) {
        const selected = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;
        if (selected && selected.value !== undefined) {
          const index = options.findIndex(
            (opt: Option) => opt && opt.value === selected.value
          );
          if (index !== -1) {
            setSelectedIndex(index);
          }
        }
      }
    } catch {
      // Error finding selected index - using default
    }
  }, [getValue, options]);

  // Get width from parent container - use a ref or calculate from menu
  useEffect(() => {
    const updateWidth = () => {
      // Try multiple selectors to find the menu
      const menuElement = document.querySelector('.select-form__menu') || 
                         document.querySelector('[class*="menu"]') ||
                         document.querySelector('[role="listbox"]');
      if (menuElement) {
        const width = (menuElement as HTMLElement).clientWidth || 300;
        setListWidth(Math.max(width, 200)); // Minimum 200px
      } else {
        // Fallback: use a reasonable default based on viewport
        setListWidth(Math.min(window.innerWidth * 0.3, 400));
      }
    };
    
    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      updateWidth();
    });
    
    // Also try after a short delay
    const timer = setTimeout(updateWidth, 100);
    
    // Update on resize
    window.addEventListener('resize', updateWidth);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Calculate total height (max 8 items visible)
  // Add null check for options
  if (!options || !Array.isArray(options)) {
    return <div className="px-3 py-2 text-gray-500 text-sm">No options available</div>;
  }
  
  const itemCount = options.length;
  const listHeight = Math.min(itemCount * itemHeight, maxHeight || 280);

  if (itemCount === 0) {
    return <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>;
  }

  // Ensure width is a valid number
  const validWidth = typeof listWidth === 'number' && listWidth > 0 ? listWidth : 300;
  const validHeight = typeof listHeight === 'number' && listHeight > 0 ? listHeight : 280;

  if (!ListComponent) {
    return <div className="px-3 py-2 text-gray-500 text-sm">Loading...</div>;
  }

  return (
    <ListComponent
      height={validHeight}
      itemCount={itemCount}
      itemSize={itemHeight}
      width={validWidth}
      itemData={{
        options: options || [],
        getValue: getValue || (() => null),
        onChange: props.selectProps?.onChange || (() => {}),
        selectProps: props.selectProps || {},
      }}
      initialScrollOffset={selectedIndex * itemHeight}
    >
      {VirtualizedOption}
    </ListComponent>
  );
};

const VirtualizedDropdownSelect: React.FC<VirtualizedDropdownProps> = ({
  errors,
  label,
  options,
  onChange,
  name,
  onSelect,
  className,
  defaultValue,
  multiselect = false,
  disabled = false,
  isRequired = false,
  control,
  rules,
  formClassName = "",
  placeholder = "",
  fontWeight = "medium",
  menuPlacement = "bottom",
  name_key = "",
  setValue,
  inline,
  value = "",
  height = 280,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState<Option[]>(
    options || [],
  );

  useEffect(() => {
    setDropdownOptions(options);
  }, [options]);

  // Filter options based on search input
  const filteredOptions = useMemo(() => {
    if (!searchInput.trim()) {
      return dropdownOptions;
    }
    return dropdownOptions.filter((opt: Option) =>
      opt.label?.toString().toLowerCase().includes(searchInput.toLowerCase()),
    );
  }, [dropdownOptions, searchInput]);

  const handleSelectChange = (
    selectedOption: SingleValue<Option> | MultiValue<Option> | any,
    field: any,
  ) => {

    const value: any = multiselect
      ? (selectedOption as MultiValue<Option>).map((option) => option.value)
      : (selectedOption as SingleValue<Option>)?.value;

    field.onChange(value);

    if (!multiselect) {
      if (name_key && setValue && selectedOption?.label) {
        setValue(name_key, selectedOption?.label);
      }
    }

    if (onChange) {
      onChange(value);
    }
    if (onSelect) {
      onSelect({ ...selectedOption, value, name });
    }
    setSearchInput("");
  };

  const handleInputChange = (inputValue: string) => {
    setSearchInput(inputValue);
  };

  const customStyles: any = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isDisabled ? "#e9eef5" : provided.backgroundColor,
      opacity: "60%",
      padding: "0.08rem",
      borderRadius: "4px",
      borderWidth: "1px",
      borderColor: state.isDisabled
        ? "#cad5e2"
        : state.menuIsOpen || state.isFocused
          ? "#cdcdcd"
          : provided.borderColor,
      minHeight: "34px",
      maxHeight: "200px",
      overflowY: "auto",
      flexWrap: "wrap",
      boxShadow: state.isFocused
        ? "0 0 0 1px rgba(0,0,0,0.04)"
        : provided.boxShadow,
      color: "black",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#ffffff",
      borderRadius: "5px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.06)",
      zIndex: 9999,
    }),
    menuList: (provided: any) => ({
      ...provided,
      backgroundColor: "#ffffff",
      maxHeight: `${height}px`,
      zIndex: 9999,
      padding: 0,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      padding: "10px 12px",
      fontSize: "13px",
      cursor: "pointer",
      backgroundColor: state.isSelected
        ? "#e6e6e6"
        : state.isFocused
          ? "#f3f3f3"
          : "#ffffff",
      color: "#111827",
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: "transparent",
    }),
  };

  const getValue = (field: any) => {
    if (multiselect) {
      return options?.filter((option) =>
        (field.value as (string | number)[])?.includes(option?.value),
      );
    } else {
      const checkDetails = options?.find(
        (option) => option?.value === field?.value,
      );
      return checkDetails || null;
    }
  };

  const RenderSelect = ({ field }: any) => {
    const selectedValue = getValue(field);

    const menuPortalTarget =
      typeof document !== "undefined" ? document.body : undefined;

    return (
      <div className="flex flex-col">
        <div className="h-auto w-full">
          <Select
            classNamePrefix="select-form"
            isDisabled={disabled}
            isMulti={multiselect}
            value={selectedValue}
            onChange={(selectedOption: any) =>
              handleSelectChange(selectedOption, field)
            }
            styles={customStyles}
            options={filteredOptions}
            onInputChange={handleInputChange}
            placeholder={
              placeholder || (defaultValue ? `Select ${defaultValue}` : "")
            }
            className={`${className ?? ""} ${multiselect ? "select-form--multi" : ""} ${!errors?.message ? "" : "border-error border"} select-form-containers rounded-md text-sm`}
            inputValue={searchInput}
            components={{
              MenuList: VirtualizedMenuList,
              IndicatorSeparator: () => null,
            }}
            isSearchable
            menuShouldScrollIntoView={false}
            menuPosition="fixed"
            closeMenuOnSelect={!multiselect}
            hideSelectedOptions={!multiselect}
            menuPlacement={menuPlacement}
            menuPortalTarget={menuPortalTarget}
            filterOption={() => true} // We handle filtering manually
          />
        </div>

        {errors && (
          <div className="flex items-center">
            <p
              className={`input-text-error text-error dark:text-error-lighter mx-1 mt-1 text-left text-[11px]`}
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
      className={`flex ${inline ? "items-center space-x-2" : "flex flex-col"} ${formClassName}`}
    >
      {label && (
        <label
          className={`input-label dropdown-label font-normal font-${fontWeight} text-[14px] text-black`}
          htmlFor={name}
        >
          {label}
          {isRequired && <span className="text-red-500"> *</span>}
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

export default VirtualizedDropdownSelect;

