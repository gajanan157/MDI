import type { ComponentType, SVGProps } from "react";
import {
  BeakerIcon,
  BoltIcon,
  BuildingOffice2Icon,
  ComputerDesktopIcon,
  CpuChipIcon,
  CubeIcon,
  HeartIcon,
  HomeModernIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { BuildingStorefrontIcon } from "@heroicons/react/24/solid";

export type InfrastructureCategoryIconTheme = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  boxClass: string;
  iconClass: string;
  countClass: string;
  childAccentClass: string;
};

const DEFAULT_THEME: InfrastructureCategoryIconTheme = {
  icon: CubeIcon,
  boxClass: "bg-slate-100 ring-slate-200/80",
  iconClass: "text-slate-600",
  countClass: "bg-slate-100 text-slate-700 ring-slate-200/70",
  childAccentClass: "bg-gradient-to-b from-slate-400 to-slate-300",
};

/** Per-category icon and color — matches reference grid category styling. */
const INFRASTRUCTURE_CATEGORY_ICON_THEMES: Record<string, InfrastructureCategoryIconTheme> = {
  "bed-infrastructure": {
    icon: HomeModernIcon,
    boxClass: "bg-sky-100 ring-sky-200/80",
    iconClass: "text-sky-600",
    countClass: "bg-sky-50 text-sky-700 ring-sky-200/70",
    childAccentClass: "bg-gradient-to-b from-sky-500 to-sky-300",
  },
  "room-infrastructure": {
    icon: BuildingOffice2Icon,
    boxClass: "bg-violet-100 ring-violet-200/80",
    iconClass: "text-violet-600",
    countClass: "bg-violet-50 text-violet-700 ring-violet-200/70",
    childAccentClass: "bg-gradient-to-b from-violet-500 to-violet-300",
  },
  "ot-infrastructure": {
    icon: ScissorsIcon,
    boxClass: "bg-rose-100 ring-rose-200/80",
    iconClass: "text-rose-600",
    countClass: "bg-rose-50 text-rose-700 ring-rose-200/70",
    childAccentClass: "bg-gradient-to-b from-rose-500 to-rose-300",
  },
  "icu-critical-care": {
    icon: HeartIcon,
    boxClass: "bg-red-100 ring-red-200/80",
    iconClass: "text-red-600",
    countClass: "bg-red-50 text-red-700 ring-red-200/70",
    childAccentClass: "bg-gradient-to-b from-red-500 to-red-300",
  },
  "diagnostic-infrastructure": {
    icon: BeakerIcon,
    boxClass: "bg-cyan-100 ring-cyan-200/80",
    iconClass: "text-cyan-600",
    countClass: "bg-cyan-50 text-cyan-700 ring-cyan-200/70",
    childAccentClass: "bg-gradient-to-b from-cyan-500 to-cyan-300",
  },
  "emergency-infrastructure": {
    icon: BoltIcon,
    boxClass: "bg-amber-100 ring-amber-200/80",
    iconClass: "text-amber-600",
    countClass: "bg-amber-50 text-amber-800 ring-amber-200/70",
    childAccentClass: "bg-gradient-to-b from-amber-500 to-amber-300",
  },
  "utility-infrastructure": {
    icon: WrenchScrewdriverIcon,
    boxClass: "bg-orange-100 ring-orange-200/80",
    iconClass: "text-orange-600",
    countClass: "bg-orange-50 text-orange-800 ring-orange-200/70",
    childAccentClass: "bg-gradient-to-b from-orange-500 to-orange-300",
  },
  "safety-infrastructure": {
    icon: ShieldCheckIcon,
    boxClass: "bg-emerald-100 ring-emerald-200/80",
    iconClass: "text-emerald-600",
    countClass: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    childAccentClass: "bg-gradient-to-b from-emerald-500 to-emerald-300",
  },
  "accessibility-infrastructure": {
    icon: UserGroupIcon,
    boxClass: "bg-purple-100 ring-purple-200/80",
    iconClass: "text-purple-600",
    countClass: "bg-purple-50 text-purple-700 ring-purple-200/70",
    childAccentClass: "bg-gradient-to-b from-purple-500 to-purple-300",
  },
  "support-infrastructure": {
    icon: CubeIcon,
    boxClass: "bg-teal-100 ring-teal-200/80",
    iconClass: "text-teal-600",
    countClass: "bg-teal-50 text-teal-700 ring-teal-200/70",
    childAccentClass: "bg-gradient-to-b from-teal-500 to-teal-300",
  },
  "equipment-infrastructure": {
    icon: CpuChipIcon,
    boxClass: "bg-indigo-100 ring-indigo-200/80",
    iconClass: "text-indigo-600",
    countClass: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
    childAccentClass: "bg-gradient-to-b from-indigo-500 to-indigo-300",
  },
  "pharmacy-infrastructure": {
    icon: BuildingStorefrontIcon,
    boxClass: "bg-lime-100 ring-lime-200/80",
    iconClass: "text-lime-700",
    countClass: "bg-lime-50 text-lime-800 ring-lime-200/70",
    childAccentClass: "bg-gradient-to-b from-lime-500 to-lime-300",
  },
  "laboratory-infrastructure": {
    icon: BeakerIcon,
    boxClass: "bg-blue-100 ring-blue-200/80",
    iconClass: "text-blue-600",
    countClass: "bg-blue-50 text-blue-700 ring-blue-200/70",
    childAccentClass: "bg-gradient-to-b from-blue-500 to-blue-300",
  },
  "infection-control-infrastructure": {
    icon: ShieldExclamationIcon,
    boxClass: "bg-fuchsia-100 ring-fuchsia-200/80",
    iconClass: "text-fuchsia-600",
    countClass: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/70",
    childAccentClass: "bg-gradient-to-b from-fuchsia-500 to-fuchsia-300",
  },
  "digital-mis-infrastructure": {
    icon: ComputerDesktopIcon,
    boxClass: "bg-slate-200 ring-slate-300/80",
    iconClass: "text-slate-700",
    countClass: "bg-slate-100 text-slate-700 ring-slate-200/70",
    childAccentClass: "bg-gradient-to-b from-slate-500 to-slate-400",
  },
};

export function getInfrastructureCategoryIconTheme(
  categoryId: string,
): InfrastructureCategoryIconTheme {
  return INFRASTRUCTURE_CATEGORY_ICON_THEMES[categoryId] ?? DEFAULT_THEME;
}
