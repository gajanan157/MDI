import React from "react";

export function createSearchHighlighter(
  searchText: string | undefined,
  currentPath: string | undefined,
  activeMatchPath: string | null | undefined,
) {
  return (text: string): React.ReactNode => {
    if (!searchText?.trim() || !text) return text;

    const normalizeText = (str: string) => str.replace(/\s+/g, " ").trim();
    const textLower = normalizeText(text).toLowerCase();
    const searchLower = normalizeText(searchText.trim()).toLowerCase();

    if (!textLower.includes(searchLower)) {
      return text;
    }

    const trimmedSearchTerm = searchText.trim();
    const searchLowerOriginal = trimmedSearchTerm.toLowerCase();
    const textLowerOriginal = text.toLowerCase();

    const matches: Array<{ start: number; end: number; text: string }> = [];
    let searchIndex = 0;

    while (true) {
      const index = textLowerOriginal.indexOf(searchLowerOriginal, searchIndex);
      if (index === -1) break;

      matches.push({
        start: index,
        end: index + trimmedSearchTerm.length,
        text: text.substring(index, index + trimmedSearchTerm.length),
      });
      searchIndex = index + 1;
    }

    if (matches.length === 0) {
      return text;
    }

    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    const normalizePath = (p: string) => p.replace(/\[(\d+)\]/g, ".$1");
    const normCurrent = currentPath ? normalizePath(currentPath) : "";
    const normActive = activeMatchPath ? normalizePath(activeMatchPath) : "";
    const isActive =
      normCurrent &&
      normActive &&
      (normActive === normCurrent || normActive.startsWith(normCurrent + "."));

    matches.forEach((match, matchIndex) => {
      if (match.start > lastIndex) {
        result.push(text.substring(lastIndex, match.start));
      }

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
        </mark>,
      );

      lastIndex = match.end;
    });

    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return <>{result}</>;
  };
}
