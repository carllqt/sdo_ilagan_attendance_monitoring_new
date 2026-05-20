"use client";

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import TravelOrderPrintDialog from "./TravelOrderPrintDialog";

const TravelOrderTable = ({ travelOrders = [], pagination = null }) => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [open, setOpen] = useState(false);

    const handlePreview = (order) => {
        setSelectedOrder(order);
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
                            Host
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">
                            Destination
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">
                            Date
                        </th>
                        <th className="px-6 py-3 text-center font-medium text-gray-700">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                    {travelOrders.length > 0 ? (
                        travelOrders.map((order) => (
                            <tr
                                key={order.id}
                                className="transition hover:bg-gray-50"
                            >
                                <td className="px-6 py-3">
                                    {order.employee_name ||
                                        order.employee?.full_name ||
                                        order.employee?.name ||
                                        "—"}
                                </td>

                                <td className="px-6 py-3">
                                    {order.purpose_of_travel || "—"}
                                </td>

                                <td className="px-6 py-3">
                                    {order.host_of_activity || "—"}
                                </td>

                                <td className="px-6 py-3">
                                    {order.destination || "—"}
                                </td>

                                <td className="px-6 py-3">
                                    {order.inclusive_dates
                                        ? new Date(
                                              order.inclusive_dates,
                                          ).toLocaleDateString("en-PH", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                          })
                                        : "—"}
                                </td>

                                <td className="px-6 py-3 text-center">
                                    <button
                                        onClick={() => handlePreview(order)}
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
                                No travel orders found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {pagination?.links && (
                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 p-4">
                    {pagination.links.map((link, index) => (
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

            <TravelOrderPrintDialog
                open={open}
                onClose={() => setOpen(false)}
                order={selectedOrder}
            />
        </>
    );
};

export default TravelOrderTable;
