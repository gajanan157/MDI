import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Spinner } from "@/components/ui";
import { AgGridSuperWrapper } from "../../../shared/providerShell";
import {
    createProviderInwardGridColumns,
    navigateToProviderInward,
    PROVIDER_INWARD_GRID_AUTO_SIZE,
} from "../providerInwardGrid";
import { PROVIDER_INWARD_GRID_STYLES } from "../providerInwardGridStyles";
import type { ProviderInwardRow } from "../providerInwardTypes";

type ProviderInwardGridSectionProps = {
    rowData: ProviderInwardRow[];
    loading?: boolean;
    onAssignClick?: (row: ProviderInwardRow) => void;
    summaryRefreshKey?: number;
};

export function ProviderInwardGridSection({
    rowData,
    loading = false,
    onAssignClick,
    summaryRefreshKey,
}: Readonly<ProviderInwardGridSectionProps>) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const columns = useMemo(
        () => createProviderInwardGridColumns(t, navigate, onAssignClick, summaryRefreshKey),
        [navigate, onAssignClick, summaryRefreshKey, t],
    );

    return (
        <div className="provider-inward-grid relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
            <style>{PROVIDER_INWARD_GRID_STYLES}</style>
            {loading ? (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 dark:bg-dark-700/70">
                    <Spinner color="primary" className="size-8 border-2" />
                </div>
            ) : null}
            <AgGridSuperWrapper
                rowData={rowData}
                columnDefs={columns}
                pagination={false}
                height="100%"
                domLayout="normal"
                autoSizeStrategy={PROVIDER_INWARD_GRID_AUTO_SIZE}
                getRowId={({ data }) => String((data as ProviderInwardRow).id)}
                onRowClick={(row) =>
                    navigateToProviderInward(navigate, row as ProviderInwardRow)
                }
                openOnRowClick={false}
            />
        </div>
    );
}
