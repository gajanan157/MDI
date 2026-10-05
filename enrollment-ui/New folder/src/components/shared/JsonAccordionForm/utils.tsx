// src/components/shared/JsonAccordionForm/utils.tsx
import React from "react";
import { AnyObject } from "./types";
import {
  coerceInputByOriginalType,
  deepEqualValues,
  detectValueDataType,
  formatKeyFromText,
  parseKeyValuePairString,
} from "./valueCoercionHelpers";

export const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export function getAt(
  obj: AnyObject | undefined,
  path: Array<string | number>,
): any {
  return path.reduce(
    (acc: any, k) => (acc && acc[k] !== undefined ? acc[k] : undefined),
    obj,
  );
}

export function setAt(obj: any, path: Array<string | number>, value: any): any {
  if (!path.length) return value;
  const copy = Array.isArray(obj) ? obj.slice() : { ...(obj || {}) };
  let cur: any = copy;
  for (let i = 0; i < path.length - 1; i++) {
    const p = path[i];
    if (cur[p] === undefined || cur[p] === null)
      cur[p] = typeof path[i + 1] === "number" ? [] : {};
    cur[p] = Array.isArray(cur[p]) ? cur[p].slice() : { ...cur[p] };
    cur = cur[p];
  }
  cur[path[path.length - 1]] = value;
  return copy;
}

export function valueToString(val: any): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return JSON.stringify(val, null, 2);
  return String(val);
}

/**
 * Build path string in bracket notation to match searchJsonPaths output.
 * e.g. ['other_base_covers', 0, 'tables', 1] -> "other_base_covers[0].tables[1]"
 * Used so data-path and fieldPath align with matchedPaths/activeMatchPath for search scroll & highlight.
 */
export function toBracketPath(path: Array<string | number>): string {
  if (!path.length) return "";
  let s = "";
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    if (typeof p === "number") {
      s += `[${p}]`;
    } else {
      s += (i === 0 ? "" : ".") + String(p);
    }
  }
  return s;
}

/**
 * highlightText - Reusable function to highlight search text in a string
 * Returns JSX with highlighted matches
 * 
 * @param text - The text to search in
 * @param searchText - The text to highlight
 * @param currentPath - Optional path for active match detection
 * @param activeMatchPath - Optional active match path
 * @returns JSX.Element with highlighted text
 */
export function highlightText(
  text: string,
  searchText?: string,
  currentPath?: string,
  activeMatchPath?: string | null,
): React.ReactNode {
  if (!searchText || !text) return text;

  const textStr = String(text);
  const searchStr = String(searchText).trim();
  
  if (!searchStr) return textStr;

  // Normalize whitespace for comparison
  const normalizeText = (str: string) => str.replace(/\s+/g, ' ').trim();
  const textNormalized = normalizeText(textStr);
  const searchNormalized = normalizeText(searchStr);
  const textLower = textNormalized.toLowerCase();
  const searchLower = searchNormalized.toLowerCase();
  
  // Check if text contains search term
  if (!textLower.includes(searchLower)) {
    return textStr;
  }
  
  // Check if this is the active match (normalize paths so "a.b[0].c" and "a.b.0.c" both match)
  const normalizePath = (p: string) => p.replace(/\[(\d+)\]/g, ".$1");
  const normCurrent = currentPath ? normalizePath(currentPath) : "";
  const normActive = activeMatchPath ? normalizePath(activeMatchPath) : "";
  const isActive =
    normCurrent &&
    normActive &&
    (normActive === normCurrent || normActive.startsWith(normCurrent + "."));
  
  // Find all occurrences of the search term (case-insensitive)
  const matches: Array<{ start: number; end: number; text: string }> = [];
  let searchIndex = 0;
  
  while (true) {
    const index = textLower.indexOf(searchLower, searchIndex);
    if (index === -1) break;
    
    // Get the actual matched text from the original (preserving case)
    const matchedText = textStr.substring(index, index + searchStr.length);
    matches.push({
      start: index,
      end: index + searchStr.length,
      text: matchedText,
    });
    searchIndex = index + 1;
  }
  
  // If no matches found, return as-is
  if (matches.length === 0) {
    return textStr;
  }
  
  // Build highlighted result by splitting text at match positions
  const result: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  
  matches.forEach((match, matchIndex) => {
    // Add text before match
    if (match.start > lastIndex) {
      result.push(textStr.substring(lastIndex, match.start));
    }
    
    // Add highlighted match – explicit text color so active text matches theme
    result.push(
      <mark
        key={`match-${matchIndex}`}
        className={`rounded px-0.5 font-semibold text-gray-900 dark:text-gray-100 ${
          isActive 
            ? "bg-orange-400 ring-2 ring-orange-500 dark:bg-orange-500 text-amber-900 dark:text-amber-200" 
            : "bg-yellow-300 dark:bg-yellow-600 dark:text-yellow-50"
        }`}
      >
        {match.text}
      </mark>
    );
    
    lastIndex = match.end;
  });
  
  // Add remaining text after last match
  if (lastIndex < textStr.length) {
    result.push(textStr.substring(lastIndex));
  }
  
  return <>{result}</>;
}

/**
 * parseInputString(origValue, str)
 * - If origValue is a number/boolean/array/object it tries to coerce the input string to that type.
 * - For arrays: first tries JSON.parse, otherwise splits on commas.
 */
export function parseInputString(origValue: any, str: string): any {
  return coerceInputByOriginalType(origValue, str);
}

