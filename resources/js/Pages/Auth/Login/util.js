import { FileText, Plane } from "lucide-react";

export const defaultDocumentRequestData = {
    request_type: "locator_slip",
    employee_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    extension_name: "",
    email: "",
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
