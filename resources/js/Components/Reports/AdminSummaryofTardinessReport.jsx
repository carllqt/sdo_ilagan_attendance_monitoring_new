import React from "react";

const AdminSummaryofTardinessReport = React.forwardRef(
    ({ summary, selectedMonth = "Whole Year", selectedYear }, ref) => {
        const monthList = [
            { full: "January", short: "Jan", number: 1 },
            { full: "February", short: "Feb", number: 2 },
            { full: "March", short: "Mar", number: 3 },
            { full: "April", short: "Apr", number: 4 },
            { full: "May", short: "May", number: 5 },
            { full: "June", short: "June", number: 6 },
            { full: "July", short: "July", number: 7 },
            { full: "August", short: "Aug", number: 8 },
            { full: "September", short: "Sept", number: 9 },
            { full: "October", short: "Oct", number: 10 },
            { full: "November", short: "Nov", number: 11 },
            { full: "December", short: "Dec", number: 12 },
        ];
        const selectedMonths =
            selectedMonth === "Whole Year"
                ? monthList
                : monthList.filter((month) => month.full === selectedMonth);

        // Get unique departments
        const departments = Array.from(
            new Set(summary.map((e) => e.employee.department))
        );

        return (
            <div
                ref={ref}
                className="px-4 py-2 text-[10px] font-sans leading-tight"
            >
                <div className="relative flex items-center mb-3 justify-between">
                    {/* Left Logo */}
                    <div>
                        <img
                            src="/sdo-pic.jpg"
                            alt="Left Logo"
                            className="w-16 h-16 object-contain"
                        />
                    </div>

                    {/* Center Title */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                        <h1 className="text-[12px] font-bold uppercase tracking-wide">
                            SUMMARY OF TARDINESS
                        </h1>
                        <h2 className="text-[10px] font-semibold tracking-wider">
                            {selectedMonth === "Whole Year"
                                ? selectedYear
                                : `${selectedMonth} ${selectedYear}`}
                        </h2>
                    </div>

                    {/* Right Logo */}
                    <div>
                        <img
                            src="/logo-copy.png"
                            alt="Right Logo"
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                </div>

                <table className="w-full table-fixed border border-black border-collapse text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th
                                rowSpan={2}
                                className="border border-black px-2 py-2 w-[30px]"
                            >
                                No.
                            </th>
                            <th
                                rowSpan={2}
                                className="border border-black px-2 py-2 w-[150px]"
                            >
                                Name
                            </th>
                            <th
                                colSpan={selectedMonths.length}
                                className="border border-black px-2 py-2 text-[9px]"
                            >
                                Number of hours
                            </th>
                            <th
                                rowSpan={2}
                                className="border border-black px-2 py-2 w-[50px]"
                            >
                                Total
                            </th>
                        </tr>
                        <tr>
                            {selectedMonths.map((month) => (
                                <th
                                    key={month.number}
                                    className="border border-black px-2 py-2 text-[9px]"
                                >
                                    {month.short}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {departments.map((dept, deptIndex) => {
                        const deptEmployees = summary.filter(
                            (e) => e.employee.department === dept
                        );
                        if (!deptEmployees.length) return null;

                        return (
                            <tbody key={deptIndex} className="department">
                                {/* Department row */}
                                <tr style={{ pageBreakInside: "avoid" }}>
                                    <td
                                        colSpan={selectedMonths.length + 3}
                                        className="border border-black font-bold text-center bg-gray-100 py-3"
                                    >
                                        {dept}
                                    </td>
                                </tr>

                                {/* Employee rows */}
                                {deptEmployees.map((emp, index) => (
                                    <tr
                                        key={index}
                                        style={{ pageBreakInside: "avoid" }}
                                    >
                                        <td className="border border-black px-2 py-2 text-center">
                                            {index + 1}
                                        </td>
                                        <td className="border border-black px-2 py-2 text-center">
                                            {emp.employee.full_name}
                                        </td>
                                        {selectedMonths.map((month) => (
                                            <td
                                                key={month.number}
                                                className="border border-black px-2 py-2 text-center"
                                            >
                                                {emp.tardyPerMonths[
                                                    selectedYear
                                                ]?.[month.number]?.toFixed(
                                                    2
                                                ) || "0.00"}
                                            </td>
                                        ))}
                                        <td className="border border-black px-2 py-2 text-center">
                                            {selectedMonths
                                                .reduce(
                                                    (total, month) =>
                                                        total +
                                                        Number(
                                                            emp.tardyPerMonths[
                                                                selectedYear
                                                            ]?.[month.number] ||
                                                                0
                                                        ),
                                                    0
                                                )
                                                .toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        );
                    })}
                </table>
            </div>
        );
    }
);

export default AdminSummaryofTardinessReport;

