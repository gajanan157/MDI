import { patchApi, policySearchApi, postApi, userService, workFlow } from "@/app/api/apiService";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import { handleApiError } from "@/app/pages/AdminDepartment/tpabranches/function";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";


export interface InwardFormValues { user_id: string; remark?: string }
interface Props { onClose: () => void; isData: any }

interface GroupData {
    id: string;
    name: string;
    description: string | null;
    path: string;
    parentId: string | null;
    subGroupCount: number;
    subGroups: any[];
    attributes: any;
    realmRoles: any;
    clientRoles: any;
    access: {
        view: boolean;
        viewMembers: boolean;
        manageMembers: boolean;
        manage: boolean;
        manageMembership: boolean;
    };
}



const AssignUser: React.FC<Props> = ({ onClose, isData }) => {
    const inwardFormSchema = yup.object().shape({
        user_id: yup.string().required("User is required"),
        remark: yup.string().notRequired().optional(),
    });
    const {
        control,
        handleSubmit,
        formState: { errors },
        register,
    } = useForm<InwardFormValues>({
        resolver: yupResolver(inwardFormSchema as any)
    });

    const { userInfo } = useKeycloak();
    const preferred_username = userInfo?.preferred_username ?? ""


    const [workflowResponse, setWorkflowResponse] = useState<any>(null);
    function getGroupName(data: any) {
        const { enrollmentType, status } = data;

        if (enrollmentType === "ENROLLMENT" && status === "PROCESSOR_PENDING") {
            return "Corporate-Enrolment-Processor";
        }

        if (enrollmentType === "ENROLLMENT" && status === "ONBOARDING_PENDING") {
            return "Corporate-Enrolment-Processor";
        }

        if (enrollmentType === "ENROLLMENT" && status === "QC_PENDING") {
            return "Corporate-Enrolment-QC";
        }

        if (enrollmentType === "ENDORSEMENT" && status === "PROCESSOR_PENDING") {
            return "Corporate-Endorsement-Processor";
        }

        if (enrollmentType === "ENDORSEMENT" && status === "QC_PENDING") {
            return "Corporate-Endorsement-QC";
        }
        return null;
    }






    const [loading, setLoading] = useState(false);

    const [processorUsers, setProcessorUsers] = useState<{ label: string; value: string }[]>([]);
    const [groupData, setGroupData] = useState<GroupData | null>(null);


    const [groupStatus, setGroupStatus] = useState<"loading" | "ready" | "error">("loading");
    const [groupMessage, setGroupMessage] = useState<string>("");

    // Responses come back as { data: [...] } or { data: { data: [...] } }.
    const toList = (result: any): any[] => {
        const body = result?.data;
        if (Array.isArray(body)) return body;
        if (Array.isArray(body?.data)) return body.data;
        if (Array.isArray(body?.data?.data)) return body.data.data;
        return [];
    };

    useEffect(() => {
        if (!groupData?.name) return;
        let cancelled = false;
        const fetchUserData = async () => {
            try {
                const result = await fetchUser(
                    userService,
                    `api/v1/groups/${encodeURIComponent(groupData.name)}/members`
                );
                if (cancelled) return;
                if (!result?.success) {
                    handleApiError(result);
                    setProcessorUsers([]);
                    return;
                }
                const users = toList(result)
                    .map((user: any) => {
                        const username = user?.username ?? user?.userName;
                        const fullName =
                            user?.name ||
                            user?.fullName ||
                            [user?.firstName, user?.lastName].filter(Boolean).join(" ");
                        return { label: fullName || username, value: username };
                    })
                    .filter((user: { value?: string }) => Boolean(user.value));
                setProcessorUsers(users);
            } catch (error) {
                console.error("Failed to load group members:", error);
                if (!cancelled) setProcessorUsers([]);
            }
        };
        fetchUserData();
        return () => {
            cancelled = true;
        };
    }, [groupData?.name]);


    useEffect(() => {
        if (!isData) return;
        let cancelled = false;
        const fetchGroups = async () => {
            setGroupStatus("loading");
            const groupName = getGroupName(isData);
            if (!groupName) {
                setGroupData(null);
                setGroupStatus("error");
                setGroupMessage(
                    `No group configured for ${isData?.enrollmentType ?? "-"} / ${isData?.status ?? "-"}`
                );
                return;
            }
            try {
                const result = await fetchUser(userService, `api/v1/groups`);
                if (cancelled) return;
                if (!result?.success) {
                    handleApiError(result);
                    setGroupData(null);
                    setGroupStatus("error");
                    setGroupMessage("Unable to load groups");
                    return;
                }
                // Keycloak can return groups nested under a parent, so search subGroups too.
                // The user service sends the name as `groupName`; Keycloak uses `name`.
                const nameOf = (group: any): string => group?.groupName ?? group?.name ?? "";
                const findGroup = (groups: any[]): any => {
                    for (const group of groups ?? []) {
                        if (nameOf(group).toLowerCase() === groupName.toLowerCase()) {
                            return { ...group, name: nameOf(group) };
                        }
                        const nested = findGroup(group?.subGroups);
                        if (nested) return nested;
                    }
                    return null;
                };
                const matchedGroup = findGroup(toList(result));
                if (!matchedGroup) {
                    console.warn(
                        `Group "${groupName}" not in groups response:`,
                        toList(result).map(nameOf)
                    );
                }
                setGroupData(matchedGroup || null);
                setGroupStatus(matchedGroup ? "ready" : "error");
                setGroupMessage(matchedGroup ? "" : `Group "${groupName}" not found`);
            } catch (error) {
                console.error("Failed to load groups:", error);
                if (!cancelled) {
                    setGroupData(null);
                    setGroupStatus("error");
                    setGroupMessage("Unable to load groups");
                }
            }
        };
        fetchGroups();
        return () => {
            cancelled = true;
        };
    }, [isData]);

    const getAssignmentType = (data: any): string | null => {
        const { enrollmentType, status } = data || {};

        if (
            (enrollmentType === "ENROLLMENT" || enrollmentType === "ENDORSEMENT") &&
            (status === "PROCESSOR_PENDING" || status === "ONBOARDING_PENDING")
        ) {
            return "MANUAL_ASSIGN_PROCESSOR";
        }

        if ((enrollmentType === "ENROLLMENT" || enrollmentType === "ENDORSEMENT") && status === "QC_PENDING") {
            return "MANUAL_ASSIGN_QC";
        }

        return null;
    };

const onSubmit = async (data: any) => {
    setLoading(true);

    try {
        // 1. Create workflow instance
        const createWorkflowUrl = `/api/v1/workflow/instances`;

        const workflowPayload = {
            workflowId: isData.workflowId,
            inwardNo: isData.inwardNo,
            businessEntityId: isData.id,
            businessReferenceNumber: isData.policyNo,
            businessEntityName: "POLICY",
            priority: "LOW",
            createdBy: preferred_username,
        };

        const workflowResult = await postApi<any, any>(
            workFlow,
            createWorkflowUrl,
            workflowPayload
        );

        if (!workflowResult?.success) {
            handleApiError(workflowResult);
            return;
        }

        // 2. Get workflow instance ID
        const workflowInstanceId =
            workflowResult?.data?.data?.workflowInstanceId;

        if (!workflowInstanceId) {
            toast.error("Workflow instance ID not found.", {
                position: "top-right",
                duration: 5000,
            });
            return;
        }

        setWorkflowResponse(workflowResult?.data?.data);

        // 3. Transition API
        const transitionUrl =
            `/api/v1/workflow/instances/${workflowInstanceId}/transition`;

        const transitionPayload = {
            actionCode: getAssignmentType(isData),
            requestingUserId: data?.user_id,
            requestingGroupName: "Corporate-Enrolment-Admin",
            remarks: data?.remark,
        };

        const transitionResult = await postApi<any, any>(
            workFlow,
            transitionUrl,
            transitionPayload
        );

        // Handle transition failure
        if (!transitionResult?.success) {
            if (transitionResult?.status === 409) {
                toast.error(transitionResult?.message, {
                    position: "top-right",
                    duration: 5000,
                });
            } else {
                handleApiError(transitionResult);
            }

            return;
        }

        // 4. Call PATCH API only after successful transition
        const assignUrl = `/v1/ocr/assign-user`;

        const workflowPayloadForPatch = {
            inwardNo: isData.inwardNo,
            policyNo: isData.policyNo,
            toUserName: data?.user_id,
        };

        const assignResult = await patchApi<any, any>(
            policySearchApi,
            assignUrl,
            workflowPayloadForPatch
        );

        // 5. Handle PATCH API response
        if (!assignResult?.success) {
            handleApiError(assignResult);
            return;
        }

        // 6. Show success message only after both APIs succeed
        toast.success(
            assignResult?.data?.message ||
            transitionResult?.data?.message ||
            "Workflow processed successfully.",
            {
                // Same id as the WORK_ITEM_ASSIGNED socket notification, so only one toast shows.
                id: `work-item-assigned-${isData.inwardNo}`,
                position: "top-right",
                duration: 5000,
            }
        );

        // 7. Close popup after successful PATCH
        onClose();

    } catch (error) {
        console.error("Workflow submission failed:", error);
        toast.error("Something went wrong while processing the workflow.", {
            position: "top-right",
            duration: 5000,
        });
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="p-4 space-y-2">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-2">
                    {/* Automatically Selected Group */}
                    {/* Assign Group */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign Group
                        </label>

                        <div className="relative">
                            <div className="flex items-center justify-between w-full min-h-[46px] px-3 border border-blue-300 rounded-lg bg-white shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-100 text-blue-600">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.8}
                                        >
                                            <circle cx="9" cy="8" r="3" />
                                            <circle cx="17" cy="9" r="2.5" />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.5 19a5.5 5.5 0 0111 0"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M14.5 14.5a5 5 0 016 4.5"
                                            />
                                        </svg>


                                    </div>

                                    {/* Group Name */}
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Selected Group
                                        </p>

                                        <p className="text-sm font-medium text-gray-800">
                                            {groupStatus === "loading"
                                                ? "Loading..."
                                                : groupData?.name || groupMessage}
                                        </p>
                                    </div>
                                </div>

                                {/* Right side */}
                                {groupData?.name && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Auto Selected
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>


                    <DropdownSelect
                        label={"User"}
                        defaultValue={"Select User"}
                        name_key="user_id"
                        options={processorUsers}
                        control={control}
                        name="user_id"
                        errors={errors.user_id}
                        isRequired
                        className="h-[38px] rounded-[10px]"
                    />
                    <Input
                        label={"Remark"}
                        placeholder={"Remark"}
                        {...register("remark")}
                        error={errors?.remark?.message}
                    />
                </div>
                <div className="col-span-2 flex justify-end mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 rounded-lg text-white ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 cursor-pointer"
                            }`}>
                        {loading ? "Assign User..." : "Assign User"}
                    </button>
                </div>
            </form>
        </div>

    );
};
export default AssignUser;