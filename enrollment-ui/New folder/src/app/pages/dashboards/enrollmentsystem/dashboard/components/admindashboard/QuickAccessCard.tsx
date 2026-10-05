import React from "react";
import { useNavigate } from "react-router";

interface QuickAccessCardProps {
  title: string;
  icon: React.ReactNode;
  path: string;
  subtitle?: string;
}

export default function QuickAccessCard({
  title,
  icon,
  path,
}: Readonly<QuickAccessCardProps>) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      title={title}
      className="group flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-left shadow-2xs transition-all duration-150 hover:border-blue-400 hover:bg-blue-50/40 active:bg-blue-100 cursor-pointer dark:border-dark-600 dark:bg-dark-800 dark:hover:bg-dark-700 overflow-hidden"
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
        {icon}
      </div>
      <span className="truncate text-xs font-semibold text-slate-700 transition-colors group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-400">
        {title}
      </span>
    </button>
  );
}