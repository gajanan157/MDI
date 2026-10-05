import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ConfigFormDialog } from "@/components/shared/dialog/commonDialog";
import { Button, PROVIDER_DRAWER_DIALOG_Z_INDEX_CLASS } from "../../../shared/providerShell";
import { formatToDDMMMYYYY } from "../../../shared/dateFormat";
import type { ProviderInwardTask } from "./providerInwardTaskTypes";

const WORKFLOW_STAGES = [
  "Registration",
  "Documentation",
  "QC",
  "Legal Review",
  "Approval",
  "Closure",
] as const;

type StepState = "done" | "current" | "upcoming";

type WorkflowStep = {
  stage: string;
  index: number;
  state: StepState;
};

type TimelineEntry = {
  id: string;
  title: string;
  performedAt: string;
  performedBy: string;
  state: "done" | "current";
};

type TaskWorkflowDialogProps = {
  open: boolean;
  task: ProviderInwardTask | null;
  onClose: () => void;
};

function resolveStepState(
  index: number,
  activeIndex: number,
  isCompleted: boolean,
): StepState {
  if (isCompleted) return "done";
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "current";
  return "upcoming";
}

function buildWorkflowSteps(task: ProviderInwardTask): WorkflowStep[] {
  const currentIndex = WORKFLOW_STAGES.findIndex(
    (stage) => stage.toLowerCase() === task.workflowStage.toLowerCase(),
  );
  const activeIndex = Math.max(0, currentIndex);
  const isCompleted = task.status === "COMPLETED";

  return WORKFLOW_STAGES.map((stage, index) => ({
    stage,
    index,
    state: resolveStepState(index, activeIndex, isCompleted),
  }));
}

function formatTimelineDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = formatToDDMMMYYYY(iso.slice(0, 10));
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}, ${time}`;
}

function buildWorkflowTimeline(task: ProviderInwardTask): TimelineEntry[] {
  const actor = task.assignedUserName ?? "Anup Kalam";
  const baseDate = task.dueDate ? `${task.dueDate}T10:22:00` : "2026-07-21T10:22:00";
  const progressDate = task.dueDate ? `${task.dueDate}T10:25:00` : "2026-07-21T10:25:00";

  const entries: TimelineEntry[] = [
    {
      id: `${task.id}-inward`,
      title: "Inward Created",
      performedAt: baseDate,
      performedBy: actor,
      state: "done",
    },
    {
      id: `${task.id}-instance`,
      title: "Workflow Instance Created",
      performedAt: baseDate,
      performedBy: "System",
      state: "done",
    },
    {
      id: `${task.id}-tasks`,
      title: "Tasks Generated",
      performedAt: baseDate,
      performedBy: "System",
      state: "done",
    },
  ];

  if (task.status === "COMPLETED") {
    entries.push({
      id: `${task.id}-completed`,
      title: "Assignment Completed",
      performedAt: progressDate,
      performedBy: actor,
      state: "done",
    });
    return entries;
  }

  entries.push({
    id: `${task.id}-assignment`,
    title: task.assignedUserId ? "Assigned" : "Assignment In Progress",
    performedAt: progressDate,
    performedBy: actor,
    state: "current",
  });

  return entries;
}

export function TaskWorkflowDialog({ open, task, onClose }: Readonly<TaskWorkflowDialogProps>) {
  const { t } = useTranslation();
  const noopForm = useForm<Record<string, unknown>>({ defaultValues: {} });

  const steps = useMemo(() => (task ? buildWorkflowSteps(task) : []), [task]);
  const timeline = useMemo(() => (task ? buildWorkflowTimeline(task) : []), [task]);

  if (!open || !task) return null;

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      overlayZIndexClassName={PROVIDER_DRAWER_DIALOG_Z_INDEX_CLASS}
      title={t("providerMaster.dashboard.inward.taskAssignment.workflowDialogTitle", {
        task: task.name,
      })}
      titleId="task-workflow-dialog-title"
      fields={[]}
      form={noopForm}
      onSubmit={() => {}}
      maxColumns={1}
      widthClassName="w-full max-w-lg sm:w-[92%]"
      hideFooter
      footer={
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-2">
          <div className="flex justify-end">
            <Button type="button" variant="outlined" onClick={onClose}>
              {t("providerMaster.button.cancel")}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pb-1">
        <div className="rounded-lg border border-violet-100 bg-violet-50/80 px-3 py-2.5 text-[11px]">
          <p className="font-medium text-slate-700">
            {t("providerMaster.dashboard.inward.taskAssignment.colWorkflowStage")}:{" "}
            <span className="font-semibold text-violet-700">{task.workflowStage}</span>
          </p>
          <p className="mt-1 text-slate-500">
            {t("providerMaster.dashboard.inward.taskAssignment.workflowDueDate", {
              date: formatToDDMMMYYYY(task.dueDate),
            })}
          </p>
        </div>

        <ol className="space-y-2">
          {steps.map((step) => (
            <li
              key={step.stage}
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[12px] ${
                step.state === "current"
                  ? "border-violet-200 bg-violet-50 font-semibold text-violet-800"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  step.state === "current"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step.index + 1}
              </span>
              <span className={step.state === "current" ? "text-violet-800" : "text-slate-500"}>
                {step.stage}
              </span>
              {step.state === "current" ? (
                <span className="ml-auto text-[11px] font-medium text-violet-600">
                  {t("providerMaster.dashboard.inward.taskAssignment.workflowCurrentStage")}
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <div>
          <h3 className="mb-3 text-[13px] font-semibold text-slate-800">
            {t("providerMaster.dashboard.inward.taskAssignment.workflowTimelineTitle")}
          </h3>
          <ol className="relative space-y-0">
            {timeline.map((entry, index) => {
              const isLast = index === timeline.length - 1;
              return (
                <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {!isLast ? (
                    <span
                      className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-px bg-slate-200"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center">
                    {entry.state === "done" ? (
                      <CheckCircleIcon className="h-6 w-6 text-emerald-500" aria-hidden />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-4 ring-blue-50">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[13px] font-semibold text-slate-800">{entry.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {formatTimelineDateTime(entry.performedAt)}
                    </p>
                    <p className="text-[11px] text-slate-500">{entry.performedBy}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </ConfigFormDialog>
  );
}
