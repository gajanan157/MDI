type YesNoRadioProps = {
  label: string;
  name: string;
  register: any;
};

const YesNoRadio = ({
  label,
  name,
  register,
}: YesNoRadioProps) => {
  return (
    <div className="">
      <label className="block mb-2 text-sm font-medium  input-label dropdown-label  text-[14px] text-black">
        {label}
      </label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2  cursor-pointer text-sm font-medium  input-label dropdown-label  text-[14px] text-black">
          <input type="radio" className="" value="YES" {...register(name)} />
          Yes
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium  input-label dropdown-label  text-[14px] text-black">
          <input type="radio" value="NO" {...register(name)} />
          No
        </label>
      </div>
    </div>
  );
};
export default YesNoRadio;