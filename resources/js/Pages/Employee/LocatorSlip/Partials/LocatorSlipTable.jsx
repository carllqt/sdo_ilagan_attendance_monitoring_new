"use client";

import React, { useState } from "react";
import LocatorSlipPrintDialog from "./LocatorSlipPrintDialog";

const LocatorSlipTable = ({ slips = [] }) => {
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [open, setOpen] = useState(false);

    const handlePreview = (slip) => {
        setSelectedSlip(slip);
        setOpen(true);
    };

    return (
        <>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">
                            Employee
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">
                            Purpose
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">
                            Destination
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">
                            Date / Time
                        </th>
                        <th className="px-6 py-3 text-center font-medium text-gray-700">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                    {slips.length > 0 ? (
                        slips.map((slip) => (
                            <tr
                                key={slip.id}
                                className="transition hover:bg-gray-50"
                            >
                                <td className="px-6 py-3">
                                    {slip.employee_name
                                        ? slip.employee_name
                                        : slip.employee
                                        ? `${slip.employee.first_name ?? ""} ${slip.employee.middle_name ?? ""} ${slip.employee.last_name ?? ""}`
                                              .replace(/\s+/g, " ")
                                              .trim()
                                        : "—"}
                                </td>

                                <td className="px-6 py-3">
                                    {slip.purpose_of_travel || "—"}
                                </td>

                                <td className="px-6 py-3">
                                    {slip.destination || "—"}
                                </td>

                                <td className="px-6 py-3">
                                    {slip.travel_datetime
                                        ? new Date(
                                              slip.travel_datetime,
                                          ).toLocaleString("en-PH", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              second: "2-digit",
                                              hour12: true,
                                          })
                                        : "—"}
                                </td>

                                <td className="px-6 py-3 text-center">
                                    <button
                                        onClick={() => handlePreview(slip)}
                                        className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
                                    >
                                        Preview / PDF
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={5}
                                className="px-6 py-6 text-center text-gray-500"
                            >
                                No locator slips found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <LocatorSlipPrintDialog
                open={open}
                onClose={() => setOpen(false)}
                slip={selectedSlip}
            />
        </>
    );
};

export default LocatorSlipTable;
