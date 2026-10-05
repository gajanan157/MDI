import React, { useRef } from "react";
import ExportPopup from "./ExportPopup";

type Row = {
  branchName: string;
  branchPendency: number;
  branchPendency2: number;
  cbfInward: number;
  authUnderProcess: number;
  authApproved: number;
  authQueryRaised: number;
  claimUnderProcess: number;
  claimApproved: number;
  claimQueryRaised: number;
  approved: number;
  pendingForAppend: number;
  totalCbfAppend: number;
};

interface Props {
  data: Row[];
  tableHeaders: any[];
}

const CBFTable: React.FC<Props> = ({ data, tableHeaders }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <div
        ref={scrollRef}
        className="max-h-[480px] w-full overflow-auto rounded-lg border shadow-sm"
      >
        <table className="w-full min-w-[1100px] border-collapse">
          <thead className="sticky top-0 z-10 bg-white shadow text-[10px] font-bold">
            <tr>
              {tableHeaders.map((col, i) => (
                <th
                  key={i}
                  rowSpan={col.rowSpan}
                  colSpan={col.colSpan}
                  className={`${col.bg}  border p-1 text-center text-white w-[100px]`}
                >
                  {col.title}
                </th>
              ))}
            </tr>
            <tr>
              {tableHeaders
                .filter(h => h.children)
                .flatMap(h =>
                  h.children.map((c: any, i: number) => (
                    <th
                      key={i}
                      colSpan={c.colSpan || 1}
                      rowSpan={c.children ? 1 : 2}
                      className={`
                            ${c.bg}
                            ${(c.title === "Maker 1" || c.title === "Maker 2") ? "p-1" : "p-0"}
                            ${c.colSpan ? "text-white" : ""}
                            border text-cente w-[100px]
                          `}>
                      {c.title}
                    </th>
                  ))
                )}
            </tr>
            <tr>
              {tableHeaders
                .filter(h => h.children)
                .flatMap(h =>
                  h.children.flatMap((c: any) =>
                    c.children
                      ? c.children.map((s: any, i: number) => (
                          <th
                            key={i}
                            className={`${s.bg} border p-1 text-center w-[90px]`}
                          >
                            {s.title}
                          </th>
                        ))
                      : []
                  )
                )}
            </tr>
          </thead>

          <tbody className="text-[10px] ">
            {data.map((row, i) => (
              <tr key={i} className="even:bg-gray-50">
                <td className="border p-2">{row.branchName}</td>
                <td className="border p-2 text-center">{row.branchPendency}</td>
                <td className="border p-2 text-center font-bold">{row.authApproved}</td>
                <td className="border p-2 text-center">{row.authQueryRaised}</td>

                <td className="border p-2 text-center">{row.branchPendency2}</td>
                <td className="border p-2 text-center font-bold">{row.claimApproved}</td>
                <td className="border p-2 text-center">{row.claimQueryRaised}</td>

                <td className="border p-2 text-center">{row.authUnderProcess}</td>
                <td className="border p-2 text-center font-bold">{row.cbfInward}</td>
                <td className="border p-2 text-center">{row.claimUnderProcess}</td>

                <td className="border p-2 text-center font-bold">{row.approved}</td>
                <td className="border p-2 text-center">{row.pendingForAppend}</td>
                <td className="border p-2 text-center font-bold">{row.totalCbfAppend}</td>
                <td className="border p-2 text-center font-bold">{row.approved}</td>
                <td className="border p-2 text-center">{row.pendingForAppend}</td>
                <td className="border p-2 text-center font-bold">{row.totalCbfAppend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExportPopup />
    </>
  );
};

export default CBFTable;
