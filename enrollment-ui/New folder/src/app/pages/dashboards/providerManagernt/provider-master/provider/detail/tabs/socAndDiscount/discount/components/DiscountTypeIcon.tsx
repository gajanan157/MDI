import type { ComponentType, SVGProps } from "react";
import {
  CubeIcon,
  DocumentTextIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const DISCOUNT_PANEL_ICONS: Record<string, HeroIcon> = {
  individual: UserIcon,
  netBill: DocumentTextIcon,
  approvedAmountDiscount: ShieldCheckIcon,
  package: CubeIcon,
  opd: HeartIcon,
};

export function DiscountTypeIcon({
  typeId,
  className = "h-2.5 w-2.5",
}: Readonly<{ typeId: string; className?: string }>) {
  const Icon = DISCOUNT_PANEL_ICONS[typeId] ?? DocumentTextIcon;
  return <Icon className={className} aria-hidden />;
}
