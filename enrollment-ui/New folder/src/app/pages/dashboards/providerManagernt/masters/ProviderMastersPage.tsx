import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import CheckListButton from "@/app/pages/dashboards/insurerManagement/IcCheckList/CheckListButton";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import {
  AgGridSuperWrapper,
  Button,
  CommonSearch,
  Page,
  PageContent,
  Pagination,
  ViewDialog,
} from "../shared/providerShell";
import { ProviderMasterActivityLogDialog } from "./components/ProviderMasterActivityLogDialog";
import { PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS } from "../shared/providerButtonStyles";
import { useProviderMastersPage } from "./useProviderMastersPage";

export default function ProviderMastersPage() {
  const page = useProviderMastersPage();

  return (
    <Page title={page.t("providerMaster.mastersPage.title")}>
      <PageContent className="flex min-h-0 flex-1 flex-col">
        <div
          className={`flex min-h-0 w-full flex-1 flex-col ${page.searchOpen ? "gap-2" : "gap-0"}`}
        >
          <div className="flex w-full shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex shrink-0 flex-wrap items-center gap-2 self-center sm:self-auto">
              <CheckListButton
                onClick={() => page.setSearchOpen((open) => !open)}
                label={
                  page.searchOpen
                    ? page.t("providerMaster.button.hideSearch")
                    : page.t("providerMaster.button.search")
                }
                bgColor="bg-blue-600"
                textColor="text-white"
                size="text-xs"
                className={PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS}
                isSearch
              />
              {page.canWrite ? (
                <Button
                  type="button"
                  color="primary"
                  className="h-8 gap-2 rounded-lg px-4 text-xs font-medium"
                  onClick={() =>
                    page.navigate(`/provider-masters/masters/${page.selectedMasterKey}/create`)
                  }
                >
                  {page.t("providerMaster.button.add")}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outlined"
                className="h-8 gap-2 rounded-lg px-4 text-xs font-medium"
                onClick={() => page.setActivityLogOpen(true)}
                title={page.t("providerMaster.mastersPage.auditLogTitle")}
              >
                <ClipboardDocumentListIcon className="h-4 w-4" />
                {page.t("providerMaster.mastersPage.auditLog")}
              </Button>
            </div>
            <div className="w-full sm:max-w-sm">
              <DropdownSelect
                control={page.masterForm.control}
                name="masterKey"
                options={page.masterOptions}
                value={page.selectedMasterKey}
                onChange={page.handleMasterChange}
                className="text-xs"
              />
            </div>
          </div>

          {page.searchOpen ? (
            <CommonSearch
              fields={page.searchFields}
              onSearch={page.handleSearch}
              showToggleButton={false}
              isOpen={true}
              onToggle={() => page.setSearchOpen(false)}
              allowEmptySearch
            />
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col gap-1">
            <AgGridSuperWrapper
              rowData={page.pagedRows}
              columnDefs={page.columnDefs}
              pageSize={page.pageSize}
              height="100%"
              pagination={false}
              onRowClick={(row) => page.setViewRecord(row)}
              openOnRowClick={false}
            />
            <Pagination
              className="shrink-0"
              page={page.page}
              pageSize={page.pageSize}
              totalItems={page.totalItems}
              onPageChange={page.setPage}
              onPageSizeChange={page.setPageSize}
              pageSizeOptions={page.pageSizeOptions}
            />
          </div>
        </div>

        <ViewDialog
          isOpen={Boolean(page.viewRecord)}
          onClose={() => page.setViewRecord(null)}
          title={page.viewRecord ? `${page.selectedConfig.title} Details` : "Details"}
          fields={page.viewFields}
          gridColumns={2}
          panelClassName="max-w-3xl"
        />

        <ConfirmModal
          show={page.isDeleteOpen}
          onClose={page.handleDeleteConfirmClose}
          messages={page.deleteConfirmMessages}
          onOk={page.handleDeleteConfirm}
          confirmLoading={page.deleteConfirmLoading}
          state={page.deleteModalState}
        />

        <ProviderMasterActivityLogDialog
          open={page.activityLogOpen}
          onClose={() => page.setActivityLogOpen(false)}
          masterKey={page.selectedMasterKey}
          masterTitle={page.selectedConfig.title}
        />
      </PageContent>
    </Page>
  );
}
