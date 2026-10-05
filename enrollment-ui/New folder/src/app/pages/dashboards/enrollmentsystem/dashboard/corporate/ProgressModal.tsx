import React from "react";

interface ProgressModalProps {
  open: boolean;
  progress?: number;
  status?: "PROCESSING" | "COMPLETED" | "FAILED";
  remainingTime?: number;
  title?: string;
  description?: string;
}

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }

  return `${mins}m ${secs}s`;
};

const ProgressModal: React.FC<ProgressModalProps> = ({
  open,
  progress = 0,
  status = "PROCESSING",
  remainingTime = 0,
  title = "Updating Member Records",
  description = "Please wait while we update the member records. This may take a few moments.",
}) => {
  if (!open) return null;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const statusColor = {
    PROCESSING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[380px] rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-32">
            <svg className="-rotate-90 h-32 w-32" viewBox="0 0 120 120">
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="25%" stopColor="#22C55E" />
                  <stop offset="50%" stopColor="#EAB308" />
                  <stop offset="75%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>

              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#E5E7EB"
                strokeWidth="10"
                fill="none"
              />

              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-500 ease-in-out"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">
                {progress}%
              </span>
            </div>
          </div>

          <h3 className="mt-5 text-lg font-semibold text-gray-800">
            {title}
          </h3>

          <p className="mt-2 text-center text-sm text-gray-500">
            {description}
          </p>

          <span
            className={`mt-4 rounded-full px-3 py-1 text-xs font-semibold ${
              statusColor[status]
            }`}
          >
            {status}
          </span>

          <div className="mt-5 w-full rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-500">Estimated  Remaining Time</span>
              <span className="font-medium">
                {formatTime(remainingTime)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;