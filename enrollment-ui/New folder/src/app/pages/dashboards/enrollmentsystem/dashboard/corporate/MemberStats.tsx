import CompactStatCard from "@/components/shared/CompactStatCard";

interface StatItem {
  label: string;
  value: number;
  color: string;
}

interface MemberStatsProps {
  stats: StatItem[];
  height?: string;
  width?: string;
  className?: string;
}

const MemberStats = ({
  stats,
  height,
  width,
  className = "",
}: MemberStatsProps) => {
  return (
    <div
      className={`grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 mb-1.5 shrink-0 ${className}`}
    >
      {stats?.map((stat) => (
        <CompactStatCard
          key={stat.label}
          variant="solid"
          color={stat.color}
          title={stat.label}
          count={stat.value}
          height={height}
          width={width}
        />
      ))}
    </div>
  );
};

export default MemberStats;