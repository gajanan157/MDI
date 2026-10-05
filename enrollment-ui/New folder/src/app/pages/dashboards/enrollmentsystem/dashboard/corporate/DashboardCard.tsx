import CompactStatCard from "@/components/shared/CompactStatCard";
import { useNavigate } from "react-router";

interface DashboardCardProps {
  title: string;
  count: number | string | undefined | null;
  subtitle: string;
  action: string;
  badge: string;
  icon: React.ReactNode;
  navigateTo: string;
  variant?: "primary" | "default" | "warning" | "danger";
  height?: string;
  width?: string;
  className?: string;
}

export default function DashboardCard({
  title,
  count,
  subtitle,
  action,
  badge,
  icon,
  navigateTo,
  variant = "default",
  height,
  width,
  className,
}: DashboardCardProps) {
  const navigate = useNavigate();

  const colorMap: Record<string, string> = {
    primary: "indigo",
    default: "emerald",
    warning: "amber",
    danger: "rose",
  };

  return (
    <CompactStatCard
      variant="interactive"
      color={colorMap[variant] || "blue"}
      title={title}
      count={count}
      subtitle={subtitle}
      action={action}
      badge={badge}
      icon={icon}
      onClick={() => navigate(navigateTo)}
      height={height}
      width={width}
      className={className}
    />
  );
}