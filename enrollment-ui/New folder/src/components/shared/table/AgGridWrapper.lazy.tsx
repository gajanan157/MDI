import { lazy, Suspense, ComponentProps } from "react";
import { AgGridLoadingOverlay } from "./AgGridLoadingOverlay";
import type { default as AgGridSuperWrapperType } from "./AgGridWrapper";

// Lazy load AG Grid wrapper to reduce initial bundle size
const AgGridSuperWrapper = lazy(() => import("./AgGridWrapper").then((module) => ({ default: module.default })));

/**
 * Lazy-loaded wrapper for AgGridSuperWrapper
 * This component code-splits AG Grid (~1MB) from the main bundle
 */
export function LazyAgGridWrapper(props: ComponentProps<typeof AgGridSuperWrapperType>) {
  return (
    <Suspense fallback={<AgGridLoadingOverlay />}>
      <AgGridSuperWrapper {...props} />
    </Suspense>
  );
}

export default LazyAgGridWrapper;

