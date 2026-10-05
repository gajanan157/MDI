import CompactStatCard, { CompactStatCardProps } from "@/components/shared/CompactStatCard";

export default function StatsCard(props: Readonly<CompactStatCardProps>) {
  return <CompactStatCard variant="left-accent" {...props} />;
}