import type { ComponentType, ReactNode, SVGProps } from "react";
import type { TFunction } from "i18next";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { ProviderStatChip } from "../../../shared/dashboard";
import type { InwardTaskFilterStatus, ProviderInwardTaskSummary } from "./providerInwardTaskTypes";

type TaskAssignmentKpiCardsProps = {
  summary: ProviderInwardTaskSummary;
  overdueCount: number;
  statusFilter: InwardTaskFilterStatus;
  onStatusFilterChange: (status: InwardTaskFilterStatus) => void;
  onOverdueView: () => void;
  actions?: ReactNode;
  t: TFunction;
};

const TONE_CLASSES = {
  amber: {
    idle: "bg-amber-100 text-amber-800 hover:bg-amber-200/80",
    active: "bg-amber-200 text-amber-900 ring-2 ring-amber-300",
  },
  blue: {
    idle: "bg-blue-100 text-blue-800 hover:bg-blue-200/80",
    active: "bg-blue-200 text-blue-900 ring-2 ring-blue-300",
  },
  emerald: {
    idle: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200/80",
    active: "bg-emerald-200 text-emerald-900 ring-2 ring-emerald-300",
  },
  rose: {
    idle: "bg-rose-100 text-rose-800 hover:bg-rose-200/80",
    active: "bg-rose-200 text-rose-900 ring-2 ring-rose-300",
  },
} as const;

export function TaskAssignmentKpiCards({
  summary,
  overdueCount,
  statusFilter,
  onStatusFilterChange,
  onOverdueView,
  actions,
  t,
}: Readonly<TaskAssignmentKpiCardsProps>) {
  const toggle = (status: InwardTaskFilterStatus) => {
    onStatusFilterChange(statusFilter === status ? "ALL" : status);
  };

  return (
    <section className="shrink-0 border-b border-slate-200 bg-white px-3 py-1">
      <div className="flex flex-nowrap items-center gap-2">
        {actions ? (
          <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <KpiChip
            count={summary.pending}
            label={t("providerMaster.dashboard.inward.taskAssignment.pending")}
            tone="amber"
            icon={ClockIcon}
            active={statusFilter === "PENDING"}
            onClick={() => toggle("PENDING")}
          />
          <KpiChip
            count={summary.assigned + summary.inProgress}
            label={t("providerMaster.dashboard.inward.taskAssignment.assigned")}
            tone="blue"
            icon={UserIcon}
            active={statusFilter === "ASSIGNED"}
            onClick={() => toggle("ASSIGNED")}
          />
          <KpiChip
            count={summary.completed}
            label={t("providerMaster.dashboard.inward.taskAssignment.completed")}
            tone="emerald"
            icon={CheckCircleIcon}
            active={statusFilter === "COMPLETED"}
            onClick={() => toggle("COMPLETED")}
          />
          <KpiChip
            count={overdueCount}
            label={t("providerMaster.dashboard.inward.taskAssignment.overdue")}
            tone="rose"
            icon={ExclamationTriangleIcon}
            active={false}
            onClick={onOverdueView}
          />
        </div>
      </div>
    </section>
  );
}

function KpiChip({
  count,
  label,
  tone,
  icon,
  active,
  onClick,
}: Readonly<{
  count: number;
  label: string;
  tone: keyof typeof TONE_CLASSES;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  active: boolean;
  onClick: () => void;
}>) {
  const toneClass = active ? TONE_CLASSES[tone].active : TONE_CLASSES[tone].idle;
  return (
    <ProviderStatChip
      count={count}
      label={label}
      toneClass={toneClass}
      icon={icon}
      active={active}
      onClick={onClick}
    />
  );
}
