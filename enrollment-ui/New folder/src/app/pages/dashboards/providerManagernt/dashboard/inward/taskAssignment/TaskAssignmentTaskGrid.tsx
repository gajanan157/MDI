import { useCallback, useEffect, useMemo } from "react";
import type { TFunction } from "i18next";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import {
  AgGridSuperWrapper,
  Pagination,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
} from "../../../shared/providerShell";
import { useProviderGridPagination } from "../../../shared/useProviderGridPagination";
import type { InwardTaskPriority, ProviderInwardTask, TaskAssignmentPanelAction } from "./providerInwardTaskTypes";
import {
  createTaskAssignmentGridColumns,
  TASK_ASSIGNMENT_ROW_HEIGHT,
  isTaskSelectable,
  toTaskGridRows,
  type TaskGridContext,
} from "./taskAssignmentGrid";

type TaskAssignmentTaskGridProps = {
  tasks: ProviderInwardTask[];
  loading: boolean;
  selectedTaskIds: string[];
  assigning: boolean;
  savingPriority: boolean;
  savingDueDate: boolean;
  onToggleSelect: (taskId: string) => void;
  onToggleSelectAll: (taskIds: string[]) => void;
  onPriorityChange: (taskId: string, priority: InwardTaskPriority) => void;
  onDueDateChange: (taskId: string, dueDate: string) => void;
  onRowAction: (taskId: string, action: TaskAssignmentPanelAction) => void;
  onClearFilters: () => void;
  t: TFunction;
};

function TaskAssignmentEmptyState({
  onClearFilters,
  t,
}: Readonly<{
  onClearFilters: () => void;
  t: TFunction;
}>) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <ClipboardDocumentListIcon className="h-8 w-8" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">
        {t("providerMaster.dashboard.inward.taskAssignment.emptyTitle")}
      </h3>
      <p className="mt-1 max-w-sm text-[12px] text-slate-500">
        {t("providerMaster.dashboard.inward.taskAssignment.emptyDescription")}
      </p>
      <Button
        type="button"
        className="mt-4 border border-slate-200 bg-white px-4 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50"
        onClick={onClearFilters}
      >
        {t("providerMaster.dashboard.inward.taskAssignment.clearFilters")}
      </Button>
    </div>
  );
}

function TaskAssignmentGridSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-0 p-3">
      <div className="mb-2 h-7 animate-pulse rounded-lg bg-slate-100" />
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-slate-100 py-2.5"
        >
          <div className="h-4 w-4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-4 animate-pulse rounded bg-slate-100" />
          <div className="h-3 flex-1 animate-pulse rounded bg-slate-100" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function TaskAssignmentTaskGrid({
  tasks,
  loading,
  selectedTaskIds,
  assigning,
  savingPriority,
  savingDueDate,
  onToggleSelect,
  onToggleSelectAll,
  onPriorityChange,
  onDueDateChange,
  onRowAction,
  onClearFilters,
  t,
}: Readonly<TaskAssignmentTaskGridProps>) {
  const {
    page,
    pageSize,
    setPage,
    resetPage,
    handlePageChange,
    handlePageSizeChange,
  } = useProviderGridPagination();

  const allRows = useMemo(
    () => toTaskGridRows(tasks, selectedTaskIds),
    [selectedTaskIds, tasks],
  );

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allRows.slice(start, start + pageSize);
  }, [allRows, page, pageSize]);

  const pageSelectableTaskIds = useMemo(
    () => paginatedRows.filter((task) => isTaskSelectable(task)).map((task) => task.id),
    [paginatedRows],
  );

  useEffect(() => {
    resetPage();
  }, [tasks, resetPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(allRows.length / pageSize));
    if (page > maxPage) setPage(maxPage);
  }, [allRows.length, page, pageSize, setPage]);

  const columns = useMemo(() => createTaskAssignmentGridColumns(t), [t]);

  const handleToggleSelectAllOnPage = useCallback(() => {
    const allPageSelected =
      pageSelectableTaskIds.length > 0 &&
      pageSelectableTaskIds.every((id) => selectedTaskIds.includes(id));

    if (allPageSelected) {
      onToggleSelectAll(selectedTaskIds.filter((id) => !pageSelectableTaskIds.includes(id)));
      return;
    }

    onToggleSelectAll([...new Set([...selectedTaskIds, ...pageSelectableTaskIds])]);
  }, [onToggleSelectAll, pageSelectableTaskIds, selectedTaskIds]);

  const gridContext = useMemo<TaskGridContext>(
    () => ({
      t,
      assigning,
      savingPriority,
      savingDueDate,
      selectedTaskIds,
      pendingTaskIds: pageSelectableTaskIds,
      onToggleSelect,
      onToggleSelectAll: handleToggleSelectAllOnPage,
      onPriorityChange,
      onDueDateChange,
      onRowAction,
    }),
    [
      assigning,
      handleToggleSelectAllOnPage,
      onDueDateChange,
      onRowAction,
      onPriorityChange,
      onToggleSelect,
      pageSelectableTaskIds,
      savingDueDate,
      savingPriority,
      selectedTaskIds,
      t,
    ],
  );

  const showEmpty = !loading && allRows.length === 0;

  return (
    <div className="task-assignment-grid provider-inward-grid relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {loading ? (
        <TaskAssignmentGridSkeleton />
      ) : showEmpty ? (
        <TaskAssignmentEmptyState onClearFilters={onClearFilters} t={t} />
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-hidden">
            <AgGridSuperWrapper
              rowData={paginatedRows}
              columnDefs={columns}
              context={gridContext}
              pagination={false}
              height="100%"
              domLayout="normal"
              getRowId={({ data }) => String((data as ProviderInwardTask).id)}
              getRowHeight={() => TASK_ASSIGNMENT_ROW_HEIGHT}
              getRowClass={(params) => {
                const task = params.data as ProviderInwardTask | undefined;
                const classes: string[] = [];
                if (task && selectedTaskIds.includes(task.id)) {
                  classes.push("task-row-selected");
                }
                if (isTaskSelectable(task)) {
                  classes.push("task-row-selectable");
                }
                return classes.length > 0 ? classes.join(" ") : undefined;
              }}
            />
          </div>
          <Pagination
            className="shrink-0 border-t border-gray-100 px-2 py-1"
            page={page}
            pageSize={pageSize}
            totalItems={allRows.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
          />
        </>
      )}
    </div>
  );
}
