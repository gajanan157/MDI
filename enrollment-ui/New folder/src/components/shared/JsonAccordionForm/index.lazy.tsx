import { lazy, Suspense } from "react";
import type { JsonAccordionFormRef } from "./index";
import type { JsonAccordionFormProps } from "./types";

const JsonAccordionForm = lazy(() => import("./index").then((module) => ({ default: module.default })));

/**
 * Lazy-loaded wrapper for JsonAccordionForm
 * This component code-splits the large form component from the main bundle
 */
export function LazyJsonAccordionForm(props: JsonAccordionFormProps & { ref?: React.Ref<JsonAccordionFormRef> }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading form...</p>
          </div>
        </div>
      }
    >
      <JsonAccordionForm {...props} ref={props.ref} />
    </Suspense>
  );
}

export default LazyJsonAccordionForm;

