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
