import React from "react";
import dayjs from "dayjs";
import DTRReport from "@/Components/Reports/DtrReport";
import { generateLogs } from "./utils";

const HiddenDtrReports = ({
    employeeData,
    printContainerRef,
    printEmployees,
    selectedEmployeeSignatory,
    selectedMonth,
    selectedYear,
}) => (
    <div
        ref={printContainerRef}
        id="dtr-print-content"
        className="absolute left-[-9999px] top-0"
    >
        {printEmployees.map((employee) => {
            const data = employeeData[employee.id];
            if (!data) return null;

            return (
                <div key={employee.id} style={{ breakAfter: "page" }}>
                    <DTRReport
                    name={employee.full_name}
                    dateRange={{
                        start: dayjs(
                            `${selectedYear}-${String(selectedMonth).padStart(
                                2,
                                "0",
                            )}-01`,
                        )
                            .startOf("month")
                            .format("YYYY-MM-DD"),
                        end: dayjs(
                            `${selectedYear}-${String(selectedMonth).padStart(
                                2,
                                "0",
                            )}-01`,
                        )
                            .endOf("month")
                            .format("YYYY-MM-DD"),
                    }}
                    logs={generateLogs(
                        data.time_record,
                        selectedMonth,
                        selectedYear,
                    )}
                    monthlyTotals={data.monthly_totals}
                    workSchedule={employee.work_schedule}
                        signatory={selectedEmployeeSignatory(employee)}
                    />
                </div>
            );
        })}
    </div>
);

export default HiddenDtrReports;
