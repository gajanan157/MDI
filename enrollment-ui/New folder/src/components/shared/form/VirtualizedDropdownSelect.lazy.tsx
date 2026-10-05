import { lazy, Suspense } from "react";
import type VirtualizedDropdownSelectType from "./VirtualizedDropdownSelect";
import type { ComponentProps } from "react";

const VirtualizedDropdownSelect = lazy(() => import("./VirtualizedDropdownSelect").then((module) => ({ default: module.default })));

/**
 * Lazy-loaded wrapper for VirtualizedDropdownSelect
 * This component code-splits react-window from the main bundle
 */
export function LazyVirtualizedDropdownSelect(props: ComponentProps<typeof VirtualizedDropdownSelectType>) {
  return (
    <Suspense
      fallback={
        <div className="flex h-10 w-full items-center rounded-md border border-gray-300 bg-white px-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      }
    >
      <VirtualizedDropdownSelect {...props} />
    </Suspense>
  );
}

export default LazyVirtualizedDropdownSelect;

