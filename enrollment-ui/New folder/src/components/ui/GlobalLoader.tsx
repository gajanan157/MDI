import React from "react";

interface GlobalLoaderProps {
  show: boolean;
  text?: string;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  show,
  text = "Loading...",
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50">
      <div className="flex flex-col items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-lg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          {text}
        </span>
      </div>
    </div>
  );
};

export default GlobalLoader;
