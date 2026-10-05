export type InfraFacilitySubTab = "infrastructure" | "facility" | "manpower";

type InfraFacilitySubTabBarProps = {
  activeSubTab: InfraFacilitySubTab;
  onSubTabChange: (subTab: InfraFacilitySubTab) => void;
};

const SUB_TABS: { id: InfraFacilitySubTab; label: string }[] = [
  { id: "infrastructure", label: "Infrastructure" },
  { id: "facility", label: "Facility" },
  { id: "manpower", label: "Manpower" },
];

function subTabToggleClass(isActive: boolean): string {
  const base =
    "rounded px-2 py-0.5 text-[10px] font-semibold leading-tight transition-all sm:px-2.5 sm:text-[11px]";
  if (isActive) {
    return `${base} bg-white text-primary-700 shadow-sm ring-1 ring-gray-200/80`;
  }
  return `${base} text-gray-600 hover:text-gray-900`;
}

export function InfraFacilitySubTabBar({
  activeSubTab,
  onSubTabChange,
}: Readonly<InfraFacilitySubTabBarProps>) {
  return (
    <div
      className="inline-flex rounded-md border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/80 p-0.5 shadow-sm"
      role="group"
      aria-label="Infrastructure and facility sections"
    >
      {SUB_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSubTabChange(tab.id)}
          className={subTabToggleClass(activeSubTab === tab.id)}
          aria-pressed={activeSubTab === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
