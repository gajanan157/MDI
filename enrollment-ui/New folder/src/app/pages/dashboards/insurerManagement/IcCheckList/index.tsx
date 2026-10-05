import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { useDisclosure } from "@/hooks";
import { useState } from "react";
import CommonSearch, { SearchField } from "../../CommonSearch";

const IcCheckList = () => {
    const [loading, setLoading] = useState(false);
    const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(true);

    const fields: SearchField[] = [
        { name: "insurerId", label: "Insurer Name", type: "dropdown", options: [] },
    ];

    const handleSearch = async () => {
        setLoading(true);
        setLoading(false);
    };
    return (
        <Page title="Insurer Check List">
            <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
                <CompactPageHeader
                    title="Insurer Onboarding Checklist"
                    statusBadge="Checklist"
                />
                <CommonSearch
                    fields={fields}
                    onSearch={handleSearch}
                    isSubmitting={loading}
                    title="Insurer Filters"
                    showToggleButton={false}
                    isOpen={isSearchOpen}
                    onToggle={toggleSearch}
                    isInsurer
                />
            </div>
        </Page>
    );
};
export default IcCheckList;