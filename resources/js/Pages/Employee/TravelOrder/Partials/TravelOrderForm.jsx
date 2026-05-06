"use client";

import React from "react";
import { useForm } from "@inertiajs/react";

export default function TravelAuthorityForm({ onClose, employee }) {
    const employeeName = employee?.full_name || employee?.name || "";
    const employeePosition = employee?.position || "";
    const employeeStation =
        employee?.station?.name || employee?.permanent_station || "";

    const { data, setData, post, processing, reset, errors } = useForm({
        employee_name: employeeName,
        position: employeePosition,
        permanent_station: employeeStation,
        purpose_of_travel: "",
        host_of_activity: "",
        inclusive_dates: "",
        destination: "",
        fund_source: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post("/employee/travel-order", {
            onSuccess: () => {
                reset();
                onClose();
            },
            onError: (err) => console.log(err),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="max-h-[90vh] w-[720px] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Travel Authority
                    </h2>
                    <p className="text-sm text-gray-500">
                        Fill out travel details
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Employee Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Name
                            </label>
                            <input
                                className="mt-1 w-full rounded-lg border p-2"
                                value={data.employee_name}
                                onChange={(e) =>
                                    setData("employee_name", e.target.value)
                                }
                            />
                            {errors.employee_name && (
                                <p className="text-sm text-red-500">
                                    {errors.employee_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Position / Designation
                            </label>
                            <input
                                className="mt-1 w-full rounded-lg border p-2"
                                value={data.position}
                                onChange={(e) =>
                                    setData("position", e.target.value)
                                }
                            />
                            {errors.position && (
                                <p className="text-sm text-red-500">
                                    {errors.position}
                                </p>
                            )}
                        </div>

                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-600">
                                Permanent Station
                            </label>
                            <input
                                className="mt-1 w-full rounded-lg border p-2"
                                value={data.permanent_station}
                                onChange={(e) =>
                                    setData("permanent_station", e.target.value)
                                }
                            />
                            {errors.permanent_station && (
                                <p className="text-sm text-red-500">
                                    {errors.permanent_station}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Purpose */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Purpose of Travel
                        </label>
                        <input
                            type="text"
                            className="mt-1 w-full rounded-lg border p-2"
                            value={data.purpose_of_travel}
                            onChange={(e) =>
                                setData("purpose_of_travel", e.target.value)
                            }
                        />
                        {errors.purpose_of_travel && (
                            <p className="text-sm text-red-500">
                                {errors.purpose_of_travel}
                            </p>
                        )}
                    </div>

                    {/* Host */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Host of Activity
                        </label>
                        <input
                            type="text"
                            className="mt-1 w-full rounded-lg border p-2"
                            value={data.host_of_activity}
                            onChange={(e) =>
                                setData("host_of_activity", e.target.value)
                            }
                        />
                    </div>

                    {/* Dates */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Inclusive Dates
                        </label>
                        <input
                            type="date"
                            className="mt-1 w-full rounded-lg border p-2"
                            value={data.inclusive_dates}
                            onChange={(e) =>
                                setData("inclusive_dates", e.target.value)
                            }
                        />
                    </div>

                    {/* Destination + Fund */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Destination
                            </label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded-lg border p-2"
                                value={data.destination}
                                onChange={(e) =>
                                    setData("destination", e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Fund Source
                            </label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded-lg border p-2"
                                value={data.fund_source}
                                onChange={(e) =>
                                    setData("fund_source", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border px-4 py-2"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
                        >
                            {processing ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
