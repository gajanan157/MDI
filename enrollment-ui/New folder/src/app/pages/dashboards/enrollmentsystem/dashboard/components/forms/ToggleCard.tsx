import React from "react";

type ToggleCardProps = {
    title: string;
    description: string;
    checked: any;
    onChange: () => void;
};

const ToggleCard: React.FC<ToggleCardProps> = ({
    title,
    description,
    checked,
    onChange,
}) => {
    return (
        <div className="mt-2 w-1/2 flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
            <div className="font-bold text-[11px]">
                <h3 className=" text-gray-900">{title}</h3>
                <p className="text-gray-500 mt-1">{description}</p>
            </div>
            <button onClick={onChange} className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? "bg-blue-600" : "bg-gray-300"}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-1"}`}/>
            </button>
        </div>
    );
};

export default ToggleCard;