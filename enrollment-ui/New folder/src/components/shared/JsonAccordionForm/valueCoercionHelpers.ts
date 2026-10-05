const ROMAN_NUMERAL_REGEX = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i;
const IMAGE_PATTERN = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;

function formatKeyWord(word: string): string {
  if (ROMAN_NUMERAL_REGEX.test(word)) {
    return word.toUpperCase();
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function formatKeyFromText(text: string): string {
  if (!text || typeof text !== "string") return String(text);

  return text
    .replace(/[^A-Za-z]+/g, " ")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(formatKeyWord)
    .join(" ");
}

function parseArrayInput(str: string): unknown {
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall back to CSV parsing
  }
  return str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function parseObjectInput(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

export function coerceInputByOriginalType(origValue: unknown, str: string): unknown {
  if (origValue === null || origValue === undefined) return str;

  if (typeof origValue === "number") {
    const n = Number(str);
    return Number.isNaN(n) ? str : n;
  }

  if (typeof origValue === "boolean") {
    const low = str.trim().toLowerCase();
    if (low === "true") return true;
    if (low === "false") return false;
    return Boolean(str);
  }

  if (Array.isArray(origValue)) {
    return parseArrayInput(str);
  }

  if (typeof origValue === "object") {
    return parseObjectInput(str);
  }

  return str;
}

function compareObjectValues(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqualValues(a[key], b[key])) return false;
  }
  return true;
}

function compareArrayValues(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!deepEqualValues(a[i], b[i])) return false;
  }
  return true;
}

export function deepEqualValues(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return a === b;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    return compareArrayValues(a, b);
  }

  return compareObjectValues(a as Record<string, unknown>, b as Record<string, unknown>);
}

function detectStringDataType(value: string): {
  type: "string" | "image" | "keyValue" | "json";
  isImage: boolean;
  isKeyValue: boolean;
} {
  const isImage = IMAGE_PATTERN.test(value) || value.startsWith("data:image/");
  const isKeyValue = parseKeyValuePairString(value) !== null;

  let isJson = false;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) {
      isJson = true;
    }
  } catch {
    // not JSON
  }

  if (isImage) {
    return { type: "image", isImage: true, isKeyValue: false };
  }
  if (isKeyValue && !isJson) {
    return { type: "keyValue", isImage: false, isKeyValue: true };
  }
  if (isJson) {
    return { type: "json", isImage: false, isKeyValue: false };
  }
  return { type: "string", isImage: false, isKeyValue: false };
}

export function detectValueDataType(value: unknown): {
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
  if (value === null || value === undefined) {
    return { type: "string", isImage: false, isKeyValue: false };
  }

  if (typeof value === "string") {
    return detectStringDataType(value);
  }

  if (typeof value === "number") {
    return { type: "number", isImage: false, isKeyValue: false };
  }

  if (typeof value === "boolean") {
    return { type: "boolean", isImage: false, isKeyValue: false };
  }

  if (Array.isArray(value)) {
    return { type: "array", isImage: false, isKeyValue: false };
  }

  return { type: "object", isImage: false, isKeyValue: false };
}

const KEY_VALUE_PAIR_MAX_LENGTH = 4096;

function isIdentifierKey(key: string): boolean {
  if (!key.length) return false;
  for (let i = 0; i < key.length; i++) {
    const ch = key[i];
    const isWord =
      (ch >= "a" && ch <= "z") ||
      (ch >= "A" && ch <= "Z") ||
      (ch >= "0" && ch <= "9") ||
      ch === "_";
    if (!isWord) return false;
  }
  return true;
}

function stripOptionalQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseQuotedKeyPrefix(trimmed: string): { key: string; valueStart: number } | null {
  const first = trimmed[0];
  if (first !== '"' && first !== "'") return null;

  const closeQuote = trimmed.indexOf(first, 1);
  if (closeQuote === -1) return null;

  const key = trimmed.slice(1, closeQuote);
  if (!isIdentifierKey(key)) return null;

  let valueStart = closeQuote + 1;
  while (valueStart < trimmed.length && trimmed[valueStart] === " ") {
    valueStart++;
  }
  if (trimmed[valueStart] !== ":") return null;
  return { key, valueStart: valueStart + 1 };
}

function parseUnquotedKeyPrefix(trimmed: string): { key: string; valueStart: number } | null {
  const colonIndex = trimmed.indexOf(":");
  if (colonIndex === -1) return null;

  const key = trimmed.slice(0, colonIndex).trimEnd();
  if (!isIdentifierKey(key)) return null;
  return { key, valueStart: colonIndex + 1 };
}

export function parseKeyValuePairString(
  str: string,
): { key: string; value: string } | null {
  const trimmed = str.trim();
  if (!trimmed || trimmed.length > KEY_VALUE_PAIR_MAX_LENGTH) return null;

  const parsed =
    parseQuotedKeyPrefix(trimmed) ?? parseUnquotedKeyPrefix(trimmed);
  if (!parsed) return null;

  let valueStart = parsed.valueStart;
  while (valueStart < trimmed.length && trimmed[valueStart] === " ") {
    valueStart++;
  }

  const value = stripOptionalQuotes(trimmed.slice(valueStart).trim());
  return { key: parsed.key, value };
}
