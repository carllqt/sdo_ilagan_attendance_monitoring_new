import React, { useState, useMemo, useRef } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import html2pdf from "html2pdf.js";

import TardyFilters from "./Partials/TardyFilters";
import TardyTable from "./Partials/TardyTable";
import SummaryofTardinessReport from "../../DocumentsFormats/AdminSummaryofTardinessReport";

const TardySummary = ({ summary }) => {
    const pdfRef = useRef();
    const monthList = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const currentYear = new Date().getFullYear().toString();
    const [selectedDepartment, setSelectedDepartment] =
        useState("All Departments");
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const departments = [
        "All Departments",
        ...new Set(summary.map((e) => e.employee.department)),
    ];

    const years = useMemo(() => {
        const allYears = new Set();
        summary.forEach((data) => {
            Object.keys(data.tardyPerMonths).forEach((year) =>
                allYears.add(year)
            );
        });
        return Array.from(allYears).sort((a, b) => Number(b) - Number(a));
    }, [summary]);

    const filteredSummary = summary.filter(
        (data) =>
            selectedDepartment === "All Departments" ||
            data.employee.department === selectedDepartment
    );

    const handleDownloadPDF = () => {
        const element = pdfRef.current;
        html2pdf()
            .set({
                margin: 0.5,
                filename: `Tardiness_Summary_${selectedYear}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: {
                    unit: "in",
                    format: "letter",
                    orientation: "portrait",
                },
            })
            .from(element)
            .save();
    };

    return (
        <AuthenticatedLayout header="Summary of Tardiness">
            <Head title="Summary of Tardiness" />
            <main className="flex-1 p-3">
                <div className="flex items-center justify-between mb-4 gap-2">
                    <h3 className="text-lg font-semibold mb-4">
                        Tardiness Summary
                    </h3>
                    <TardyFilters
                        years={years}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        departments={departments}
                        selectedDepartment={selectedDepartment}
                        setSelectedDepartment={setSelectedDepartment}
                        onDownloadPDF={handleDownloadPDF}
                    />
                </div>

                <div>
                    <TardyTable
                        filteredSummary={filteredSummary}
                        monthList={monthList}
                        selectedYear={selectedYear}
                    />

                    <div style={{ display: "none" }}>
                        <SummaryofTardinessReport
                            ref={pdfRef}
                            summary={filteredSummary}
                            selectedYear={selectedYear}
                        />
                    </div>
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default TardySummary;
