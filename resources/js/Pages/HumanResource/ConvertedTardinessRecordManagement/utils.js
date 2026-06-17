export const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export const formatDateTime = (value) => {
    if (!value) {
        return "-";
    }

    return new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
};

export const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    const numberValue = Number(value);

    return Number.isNaN(numberValue) ? value : numberValue.toFixed(2);
};

export const formatTardiness = (value) => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    const numberValue = Number(value);

    return Number.isNaN(numberValue) ? value : numberValue.toFixed(2);
};

export const batchLabel = (batch = {}) => String(batch.batch_id || "");

export const getBatchPdfFilename = (batchId) =>
    `HR_Tardiness_Summary_Batch_${batchId || ""}.pdf`;

export const toBatchReportRecords = (batch, getEmployeeName) =>
    (batch?.employees || []).map((record) => {
        const employee = record.employee || {};

        return {
            name: getEmployeeName(employee) || "-",
            office: employee.office?.name || "-",
            month_label: batch?.month_range || "-",
            total_tardy: Number(record.total_tardy || 0),
            equi_hours: Number(record.total_hours || 0),
            equi_mins: Number(record.total_minutes || 0),
            total_equi: Number(record.total_equivalent || 0),
        };
    });

export const normalizedMonthRange = (record) => {
    const start = Number(record.start_month) || 1;
    const end = Number(record.end_month) || start;

    return {
        start: Math.min(Math.max(start, 1), 12),
        end: Math.min(Math.max(end, start), 12),
    };
};

export const buildConvertedTardinessQuery = (updates = {}) => {
    const query = new URLSearchParams(window.location.search);

    Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            query.delete(key);
            return;
        }

        query.set(key, value);
    });

    return Object.fromEntries(query);
};
