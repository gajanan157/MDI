import { useState, useRef, useCallback, useMemo } from "react";

/**
 * Custom hook for managing accordion state
 * 
 * This hook separates accordion UI state from other application state,
 * ensuring that PDF navigation doesn't affect accordion panels.
 */
export function useAccordionState(initialOpenSections: string[] = []) {
  // Track open sections
  const [openSections, setOpenSections] = useState<string[]>(initialOpenSections);
  
  // Track if accordion has been initialized (prevents reset on data changes)
  const initializedRef = useRef(false);
  
  // Initialize once
  if (!initializedRef.current && initialOpenSections.length > 0) {
    setOpenSections(initialOpenSections);
    initializedRef.current = true;
  }

  // Toggle section - memoized to prevent re-renders
  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  }, []);

  // Expand section
  const expandSection = useCallback((sectionId: string) => {
    setOpenSections(prev => {
      if (!prev.includes(sectionId)) {
        return [...prev, sectionId];
      }
      return prev;
    });
  }, []);

  // Collapse section
  const collapseSection = useCallback((sectionId: string) => {
    setOpenSections(prev => prev.filter(id => id !== sectionId));
  }, []);

  // Expand all
  const expandAll = useCallback(() => {
    // This would need to know all section IDs
    // For now, we'll use a placeholder
  }, []);

  // Collapse all
  const collapseAll = useCallback(() => {
    setOpenSections([]);
  }, []);

  // Check if section is open
  const isSectionOpen = useCallback((sectionId: string) => {
    return openSections.includes(sectionId);
  }, [openSections]);

  // Memoized state object
  const accordionState = useMemo(() => ({
    openSections,
    toggleSection,
    expandSection,
    collapseSection,
    expandAll,
    collapseAll,
    isSectionOpen,
  }), [openSections, toggleSection, expandSection, collapseSection, expandAll, collapseAll, isSectionOpen]);

  return accordionState;
}

