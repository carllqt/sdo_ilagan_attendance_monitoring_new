import dayjs from "dayjs";

export const emptyPagination = { data: [] };

export const formatDate = (value) =>
    value ? dayjs(value).format("MMM D, YYYY") : "-";

export const formatDateTime = (value) =>
    value ? dayjs(value).format("MMM D, YYYY h:mm A") : "-";

export const humanize = (value) =>
    String(value || "-")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

export const statusClassName = (status) => {
    if (status === "approved") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "rejected") {
        return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
};
