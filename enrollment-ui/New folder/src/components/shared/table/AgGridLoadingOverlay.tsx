import { CustomLoader } from "../CustomLoader";

/**
 * Custom Loading Overlay Component for AG Grid
 * This component is used by AG Grid to display loading state
 */
export function AgGridLoadingOverlay() {
  return (
    <div className="ag-overlay-loading-center">
      <CustomLoader
        isLoading={true}
        logoSize="size-20"
        progressBarWidth="w-48"
      />
    </div>
  );
}

export default AgGridLoadingOverlay;

