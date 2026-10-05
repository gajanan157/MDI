import { formatProviderDateTimeDisplay } from "../../../../../../shared/dateFormat";

export function formatInfrastructureDate(value?: string | null): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "—";
  return formatProviderDateTimeDisplay(trimmed);
}

export function formatVerifiedOnDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "-";
  return formatProviderDateTimeDisplay(trimmed);
}
