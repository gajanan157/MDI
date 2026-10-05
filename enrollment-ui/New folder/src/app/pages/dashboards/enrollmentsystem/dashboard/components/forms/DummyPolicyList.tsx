import React, { useState } from "react";

interface DummyPolicy {
    dummyPolicyNumber: string;
    corporate: string;
    insurer: string;
}

interface DummyPolicyListProps {
    policies?: DummyPolicy[];
    onSelect: (dummyPolicyNumber: string) => void;
    onClose: () => void;


}

const DummyPolicyList: React.FC<DummyPolicyListProps> = ({ policies = [], onSelect, onClose
}) => {
    const [selectedPolicy, setSelectedPolicy] = useState<string>("");

    const handleSelect = (policy: DummyPolicy) => {
        setSelectedPolicy(policy.dummyPolicyNumber);
    };

    const handleConfirm = () => {
        if (!selectedPolicy) return;

        onSelect(selectedPolicy);
        onClose()
    };



    const firstPolicy = policies?.[0];

    const insurer = firstPolicy?.insurer || "";
    const corporate = firstPolicy?.corporate || "";
    const livePolicyNumber = firstPolicy?.dummyPolicyNumber || "";


    return (
        <div className="w-full">
            {/* Heading */}

            <div className="mb-4 space-y-1.5">
                {/* Insurer / IC */}
                <div className="grid grid-cols-[125px_1fr] items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#111827]">
                        Insurer / IC
                    </span>

                    <div className="bg-[#e7e7e7] flex h-[30px] w-full items-center rounded-sm border border-[#c8cfd8]  px-2.5 text-[12px] text-[#111827]">
                        {insurer}
                    </div>
                </div>

                {/* Corporate */}
                <div className="grid grid-cols-[125px_1fr] items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#111827]">
                        Corporate
                    </span>

                    <div className="bg-[#e7e7e7] flex h-[30px] w-full items-center rounded-sm border border-[#c8cfd8]  px-2.5 text-[12px] text-[#111827]">
                        {corporate}
                    </div>
                </div>

                <div className="grid grid-cols-[125px_1fr] items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#111827]">
                        Live Policy Number
                    </span>

                    <div className="bg-[#e7e7e7] flex h-[30px] w-full items-center rounded-sm border border-[#c8cfd8]  px-2.5 text-[12px] text-[#111827]">
                        {livePolicyNumber}
                    </div>
                </div>
            </div>
            <h3 className="mb-1 text-[13px] font-semibold text-[#111827]">
                Available Dummy Policies
            </h3>


            <div className="w-full overflow-hidden rounded-sm border border-[#bfc7d1]">
                {/* Header */}
                <table className="w-full table-fixed border-collapse">
                    <thead>
                        <tr className="h-8 bg-[#edf2f7]">
                            <th className="w-[50px] border-r border-[#bfc7d1] px-1 text-center text-[10px] font-semibold text-[#111827]">
                                Select
                            </th>

                            <th className="w-[150px] border-r border-[#bfc7d1] px-2 text-left text-[10px] font-semibold text-[#111827]">
                                Dummy Policy Number
                            </th>

                            <th className="w-[150px] border-r border-[#bfc7d1] px-2 text-left text-[10px] font-semibold text-[#111827]">
                                Corporate
                            </th>

                            <th className="px-2 text-center text-[10px] font-semibold text-[#111827]">
                                Insurer / IC
                            </th>
                        </tr>
                    </thead>
                </table>

                {/* Scrollable Body */}
                <div className="max-h-[170px] overflow-y-auto">
                    <table className="w-full table-fixed border-collapse">
                        <tbody>
                            {policies?.map((policy) => {
                                const isSelected =
                                    selectedPolicy === policy.dummyPolicyNumber;

                                return (
                                    <tr
                                        key={policy.dummyPolicyNumber}
                                        onClick={() => handleSelect(policy)}
                                        className="h-[34px] cursor-pointer border-t border-[#bfc7d1] bg-white"
                                    >
                                        {/* Radio */}
                                        <td className="w-[50px] border-r border-[#bfc7d1] px-1 text-center">
                                            <input
                                                type="radio"
                                                name="dummyPolicy"
                                                value={policy.dummyPolicyNumber}
                                                checked={isSelected}
                                                onChange={() => handleSelect(policy)}
                                                className="h-[14px] w-[14px] cursor-pointer accent-[#075bb5]"
                                            />
                                        </td>

                                        {/* Dummy Policy Number */}
                                        <td className="w-[150px] border-r border-[#bfc7d1] px-2 text-[10px] text-[#111827]">
                                            {policy.dummyPolicyNumber}
                                        </td>

                                        {/* Corporate */}
                                        <td className="w-[150px] border-r border-[#bfc7d1] px-2 text-[10px] text-[#111827]">
                                            {policy.corporate}
                                        </td>

                                        {/* Insurer / IC */}
                                        <td className="px-2 text-[10px] text-[#111827]">
                                            {policy.insurer}
                                        </td>
                                    </tr>
                                );
                            })}

                            {policies?.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="h-[50px] text-center text-[11px] text-gray-500"
                                    >
                                        No dummy policies available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Select Button */}
            <div className="mt-2.5 flex justify-end">
                <button
                    type="button"
                    disabled={!selectedPolicy}
                    onClick={handleConfirm}
                    className="
            h-[29px]
            min-w-[108px]
            rounded-sm
            bg-[#075bb5]
            px-5
            text-[12px]
            font-semibold
            text-white
            hover:bg-[#064d99]
            disabled:cursor-not-allowed
            disabled:opacity-50
            cursor-pointer
          "
                >
                    Select
                </button>
            </div>
        </div>
    );
};

export default DummyPolicyList;
