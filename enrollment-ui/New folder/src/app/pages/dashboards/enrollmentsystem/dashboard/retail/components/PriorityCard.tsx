type Props = {
  title: string;
  color: string;
  stats: {
    opening: number;
    inward: number;
    outward: number;
    pending: number;
  };
};

const PriorityCard = ({ title, color, stats }: Props) => {
  return (
    <div className="rounded-xl border border-slate-200 shadow-2xs overflow-hidden dark:border-dark-600 bg-white">
      <div className={`text-center font-bold text-xs py-1 text-white ${color}`}>
        {title}
      </div>

      <div className="grid grid-cols-4 gap-1.5 p-2 text-center bg-slate-50/50">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="bg-white border border-slate-200/80 rounded-md p-1 shadow-2xs">
            <div className="text-[10px] uppercase font-medium text-slate-500 truncate">{key}</div>
            <div className="text-xs font-bold text-slate-800">{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityCard;