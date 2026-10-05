// Search working
import { memo, useCallback } from "react";
import Field from "./Field";

export interface PolicyFieldProps {
  label: string;
  value: any;
  actualDataWithoutChangeValue: any;
  editable: boolean;
  onChange: (value: any) => void;
  error?: string;
  commentOnlyMode?: boolean;
  shouldEnableComments?: boolean;
  shouldEnableStatus?: boolean;
  fieldPath: string;
  status?: string | null;
  onStatusChange?: (status: string | null) => void;
  userRole?: "maker1" | "maker2" | "checker" | null;
  rootData?: any;
  onRootDataChange?: (newData: any) => void;
  jsonComments?: Record<string, Array<any>>;
  pendingComments?: Array<any>;
  newComments?: Record<string, string>;
  onNewCommentsChange?: (
    updater: (prev: Record<string, string>) => Record<string, string>
  ) => void;
  /**
   * Imperative PDF navigation handler
   * This callback receives page_number and navigates PDF without re-renders
   */
  onPdfNavigate?: (pageNumber: number) => void;
  // CRITICAL: These props are needed for search highlighting
  searchText?: string;
  activeMatchPath?: string | null;
}

/**
 * PolicyField Component
 * 
 * Memoized field component that handles PDF navigation via imperative callback.
 * This prevents re-renders when navigating to PDF pages.
 */
const PolicyField = memo<PolicyFieldProps>(({
  onPdfNavigate,
  ...fieldProps
}) => {
  // Handle source clicks with imperative navigation
  const handleSourceClick = useCallback((source: { page_number?: number; snippet?: string }) => {
    if (source.page_number && onPdfNavigate) {
      // Use imperative navigation - no state updates, no re-renders
      onPdfNavigate(source.page_number);
    }
  }, [onPdfNavigate]);

  return (
    <Field
      {...fieldProps}
      status={fieldProps.status ?? null}
      onSourceClick={handleSourceClick}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // CRITICAL: Must include searchText and activeMatchPath so highlighting works!
  // Only re-render if these specific props change
  return (
    prevProps.value === nextProps.value &&
    prevProps.editable === nextProps.editable &&
    prevProps.error === nextProps.error &&
    prevProps.status === nextProps.status &&
    prevProps.fieldPath === nextProps.fieldPath &&
    prevProps.onPdfNavigate === nextProps.onPdfNavigate &&
    prevProps.searchText === nextProps.searchText &&
    prevProps.activeMatchPath === nextProps.activeMatchPath
  );
});

PolicyField.displayName = 'PolicyField';

export default PolicyField;

