import React from "react";

import TravelOrderReport from "@/Components/Reports/TravelOrderReport";
import DocumentSamplePage from "./Partials/DocumentSamplePage";

const initialSample = {
    employee_name: "JUAN DELA CRUZ",
    position: "Administrative Assistant II",
    permanent_station: "Schools Division Office - City of Ilagan",
    purpose_of_travel: "Attend an official regional coordination meeting.",
    host_of_activity: "Department of Education Regional Office II",
    inclusive_dates: "2026-08-25",
    destination: "Tuguegarao City, Cagayan",
    fund_source: "Local Funds",
};

const TravelOrderSample = () => (
    <DocumentSamplePage
        documentTitle="Travel_Order_Sample"
        initialSample={initialSample}
        pageTitle="Travel Order"
        ReportComponent={TravelOrderReport}
        renderFields={({ fieldClassName, sample, updateField }) => (
            <>
                <label className="block text-sm font-medium text-slate-700">
                    Employee Name
                    <input
                        className={fieldClassName}
                        value={sample.employee_name}
                        onChange={(event) =>
                            updateField("employee_name", event.target.value)
                        }
                    />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Position / Designation
                    <input
                        className={fieldClassName}
                        value={sample.position}
                        onChange={(event) =>
                            updateField("position", event.target.value)
                        }
                    />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Permanent Station
                    <input
                        className={fieldClassName}
                        value={sample.permanent_station}
                        onChange={(event) =>
                            updateField("permanent_station", event.target.value)
                        }
                    />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Purpose of Travel
                    <textarea
                        className={`${fieldClassName} h-24 py-2`}
                        value={sample.purpose_of_travel}
                        onChange={(event) =>
                            updateField("purpose_of_travel", event.target.value)
                        }
                    />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Host of Activity
                    <input
                        className={fieldClassName}
                        value={sample.host_of_activity}
                        onChange={(event) =>
                            updateField("host_of_activity", event.target.value)
                        }
                    />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Inclusive Date
                    <input
                        type="date"
                        className={fieldClassName}
                        value={sample.inclusive_dates}
                        onChange={(event) =>
                            updateField("inclusive_dates", event.target.value)
                        }
                    />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Destination
                    <input
                        className={fieldClassName}
                        value={sample.destination}
                        onChange={(event) =>
                            updateField("destination", event.target.value)
                        }
                    />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Fund Source
                    <input
                        className={fieldClassName}
                        value={sample.fund_source}
                        onChange={(event) =>
                            updateField("fund_source", event.target.value)
                        }
                    />
                </label>
            </>
        )}
    />
);

export default TravelOrderSample;
