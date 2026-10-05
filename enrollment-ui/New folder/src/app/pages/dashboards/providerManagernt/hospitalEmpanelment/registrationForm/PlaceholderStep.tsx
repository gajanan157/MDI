import { ReactNode } from "react";

type PlaceholderStepProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

export function PlaceholderStep({
  title,
  description = "This step is coming soon.",
  icon,
}: Readonly<PlaceholderStepProps>) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
