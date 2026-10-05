import React, { useEffect, useState } from "react";
import { FieldErrors, SubmitHandler, useForm, Path } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { XMarkIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { EscalationRow } from "./types";
import { escalationSchema } from "./escalationSchema";
import { Input } from "@/components/ui";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { fetchUser } from "../tpa/funcation";
import { masterApi, putApi } from "@/app/api/apiService";
import { toast } from "sonner";

interface Props {
  open: boolean;
  readOnly?: boolean;
  data: EscalationRow | null;
  selectedRow2: any;
  onClose: () => void;
}
const LEVELS = [
  { key: "contactPerson", label: "Contact Person" },
  { key: "escalationLevel1", label: "Escalation Level - 1" },
  { key: "escalationLevel2", label: "Escalation Level - 2" },
  { key: "escalationLevel3", label: "Escalation Level - 3" },
  { key: "escalationLevel4", label: "Escalation Level - 4" },
] as const;

type LevelKey = keyof EscalationRow;

const EditEscalationModal: React.FC<Props> = ({
  open,
  readOnly = false,
  data,
  onClose,
  selectedRow2
}) => {
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [isEmployeeListReady, setIsEmployeeListReady] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors, }, setValue, watch } =
    useForm<EscalationRow>({
      resolver: yupResolver(escalationSchema as any),
      values: data ?? undefined,
    });
  const fetchEmployee = async () => {
    const result = await fetchUser(masterApi, `/v1/escalation-matrix/employeeByQuery?queryId=${data?.queryId}`);
    if (result?.success && result?.data) setEmployeeList(result?.data?.data);
    setIsEmployeeListReady(true);
  };
  useEffect(() => {
    if (data?.queryId) fetchEmployee();
  }, [data?.queryId]);

  // Combine selectedRow2 levels and fetched employeeList for dropdown
  const levels = selectedRow2?.levels ?? [];

  const newEmpList = [
    ...levels.map((emp: any) => ({
      label: `${emp.employeeName} (${emp.employeeCode})`,
      value: emp.employeeId,
    })),
    ...(employeeList ?? [])
      .filter(
        (emp) => !levels.some((e: any) => e.employeeId === emp.employeeId)
      )
      .map((emp) => ({
        label: `${emp.employeeName} (${emp.employeeCode})`,
        value: emp.employeeId,
      })),
  ];
  const levelKeys2 = ["contactPerson", "escalationLevel1", "escalationLevel2", "escalationLevel3", "escalationLevel4"] as const;
  type LevelKey2 = typeof levelKeys2[number];
  type NameKeys2 = `${LevelKey2}.name`;
  const nameKeys = levelKeys2?.map(key => `${key}.name`) as NameKeys2[];
  const watchedNames = watch(nameKeys);

  const activeLevels = React.useMemo(() => {
    if (!data) return [];
    return LEVELS?.filter(level => data[level?.key])
  }, [data]);

  useEffect(() => {
    if (!selectedRow2?.levels || !employeeList) return;

    activeLevels?.forEach((levelKey, index) => {
      const selectedName = watchedNames[index];
      const key = levelKey.key as LevelKey;
      if (!selectedName) return;

      const emp = selectedRow2.levels?.find((e: any) => e.employeeId === selectedName) || employeeList?.find((e: any) => e.employeeId === selectedName);
      if (emp) {
        setValue(`${key}.phone` as Path<EscalationRow>, emp.contacts?.Mobile || "");
        setValue(`${key}.email` as Path<EscalationRow>, emp.contacts?.Email || "");
      }
    });
  }, [watchedNames]);



  // Reset form only after data & employees ready
  useEffect(() => {
    if (data && isEmployeeListReady) reset(data);
  }, [data, isEmployeeListReady, reset]);

  const [loading, setLoading] = useState(false)
  const onSubmit: SubmitHandler<EscalationRow> = async (formData) => {
    setLoading(true)
    const levelKeyMap: Record<string, number> = {
      contactPerson: 0,
      escalationLevel1: 1,
      escalationLevel2: 2,
      escalationLevel3: 3,
      escalationLevel4: 4,
    };

    const levels = Object.entries(levelKeyMap)
      .map(([key, levelNumber]) => {
        const levelData = (formData as any)[key];
        if (!levelData?.name) return null;

        return {
          escalationLevel: levelNumber,
          employeeId: levelData.name,
          mobile: levelData?.phone,
          email: levelData?.email
        };
      })
      .filter(Boolean);

    const payload = { levels };

    const endpoint = `v1/escalation-matrix/query/${data?.queryId}/matrix/${selectedRow2?.escalationMatrixId}/level`
    const res = await putApi<any, any>(masterApi, endpoint, payload)
    if (res?.success) {
      setLoading(false)
      toast.success(res?.data?.message, { position: "top-right", duration: 5000 })
      onClose()
    } else {
      toast.error(res?.error, { position: "top-right" })
      setLoading(false)
    }
  };



  if (!open || !data) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-md shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-lg">Edit Escalation Matrix</h2>
          <button onClick={onClose} className="cursor-pointer">
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
          <Input
            isRequired
            label="Query"
            placeholder="Enter Query"
            {...register("query")}
            error={errors?.query?.message}
            disabled
          />
          {activeLevels?.map(level => {
            const key = level?.key as LevelKey;
            const fieldError = errors[key] as FieldErrors<{ name: string; phone: string; email: string; }> | undefined;
            return (
              <section key={key}>
                <h3 className="font-semibold text-sm mb-3 border-b pb-1">{level.label}</h3>
                <div className="grid grid-cols-3 gap-2">
                  <DropdownSelect
                    label="Employee Name"
                    name_key={`${key}.name`}
                    defaultValue="Name"
                    options={newEmpList}
                    control={control}
                    rules={{ required: "Employee Name is required" }}
                    name={`${key}.name`}
                    errors={fieldError?.name}
                    isRequired
                  />
                  <Input
                    label="Mobile Number Or Landline"
                    prefix={<PhoneIcon className="size-5" />}
                    {...register(`${key}.phone` as keyof EscalationRow & string)}
                    error={fieldError?.phone?.message}
                  />
                  <Input
                    isRequired
                    label="Email ID"
                    prefix={<EnvelopeIcon className="size-5" />}
                    {...register(`${key}.email` as keyof EscalationRow & string)}
                    error={fieldError?.email?.message}
                  />
                </div>
              </section>
            );
          })}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1 border rounded text-sm cursor-pointer"
            >
              Close
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1 bg-blue-600 text-white rounded text-sm cursor-pointer"
              >
                Save
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEscalationModal;