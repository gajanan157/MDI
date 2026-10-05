import React, { useState } from "react";
import {
    ChevronDownIcon,
    ChevronUpIcon,
} from "@heroicons/react/24/outline";

interface CollapseItem {
    key: string;
    title: string;
    content: React.ReactNode;
}

interface CollapsibleSectionProps {
    items: CollapseItem[];
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    items,
}) => {
    // initially all closed
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (key: string) => {
        setOpenSection((prev) => (prev === key ? null : key));
    };

    return (
        <div className="space-y-2">
            {items.map((item) => {
                const isOpen = openSection === item.key;

                return (
                    <div
                        key={item.key}
                        className="border rounded-xl shadow-sm overflow-hidden"
                    >
                        <div
                            onClick={() => toggleSection(item.key)}
                            className="flex items-center justify-between px-2 py-2 bg-gray-50 border-b cursor-pointer"
                        >
                            <h2 className="text-sm font-semibold text-gray-700">
                                {item.title}
                            </h2>

                            {isOpen ? (
                                <ChevronUpIcon className="w-5 h-5" />
                            ) : (
                                <ChevronDownIcon className="w-5 h-5" />
                            )}
                        </div>

                        {/* Content */}
                        {isOpen && (
                            <div className="p-1">
                                {item.content}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CollapsibleSection;