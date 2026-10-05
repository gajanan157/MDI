import { Card } from "@/components/ui";
import clsx from "clsx";

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  cardClassName?: string;
}

/**
 * Section Card Component
 * Provides consistent card layout with optional title and actions
 * 
 * @example
 * ```tsx
 * <SectionCard
 *   title="Office Details"
 *   actions={<Button>Edit</Button>}
 * >
 *   <p>Content here</p>
 * </SectionCard>
 * ```
 */
export function SectionCard({ 
  title, 
  children, 
  actions,
  className,
  cardClassName
}: SectionCardProps) {
  return (
    <Card className={clsx("p-6", cardClassName)}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-sm font-medium text-gray-900 dark:text-dark-50">
              {title}
            </h3>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={className}>
        {children}
      </div>
    </Card>
  );
}

export default SectionCard;

