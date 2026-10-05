import { ProviderUserAvatar } from "./ProviderUserAvatar";

export type ProviderAvatarStackItem = {
  id: string;
  initials: string;
  colorClass: string;
  title?: string;
};

type ProviderAvatarStackProps = {
  items: ProviderAvatarStackItem[];
  max?: number;
  sizeClass?: string;
  textClass?: string;
};

export function ProviderAvatarStack({
  items,
  max = 2,
  sizeClass = "h-6 w-6",
  textClass = "text-[9px]",
}: Readonly<ProviderAvatarStackProps>) {
  const visible = items.slice(0, max);
  const overflowCount = Math.max(0, items.length - max);
  const overflowTitle = items
    .slice(max)
    .map((item) => item.title ?? item.initials)
    .join(", ");

  return (
    <div className="flex min-w-0 items-center -space-x-1.5">
      {visible.map((item) => (
        <ProviderUserAvatar
          key={item.id}
          initials={item.initials}
          colorClass={item.colorClass}
          sizeClass={sizeClass}
          textClass={textClass}
          ringClass="ring-2 ring-white"
          title={item.title}
        />
      ))}
      {overflowCount > 0 ? (
        <span
          title={overflowTitle}
          className={`inline-flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-gray-100 ${textClass} font-semibold text-gray-600 ring-2 ring-white`}
        >
          +{overflowCount}
        </span>
      ) : null}
    </div>
  );
}
