import { FileText, Plane } from "lucide-react";

export const defaultDocumentRequestData = {
    request_type: "locator_slip",
    employee_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    extension_name: "",
    position: "",
    station_id: "",
    purpose_of_travel: "",
    destination: "",
    travel_datetime: "",
    travel_type: "",
    host_of_activity: "",
    inclusive_dates: "",
    fund_source: "",
};

export const requestLabels = {
    locator_slip: {
        title: "Locator Slip",
        description: "Fill out the details for your locator slip request.",
    },
    travel_order: {
        title: "Travel Order",
        description: "Fill out the details for your travel order request.",
    },
};

export const requestIcons = {
    locator_slip: FileText,
    travel_order: Plane,
};

export const getStationItems = (stations = []) =>
    stations.map((station) => ({
        ...station,
        division: station.code ? { name: station.code } : null,
    }));

export const getSelectedStation = (stationItems = [], stationId) =>
    stationItems.find((station) => Number(station.id) === Number(stationId));

export const validateDocumentRequestData = (data) => {
    const errors = {};
    const required = (field, label) => {
        if (!String(data[field] || "").trim()) {
            errors[field] = `The ${label} field is required.`;
        }
    };

    required("employee_id", "employee id");
    required("first_name", "first name");
    required("last_name", "last name");
    required("position", "position / designation");
    required("station_id", "permanent station");
    required("purpose_of_travel", "purpose of travel");
    required("destination", "destination");

    if (data.employee_id && !/^\d+$/.test(String(data.employee_id))) {
        errors.employee_id = "The employee id must be a valid number.";
    }

    if (data.request_type === "locator_slip") {
        required("travel_datetime", "date and time");
        required("travel_type", "travel type");
    } else {
        required("host_of_activity", "host of activity");
        required("inclusive_dates", "inclusive dates");
        required("fund_source", "fund source");
    }

    return errors;
};
