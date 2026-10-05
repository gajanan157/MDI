/**
 * PDF Viewer Imperative API
 * 
 * This interface defines the imperative methods that can be called
 * on the PDF viewer via ref, avoiding state-based navigation that
 * causes re-renders.
 */
export interface PdfViewerRef {
  /**
   * Navigate to a specific page number
   * This method does NOT trigger a re-render of parent components
   */
  navigateToPage: (pageNumber: number) => void;
  
  /**
   * Get the current page number
   */
  getCurrentPage: () => number;
  
  /**
   * Get the total number of pages
   */
  getTotalPages: () => number;
  
  /**
   * Set zoom level
   */
  setZoom: (zoom: number) => void;
  
  /**
   * Get current zoom level
   */
  getZoom: () => number;
  
  /**
   * Highlight text on a specific page (optional enhancement)
   */
  highlightText?: (pageNumber: number, text: string) => void;
  
  /**
   * Scroll to page with smooth animation
   */
  scrollToPage: (pageNumber: number, smooth?: boolean) => void;
}

