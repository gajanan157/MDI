import {
    ArrayPath,
    Control,
    FieldArrayPathValue,
    FieldValues,
    Path,
    UseFormRegister,
    useFieldArray,
    UseFormWatch,
    FieldErrors
} from "react-hook-form";


import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { Input } from "@/components/ui";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function getFieldErrorByPath(
    errors: FieldErrors | any,
    path: string
): string | undefined {
    if (!errors || !path) return undefined;
    const result = path
        .split(".")
        .reduce((acc: any, key) => {
            if (!acc) return undefined;
            return acc[isNaN(Number(key)) ? key : Number(key)];
        }, errors);
    return result?.message;
}


interface MultiContactProps<
    T extends FieldValues,
    P extends ArrayPath<T>
> {
    name: P;
    control: Control<T>;
    register: UseFormRegister<T>;
    watch: UseFormWatch<T>;
    errors: any;
    isRequired?: boolean;
    editing?: boolean;
}


function MultiContactField<
    T extends FieldValues,
    P extends ArrayPath<T>
>({
    name,
    control,
    register,
    watch,
    errors,
    isRequired,
    editing
}: Readonly<MultiContactProps<T, P>>) {
    type Item = FieldArrayPathValue<T, P>[number];

    const { fields, append, remove } = useFieldArray<T, P>({
        control,
        name,
    });
    useEffect(() => {
        if (fields?.length === 0) {
            append(EMPTY_CONTACT);
        }
    }, [fields?.length, append]);

    const EMPTY_CONTACT: Item = {
        type: "",
        value: "",
        isWhatsappEnabled: false,
    };
    const {t}  = useTranslation()
    return (
        <div className={`w-[210%] flex justify-between relative ${fields.length && fields?.length > 1 ? "flex-col gap-4" : "flex-row gap-4"} `}>
            {fields?.map((item, index) => {
                const typeName = `${name}.${index}.type` as Path<T>;
                const valueName = `${name}.${index}.value` as Path<T>;
                const isWhatsappEnabled = `${name}.${index}.isWhatsappEnabled` as Path<T>;

                const len = fields?.length;
                const isFirstRow = index === 0;
                const isOnlyOne = len === 1;
                const contactType = watch(typeName ?? "");

                const typeError = getFieldErrorByPath(errors, typeName);
                const errorObject = typeError ? { message: typeError } : undefined;

                return (
                    <div key={item.id} className={`flex w-full gap-4 ${(isOnlyOne || isFirstRow) ?? "flex-row"}`}>
                        <div className="w-1/2">
                            <DropdownSelect
                                label={t("contactPersonform.fields.contactType")}
                                defaultValue={t("contactPersonform.fields.contactType")}
                                name={typeName}
                                name_key={typeName}
                                options={[
                                    { label: "Email", value: "email" },
                                    { label: "Mobile", value: "mobile" },
                                    { label: "Landline", value: "landline" },
                                ]}
                                isRequired={isRequired}
                                control={control}
                                disabled={editing}
                                errors={errorObject}
                                rules={{ required: `Contact Type is required` }}

                            />
                        </div>
                        <div className="w-1/2">
                            <Input
                                label={t("contactPersonform.fields.contactValue")}
                                placeholder={t("contactPersonform.fields.contactValue")}
                                {...register(valueName)}
                                isRequired={isRequired}
                                error={getFieldErrorByPath(errors, valueName)}
                                disabled={editing}
                            />
                            {contactType === "mobile" && (
                                <div className="w-full mt-4 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        {...register(isWhatsappEnabled)}
                                        disabled={editing}
                                        className="cursor-pointer"
                                    />
                                    <label className="text-[12px] text-gray-700">
                                        {t("whatsAppEnabled")}
                                    </label>
                                </div>
                            )}

                        </div>
                        {fields.length > 1 && (
                            <div className="absolute right-0 mt-1">
                                {!editing && (
                                    <button
                                        type="button"
                                        className="text-red-500 text-sm mt-1 cursor-pointer"
                                        onClick={() => remove(index)}
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="absolute right-0 -top-1 text-xs" >
                <button
                    type="button"
                    className="text-blue-600 underline cursor-pointer text-xs"
                    onClick={() => append(EMPTY_CONTACT)}>
                    + {t("contactPersonform.fields.addContact")}
                </button>
            </div>
        </div>
    );
}

export default MultiContactField;
