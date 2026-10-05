import JsonAccordionForm from "./index";
import { JsonAccordionFormProps } from "./types";

export interface JsonAccordionFormWrapperProps extends Omit<JsonAccordionFormProps, 'title' | 'customQuickActions' | 'hideTitleAndQuickActions' | 'showTitleAndQuickActionsOnly'> {
  /** PDF Viewer component to render alongside the form */
  pdfViewer?: React.ReactNode;
  /** Whether PDF viewer is open */
  isPdfViewerOpen?: boolean;
  /** Container className */
  containerClassName?: string;
}

/**
 * Simple wrapper component for JsonAccordionForm that handles:
 * - Layout with optional PDF viewer
 * 
 * Title and Quick Actions should be handled by the parent component.
 * JsonAccordionForm only handles JSON rendering.
 */
export default function JsonAccordionFormWrapper({
  pdfViewer,
  isPdfViewerOpen = false,
  containerClassName,
  data,
  ...formProps
}: Readonly<JsonAccordionFormWrapperProps>) {
  return (
    <div className={containerClassName}>
      {/* Main Content Area - Form and PDF Viewer */}
      <div className="flex gap-4">
        {/* Form Section */}
        <div className={isPdfViewerOpen ? "flex-1" : "w-full"}>
          <JsonAccordionForm
            data={data}
            {...formProps}
            hideTitleAndQuickActions={true}
          />
        </div>

        {/* PDF Viewer Section */}
        {isPdfViewerOpen && pdfViewer && (
          <div className="flex-1">
            {pdfViewer}
          </div>
        )}
      </div>
    </div>
  );
}
