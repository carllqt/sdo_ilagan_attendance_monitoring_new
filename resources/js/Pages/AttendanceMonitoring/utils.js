export const formatTime = (time) => {
    if (!time) return "-";

    const [hours = 0, minutes = 0] = String(time).split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatTimeWithSeconds = (time) => {
    if (!time) return "-";

    const [hours = 0, minutes = 0, seconds = 0] = String(time)
        .split(":")
        .map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

export const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const formatTravelDate = (item = {}) => {
    const startDate = formatDate(item.start_date);
    const endDate = formatDate(item.end_date);

    if (!startDate && !endDate) return "Today";
    if (startDate === endDate || !endDate) return startDate;

    return `${startDate} - ${endDate}`;
};

export const personName = (item = {}) =>
    item.full_name ||
    [item.first_name, item.middle_name, item.last_name]
        .filter(Boolean)
        .join(" ");
