// import { Dialog } from "@/components/ui";
// import AddBenefitLimitForm from "./AddBenifitLimitForm";

// type BenefitRuleDialogProps = {
//     open: boolean;
//     onClose: () => void;
//     benefitLimitId: string;
//     parentNodeId?: string | null;
//     ruleId?: string | null;   // set when editing an existing rule, undefined/null = add mode
//     rule?: any;                // existing rule payload, used to prefill on edit
//     onSaved: (savedRule: any) => void;
// };

// const BenefitRuleDialog = ({
//     open,
//     onClose,
//     benefitLimitId,
//     parentNodeId,
//     ruleId,
//     rule,
//     onSaved,
// }: BenefitRuleDialogProps) => {
//     if (!open) return null;

//     return (
//         <Dialog isOpen={open} onClose={onClose} width="xl">
//             <AddBenefitLimitForm
//                 type="RULE"
//                 benefitLimitId={benefitLimitId}
//                 parentNodeId={parentNodeId ?? null}
//                 id={ruleId ?? undefined}
//                 item={rule}
//                 onClose={onClose}
//                 onSave={onSaved}
//             />
//         </Dialog>
//     );
// };

// export default BenefitRuleDialog;

import { useEffect } from "react";
import { X } from "lucide-react";
import AddBenefitLimitForm from "./AddBenifitLimitForm";

type BenefitRuleDialogProps = {
    open: boolean;
    onClose: () => void;
    benefitLimitId: string;
    parentNodeId?: string | null;
    ruleId?: string | null;   // set when editing an existing rule, undefined/null = add mode
    rule?: any;                // existing rule payload, used to prefill on edit
    onSaved: (savedRule: any) => void;
};

const BenefitRuleDialog = ({
    open,
    onClose,
    benefitLimitId,
    parentNodeId,
    ruleId,
    rule,
    onSaved,
}: BenefitRuleDialogProps) => {
    // Close on Escape key
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => {
                // Close only when the backdrop itself is clicked, not the card
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                    <div>
                        <h2 className="text-base font-bold text-zinc-900">
                            {ruleId ? "Edit Benefit Rule" : "Add Benefit Rule"}
                        </h2>

                        <p className="mt-1 text-xs text-zinc-500">
                            Configure the business rule details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="overflow-y-auto">
                    <AddBenefitLimitForm
                        type="RULE"
                        benefitLimitId={benefitLimitId}
                        parentNodeId={parentNodeId ?? null}
                        id={ruleId ?? undefined}
                        item={rule}
                        onClose={onClose}
                        onSave={onSaved}
                    />
                </div>
            </div>
        </div>
    );
};

export default BenefitRuleDialog;
