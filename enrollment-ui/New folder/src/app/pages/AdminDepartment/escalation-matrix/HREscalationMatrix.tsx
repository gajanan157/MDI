import React, { useEffect, useState } from "react";
import EditEscalationModal from "./EditModel";
import CommonSearch, { SearchField } from "../../dashboards/CommonSearch";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { useDisclosure } from "@/hooks";
import CheckListButton from "../../dashboards/insurerManagement/IcCheckList/CheckListButton";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchEscalationMatrix, fetchEscalationMatrixdepartment } from "@/store/features/escalationMatrix/matrixSlice";
import { fetchTPABranches } from "@/store/features/tpa/tpaSlice";
import { usePermission } from "@/app/auth/usePermission";

interface Employee {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
}
const PersonCell = ({ person }: any) => {
  if (!person) return <span className="text-gray-400">—</span>;

  return (
    <div className="text-[12px] space-y-1">
      <p className="font-semibold">{person.employeeName}</p>
      <p>{person.designation}</p>
      <p className="text-blue-600">{person.contacts?.Email}</p>
      <p>{person.contacts?.Mobile}</p>
    </div>
  );
};

const mapRowToFormData = (row: any) => {
  if (!row?.levels?.length) {
    return {
      query: row.queryName,
      queryId: row.queryId,
    };
  }

  const formData: any = {
    query: row.queryName,
    queryId: row.queryId,
  };

  // Sort levels by escalationLevel just in case
  const sortedLevels = [...row.levels].sort(
    (a, b) => (a.escalationLevel ?? 0) - (b.escalationLevel ?? 0)
  );

  sortedLevels.forEach((level: any, index: number) => {
    const levelKey = index === 0 ? "contactPerson" : `escalationLevel${index}`;
    formData[levelKey] = {
      name: level.employeeId || "",
      phone: level.contacts?.Mobile || "",
      email: level.contacts?.Email || "",
    };
  });

  return formData;
};



const HREscalationMatrix: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [selectedRow1, setSelectedRow1] = useState<{ levels?: Employee[] }>({});


  const handleEdit = (row: any) => {
    const mappedData = mapRowToFormData(row);
    setSelectedRow(mappedData as any);
    setSelectedRow1(row)
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedRow(null);
    setOpen(false);
    dispatch(fetchEscalationMatrix());
  };
  const [loading] = useState(false);

  const dispatch = useAppDispatch();

  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const { branches } = useAppSelector((state) => state.tpa);
  const { matrix } = useAppSelector((state) => state.matrix);
  const { canWrite } = usePermission("tpa");
  const branchOptions = branches?.map((state: any) => ({
    label: state?.branchName,
    value: state?.tpaBranchId,
  }));
  const fields: SearchField[] = [
    {
      name: "branchDropdown",
      label: "Branch",
      type: "dropdown",
      options: branchOptions,
      isMulti: false,
    },
  ];

  const handleSearch = async (data: Record<string, any>) => {
    if (data?.branchDropdown|| data?.depertmentDropdown) {
      dispatch(fetchEscalationMatrix({ tpaBranchId: data.branchDropdown,departmentId:data?.depertmentDropdown }));
    } else {
      dispatch(fetchEscalationMatrix());
    }
  };

  useEffect(() => {
    const payload = {
      page: 1,
      size: 200,
    };
    dispatch(fetchTPABranches(payload));
  }, [dispatch]);
  useEffect(() => {
    dispatch(fetchEscalationMatrix());
    dispatch(fetchEscalationMatrixdepartment());
  }, [dispatch]);


  return (
    <>
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title="HR Escalation Matrix"
          totalRecords={matrix?.length || 0}
          recordLabel="Rules"
          onRefresh={() => dispatch(fetchEscalationMatrix())}
        >
          <CheckListButton
            onClick={toggleSearch}
            label={isSearchOpen ? "Hide Search" : "Search"}
            bgColor="bg-blue-600"
            textColor="text-white"
            size="text-xs"
            className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
            isSearch
          />
        </CompactPageHeader>

        <CommonSearch
          fields={fields}
          onSearch={handleSearch}
          isSubmitting={loading}
          title="TPA Branch Filters"
          isState
          showToggleButton={false}
          isOpen={isSearchOpen}
          onToggle={toggleSearch}
        />

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-dark-600 dark:bg-dark-800 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-semibold sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="border-b border-slate-200 px-2 py-1.5 w-12 text-center bg-slate-100">Sr</th>
                  <th className="border-b border-slate-200 px-2 py-1.5 w-60 bg-slate-100">Queries</th>
                  <th className="border-b border-slate-200 px-2 py-1.5 bg-slate-100">Contact Person</th>
                  <th className="border-b border-slate-200 px-2 py-1.5 bg-slate-100">Escalation Level-1</th>
                  <th className="border-b border-slate-200 px-2 py-1.5 bg-slate-100">Escalation Level-2</th>
                  {canWrite && (<th className="border-b border-slate-200 px-2 py-1.5 bg-slate-100 w-16 text-center">Action</th>)}
                </tr>
              </thead>
              <tbody>
                {matrix && matrix?.length > 0 ? (
                  matrix?.map((row: any, index: number) => (
                    <tr key={row?.queryId + index * 3} className="align-top border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                      <td className="px-2 py-1.5 text-center font-medium font-mono text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-2 py-1.5 font-medium text-slate-800">
                        {row?.queryName}
                      </td>
                      <td className="px-2 py-1.5">
                        <PersonCell person={row?.levels?.[0]} />
                      </td>
                      <td className="px-2 py-1.5">
                        <PersonCell person={row?.levels?.[1]} />
                      </td>
                      <td className="px-2 py-1.5">
                        <PersonCell person={row?.levels?.[2]} />
                      </td>
                      {canWrite && (
                        <td className="px-2 py-1.5 text-center">
                          <button
                            type="button"
                            className="text-primary-600 hover:text-primary-800 cursor-pointer font-semibold text-xs"
                            onClick={() => handleEdit(row)}
                          >
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-6 text-center text-slate-500 text-xs"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <EditEscalationModal selectedRow2={selectedRow1} open={open} data={selectedRow} onClose={handleClose} />
    </>
  );
};
export default HREscalationMatrix;