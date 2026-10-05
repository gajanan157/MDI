export interface TitleSectionProps {
  title?: string;
  hideTitle?: boolean;
}

export default function TitleSection({
  title,
  hideTitle = false,
}: TitleSectionProps) {
  if (hideTitle || !title) {
    return null;
  }

  return (
    <div className="mb-2">
      <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
    </div>
  );
}

TitleSection.displayName = "TitleSection";
