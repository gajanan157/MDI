import { useCallback, useRef } from "react";
import clsx from "clsx";
import Select, {
  components,
  type GroupBase,
  type MenuListProps,
  type MenuProps,
  type OptionProps,
  type StylesConfig,
} from "react-select";

export type BillScopeOption = {
  label: string;
  value: string;
  isDisabled?: boolean;
  disabledReason?: string;
};

/** Multi-column grid inside the dropdown (2 cols mobile, 4 from sm+) — matches discount category picker. */
export function BillScopeMenuList(
  props: MenuListProps<BillScopeOption, true, GroupBase<BillScopeOption>>,
) {
  return (
    <components.MenuList {...props}>
      <div className="grid grid-cols-2 gap-1.5 p-2 sm:grid-cols-4 [&>div]:min-w-0">
        {props.children}
      </div>
    </components.MenuList>
  );
}

const MENU_PAD_PX = 10;

/**
 * react-select left-aligns the menu to the control; with a wide panel the right edge
 * can sit past the viewport. Shift with translateX so the full grid stays visible.
 */
function ViewportClampedMenu(
  props: MenuProps<BillScopeOption, true, GroupBase<BillScopeOption>>,
) {
  const innerRefStable = useRef(props.innerRef);
  innerRefStable.current = props.innerRef;

  const applyClamp = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    el.style.transform = "";
    requestAnimationFrame(() => {
      const vw = window.innerWidth;
      const rect = el.getBoundingClientRect();
      let dx = 0;
      if (rect.right > vw - MENU_PAD_PX) {
        dx = vw - MENU_PAD_PX - rect.right;
      }
      const leftAfter = rect.left + dx;
      if (leftAfter < MENU_PAD_PX) {
        dx += MENU_PAD_PX - leftAfter;
      }
      if (dx !== 0) {
        el.style.transform = `translateX(${dx}px)`;
      }
    });
  }, []);

  const mergedInnerRef = useCallback(
    (el: HTMLDivElement | null) => {
      const ir = innerRefStable.current;
      if (typeof ir === "function") {
        ir(el);
      } else if (ir != null && typeof ir === "object" && "current" in ir) {
        (ir as { current: HTMLDivElement | null }).current = el;
      }
      applyClamp(el);
    },
    [applyClamp],
  );

  return <components.Menu {...props} innerRef={mergedInnerRef} />;
}

function billScopeOptionBackgroundColor(
  isSelected?: boolean,
  isFocused?: boolean,
  isDisabled?: boolean,
): string {
  if (isDisabled) return "#f9fafb";
  if (isSelected) return "#eff6ff";
  if (isFocused) return "#f3f4f6";
  return "#fff";
}

const DISCOUNT_MATCH_CONTROL = {
  minHeight: 32,
  height: 32,
  fontSize: 12,
  minWidth: 0,
  alignItems: "center" as const,
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  borderWidth: 1,
  borderStyle: "solid" as const,
  borderColor: "#cdcdcd",
  borderRadius: 4,
  backgroundColor: "#fff",
  boxShadow: "none",
  "&:hover": { borderColor: "#cdcdcd" },
};

const STYLES_SM = {
  control: (base: Record<string, unknown>, state: { isFocused?: boolean }) => ({
    ...base,
    ...DISCOUNT_MATCH_CONTROL,
    borderColor: state.isFocused ? "#cdcdcd" : "#cdcdcd",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(0,0,0,0.04)" : "none",
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    flexWrap: "nowrap",
    maxHeight: 28,
    maxWidth: "100%",
    overflowY: "hidden",
    overflowX: "auto",
    minWidth: 0,
    flex: "1 1 0",
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 8,
    paddingRight: 4,
    gap: 4,
    WebkitOverflowScrolling: "touch",
  }),
  multiValue: (base: Record<string, unknown>) => ({ ...base, flexShrink: 0, minWidth: 0 }),
  multiValueRemove: (base: Record<string, unknown>) => ({
    ...base,
    cursor: "pointer",
    paddingLeft: 4,
    paddingRight: 4,
    color: "#6b7280",
    ":hover": { backgroundColor: "#fef2f2", color: "#dc2626" },
  }),
  indicatorsContainer: (base: Record<string, unknown>) => ({
    ...base,
    flexShrink: 0,
    alignSelf: "stretch",
    height: 30,
    paddingTop: 0,
    paddingBottom: 0,
  }),
  dropdownIndicator: (base: Record<string, unknown>) => ({ ...base, padding: 6, color: "#6b7280" }),
  clearIndicator: (base: Record<string, unknown>) => ({ ...base, padding: 4 }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    zIndex: 50000,
    borderRadius: 4,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
    minWidth: 0,
    width: "min(56rem, calc(100vw - 16px))",
    maxWidth: "calc(100vw - 16px)",
  }),
  menuList: (base: Record<string, unknown>) => ({ ...base, maxHeight: 320, padding: 0 }),
  menuPortal: (base: Record<string, unknown>) => ({ ...base, zIndex: 50000 }),
  option: (
    base: Record<string, unknown>,
    state: { isSelected?: boolean; isFocused?: boolean; isDisabled?: boolean },
  ) => ({
    ...base,
    padding: 0,
    borderRadius: 4,
    backgroundColor: billScopeOptionBackgroundColor(
      state.isSelected,
      state.isFocused,
      state.isDisabled,
    ),
    color: state.isDisabled ? "#9ca3af" : "#111827",
    cursor: state.isDisabled ? "not-allowed" : "default",
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    fontSize: 12,
    color: "#9ca3af",
    margin: 0,
  }),
} as StylesConfig<BillScopeOption, true>;

