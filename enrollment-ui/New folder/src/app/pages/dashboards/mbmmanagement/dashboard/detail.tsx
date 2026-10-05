import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Page } from "@/components/shared/Page";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchMbmDashboardById } from "@/store/features/mbmDashboard/mbmDashboardSlice";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { Button } from "@/components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function MbmDashboardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedItem, loadingItem } = useAppSelector(
    (state) => state.mbmDashboard,
  );

  // Fetch item by ID
  useEffect(() => {
    if (id) {
      dispatch(fetchMbmDashboardById({ id }));
    }
  }, [id, dispatch]);

  // Set breadcrumbs
  useBreadcrumb([
    {
      title: "MBM Dashboard",
      path: "/mbm-management/dashboard",
      onClick: () => navigate("/mbm-management/dashboard"),
    },
    { title: selectedItem?.requestId || id || "Detail View" },
  ]);

  const handleBack = () => {
    navigate("/mbm-management/dashboard");
  };

  if (loadingItem) {
    return (
      <Page title="MBM Dashboard - Detail">
        <div className="flex h-screen items-center justify-center">
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
      </Page>
    );
  }

  if (!selectedItem) {
    return (
      <Page title="MBM Dashboard - Detail">
        <div className="px-4 py-2">
          <div className="mb-4">
            <Button
              type="button"
              onClick={handleBack}
              variant="outlined"
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-gray-600">No data found for this ID.</p>
          </div>
        </div>
      </Page>
    );
  }


  return (
    <Page title="MBM Dashboard - Detail">
      <div className="px-4 py-2">
        <div className="mb-4">
          <Button
            type="button"
            onClick={handleBack}
            variant="outlined"
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

      </div>
    </Page>
  );
}
