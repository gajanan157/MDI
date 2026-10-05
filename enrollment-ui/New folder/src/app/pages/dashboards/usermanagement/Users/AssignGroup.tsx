import { ApiResponse, putApi, userService } from "@/app/api/apiService";
import { fetchUser } from "@/app/pages/AdminDepartment/tpa/funcation";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { OptionForInward } from "../../enrollmentsystem/PolicyDetails/CreateInwardForm";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchUsersData } from "@/store/features/Broker/BrokerSlice";


const groupAssignSchema = yup.object().shape({
    group_id: yup
        .array()
        .of(yup.string().required())
        .min(1, "Groups is required"),
});


interface InwardFormValues {
    group_id: string[];
}

interface Props {
    onClose: () => void;
    groupList: any;
    userId: string;
}

const assignAndRemoveGroup = async <T extends object>(payload: T, userId: string,): Promise<ApiResponse<any>> => {
    try {
        const endpoint = `api/v1/users/${userId}/groups`;
        return await putApi<any, T>(userService, endpoint, payload);
    } catch (error: any) {
        return { success: false, data: null, error: error.message };
    }
};

const AssignGroup: React.FC<Props> = ({ onClose, groupList, userId }) => {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<InwardFormValues>({
        resolver: yupResolver(groupAssignSchema as any)
    });
    const dispatch = useAppDispatch()

    const [loading, setLoading] = useState(false);
    const onSubmit = async (data: InwardFormValues) => {
        try {
            setLoading(true);

            const previousGroupIds = groupList?.map((g: any) => g?.value);
            const currentGroupIds = data?.group_id ?? [];
            const addGroupIds = currentGroupIds?.filter((id) => !previousGroupIds?.includes(id));
            const removeGroupIds = previousGroupIds?.filter((id: string) => !currentGroupIds?.includes(id));
            const payload = { addGroupIds, removeGroupIds };
            const response = await assignAndRemoveGroup(payload, userId);

            if (response?.success) {
                toast?.success(response?.data?.message, { duration: 1000 })
                onClose();
                dispatch(fetchUsersData({ page: 1, size: 20 }));
            } else {
                toast?.error(response.error, { duration: 5000 });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const [category, setCategory] = useState<OptionForInward[]>([]);

    const fecthCategory = async () => {
        const result = await fetchUser(userService, `api/v1/groups`);
        if (result?.success && result?.data) {
            const departmentSubtypes = result?.data?.data ?? [];

            const options = departmentSubtypes?.map((item: any) => ({
                label: item?.name,
                value: item?.id,
            }));

            setCategory(options);
            if (groupList?.length) {
                setValue("group_id", groupList?.map((g: any) => g?.value));
            }

        }
    }
    useEffect(() => {
        fecthCategory()
    }, [])

    return (
        <div className="p-4 space-y-2 h-40">
            <form onSubmit={handleSubmit(onSubmit)} className="relative mb-4">
                <div className="grid grid-cols-1 gap-2">
                    <DropdownSelect
                        label={"Groups"}
                        defaultValue={"Select Group"}
                        name_key="group_id"
                        options={category}
                        control={control}
                        name="group_id"
                        errors={errors.group_id}
                        isRequired
                        className=" rounded-[10px]"
                        multiselect
                        is_select_checkbox
                    />
                </div>
                <div className="bg-white pt-4 flex justify-end absolute right-0 top-[-27px]">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-1 rounded-lg cursor-pointer"
                    >
                        Assign Group
                    </button>
                </div>
            </form>
        </div>
    );
};
export default AssignGroup;