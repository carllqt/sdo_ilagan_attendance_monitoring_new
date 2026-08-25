import React from "react";
import { Head } from "@inertiajs/react";
import dayjs from "dayjs";
import DTRReport from "@/Components/Reports/DtrReport";
import { generateLogs } from "./Partials/DepartmentPrint/utils";

const DtrPrintPreview = ({ employee, time_record, signatory, month, year }) => {
    const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);

    return (
        <>
            <Head title={`DTR Print Preview - ${employee.full_name}`} />
            <main className="min-h-screen bg-slate-200 p-6 print:bg-white print:p-0">
                <div className="mx-auto mb-4 max-w-[8.5in] text-center text-sm text-slate-600 print:hidden">
                    Print-layout preview only. Refresh this page after changing the DTR design.
                </div>
                <section className="mx-auto box-border w-[8.5in] bg-white p-[0.5in] shadow-xl print:shadow-none">
                    <DTRReport
                        name={employee.full_name}
                        dateRange={{
                            start: start.startOf("month").format("YYYY-MM-DD"),
                            end: start.endOf("month").format("YYYY-MM-DD"),
                        }}
                        logs={generateLogs(time_record, month, year)}
                        signatory={signatory}
                        workSchedule={employee.work_schedule}
                    />
                </section>
            </main>
        </>
    );
};

export default DtrPrintPreview;
