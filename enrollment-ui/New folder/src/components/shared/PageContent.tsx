import { ReactNode } from "react";
import clsx from "clsx";

/**
 * PageContent - Standardized wrapper for page content
 * Provides consistent padding and margin across all pages
 * 
 * Horizontal padding: 1rem (16px) - px-4
 * Vertical padding: 0.5rem (8px) - py-2
 */
interface PageContentProps {
  children: ReactNode;
  className?: string;
  /** Override default padding - use with caution */
  noPadding?: boolean;
}

export function PageContent({ children, className, noPadding = false }: PageContentProps) {
  return (
    <div
      className={clsx(
        "transition-content",
        !noPadding && "px-4 pt-1",
        className
      )}
    >
      {children}
    </div>
  );
}

