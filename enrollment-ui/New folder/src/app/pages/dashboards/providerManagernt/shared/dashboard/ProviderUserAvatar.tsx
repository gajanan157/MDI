import clsx from "clsx";

type ProviderUserAvatarProps = {
  initials: string;
  colorClass: string;
  sizeClass?: string;
  textClass?: string;
  ringClass?: string;
  title?: string;
};

export function ProviderUserAvatar({
  initials,
  colorClass,
  sizeClass = "h-6 w-6",
  textClass = "text-[9px]",
  ringClass,
  title,
}: Readonly<ProviderUserAvatarProps>) {
  return (
    <span
      title={title}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        sizeClass,
        textClass,
        colorClass,
        ringClass,
      )}
    >
      {initials}
    </span>
  );
}
