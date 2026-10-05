type Metric = {
    pol: string;
    ip: string;
};

type ICData = {
    NIC: Metric;
    NIA: Metric;
    OIC: Metric;
    UIIC: Metric;
    total: Metric;
};

interface DataItem extends ICData {
    process: string;
}
import { FC } from "react";

const icKeys: (keyof ICData)[] = ["NIC", "NIA", "OIC", "UIIC", "total"];
const SummaryTable: FC<{ data: DataItem[] }> = ({ data }) => {
    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-xs">

                {/* 🔷 Header Row 1 */}
                <thead>
                    <tr className="bg-slate-800 text-white font-medium">
                        <th className="border border-slate-300 px-2 py-1 text-left w-[200px]">
                            IC Name
                        </th>

                        {icKeys.map((key) => (
                            <th
                                key={key}
                                colSpan={2}
                                className="border border-slate-300 px-2 py-1 text-center font-bold"
                            >
                                {key}
                            </th>
                        ))}
                    </tr>

                {/* 🔷 Header Row 2 */}
                <tr className="bg-slate-100 text-slate-800 font-semibold">
                    <th className="border border-slate-300 px-2 py-1 text-left">
                        Process
                    </th>

                    {icKeys.map((key) => (
                        <>
                            <th
                                key={`${key}-pol`}
                                className="border border-slate-300 px-2 py-1 text-center text-[11px]"
                            >
                                # of Pol
                            </th>
                            <th
                                key={`${key}-ip`}
                                className="border border-slate-300 px-2 py-1 text-center text-[11px]"
                            >
                                # of IP’s
                            </th>
                        </>
                    ))}
                </tr>
            </thead>

            {/* 🔷 Body */}
            <tbody>
                {data.map((row:any, idx) => {
                    const isTotal = row.process.toLowerCase() === "total";

                    return (
                        <tr
                            key={idx}
                            className={`text-center ${isTotal ? "bg-blue-50/80 font-bold text-blue-900" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                                } hover:bg-slate-100/70 transition-colors`}
                        >
                            <td className="border border-slate-200 px-2 py-1 text-left font-medium">
                                {row.process}
                            </td>

                            {icKeys?.map((key: any) => {
                                const value = row[key] as any;
                                return (
                                    <>
                                        <td className="border border-slate-200 px-2 py-1">
                                            {value?.pol}
                                        </td>
                                        <td className="border border-slate-200 px-2 py-1">
                                            {value?.ip}
                                        </td>
                                    </>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);
};

export default SummaryTable;