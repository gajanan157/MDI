import clsx from "clsx";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standardized Page Header Component
 * Provides consistent layout for page titles, descriptions, and action buttons
 * 
 * @example
 * ```tsx
 * <PageHeader 
 *   title="Office Management"
 *   description="Manage office details and hierarchy"
 *   actions={<Button>Add Office</Button>}
 * />
 * ```
 */
export function PageHeader({ 
  title, 
  description, 
  actions,
  className 
}: PageHeaderProps) {
  return (
    <div className={clsx(
      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
      className
    )}>
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-50">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;

