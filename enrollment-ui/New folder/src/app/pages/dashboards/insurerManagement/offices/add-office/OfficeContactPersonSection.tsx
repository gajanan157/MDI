import React from "react";
import { PencilSquareIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/outline";

type ContactPerson = {
  id?: string;
  prefix?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  designation?: string;
  department?: string;
  priority?: string;
};

type OfficeContactPersonSectionProps = {
  title: string;
  addLabel: string;
  noDataLabel: string;
  mobileerror: string;
  contactPersonFields: ContactPerson[];
  labels: {
    action: string;
    fullName: string;
    designation: string;
    department: string;
    priority: string;
    edit: string;
    remove: string;
  };
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
};

const OfficeContactPersonSection: React.FC<OfficeContactPersonSectionProps> = ({
  title,
  addLabel,
  noDataLabel,
  mobileerror,
  contactPersonFields,
  labels,
  onAdd,
  onEdit,
  onRemove,
}) => (
  <div className="mt-4 rounded-lg border border-gray-200">
    <div className="flex items-center justify-between p-4">
      <div className="flex gap-2.5">
        <h3 className="sub_section_title flex items-center gap-2 font-semibold text-gray-700">
          <div className="h-5 w-5 text-blue-500">
            <UserCircleIcon />
          </div>
          {title}
        </h3>
        {mobileerror && (
          <span className="input-text-error text-[11px] text-error dark:text-error-lighter">
            {mobileerror}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-600"
      >
        ➕ {addLabel}
      </button>
    </div>

    <div className="px-4 pb-4">
      <table className="w-full rounded-md border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left text-xs">{labels.action}</th>
            <th className="p-2 text-left text-xs">{labels.fullName}</th>
            <th className="p-2 text-left text-xs">{labels.designation}</th>
            <th className="p-2 text-left text-xs">{labels.department}</th>
            <th className="p-2 text-left text-xs">{labels.priority}</th>
          </tr>
        </thead>
        <tbody>
          {contactPersonFields.length === 0 && (
            <tr>
              <td colSpan={5} className="p-3 text-center text-gray-400">
                {noDataLabel}
              </td>
            </tr>
          )}
          {contactPersonFields.map((person, index) => (
            <tr key={person.id ?? index} className="border-t p-2 text-xs">
              <td className="ml-4 flex items-center gap-2 p-1">
                <button
                  type="button"
                  onClick={() => onEdit(index)}
                  className="text-blue-600 hover:text-blue-800"
                  title={labels.edit}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-700"
                  title={labels.remove}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </td>
              <td className="p-2">
                {person.prefix}. {person.firstName} {person.middleName} {person.lastName}
              </td>
              <td className="p-2">{person.designation}</td>
              <td className="p-2">{person.department}</td>
              <td className="p-2">{person.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default OfficeContactPersonSection;
