import { fetchInsurerOffices } from "@/store/features/insurerOffice/insurerOfficeSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useEffect, useRef, useState, type RefObject } from "react";
import { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";
import { OfficeFormValues } from "./schema";

type UseSuperiorOfficeOptionsParams = {
  superiorOfficeType?: string;
  officeType?: string;
  insurerId?: string;
  officeId?: string;
  isEditing: boolean;
  isEditModeRef: RefObject<boolean>;
  setValue: UseFormSetValue<OfficeFormValues>;
};

export function useSuperiorOfficeOptions({
  superiorOfficeType,
  officeType,
  insurerId,
  officeId,
  isEditing,
  isEditModeRef,
  setValue,
}: UseSuperiorOfficeOptionsParams) {
  const dispatch = useAppDispatch();
  const lastRequestKeyRef = useRef("");
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (!superiorOfficeType || !officeType) {
      if (!isEditModeRef.current) {
        setValue("superiorOffice", "");
      }
      setOptions([]);
      return;
    }

    if (officeType !== "DO" && officeType !== "UO") {
      setOptions([]);
      return;
    }

    if (!insurerId) {
      toast.error("Please select Insurer", {
        position: "top-right",
        duration: 5000,
      });
      return;
    }

    const payload = {
      officeType: superiorOfficeType,
      insurerId,
      onlyNames: true,
    };
    const key = JSON.stringify(payload);
    if (lastRequestKeyRef.current === key) return;

    lastRequestKeyRef.current = key;

    if (!officeId || isEditing) {
      setValue("superiorOffice", "");
    }

    dispatch(fetchInsurerOffices(payload))
      .unwrap()
      .then((response) => {
        const nextOptions =
          response?.data?.map((office: { officeName: string; insurerOfficeId: string }) => ({
            label: office.officeName,
            value: office.insurerOfficeId,
          })) ?? [];
        setOptions(nextOptions);
      })
      .catch(() => {
        setOptions([]);
      });
  }, [
    superiorOfficeType,
    officeType,
    insurerId,
    isEditing,
    officeId,
    isEditModeRef,
    dispatch,
    setValue,
  ]);

  return options;
}
