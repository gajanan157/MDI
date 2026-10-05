
// import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
// import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
interface InwardCardProps {
  title: string;
  subtitle: string;
  recordFor?: string;
  total: number;
  icon: React.ReactNode;
  gradient: string;
  navigateTo: string;
  recordDate?: string;
  details?: { label: string; value: string | number }[];
}

const InwardCard: React.FC<InwardCardProps> = ({
  title,
  subtitle,
  // total,
  icon,
  gradient,
  navigateTo,
  recordDate,
  details,
  recordFor
}) => {
  const navigate = useNavigate();
  // const { t } = useTranslation();

  return (
    <div
      onClick={() => navigate(navigateTo)}
      className={`rounded-2xl p-8 text-white shadow-lg cursor-pointer 
      transition transform hover:scale-[1.02] hover:shadow-xl 
      ${gradient}`}>
      <div className="flex items-start gap-4">
        <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">{icon}</div>
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-white/80 mt-1">{subtitle}</p>
          {recordDate && (
            <p className="text-white/60 text-xs mt-1 italic">{recordFor}: {recordDate}</p>
          )}
        </div>
      </div>
      <div className="flex items-end justify-between mt-2">
        <div>
          {/* <p className="text-white/80 text-sm">{t("dashboard.totalInward")}</p> */}
          {/* <h3 className="text-4xl font-bold mt-1">{total?.toLocaleString()}</h3> */}
          {details && details.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-white/80">
              {details?.map(({ label, value }) => (
                <li key={label} className="flex justify-between">
                  <span>{label}</span>
                  <span className="font-semibold">{value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* <ArrowTrendingUpIcon className="w-8 h-8 text-white/80" /> */}
      </div>
    </div>
  );
};

export default InwardCard