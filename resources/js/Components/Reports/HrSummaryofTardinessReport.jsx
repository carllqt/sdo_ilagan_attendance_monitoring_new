import React from "react";

const HrSummaryofTardinessReport = React.forwardRef(
    ({ groupedByEmployee, monthRangeLabel }, ref) => {
        // Group records by office
        const offices = Array.from(
            new Set(
                groupedByEmployee.map(
                    (record) => record.office || record.dept
                )
            )
        );

        return (
            <section
                ref={ref}
                className="document-template-page text-[10px] font-sans leading-tight"
            >
                <img
                    src="/images/document-template/sdo-header.png"
                    alt="Schools Division of the City of Ilagan document header"
                    className="document-template-header"
                />
                <img
                    src="/images/document-template/sdo-footer.png"
                    alt="Schools Division of the City of Ilagan document footer"
                    className="document-template-footer"
                />

                <div className="mb-3 text-center">
                    <h1 className="text-[14px] font-bold uppercase tracking-wide">
                        Tardiness Summary Report
                    </h1>
                    <h2 className="text-[10px] font-semibold tracking-wider">
                        {monthRangeLabel}
                    </h2>
                </div>

                <div>
                    <table className="tardiness-summary-table w-full table-fixed border border-black border-collapse text-center">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border border-black px-2 py-2 w-[30px]">
                                    No.
                                </th>
                                <th className="border border-black px-2 py-2 w-[150px]">
                                    Name
                                </th>
                                <th className="border border-black px-2 py-2 w-[80px]">
                                    Month
                                </th>
                                <th className="border border-black px-2 py-2 w-[70px]">
                                    Total Tardy
                                </th>
                                <th className="border border-black px-2 py-2 w-[100px]">
                                    Equiv Day in Hours
                                </th>
                                <th className="border border-black px-2 py-2 w-[100px]">
                                    Equiv Day in Minutes
                                </th>
                                <th className="border border-black px-2 py-2 w-[80px]">
                                    Total Equivalent
                                </th>
                            </tr>
                        </thead>

                        {offices.map((office, officeIndex) => {
                            const officeEmployees = groupedByEmployee.filter(
                                (record) =>
                                    (record.office || record.dept) === office
                            );
                            return (
                                <tbody key={officeIndex} className="office">
                                    {/* Office row */}
                                    <tr className="bg-gray-100 font-bold">
                                        <td
                                            colSpan={7}
                                            className="border border-black text-center py-3"
                                        >
                                            {office}
                                        </td>
                                    </tr>

                                    {/* Employee rows */}
                                    {officeEmployees.map((emp, index) => (
                                        <tr key={index}>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {index + 1}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {emp.name}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {emp.month_label ||
                                                    monthRangeLabel}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {emp.total_tardy.toFixed(2)}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {emp.equi_hours.toFixed(3)}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {emp.equi_mins.toFixed(3)}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {emp.total_equi.toFixed(3)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            );
                        })}
                    </table>
                </div>
            </section>
        );
    }
);

export default HrSummaryofTardinessReport;

