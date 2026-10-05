import { useFormContext } from "react-hook-form";
import { InwardFormData } from "../types";



const AgeInput = ({
  label,
  fromName,
  toName,
  errors,
  disabled = false,
  isRequired = false,
  showChildCount = false,
  childCount,
  changeChildCount,
}: any) => (
  <div>
    <p className="font-semibold text-[11px] mb-1">
      {label} {isRequired && <span className="text-red-500 text-[10px]">*</span>}
    </p>
    <div className="flex gap-2 mb-1">
      <div className="w-[100px]">
        <input placeholder="From" {...fromName} disabled={disabled} className="border px-2 py-1 w-full  text-[11px] rounded disabled:bg-gray-100" />
        {errors?.from && <p className="text-red-500 text-[10px]">{errors.from.message}</p>}
      </div>
      <div className="w-[100px]">
        <input
          placeholder="To"
          {...toName}
          disabled={disabled}
          min={0}
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "e") {
              e.preventDefault();
            }
          }}
          className="border px-2 py-1 w-full  text-[11px] rounded disabled:bg-gray-100"
        />
        {errors?.to && <p className="text-red-500 text-[10px]">{errors.to.message}</p>}
      </div>
    </div>
    {showChildCount && (
      <div className="flex items-center gap-2 text-[11px] mt-1">
        <button type="button" onClick={() => changeChildCount(-1)} className="px-2 py-1 bg-gray-200 rounded cursor-pointer">-</button>
        <span>{childCount}</span>
        <button type="button" onClick={() => changeChildCount(1)} className="px-2 py-1 bg-blue-500 text-white rounded cursor-pointer">+</button>
      </div>
    )}

  </div>
);
export default function PolicyFamilyDefinition() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<InwardFormData>();

  const parentType = watch("parentType");
  const showSibling = watch("showSibling");
  const showSelf = watch("showSelf");
  const childCount = watch("childCount") || 0;
  const siblingCount = watch("siblingCount") || 0;


const changeChildCount = (val: number) => {
setValue("childCount",Math.min(4, Math.max(0, Number(childCount) + val)));
};

const SiblingCount = (val: number) => {
  setValue("siblingCount",  Math.min(4, Math.max(0, Number(siblingCount) + val)));
};

  const handleRadioClick = (value: string) => {
    if (parentType === value) {
      setValue("parentType", "");
    } else {
      setValue("parentType", value);
    }
  };
  return (
    <div className="max-w-full p-4 border rounded-md shadow-sm space-y-4 mt-2">
      <h1 className="text-[15px] font-semibold text-gray-800 mb-0">
        Policy Family Definition
      </h1>
      <h2 className=" text-gray-500 font-[12px] mb-2 mt-1">
        Cross Selection Parents And Siblings Selection
      </h2>
      <div className="flex gap-4 items-center flex-wrap text-[11px]">
        <label className="flex items-center gap-1 cursor-pointer font-bold">
          <input type="checkbox" {...register("showSelf")} />Only Self
        </label>
        {!showSelf && (
          <>
            {[{ label: "Any 2 Parents", value: "ANY_2" },
            { label: "Only one set of parents", value: "ONE_SET" },
            { label: "Only Father And Mother", value: "FATHER_MOTHER" },
            { label: "Any Parents (Only 4)", value: "ANY_4" },
            { label: "Only In-Laws", value: "IN_LAW" },
            ].map((val, index: number) => (
              <label key={index + 1} className="flex items-center gap-1 font-bold cursor-pointer">
                <input type="radio"
                  checked={parentType === val.value}
                  onClick={() => handleRadioClick(val.value)}
                  readOnly />
                {val?.label?.replace("_", " ")}
              </label>
            ))}
            <label className="flex items-center gap-1 cursor-pointer font-bold">
              <input type="checkbox" {...register("showSibling")} /> Siblings
            </label>
          </>
        )
        }
      </div>
      <div className="grid md:grid-cols-5 gap-4">
        <AgeInput label="Self" fromName={register("selfAge.from")} toName={register("selfAge.to")} errors={errors.selfAge} />
        {!showSelf && (
          <>
            <AgeInput label="Spouse" fromName={register("spouseAge.from")} toName={register("spouseAge.to")} errors={errors.spouseAge} />
            <div className="flex flex-col">
              <AgeInput
                label="Child (Son / Daughter)"
                fromName={register("childAge.from")}
                toName={register("childAge.to")}
                errors={errors.childAge}
                showChildCount={true}
                childCount={childCount}
                changeChildCount={changeChildCount}
              />
            </div>
            <div className="flex flex-col gap-1">
              <AgeInput label="Parents" fromName={register("parentAge.from")} toName={register("parentAge.to")} errors={errors.parentAge} disabled={!parentType} />
            </div>
            {showSibling &&
              <AgeInput
                label="Sibling"
                fromName={register("siblingAge.from")}
                toName={register("siblingAge.to")}
                errors={errors.siblingAge}
                showChildCount={true}
                childCount={siblingCount}
                changeChildCount={SiblingCount}
              />}
          </>
        )
        }
      </div>
    </div>
  );
}