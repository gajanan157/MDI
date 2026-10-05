import { useInwardDashboard } from "./useInwardDashboard";

/** Inward dashboard panel (section + modal + task drawer). */
export function InwardDashboard() {
  const { content } = useInwardDashboard();
  return content;
}
