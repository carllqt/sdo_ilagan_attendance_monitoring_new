import { buildPaginationItems } from "@/Components/PaginationMain";

export const monthList = [
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

export const allOfficesLabel = "All Offices";
export const wholeYearLabel = "Whole Year";

export const getCurrentYear = () => new Date().getFullYear().toString();

export const isAllOfficeValue = (value) =>
    !value ||
    String(value).toLowerCase() === "all" ||
    value === allOfficesLabel;

export const extractSummaryRows = (summary) =>
    Array.isArray(summary?.data) ? summary.data : [];

export const getPaginationMeta = (pagination) => {
    const currentPage = pagination?.current_page || 1;
    const totalPages = pagination?.last_page || 1;

    return {
        currentPage,
        pageNumbers: buildPaginationItems(currentPage, totalPages),
        paginationFrom: pagination?.from || 0,
        paginationTo: pagination?.to || 0,
        totalPages,
        totalRecords: pagination?.total || 0,
    };
};

export const getVerificationStationName = ({
    stationId,
    stations = [],
}) =>
    stations.find((station) => Number(station.id) === Number(stationId))
        ?.name ||
    stations[0]?.name ||
    "";

export const buildTardinessSummaryQuery = ({
    isSchoolAdmin,
    officeValue,
    pageValue,
    searchValue,
    verificationPageValue,
    verificationStationValue,
    yearValue,
}) => {
    const query = {
        page: pageValue,
        year: yearValue,
    };
    const cleanSearch = String(searchValue || "").trim();

    if (!isSchoolAdmin) {
        query.verification_page = verificationPageValue;
        query.verification_station = verificationStationValue;
    }

    query.office = isAllOfficeValue(officeValue)
        ? allOfficesLabel
        : officeValue;

    if (cleanSearch) {
        query.search = cleanSearch;
    }

    return query;
};

export const getPrintSummaryFilename = ({ selectedMonth, selectedYear }) => {
    const selectedMonthLabel =
        selectedMonth === wholeYearLabel
            ? selectedYear
            : `${selectedMonth}_${selectedYear}`;

    return `Tardiness_Summary_${selectedMonthLabel}.pdf`;
};
