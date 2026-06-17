import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { sortAlphabetically } from "@/lib/utils";

dayjs.extend(isSameOrAfter);

export const VISIBLE_CONVERSION_ROWS = 5;
export const CONVERSION_SLIDE_INTERVAL_MS = 5000;

export const getCurrentMonthLabel = () => dayjs().format("MMMM YYYY");

export const getDefaultFirstMonth = (monthList = [], currentMonth) =>
    monthList[0] || currentMonth;

export const getDefaultSecondMonth = (monthList = [], currentMonth) =>
    monthList[monthList.length - 1] || currentMonth;

export const getMonthRangeLabel = (startMonth, endMonth) => {
    const start = dayjs(startMonth, "MMMM YYYY");
    const end = dayjs(endMonth, "MMMM YYYY");

    if (start.isSame(end, "month") && start.isSame(end, "year")) {
        return start.format("MMMM YYYY");
    }

    if (start.isSame(end, "year")) {
        return `${start.format("MMM")} - ${end.format("MMM YYYY")}`;
    }

    return `${start.format("MMM YYYY")} - ${end.format("MMM YYYY")}`;
};

export const getSecondMonthList = (monthList = [], selectedFirstMonth) =>
    monthList.filter((month) =>
        dayjs(month, "MMMM YYYY").isSameOrAfter(
            dayjs(selectedFirstMonth, "MMMM YYYY"),
        ),
    );

export const getNextEndMonth = (currentEndMonth, nextStartMonth) =>
    dayjs(currentEndMonth, "MMMM YYYY").isSameOrAfter(
        dayjs(nextStartMonth, "MMMM YYYY"),
    )
        ? currentEndMonth
        : nextStartMonth;

export const buildTardinessConversionQuery = ({
    endMonthValue,
    limitValue,
    officeValue,
    pageValue,
    searchValue,
    startMonthValue,
}) => {
    const query = {
        office: officeValue,
        limit: limitValue,
    };
    const cleanSearch = String(searchValue || "").trim();

    if (startMonthValue) {
        query.start_month = startMonthValue;
    }

    if (endMonthValue) {
        query.end_month = endMonthValue;
    }

    if (cleanSearch) {
        query.search = cleanSearch;
    }

    if (pageValue > 1) {
        query.page = pageValue;
    }

    return query;
};

export const getSortedOffices = (officeOptions = []) => {
    const allOffices = officeOptions.find(
        (officeOption) => String(officeOption.id) === "all",
    );
    const sortedOffices = sortAlphabetically(
        officeOptions.filter(
            (officeOption) => String(officeOption.id) !== "all",
        ),
        "name",
    );

    return allOffices ? [allOffices, ...sortedOffices] : sortedOffices;
};

export const buildSummaryPayload = (records = []) =>
    records.map((record) => ({
        employee_id: record.employee_id,
        start_month: record.start_month,
        end_month: record.end_month,
        total_tardy: Number(record.total_tardy.toFixed(2)),
        total_hours: Number(record.equi_hours.toFixed(3)),
        total_minutes: Number(record.equi_mins.toFixed(3)),
        total_equivalent: Number(record.total_equi.toFixed(3)),
    }));

export const getTardinessConversionFilename = (monthRangeLabel) =>
    `HR_Tardiness_Summary_${monthRangeLabel}.pdf`;

export const sortByNumber = (items = [], key) =>
    [...items].sort(
        (first, second) => Number(first[key]) - Number(second[key]),
    );

export const getConversionPageCount = (items = []) =>
    Math.ceil(items.length / VISIBLE_CONVERSION_ROWS);

export const getVisibleConversionRows = (items = [], pageIndex = 0) => {
    const startRow = pageIndex * VISIBLE_CONVERSION_ROWS;
    return items.slice(startRow, startRow + VISIBLE_CONVERSION_ROWS);
};

export const hasHiddenConversionRows = (items = []) =>
    items.length > VISIBLE_CONVERSION_ROWS;

export const clearEditConversionModalParams = (query) => {
    query.delete("modal");
    query.delete("conversion_type");
    query.delete("conversion_id");

    return query;
};
