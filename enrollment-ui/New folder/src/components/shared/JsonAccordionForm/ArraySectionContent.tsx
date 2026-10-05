// Search working
import { useMemo } from "react";
import { getAt, isListingArray } from "./utils";
import { isStructuredTable } from "./structuredTableHelpers";
import { useKeycloakUser } from "@/hooks/useKeycloakUser";
import { isCommentsArrayField } from "./arraySectionContentHelpers";
import {
  ArrayBulletedListSection,
  ArrayStructuredTablesSection,
  ArrayTableSection,
} from "./arraySectionContentViews";

import type { JsonAccordionUserRole } from "./types";

export interface ArraySectionContentProps {
  fieldKey: string;
  actualDataWithoutChangeValue: any;
  value: any[];
  formState: any;
  isEditing: boolean;
  isFlatArray: boolean;
  isNewlyAdded: boolean;
  hasCheckerRole: boolean;
  hasBothRoles: boolean;
  hasMakerRole: boolean;
  checkerCanAct: boolean;
  isMaker?: boolean;
  newlyAddedArrayItems: Set<string>;
  newlyAddedTableRows?: Set<string>;
  newlyAddedTableColumns?: Set<string>;
  shouldEnableComments?: boolean;
  shouldEnableStatus?: boolean;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  openPaths?: Set<string>;
  userRole?: JsonAccordionUserRole | null;
  onFormStateChange: (newState: any) => void;
  onSetValue: (key: string, value: any, options?: any) => void;
  onRemoveField: (key: string) => void;
  onNewlyAddedArrayItemsChange: (
    updater: (prev: Set<string>) => Set<string>,
  ) => void;
  onNewlyAddedTableRowsChange?: (
    updater: (prev: Set<string>) => Set<string>,
  ) => void;
  onNewlyAddedTableColumnsChange?: (
    updater: (prev: Set<string>) => Set<string>,
  ) => void;
  fieldStatus?: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  rootData?: any;
  onRootDataChange?: (newRootData: any) => void;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  getComments?: (fieldPath: string) => Array<any>;
  onAddComment?: (
    fieldPath: string,
    comment: string,
    userId: string,
    userRole?: JsonAccordionUserRole,
  ) => void;
  onDeleteComment?: (fieldPath: string, commentId: string) => void;
  userId?: string;
}

export default function ArraySectionContent(props: ArraySectionContentProps) {
  const {
    fieldKey,
    value,
    formState,
    isEditing,
    isFlatArray,
    hasCheckerRole,
    hasBothRoles,
    hasMakerRole,
    checkerCanAct,
    userId: userIdProp,
  } = props;

  const keycloakUser = useKeycloakUser();
  const userId = userIdProp || keycloakUser.userId || "unknown";
  const currentValue = getAt(formState, [fieldKey]) ?? value;
  const isFullEditMode =
    isEditing && (hasCheckerRole || hasBothRoles || hasMakerRole) && checkerCanAct;
  const isListing = isListingArray(currentValue);

  const isArrayOfStructuredTables = useMemo(() => {
    if (!Array.isArray(currentValue) || currentValue.length === 0) {
      return false;
    }

    const firstItem = currentValue[0];
    if (!isStructuredTable(firstItem)) {
      return false;
    }

    return currentValue.every((item) => isStructuredTable(item));
  }, [currentValue]);

  if (isCommentsArrayField(fieldKey, currentValue)) {
    return null;
  }

  const viewProps = {
    ...props,
    currentValue,
    userId,
    isFullEditMode,
  };

  if (isFlatArray || isListing) {
    return <ArrayBulletedListSection {...viewProps} />;
  }

  if (isArrayOfStructuredTables) {
    return <ArrayStructuredTablesSection {...viewProps} />;
  }

  return <ArrayTableSection {...viewProps} />;
}

ArraySectionContent.displayName = "ArraySectionContent";
