import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { PdfViewerRef } from "./PdfViewerRef";
import PdfViewer, { PdfViewerProps } from "../PdfViewer";

export interface PdfViewerWithRefProps extends Omit<PdfViewerProps, 'pageNumber'> {
  initialPageNumber?: number;
}

/**
 * PDF Viewer with Imperative Ref API
 * 
 * This wrapper component exposes imperative methods via ref,
 * allowing parent components to navigate the PDF without
 * causing re-renders or state updates.
 * 
 * The key difference from the regular PdfViewer:
 * - Navigation is done via ref methods (imperative)
 * - State updates are internal and don't trigger parent re-renders
 * - Accordion state remains unaffected
 */
const PdfViewerWithRef = forwardRef<PdfViewerRef, PdfViewerWithRefProps>(
  (props, ref) => {
    const {
      initialPageNumber = 1,
      ...pdfViewerProps
    } = props;

    // Internal state - isolated from parent
    // These updates don't cause parent re-renders
    const [internalPageNumber, setInternalPageNumber] = useState(initialPageNumber);
    const [internalZoom, setInternalZoom] = useState(80);
    const totalPagesRef = useRef(1);
    
    // Track navigation to prevent circular updates
    const isNavigatingRef = useRef(false);

    // Expose imperative API via ref
    useImperativeHandle(ref, () => ({
      navigateToPage: (pageNumber: number) => {
        if (pageNumber < 1) {
          console.warn(`Invalid page number: ${pageNumber}`);
          return;
        }
        
        // Set flag to prevent re-render triggers
        isNavigatingRef.current = true;
        
        // Update internal state (doesn't affect parent)
        setInternalPageNumber(pageNumber);
        
        // Reset flag after a short delay
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 500);
      },
      
      getCurrentPage: () => internalPageNumber,
      
      getTotalPages: () => totalPagesRef.current,
      
      setZoom: (zoom: number) => {
        const clampedZoom = Math.max(50, Math.min(200, zoom));
        setInternalZoom(clampedZoom);
      },
      
      getZoom: () => internalZoom,
      
      scrollToPage: (pageNumber: number, smooth = true) => {
        if (pageNumber < 1) {
          console.warn(`Invalid page number: ${pageNumber}`);
          return;
        }
        
        isNavigatingRef.current = true;
        setInternalPageNumber(pageNumber);
        
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 500);
      },
    }), [internalPageNumber, internalZoom]);

    return (
      <PdfViewer
        {...pdfViewerProps}
        pageNumber={internalPageNumber}
      />
    );
  }
);

PdfViewerWithRef.displayName = 'PdfViewerWithRef';

export default PdfViewerWithRef;

