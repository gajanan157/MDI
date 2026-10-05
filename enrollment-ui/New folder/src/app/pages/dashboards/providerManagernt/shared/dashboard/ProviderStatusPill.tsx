import clsx from "clsx";

type ProviderStatusPillProps = {
  label: string;
  className?: string;
  dotClassName?: string;
  title?: string;
};

export function ProviderStatusPill({
  label,
  className = "",
  dotClassName,
  title,
}: Readonly<ProviderStatusPillProps>) {
  return (
    <span
      className={clsx(
        dotClassName && "inline-flex items-center gap-1",
        className,
      )}
      title={title}
    >
      {dotClassName ? (
        <span className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", dotClassName)} aria-hidden />
      ) : null}
      {label}
    </span>
  );
}
