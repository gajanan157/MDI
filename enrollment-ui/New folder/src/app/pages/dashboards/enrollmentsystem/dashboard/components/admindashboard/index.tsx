import { Page } from "@/components/shared/Page";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchCorporateInwardData, fetchCorporateInwardDataStatusCount } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  IdentificationIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import OtherSources from "./OtherSources";
import QuickAccessCard from "./QuickAccessCard";
import StatsCard from "./StatsCard";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"psu" | "other">("other");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { statusCount } = useAppSelector((state: any) => state.broker);
  const dispatch = useAppDispatch();

  useBreadcrumb([
    { title: t("nav.dashboards.enrollmentsystem") },
    { title: t("nav.dashboards.adminDashboard") },
  ]);

  const statsList = [
    {
      title: "Total Enrolments",
      count: statusCount?.TOTAL_ENROLLMENT,
      color: "bg-blue-600",
      icon: <DocumentTextIcon className="h-4 w-4 text-blue-600" />,
    },
    {
      title: "Endorsements",
      count: statusCount?.TOTAL_ENDORSEMENT,
      color: "bg-purple-700",
      icon: <ArrowsRightLeftIcon className="h-4 w-4 text-purple-600" />,
    },
    {
      title: "Policies Issued",
      count: statusCount?.COMPLETED,
      color: "bg-green-700",
      icon: <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />,
    },
    {
      title: "Processor Pending",
      count: statusCount?.PROCESSOR_PENDING,
      color: "bg-orange-600",
      icon: <ClockIcon className="h-4 w-4 text-amber-600" />,
    },
    {
      title: "QC Pending",
      count: statusCount?.QC_PENDING,
      color: "bg-indigo-600",
      icon: <ClipboardDocumentCheckIcon className="h-4 w-4 text-indigo-600" />,
    },
  ];

  const quickAccessList = [
    {
      title: "Corporate Group",
      icon: <BuildingLibraryIcon className="h-4 w-4 text-indigo-600" />,
      path: "/master-management/corporate-group",
    },
    {
      title: "Corporate",
      icon: <BuildingOffice2Icon className="h-4 w-4 text-orange-600" />,
      path: "/master-management/corporate",
    },
    {
      title: "Broker",
      icon: <UserGroupIcon className="h-4 w-4 text-cyan-600" />,
      path: "/master-management/broker",
    },
    {
      title: "Agent",
      icon: <UserIcon className="h-4 w-4 text-emerald-600" />,
      path: "/master-management/agent",
    },
    {
      title: "Policy Search",
      icon: <MagnifyingGlassIcon className="h-4 w-4 text-blue-600" />,
      path: "/enrolment-system/policy-search",
    },
    {
      title: "E-Cards",
      icon: <IdentificationIcon className="h-4 w-4 text-purple-600" />,
      path: "/enrolment-system/e-cards",
    },
    {
      title: "Processor & QC",
      icon: <ClipboardDocumentCheckIcon className="h-4 w-4 text-slate-700" />,
      path: "/enrolment-system/dashboard",
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchCorporateInwardDataStatusCount()),
        dispatch(fetchCorporateInwardData({ page: 1, size: 20 })),
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    dispatch(fetchCorporateInwardDataStatusCount());
  }, [dispatch]);

  const tabs = [
    {
      id: "other",
      title: "Other Sources (Portal, Manual, OCR)",
      count: statusCount?.TOTAL ?? 5,
      icon: GlobeAltIcon,
    },
  ];

  return (
    <Page title={t("dashboard.pageTitle")}>
      <div className="flex flex-col h-[calc(100vh-4.25rem)] p-2.5 space-y-2 overflow-hidden">
        {/* Compact Header Bar */}
        <div className="flex shrink-0 items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-slate-800 dark:text-white">
              Enrollment Operations Hub
            </h1>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live System
            </span>
            <span className="text-[11px] text-slate-500">
              Total Inwards: <strong className="text-slate-800 font-semibold">{statusCount?.TOTAL ?? 0}</strong>
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 cursor-pointer dark:border-dark-600 dark:bg-dark-800 dark:text-slate-200"
            title="Refresh queue and stats"
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Queue"}</span>
          </button>
        </div>

        {/* Compact Stats Row (5 side-by-side, max height ~52px) */}
        <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          {statsList.map((item) => (
            <StatsCard key={item.title} {...item} />
          ))}
        </div>

        {/* Compact Quick Access Bar (7 horizontal chips, max height ~36px) */}
        <div className="shrink-0">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
            {quickAccessList.map((item) => (
              <QuickAccessCard key={item.title} {...item} />
            ))}
          </div>
        </div>

        {/* Work Items Table Section (Expands to fill remainder with NO page scroll) */}
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          {/* Compact Tabs Bar */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-dark-700 pb-1.5">
            <div className="flex items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "psu" | "other")}
                    className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-dark-600 dark:bg-dark-700 dark:text-slate-300"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : "text-slate-500"}`} />
                    <span>{tab.title}</span>
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700 dark:bg-dark-600 dark:text-slate-300"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid takes full remaining height */}
          <div className="flex min-h-0 flex-1 flex-col pt-1.5">
            {activeTab === "other" && <OtherSources />}
          </div>
        </div>
      </div>
    </Page>
  );
}