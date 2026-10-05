// Search working
// Reusable component for "See more/See less" functionality
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { getLineClampClass } from "./displayHelpers";

interface SeeMoreLessProps {
  content: string | React.ReactNode;
  maxLines?: number;
  minCharForSeeMore?: number;
  className?: string;
  textClassName?: string;
  buttonClassName?: string;
  onToggle?: (expanded: boolean) => void;
  highlightText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  currentPath?: string;
  /** When true, stop propagation on click so parent (e.g. cell PDF handler) never receives it. Use in clickable cells. */
  stopPropagationOnClick?: boolean;
}

export default function SeeMoreLess({
  content,
  maxLines = 1,
  minCharForSeeMore = 100,
  className = "",
  textClassName = "",
  buttonClassName = "",
  onToggle,
  highlightText,
  activeMatchPath,
  matchedPaths = [],
  currentPath,
  stopPropagationOnClick = false,
}: SeeMoreLessProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowSeeMore, setShouldShowSeeMore] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize path format for comparison (convert [8] to .8)
  const normalizePath = (p: string) => p.replace(/\[(\d+)\]/g, ".$1");

  // Convert content to string for measurement and expand logic - handle objects properly to avoid "[object Object]"
  const contentString = (() => {
    if (typeof content === "string") return content;
    if (React.isValidElement(content)) {
      return "";
    }
    if (typeof content === "object" && content !== null) {
      // Use JSON.stringify for objects to avoid "[object Object]"
      try {
        return JSON.stringify(content);
      } catch {
        return String(content);
      }
    }
    return String(content != null ? content : "");
  })();

  // Auto-expand when: (1) active match, (2) path in matchedPaths, or (3) content contains search term
  // (3) ensures we expand and show highlights even when deduplication kept a different cell in the same row
  useEffect(() => {
    if (!highlightText) return;
    const norm = currentPath ? normalizePath(currentPath) : "";
    const isActive =
      !!norm &&
      !!activeMatchPath &&
      (norm === normalizePath(activeMatchPath) ||
        normalizePath(activeMatchPath).startsWith(norm + "."));
    const isAnyMatch =
      !!norm &&
      matchedPaths.some(
        (m) =>
          norm === normalizePath(m) ||
          normalizePath(m).startsWith(norm + ".") ||
          norm.startsWith(normalizePath(m) + "."),
      );
    const contentMatches =
      !!contentString &&
      contentString
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .includes(highlightText.replace(/\s+/g, " ").trim().toLowerCase());
    if (isActive || isAnyMatch || contentMatches) setIsExpanded(true);
  }, [highlightText, activeMatchPath, matchedPaths, currentPath, contentString]);

  // Check if this is the active match (normalize paths for comparison)
  const normalizedCurrentPath = currentPath ? normalizePath(currentPath) : "";
  const normalizedActiveMatchPath = activeMatchPath ? normalizePath(activeMatchPath) : "";
  const isActive = normalizedCurrentPath && normalizedActiveMatchPath && (
    normalizedCurrentPath === normalizedActiveMatchPath ||
    normalizedActiveMatchPath.startsWith(normalizedCurrentPath + ".")
  );
  

  const runMeasure = useCallback(() => {
    if (!textRef.current || !measureRef.current) return;
    const textElement = textRef.current;
    const measureElement = measureRef.current;
    const computedStyle = window.getComputedStyle(textElement);
    measureElement.style.fontSize = computedStyle.fontSize;
    measureElement.style.fontFamily = computedStyle.fontFamily;
    measureElement.style.fontWeight = computedStyle.fontWeight;
    measureElement.style.letterSpacing = computedStyle.letterSpacing;
    measureElement.style.lineHeight = computedStyle.lineHeight;
    measureElement.style.padding = computedStyle.padding;
    measureElement.style.width = computedStyle.width;
    measureElement.style.whiteSpace = "pre-wrap";
    measureElement.style.wordBreak = "break-word";
    measureElement.textContent = contentString;
    const isLongEnough =
      contentString.length >= minCharForSeeMore || contentString.includes("\n");
    const textHeight = measureElement.scrollHeight;
    const lineHeight =
      parseFloat(computedStyle.lineHeight) ||
      parseFloat(computedStyle.fontSize) * 1.2;
    const maxHeight = lineHeight * maxLines;
    const wrapsToMultipleLines = textHeight > maxHeight;
    setShouldShowSeeMore(isLongEnough && wrapsToMultipleLines);
  }, [contentString, minCharForSeeMore, maxLines]);

  useLayoutEffect(() => {
    runMeasure();
    const id = requestAnimationFrame(() => {
      runMeasure();
    });
    return () => cancelAnimationFrame(id);
  }, [runMeasure]);

  useEffect(() => {
    const onResizeOrObserve = () => runMeasure();
    window.addEventListener("resize", onResizeOrObserve);
    const el = containerRef.current;
    if (!el) {
      return () => window.removeEventListener("resize", onResizeOrObserve);
    }
    const ro = new ResizeObserver(onResizeOrObserve);
    ro.observe(el);
    return () => {
      window.removeEventListener("resize", onResizeOrObserve);
      ro.disconnect();
    };
  }, [runMeasure]);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (onToggle) {
      onToggle(newExpanded);
    }
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ lineHeight: "1.25" }}
      onClick={stopPropagationOnClick ? (e) => e.stopPropagation() : undefined}
    >
      {/* Hidden measure element */}
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          top: "-9999px",
          left: "-9999px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: "0.75rem", // text-xs
        }}
      />

      <div ref={containerRef} className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">
          <div
            ref={textRef}
            className={`text-[10px] text-gray-900 dark:text-gray-100 ${
              !isExpanded && shouldShowSeeMore
                ? `${getLineClampClass(maxLines)} break-words`
                : "break-words whitespace-pre-wrap"
            } ${textClassName}`}
            style={{ lineHeight: "1.25" }}
          >
            {(() => {
              if (contentString && highlightText) {
                const trimmedSearchTerm = highlightText.trim();
                if (!trimmedSearchTerm) return contentString;
                const textLower = contentString.toLowerCase();
                const searchLower = trimmedSearchTerm.toLowerCase();
                // Check if text contains search term (use same strings as match loop)
                if (!textLower.includes(searchLower)) {
                  return contentString;
                }
                // Find all occurrences in original text (case-insensitive)
                const matches: Array<{ start: number; end: number; text: string }> = [];
                let searchIndex = 0;
                while (true) {
                  const index = textLower.indexOf(searchLower, searchIndex);
                  if (index === -1) break;
                  const matchedText = contentString.substring(
                    index,
                    index + trimmedSearchTerm.length,
                  );
                  matches.push({
                    start: index,
                    end: index + trimmedSearchTerm.length,
                    text: matchedText,
                  });
                  searchIndex = index + 1;
                }
                
                // If no matches found, return as-is
                if (matches.length === 0) {
                  return contentString;
                }
                
                // Build highlighted result by splitting text at match positions
                const result: (string | React.ReactElement)[] = [];
                let lastIndex = 0;
                
                matches.forEach((match, matchIndex) => {
                  // Add text before match
                  if (match.start > lastIndex) {
                    result.push(contentString.substring(lastIndex, match.start));
                  }
                  
                  // Add highlighted match – explicit text color for active text
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
                if (lastIndex < contentString.length) {
                  result.push(contentString.substring(lastIndex));
                }
                
                return <>{result}</>;
              }
              
              return contentString || content;
            })()}
          </div>
        </div>

        {/* See more/less button */}
        {shouldShowSeeMore && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleToggle();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`text-primary-600 dark:text-primary-400 flex-shrink-0 self-center text-[10px] font-medium whitespace-nowrap hover:underline ${buttonClassName}`}
          >
            {isExpanded ? "See less" : "See more"}
          </button>
        )}
      </div>
    </div>
  );
}

SeeMoreLess.displayName = "SeeMoreLess";
