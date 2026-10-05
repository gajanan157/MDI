import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { fetchMbmDashboard } from "@/store/features/mbmDashboard/mbmDashboardSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useEffect, useRef, useState } from "react";
import CBFTable from "./CBFTable";
import { tableData, tableHeaders } from "./sampleData1";

export default function DashBoard() {
  const [page] = useState(1);
  const [pageSize] = useState(20);
  const dispatch = useAppDispatch();
  const lastDispatchedRef = useRef<string>("");

  const buildAndDispatch = (payloadObj: Record<string, any>) => {
    const payload = {
      page: payloadObj.page ?? page ?? 1,
      size: payloadObj.size ?? pageSize ?? 20,
      ...(payloadObj.queryObj ? { queryObj: payloadObj.queryObj } : {}),
      ...payloadObj,
    };

    const topLevelFilterKeys = Object.keys(payloadObj).filter(
      (k) => !["page", "size", "queryObj"].includes(k),
    );
    if (!payloadObj.queryObj && topLevelFilterKeys.length > 0) {
      const queryObj: Record<string, any> = {};
      topLevelFilterKeys.forEach((k) => {
        queryObj[k] = (payloadObj as any)[k];
        delete (payload as any)[k];
      });
      (payload as any).queryObj = queryObj;
    }

    const key = JSON.stringify(payload);
    if (lastDispatchedRef.current === key) {
      return;
    }
    lastDispatchedRef.current = key;

    dispatch(fetchMbmDashboard(payload));
  };

  // Initial load
  useEffect(() => {
    buildAndDispatch({ page: 1, size: pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pageSize]);


  return (
    <Page title="MBM Dashboard">
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title="MBM Dashboard"
          recordLabel="CBF Overview"
          statusBadge="Live"
          onRefresh={() => buildAndDispatch({ page: 1, size: pageSize })}
        />
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800 overflow-hidden">
          <CBFTable data={tableData} tableHeaders={tableHeaders} />
        </div>
      </div>
    </Page>
  );
}
