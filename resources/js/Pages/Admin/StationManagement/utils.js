import { buildPaginationItems } from "@/Components/PaginationMain";

export const getStationHighlightKey = (station) => {
    if (!station) return null;

    return `${station.source || "station"}:${
        station.source === "sdo" ? station.record_id || station.id : station.id
    }`;
};

export const getStationPagination = (activePage, totalPages, maxPages = 4) => {
    const pages = [];

    if (totalPages <= maxPages) {
        for (let i = 1; i <= totalPages; i += 1) {
            pages.push(i);
        }

        return pages;
    }

    pages.push(1);

    if (activePage > 2) {
        pages.push("...");
    }

    const start = Math.max(2, activePage - 1);
    const end = Math.min(totalPages - 1, activePage + 1);

    for (let i = start; i <= end; i += 1) {
        pages.push(i);
    }

    if (activePage < totalPages - 1) {
        pages.push("...");
    }

    pages.push(totalPages);

    return pages;
};

export const getWidePagination = (activePage, totalPages) => {
    return buildPaginationItems(activePage, totalPages);
};

