"use client";

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { motion } from "framer-motion";
import ApplicationLeavePrintDialog from "./ApplicationLeavePrintDialog";

const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: "easeOut" },
    },
};

const ApplicationLeaveTable = ({
    applications = [],
    filters = {},
    leaveApplications = {},
    filterRoute = "application-leave",
    filterParams = {},
}) => {
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [open, setOpen] = useState(false);

    const handlePreview = (application) => {
        setSelectedApplication(application);
        setOpen(true);
    };

    return (
        <>
            <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mt-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Filter by Filing Date
                        </label>

                        <input
                            type="date"
                            value={filters.date || ""}
                            onChange={(e) => {
                                router.get(
                                    route(filterRoute),
                                    {
                                        ...filterParams,
                                        date: e.target.value,
                                    },
                                    {
                                        preserveState: true,
                                        replace: true,
                                    },
                                );
                            }}
                            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <button
                        onClick={() =>
                            router.get(route(filterRoute), filterParams)
                        }
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Reset Filter
                    </button>
                </div>
            </motion.div>

            <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Leave Type
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Working Days
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Inclusive Dates
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Filing Date
                            </th>
                            <th className="px-6 py-3 text-center font-medium text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {applications.length > 0 ? (
                            applications.map((application) => (
                                <tr
                                    key={application.id}
                                    className="transition hover:bg-gray-50"
                                >
                                    <td className="px-6 py-3">
                                        {application.employee_name ||
                                            application.employee?.full_name ||
                                            application.employee?.name ||
                                            "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {application.type_of_leave || "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {application.working_days || "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {application.inclusive_dates || "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {application.date_of_filing
                                            ? new Date(
                                                  application.date_of_filing,
                                              ).toLocaleDateString("en-PH", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                              })
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                handlePreview(application)
                                            }
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
                                    colSpan={6}
                                    className="px-6 py-6 text-center text-gray-500"
                                >
                                    No leave applications found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {leaveApplications.links && (
                    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 p-4">
                        {leaveApplications.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => {
                                    if (link.url) {
                                        router.visit(link.url, {
                                            preserveState: true,
                                        });
                                    }
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                    link.active
                                        ? "bg-blue-700 text-white"
                                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                } ${
                                    !link.url
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ApplicationLeavePrintDialog
                open={open}
                onClose={() => setOpen(false)}
                application={selectedApplication}
            />
        </>
    );
};

export default ApplicationLeaveTable;
