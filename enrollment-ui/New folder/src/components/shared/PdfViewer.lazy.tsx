import { lazy, Suspense } from "react";
import type { PdfViewerProps } from "./PdfViewer";

// Lazy load PDF Viewer to reduce initial bundle size (~react-pdf is large)
const PdfViewer = lazy(() => import("./PdfViewer").then((module) => ({ default: module.default })));

/**
 * Lazy-loaded wrapper for PdfViewer
 * This component code-splits PDF libraries from the main bundle
 */
export function LazyPdfViewer(props: PdfViewerProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading PDF viewer...</p>
          </div>
        </div>
      }
    >
      <PdfViewer {...props} />
    </Suspense>
  );
}

export default LazyPdfViewer;

