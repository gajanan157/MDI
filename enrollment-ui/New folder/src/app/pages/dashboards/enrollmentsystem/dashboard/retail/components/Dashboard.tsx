import CompactPageHeader from "@/components/shared/CompactPageHeader";
import SectionTitle from "../components/SectionTitle";
import SummaryTable from "../components/SummaryTable";
import PriorityCard from "../components/PriorityCard";
import { enrollmentSummary, priorityData } from "./dashboardData";

const Dashboard = () => {
  return (
    <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-2">
      <CompactPageHeader
        title="Retail Inward Summary"
        recordLabel="Overview"
        statusBadge="Live"
      />
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <SectionTitle title="RETAIL IC WISE ENROLLMENT SUMMARY" />
          <div className="mt-1.5">
            <SummaryTable data={enrollmentSummary as any} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <SectionTitle title="RETAIL PRIORITY REQUEST SUMMARY" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-1.5">
            {priorityData?.map((item, i) => (
              <PriorityCard key={i} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;