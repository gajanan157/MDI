// src/hooks/useStatus.ts
import { useState, useCallback } from "react";

export type StatusValue = "approved" | "approve_with_pendency" | "rejected" | "reverse_to_maker" | null;

export interface StatusMetadata {
  [fieldPath: string]: StatusValue;
}

/**
 * Hook for managing field-level status stored in metadata
 * Status is stored separately from JSON data using path-based keys
 */
export function useStatus(initialMetadata?: StatusMetadata) {
  const [statusMetadata, setStatusMetadata] = useState<StatusMetadata>(
    initialMetadata || {}
  );

  /**
   * Get status for a specific field path
   * @param fieldPath - Path to the field (e.g., "section1.field3")
   */
  const getStatus = useCallback(
    (fieldPath: string): StatusValue => {
      return statusMetadata[fieldPath] || null;
    },
    [statusMetadata]
  );

  /**
   * Set status for a field
   */
  const setStatus = useCallback(
    (fieldPath: string, status: StatusValue) => {
      setStatusMetadata((prev) => ({
        ...prev,
        [fieldPath]: status,
      }));
    },
    []
  );

  /**
   * Remove status for a field
   */
  const removeStatus = useCallback((fieldPath: string) => {
    setStatusMetadata((prev) => {
      const updated = { ...prev };
      delete updated[fieldPath];
      return updated;
    });
  }, []);

  /**
   * Get all status metadata (for saving)
   */
  const getAllStatus = useCallback((): StatusMetadata => {
    return statusMetadata;
  }, [statusMetadata]);

  /**
   * Set status metadata (for loading)
   */
  const setAllStatus = useCallback((metadata: StatusMetadata) => {
    setStatusMetadata(metadata);
  }, []);

  /**
   * Check if any field has a specific status
   */
  const hasStatus = useCallback(
    (status: StatusValue): boolean => {
      return Object.values(statusMetadata).includes(status);
    },
    [statusMetadata]
  );

  return {
    getStatus,
    setStatus,
    removeStatus,
    getAllStatus,
    setAllStatus,
    hasStatus,
  };
}

