import { DetailRow } from "../../../shared/DetailRow";
import type { InfrastructureViewRow } from "../../../utils/sectionMerges/infrastructure/infrastructureViewMapper";

type InfrastructureViewCardProps = {
  rows: InfrastructureViewRow[];
};

export function InfrastructureViewCard({ rows }: Readonly<InfrastructureViewCardProps>) {
  return (
    <dl className="grid grid-cols-1 gap-x-3 gap-y-0 sm:grid-cols-2">
      {rows.map((row, index) => (
        <DetailRow
          key={`${row.label}-${index}`}
          compact
          tone="slate"
          layout="inline"
          label={row.label}
          value={row.value}
        />
      ))}
    </dl>
  );
}
