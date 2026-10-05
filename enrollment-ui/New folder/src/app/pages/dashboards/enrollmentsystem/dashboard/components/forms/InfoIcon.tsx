import { InformationCircleIcon } from "@heroicons/react/24/outline";
interface InfoIconProps {
  show?: boolean;
  message: string;
}

const InfoIcon = ({ show = true, message }: InfoIconProps) => {
  if (!show) return null;

  return (
    <div className="relative inline-flex items-center group">
      <InformationCircleIcon className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-600" />
      <div className="invisible group-hover:visible fixed z-9999 mt-2 w-auto rounded-md bg-gray-800 px-3 py-2 text-xs text-white shadow-lg">
        {message}
      </div>
    </div>
  );
};

export default InfoIcon;