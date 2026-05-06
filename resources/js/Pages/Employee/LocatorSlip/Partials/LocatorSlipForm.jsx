"use client";

import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";

export default function LocatorSlipForm({ onClose, employee }) {
    const employeeName = employee?.full_name || employee?.name || "";
    const employeePosition = employee?.position || "";
    const employeeStation =
        employee?.station?.name || employee?.permanent_station || "";

    const { data, setData, post, processing, reset, errors } = useForm({
        employee_id: "",
        employee_name: employeeName,
        position: employeePosition,
        permanent_station: employeeStation,
        purpose_of_travel: "",
        destination: "",
        travel_datetime: "",
        travel_type: "",
    });

    useEffect(() => {
        if (employee?.id) {
            setData({
                ...data,
                employee_id: employee.id,
                employee_name: employeeName,
                position: employeePosition,
                permanent_station: employeeStation,
            });
        }
    }, [employee]);

    const submit = (e) => {
        e.preventDefault();

        post("/employee/locator-slip", {
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
                        Locator Slip
                    </h2>
                    <p className="text-sm text-gray-500">
                        Fill out the details below
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
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
                                <p className="mt-1 text-sm text-red-500">
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
                                <p className="mt-1 text-sm text-red-500">
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
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.permanent_station}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Purpose of Travel
                        </label>
                        <input
                            type="text"
                            className="mt-1 w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={data.purpose_of_travel}
                            onChange={(e) =>
                                setData("purpose_of_travel", e.target.value)
                            }
                        />
                        {errors.purpose_of_travel && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.purpose_of_travel}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Travel Type
                        </label>
                        <div className="mt-2 flex gap-6">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="radio"
                                    name="travel_type"
                                    value="official_business"
                                    checked={
                                        data.travel_type === "official_business"
                                    }
                                    onChange={(e) =>
                                        setData("travel_type", e.target.value)
                                    }
                                />
                                Official Business
                            </label>

                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="radio"
                                    name="travel_type"
                                    value="official_time"
                                    checked={
                                        data.travel_type === "official_time"
                                    }
                                    onChange={(e) =>
                                        setData("travel_type", e.target.value)
                                    }
                                />
                                Official Time
                            </label>
                        </div>

                        {errors.travel_type && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.travel_type}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Date and Time
                            </label>
                            <input
                                type="datetime-local"
                                className="mt-1 w-full rounded-lg border p-2"
                                value={data.travel_datetime}
                                onChange={(e) =>
                                    setData("travel_datetime", e.target.value)
                                }
                            />
                            {errors.travel_datetime && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.travel_datetime}
                                </p>
                            )}
                        </div>

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
                            {errors.destination && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.destination}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between gap-3 border-t pt-4">
                        <div className="flex gap-2">
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
                                className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
                            >
                                {processing ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
