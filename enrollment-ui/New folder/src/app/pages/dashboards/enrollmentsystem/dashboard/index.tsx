import { Page } from "@/components/shared/Page";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { fetchCorporateInwardDataForAllUser } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  InboxStackIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import CreateCorporateInwardModal from "./components/CreateCorporateInwardModal";
import DashboardCard from "./corporate/DashboardCard";

export default function DashboardIndex() {
  const { statusCountForAllUsers } = useAppSelector((state) => state.broker);
  const { selectedRoles } = useAppSelector((state) => state.tpa);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useBreadcrumb([
    { title: t("nav.dashboards.enrollmentsystem") },
    { title: t("dashboard.pageTitle") },
  ]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    let payload: {
      stageName: string;
      businessEntityName: string;
      workflowCode?: string;
    } | null = null;

    if (
      selectedRoles.includes("corporate_enrolment_admin") ||
      selectedRoles.includes("enrolment_super_admin")
    ) {
      payload = {
        stageName: "admin_pending",
        businessEntityName: "POLICY",
      };
    } else if (selectedRoles.includes("corporate_enrolment_processor")) {
      payload = {
        stageName: "processor_pending",
        businessEntityName: "POLICY",
        workflowCode: "FRESH_POLICY_ENROLLMENT",
      };
    } else if (selectedRoles?.includes("corporate_endorsement_processor")) {
      payload = {
        stageName: "processor_pending",
        businessEntityName: "POLICY",
        workflowCode: "FRESH_POLICY_ENDORSEMENT",
      };
    } else if (selectedRoles?.includes("corporate_enrolment_qc")) {
      payload = {
        stageName: "qc_pending",
        businessEntityName: "POLICY",
        workflowCode: "FRESH_POLICY_ENROLLMENT",
      };
    } else if (selectedRoles?.includes("corporate_endorsement_qc")) {
      payload = {
        stageName: "qc_pending",
        businessEntityName: "POLICY",
        workflowCode: "FRESH_POLICY_ENDORSEMENT",
      };
    }

    if (payload) {
      dispatch(fetchCorporateInwardDataForAllUser(payload));
    }
  }, [selectedRoles, dispatch]);

  const isQC = selectedRoles?.some((role: string) => role?.includes("_qc"));
  const isProcessor = selectedRoles?.some((role: string) =>
    role?.includes("_processor")
  );
  const isAdmin = selectedRoles?.some(
    (role: string) =>
      role?.includes("_admin") || role === "enrolment_super_admin"
  );

  const userType = isQC
    ? "QC Reviewer"
    : isProcessor
    ? "Data Processor"
    : isAdmin
    ? "Enrolment Admin"
    : "Operations User";

  const roleBadgeStyle = isQC
    ? "bg-purple-50 text-purple-700 border-purple-200"
    : isProcessor
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

  const [open, setOpen] = useState(false);

  return (
    <Page title={t("dashboard.pageTitle")}>
      <div className="flex flex-col h-[calc(100vh-4.25rem)] p-3 space-y-3 overflow-hidden">
        {/* Compact Header Bar */}
        <div className="flex shrink-0 items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-slate-800 dark:text-white">
              Operations Workload Queue
            </h1>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${roleBadgeStyle}`}
            >
              {userType}
            </span>
            <span className="text-xs text-slate-400">
              Active Maker-Checker Session
            </span>
          </div>

          <button
            onClick={() => navigate("/enrolment-system/corporate-enrolment")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 active:bg-blue-800 cursor-pointer"
          >
            <InboxStackIcon className="h-3.5 w-3.5" />
            <span>Open Inward Queue</span>
          </button>
        </div>

        {/* Compact Cards Grid (4 side-by-side) */}
        <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            variant="primary"
            title="Total Workload"
            count={statusCountForAllUsers?.total}
            subtitle="In current queue"
            badge="ALL"
            action="Open Cases"
            navigateTo="/enrolment-system/corporate-enrolment"
            icon={<ClipboardDocumentListIcon className="h-4 w-4" />}
          />
          <DashboardCard
            variant="warning"
            title="Pending Action"
            count={statusCountForAllUsers?.pending}
            subtitle="Requires input/check"
            badge="PENDING"
            action="Review Queue"
            navigateTo="/enrolment-system/corporate-enrolment"
            icon={<ClockIcon className="h-4 w-4" />}
          />
          <DashboardCard
            variant="danger"
            title="Rejected Cases"
            count={statusCountForAllUsers?.rejected}
            subtitle="Need remediation"
            badge="FLAGGED"
            action="View Rejected"
            navigateTo="/enrolment-system/corporate-enrolment"
            icon={<XCircleIcon className="h-4 w-4" />}
          />
          <DashboardCard
            variant="default"
            title="Completed Intake"
            count={statusCountForAllUsers?.completed}
            subtitle="Successfully finalized"
            badge="COMPLETED"
            action="View Records"
            navigateTo="/enrolment-system/corporate-enrolment"
            icon={<CheckCircleIcon className="h-4 w-4" />}
          />
        </div>

        {/* Compact Quick Access Tiles */}
        <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Quick Navigation
          </h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <div
              onClick={() => navigate("/enrolment-system/corporate-enrolment")}
              className="group flex items-center justify-between rounded-lg border border-slate-200 p-2.5 transition-all duration-150 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer dark:border-dark-600 dark:hover:bg-dark-700"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-dark-700">
                  <InboxStackIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Corporate Enrolment Intake
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Process inward document pipeline
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </div>

            <div
              onClick={() => navigate("/enrolment-system/policy-search")}
              className="group flex items-center justify-between rounded-lg border border-slate-200 p-2.5 transition-all duration-150 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer dark:border-dark-600 dark:hover:bg-dark-700"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-dark-700">
                  <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Policy Search & Lookup
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Search active and historical policies
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
            </div>

            <div
              onClick={() => navigate("/enrolment-system/admin-dashboard")}
              className="group flex items-center justify-between rounded-lg border border-slate-200 p-2.5 transition-all duration-150 hover:border-purple-400 hover:bg-purple-50/40 cursor-pointer dark:border-dark-600 dark:hover:bg-dark-700"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-50 text-purple-600 dark:bg-dark-700">
                  <ShieldCheckIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Admin Operations Hub
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Master tables and user assignments
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {open && (
        <CreateCorporateInwardModal
          open={open}
          onClose={() => setOpen(false)}
          isCorporateInward
        />
      )}
    </Page>
  );
}