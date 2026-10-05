import { isListingArray, shouldHideField, toBracketPath } from "./utils";
import { isStructuredTable } from "./structuredTableHelpers";
import { isMetadataFieldKey } from "./objectRendererHelpers";
import ObjectRendererListingArray from "./ObjectRendererListingArray";
import ObjectRendererTableArray from "./ObjectRendererTableArray";
import ObjectRendererStructuredTableField from "./ObjectRendererStructuredTableField";
import ObjectRendererNestedObject from "./ObjectRendererNestedObject";
import ObjectRendererScalarField from "./ObjectRendererScalarField";
import type { ObjectRendererProps } from "./types";

export type ObjectRendererFieldEntryProps = ObjectRendererProps & {
  entryKey: string;
  entryValue: unknown;
  isPathEditable: (fieldPath: Array<string | number>) => boolean;
  userId: string;
  activeMatchPath?: string | null;
  newlyAddedArrayItems: Set<string>;
  setNewlyAddedArrayItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  newFieldRef: React.RefObject<HTMLDivElement | null>;
  lastAddedFieldPath: string | null;
  setLastAddedFieldPath: (path: string | null) => void;
  isEditing: boolean;
  onAddFieldAtPath?: (
    fieldPath: string,
    fieldName: string,
    fieldValue: unknown,
    metadata?: unknown,
  ) => void;
  errors?: unknown;
};

export default function ObjectRendererFieldEntry({
  entryKey,
  entryValue,
  path = [],
  isPathEditable,
  rootData,
  data,
  ...props
}: ObjectRendererFieldEntryProps) {
  if (isMetadataFieldKey(entryKey)) {
    return null;
  }

  const keyPath = [...path, entryKey];
  const id = keyPath.join(".");
  const fieldPath = toBracketPath(keyPath);
  const editable = isPathEditable(keyPath);
  const conditionalRules = rootData?._conditionalRules || [];

  if (shouldHideField(fieldPath, rootData || data, conditionalRules)) {
    return null;
  }

  if (Array.isArray(entryValue)) {
    const isListing =
      entryValue.length === 0 ? true : isListingArray(entryValue);

    if (isListing) {
      return (
        <ObjectRendererListingArray
          key={id}
          id={id}
          keyName={entryKey}
          keyPath={keyPath}
          path={path}
          displayArray={entryValue}
          editable={editable}
          fieldPath={fieldPath}
          rootData={rootData}
          {...props}
        />
      );
    }

    return (
      <ObjectRendererTableArray
        key={id}
        id={id}
        keyName={entryKey}
        keyPath={keyPath}
        path={path}
        val={entryValue as Record<string, unknown>[]}
        editable={editable}
        fieldPath={fieldPath}
        rootData={rootData}
        {...props}
      />
    );
  }

  if (entryValue && typeof entryValue === "object") {
    const objVal = entryValue as Record<string, unknown>;

    if (isStructuredTable(objVal)) {
      return (
        <ObjectRendererStructuredTableField
          key={id}
          id={id}
          keyName={entryKey}
          keyPath={keyPath}
          val={objVal}
          editable={editable}
          fieldPath={fieldPath}
          rootData={rootData}
          {...props}
        />
      );
    }

    return (
      <ObjectRendererNestedObject
        key={id}
        id={id}
        keyName={entryKey}
        keyPath={keyPath}
        path={path}
        val={objVal}
        editable={editable}
        fieldPath={fieldPath}
        data={data}
        rootData={rootData}
        {...props}
      />
    );
  }

  return (
    <ObjectRendererScalarField
      key={id}
      id={id}
      keyName={entryKey}
      keyPath={keyPath}
      path={path}
      val={entryValue}
      editable={editable}
      errors={props.errors}
      rootData={rootData}
      {...props}
    />
  );
}
