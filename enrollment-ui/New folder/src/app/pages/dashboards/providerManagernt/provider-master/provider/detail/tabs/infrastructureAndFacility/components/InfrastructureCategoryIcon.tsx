import clsx from "clsx";
import { getInfrastructureCategoryIconTheme } from "../utils/infrastructureCategoryIcons";

type InfrastructureCategoryIconProps = {
  categoryId: string;
  size?: "sm" | "md";
};

export function InfrastructureCategoryIcon({
  categoryId,
  size = "sm",
}: Readonly<InfrastructureCategoryIconProps>) {
  const theme = getInfrastructureCategoryIconTheme(categoryId);
  const Icon = theme.icon;
  const boxSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-sm ring-1",
        boxSize,
        theme.boxClass,
      )}
    >
      <Icon className={clsx(iconSize, theme.iconClass)} aria-hidden />
    </span>
  );
}
