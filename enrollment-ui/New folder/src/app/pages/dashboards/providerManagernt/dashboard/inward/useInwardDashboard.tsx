import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { canWrite } from "@/app/auth/permission-check";
import { getUserPermissions } from "@/app/auth/permissions";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";
import CreateCorporateInwardModal from "@/app/pages/dashboards/enrollmentsystem/dashboard/components/CreateCorporateInwardModal";
import { useAppSelector, useDisclosure } from "../../shared/providerShell";
import { ProviderInwardDashboardSection } from "./components/ProviderInwardDashboardSection";
import { useProviderInwardList } from "./useProviderInwardList";
import { TaskAssignmentDrawer } from "./taskAssignment/TaskAssignmentDrawer";
import { useProviderInwardTaskAssignment } from "./taskAssignment/useProviderInwardTaskAssignment";

function canCreateProviderInward(permissions: ReadonlySet<string>): boolean {
  return (
    canWrite(permissions, "inward") ||
    permissions.has("inward.management")
  );
}

export function useInwardDashboard() {
  const { t } = useTranslation();
  const { token } = useKeycloak();
  const permissions = useMemo(() => getUserPermissions(token ?? ""), [token]);
  const { selectedRoles } = useAppSelector((state) => state.tpa);
  const effectivePermissions: ReadonlySet<string> = selectedRoles?.length > 0 ? new Set(selectedRoles) : permissions;

  const canCreateInward = canCreateProviderInward(effectivePermissions);
  const inwardState = useProviderInwardList();
  const [createOpen, setCreateOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const taskAssignment = useProviderInwardTaskAssignment(() => {
    inwardState.handleRefresh();
  });
  const [isInwardSearchOpen, { toggle: toggleInwardSearch }] = useDisclosure(false);

  const showCreateInward = canCreateInward && inwardState.activeCard === "TODAY";

  const toolbarActions = (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        color="primary"
        variant={isInwardSearchOpen ? "filled" : "outlined"}
        className="h-8 gap-1.5 px-3 text-xs"
        onClick={toggleInwardSearch}
        aria-label={
          isInwardSearchOpen
            ? t("providerMaster.button.hideSearch")
            : t("providerMaster.button.search")
        }
      >
        <MagnifyingGlassIcon className="size-4" aria-hidden="true" />
        <span>
          {isInwardSearchOpen
            ? t("providerMaster.button.hideSearch")
            : t("providerMaster.button.search")}
        </span>
      </Button>
      {showCreateInward ? (
        <Button
          color="primary"
          className="h-8 gap-1.5 px-3 text-xs"
          onClick={() => setCreateOpen(true)}
          aria-label={t("providerMaster.dashboard.inward.createInward")}
        >
          <span>{t("providerMaster.dashboard.inward.createInward")}</span>
        </Button>
      ) : null}
    </div>
  );

  const content = (
    <>
      <ProviderInwardDashboardSection
        inwardState={inwardState}
        isSearchOpen={isInwardSearchOpen}
        onToggleSearch={toggleInwardSearch}
        onAssignClick={taskAssignment.openDrawer}
        summaryRefreshKey={taskAssignment.summaryVersion}
        showInsights={showInsights}
      />

      {createOpen ? (
        <CreateCorporateInwardModal
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
            inwardState.refreshAfterCreate();
          }}
          isInward
        />
      ) : null}

      <TaskAssignmentDrawer assignment={taskAssignment} />
    </>
  );

  return {
    inwardState,
    canCreateInward,
    showCreateInward,
    createOpen,
    setCreateOpen,
    isInwardSearchOpen,
    toggleInwardSearch,
    showInsights,
    setShowInsights,
    toolbarActions,
    content,
  };
}
