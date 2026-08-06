export const defaultFingerprintServiceUrl = `http://${window.location.hostname}:5000`;

export const fingerprintMessages = {
    cancelled: "Scan cancelled",
    placeFinger: "Place your fingerprint",
    registrationStarting: "Starting fingerprint registration...",
    serviceUnavailable: "Could not reach fingerprint service.",
    testError: "Test error.",
    testPlaceFinger: "Place your finger on the scanner...",
    testWaiting: "Waiting for scan...",
    testDisconnected: "Lost connection to fingerprint service. Reconnecting...",
    unexpectedError: "Unexpected error occurred.",
};

export const statusOptions = ["Active", "Inactive"];
export const extensionNameOptions = [
    "None",
    "Jr.",
    "Sr.",
    "II",
    "III",
    "IV",
    "V",
];

export const formatSearchDisplay = (value) =>
    String(value || "")
        .replace(/^\d+\s+/, "")
        .trim();

export const formatFingerprintRegistrationParam = (employee) =>
    [employee?.id, employee?.full_name || employee?.label]
        .filter(Boolean)
        .join(" ")
        .trim();

export const findOfficeByName = (offices, value) =>
    offices.find((office) => office.name === value);

export const extractEmployeeRows = (employeesList) =>
    Array.isArray(employeesList?.data)
        ? employeesList.data
        : Array.isArray(employeesList)
          ? employeesList
          : [];

export const clampAvailableFingers = (value) => {
    const available = Number(value ?? 3);

    if (Number.isNaN(available)) {
        return 3;
    }

    return Math.min(Math.max(available, 0), 3);
};

