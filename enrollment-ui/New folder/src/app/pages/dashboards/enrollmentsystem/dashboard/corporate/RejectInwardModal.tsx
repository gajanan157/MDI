import { ApiResponse, policySearchApi, patchApi } from "@/app/api/apiService";
import { useRole } from "@/app/auth/usePermission";
import { handleApiError } from "@/app/pages/AdminDepartment/tpabranches/function";
import { Input } from "@/components/ui";
import { fetchCorporateInwardData, fetchCorporateInwardDataStatusCount } from "@/store/features/Broker/BrokerSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
    open: boolean;
    ocrId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const updateInwardStatus = async (
    ocrId: string,
    payload: {
        status: string;
        remark: string;
    }
): Promise<ApiResponse<any>> => {
    try {
        const endpoint = `v1/ocr/${ocrId}/status`;
        return await patchApi(policySearchApi, endpoint, payload);
    } catch (error: any) {
        return {
            success: false,
            data: null,
            error: error.message,
        };
    }
};

export default function RejectInwardModal({ open, ocrId, onClose }: Readonly<Props>) {
    const dispatch = useAppDispatch()
    const [remark, setRemark] = useState("");
    const [remarkError, setRemarkError] = useState("");
    const [loading, setLoading] = useState(false);
    const { isQC, isProcessor } = useRole();

    useEffect(() => {
        if (open) {
            setRemark("");
            setRemarkError("");
        }
    }, [open]);


    const handleSubmit = async () => {
        if (!remark.trim()) {
            setRemarkError("Remark is required");
            return;
        }
        try {
            setLoading(true);
            const response = await updateInwardStatus(ocrId, { status: "REJECTED_INWARD", remark });

            if (response.success) {
                onClose();
                toast.success(response?.data?.message, { position: "top-right", duration: 5000 });
                dispatch(fetchCorporateInwardData({ page: 1, size: 20 }));
                let rolePayload = {};
                if (isQC) {
                    rolePayload = { isQc: true };
                } else if (isProcessor) {
                    rolePayload = { isProcessor: true };
                }
                dispatch(fetchCorporateInwardDataStatusCount(rolePayload))
            } else if (response?.status === 409) {
                toast.error(response?.message);
            } else {
                handleApiError(response);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white shadow-xl">
                            {/* <div className="border-b p-5">
                <Dialog.Title className="text-lg font-semibold">
                  Reject Inward
                </Dialog.Title>
              </div> */}

                            <div className="space-y-5 p-5">
                                <Input
                                    label="Remark"
                                    placeholder="Enter Remark"
                                    value={remark}
                                    isRequired
                                    error={remarkError}
                                    onChange={(e) => {
                                        setRemark(e.target.value);

                                        if (remarkError) {
                                            setRemarkError("");
                                        }
                                    }}
                                />

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="cursor-pointer rounded-lg border border-gray-300 px-5 py-2 text-sm hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={handleSubmit}
                                        className="cursor-pointer rounded-lg bg-red-600 px-5 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {loading ? "Submitting..." : "Reject"}
                                    </button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
}

