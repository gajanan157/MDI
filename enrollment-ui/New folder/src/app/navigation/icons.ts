import { TbPalette } from "react-icons/tb";
import {
  HomeIcon,
  UserIcon as HiUserIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ClockIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon, 
  DocumentTextIcon,
  InboxArrowDownIcon ,
  UserIcon,
  CircleStackIcon,
  
} from "@heroicons/react/24/outline";
import { ElementType } from "react";

import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import SettingIcon from "@/assets/dualicons/setting.svg?react";

export const navigationIcons: Record<string, ElementType> = {
  dashboards: DashboardsIcon,
  settings: SettingIcon,
  "dashboards.home": HomeIcon,
  "settings.general": HiUserIcon,
  "settings.appearance": TbPalette,
  "dashboards.insurermanagement": HomeIcon,
  "dashboards.inward-management": InboxArrowDownIcon, 
  "dashboards.user-management": UserIcon, 
  "dashboards.tpamanagement": ShieldCheckIcon,
  "dashboards.tpabranches": BuildingOfficeIcon,
  // Child items for insurer management
  "dashboards.insurermanagement-insurer": BuildingOffice2Icon,
  "dashboards.insurermanagement-ic-checklist": BuildingOffice2Icon,
  "dashboards.insurermanagement-office": BuildingOfficeIcon,
  "dashboards.insurermanagement-contact-person": UserGroupIcon,
  "dashboards.insurermanagement-brand-history": ClockIcon,
  "dashboards.insurermanagement-merger": ArrowPathIcon,
  "dashboards.mbmmanagement-dashboard": BuildingOffice2Icon,
  "dashboards.mbmmanagement-inward": BuildingOfficeIcon,
  "dashboards.masterManagement": BuildingOfficeIcon,
  "dashboards.mbmmanagement": DocumentTextIcon,
  "dashboards.enrollmentsystem": ClipboardDocumentListIcon,
  "dashboards.hospitalmanagement": BuildingOfficeIcon,
  "dashboards.hospitalmanagement-empanel": BuildingOffice2Icon,
  "dashboards.hospitalmanagement-create": BuildingOffice2Icon,
  "dashboards.hospitalmanagement-hospital": BuildingOffice2Icon,
  "dashboards.hospitalmanagement-hospitalmapping": BuildingOffice2Icon,
  "dashboards.hospitalmanagement-hospitaldocuments": BuildingOffice2Icon,
  "dashboards.hospitalmanagement-bankdetails": BuildingOffice2Icon,
  "dashboards.hospitalmanagement-excluded-hospital": BuildingOffice2Icon,
  "dashboards.provider-masters": BuildingOffice2Icon,
  "dashboards.provider-masters-empanel": BuildingOffice2Icon,
  "dashboards.provider-masters-bulk-operations": CircleStackIcon,
};