/**
 * formatKey
 * Turn keys like "Pre_post_covered_for_parental_claims" into readable labels.
 *
 * @param key string
 * @param opts.titleCase boolean (default: false) — if true, capitalize first letter of each word
 */
/**
 * Detect if an array is a listing array (simple array of primitives)
 * Returns true if array contains only strings, numbers, or booleans
 */
export function isListingArray(arr: any[]): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;

  // Check if all elements are primitives (string, number, boolean)
  const allPrimitives = arr.every(
    (item) =>
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean" ||
      item === null ||
      item === undefined,
  );

  return allPrimitives;
}

/**
 * Detect if an array is a flat array that should be grouped into objects
 * Pattern: flat array where elements repeat in groups (e.g., every 5 elements = 1 record)
 */
export function isFlatArrayPattern(arr: any[]): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;

  // Check if all elements are primitives (string, number, boolean)
  const allPrimitives = arr.every(
    (item) =>
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean",
  );

  if (!allPrimitives) return false;

  // If array length is divisible by 5, assume it's a 5-field pattern
  // Common patterns: 3, 4, 5, 6 fields per record
  const possibleGroupSizes = [3, 4, 5, 6];
  return possibleGroupSizes.some(
    (size) => arr.length % size === 0 && arr.length >= size * 2,
  );
}

/**
 * Transform flat array into array of objects
 * Assumes 5 fields per record: Claim_Number, Date, Amount, Status, Hospital
 */
export function transformFlatArrayToObjects(
  arr: any[],
  fieldNames: string[] = [
    "Claim_Number",
    "Date",
    "Amount",
    "Status",
    "Hospital",
  ],
): any[] {
  if (!Array.isArray(arr) || arr.length === 0) return [];

  // Detect group size (number of fields per record)
  const possibleGroupSizes = [3, 4, 5, 6];
  let groupSize = 5; // Default

  for (const size of possibleGroupSizes) {
    if (arr.length % size === 0 && arr.length >= size * 2) {
      groupSize = size;
      break;
    }
  }

  // If fieldNames length doesn't match groupSize, use generic names
  const actualFieldNames =
    fieldNames.length === groupSize
      ? fieldNames
      : Array.from({ length: groupSize }, (_, i) => `Field_${i + 1}`);

  const result: any[] = [];
  for (let i = 0; i < arr.length; i += groupSize) {
    const record: any = {};
    for (let j = 0; j < groupSize && i + j < arr.length; j++) {
      record[actualFieldNames[j]] = arr[i + j];
    }
    result.push(record);
  }
  return result;
}

/**
 * Transform array of objects back to flat array
 */
export function transformObjectsToFlatArray(
  arr: any[],
  fieldNames: string[] = [
    "Claim_Number",
    "Date",
    "Amount",
    "Status",
    "Hospital",
  ],
): any[] {
  if (!Array.isArray(arr) || arr.length === 0) return [];

  const result: any[] = [];
  for (const record of arr) {
    for (const fieldName of fieldNames) {
      result.push(record[fieldName] ?? "");
    }
  }
  return result;
}

/**
 * Deep comparison of two values to check if they are equal
 */
export function deepEqual(a: any, b: any): boolean {
  return deepEqualValues(a, b);
}

// export function formatKey(
//   key: string,
//   opts: { titleCase?: boolean } = {},
// ): string {
//   if (!key || typeof key !== "string") return String(key);

//   let s = key
//     ?.replace(/[_\-]+/g, " ")
//     ?.replace(/\s+/g, " ")
//     ?.trim();

//   if (opts?.titleCase) {
//     s = s
//       ?.split(" ")
//       ?.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
//       ?.join(" ");
//   } else {
//     s = s?.charAt(0).toUpperCase() + s.slice(1).replace(/\s+/g, " ");
//   }

//   return s;
// }

export function formatKey(text: string): string {
  return formatKeyFromText(text);
}

/**
 * Detect data type dynamically from value
 */
export function detectDataType(value: any): {
  type:
    | "string"
    | "number"
    | "boolean"
    | "array"
    | "object"
    | "keyValue"
    | "image"
    | "json";
  isImage: boolean;
  isKeyValue: boolean;
} {
  return detectValueDataType(value);
}

export function parseKeyValuePair(
  str: string,
): { key: string; value: string } | null {
  return parseKeyValuePairString(str);
}

/**
 * Check if a field should be conditionally hidden based on other field values
 * This replaces static CBF_Type checks with dynamic logic
 */
export function shouldHideField(
  fieldKey: string,
  formState: any,
  conditionalRules?: Array<{
    field: string;
    condition: (value: any) => boolean;
    hideFields: string[];
  }>,
): boolean {
  // Always hide internal comment/metadata fields - they should never be rendered as fields
  const internalFields = [
    // Comment/status internal fields
    "_newComment",
    "_newComments",
    "_comments",
    "_status",
    "_comment",
    "_value",
    // Metadata fields (added when creating fields with metadata)
    "sources",
    "references",
    "limits",
    "conditions",
    "notes",
    "field_metadata",
    "section_metadata",
  ];
  if (internalFields.includes(fieldKey)) {
    return true;
  }

  if (!conditionalRules || conditionalRules.length === 0) {
    return false;
  }

  for (const rule of conditionalRules) {
    if (rule.hideFields.includes(fieldKey)) {
      const conditionValue = getAt(formState, rule.field.split("."));
      return !rule.condition(conditionValue);
    }
  }

  return false;
}

export { createClientSideId } from "@/utils/createClientSideId";