const STYLES_MD = STYLES_SM;

function BillScopeCheckboxOption(
  optionProps: OptionProps<BillScopeOption, true, GroupBase<BillScopeOption>>,
  optionTextCls: string,
) {
  const {
    data,
    innerRef,
    innerProps,
    isDisabled,
    isSelected,
    label,
    selectOption,
  } = optionProps;
  const disabled = Boolean(isDisabled || data.isDisabled);
  const reason = data.disabledReason;

  return (
    <div
      ref={innerRef}
      {...innerProps}
      onMouseDown={(event) => {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();
        selectOption(data);
      }}
      className={clsx(
        "flex w-full items-start gap-1.5 px-1.5 py-1.5",
        disabled && "cursor-not-allowed text-gray-400",
        !disabled && "cursor-pointer",
        isSelected && !disabled && "bg-blue-50 text-gray-900",
        !isSelected && !disabled && "text-gray-900 hover:bg-gray-100",
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        readOnly
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-gray-300"
      />
      <span className={`min-w-0 flex-1 leading-snug ${optionTextCls}`}>
        {label}
        {disabled && reason ? (
          <span className="mt-0.5 block text-[10px] text-gray-400">{reason}</span>
        ) : null}
      </span>
    </div>
  );
}

export function BillScopeMultiSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  size = "md",
  selectClassName = "",
  disabled = false,
  menuPlacement = "auto",
}: Readonly<{
  label: string;
  placeholder: string;
  value: string[];
  onChange: (next: string[]) => void;
  options: BillScopeOption[];
  /** `sm` = compact (32px control); `md` = default discount block */
  size?: "sm" | "md";
  selectClassName?: string;
  /** When true, control is non-interactive (e.g. until a section toggle is on). */
  disabled?: boolean;
  menuPlacement?: "auto" | "bottom" | "top";
}>) {
  const selected = (value ?? []).map((v) => {
    const opt = options.find((o) => o.value === v);
    return opt ?? { label: v, value: v };
  });
  const styles = size === "sm" ? STYLES_SM : STYLES_MD;
  const labelCls =
    size === "sm"
      ? "mb-0.5 line-clamp-2 min-h-4 text-[10px] font-medium leading-4 text-gray-700"
      : "mb-0.5 text-xs font-medium text-gray-700";
  const optionTextCls = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <div className={`flex min-w-0 flex-col ${disabled ? "opacity-55" : ""}`.trim()}>
      {label ? <span className={labelCls}>{label}</span> : null}
      <Select<BillScopeOption, true>
        isMulti
        isSearchable
        isDisabled={disabled}
        placeholder={placeholder}
        value={selected}
        options={options}
        isOptionDisabled={(option) => Boolean(option.isDisabled)}
        onChange={(sel) =>
          onChange(
            (sel ?? [])
              .filter((s) => !s.isDisabled)
              .map((s) => s.value),
          )
        }
        components={{
          Menu: ViewportClampedMenu,
          MenuList: BillScopeMenuList,
          Option: (optionProps) => BillScopeCheckboxOption(optionProps, optionTextCls),          IndicatorSeparator: () => null,
        }}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        menuPlacement={menuPlacement}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        menuPosition="fixed"
        classNamePrefix="select-form"
        className={`select-form-containers select-form--multi select-form--multi-scroll-x bg-white ${
          size === "sm" ? "text-xs" : "text-sm"
        } ${selectClassName}`.trim()}
        styles={styles}
      />
    </div>
  );
}
