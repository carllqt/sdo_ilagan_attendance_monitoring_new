import { useState } from "react";
import { usePage } from "@inertiajs/react";

import useTardinessSummaryFilters from "./useTardinessSummaryFilters";
import useTardinessSummaryPageData from "./useTardinessSummaryPageData";
import useTardinessSummaryPdfExport from "./useTardinessSummaryPdfExport";
import useTardinessSummarySuggestions from "./useTardinessSummarySuggestions";
import { wholeYearLabel } from "../utils";

const useTardinessSummaryManagement = ({
    office,
    officeOptions,
    search,
    stationVerification,
    summary,
    verificationStationId,
    verificationStations,
    year,
    yearOptions,
}) => {
    const [selectedMonth, setSelectedMonth] = useState(wholeYearLabel);
    const authUser = usePage().props.auth?.user;
    const isSchoolAdmin = (authUser?.roles || []).includes("school_admin");

    const pageData = useTardinessSummaryPageData({
        officeOptions,
        stationVerification,
        summary,
        verificationStationId,
        verificationStations,
        yearOptions,
    });

    const filters = useTardinessSummaryFilters({
        currentPage: pageData.summaryPagination.currentPage,
        currentYear: pageData.currentYear,
        isSchoolAdmin,
        office,
        offices: pageData.offices,
        resolveVerificationStationName: pageData.resolveVerificationStationName,
        search,
        verificationCurrentPage: pageData.verificationPagination.currentPage,
        year,
    });

    const suggestions = useTardinessSummarySuggestions({
        offices: pageData.offices,
        searchInput: filters.searchInput,
        selectedOffice: filters.selectedOffice,
        selectedYear: filters.selectedYear,
    });

    const { downloadPDF, pdfRef } = useTardinessSummaryPdfExport();

    const downloadAfterPrintSummaryRender = () => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                downloadPDF({
                    selectedMonth,
                    selectedYear: filters.selectedYear,
                });
            });
        });
    };

    const handleSummaryPageChange = (page) => {
        if (filters.summaryLoading) return;
        if (page < 1 || page > pageData.summaryPagination.totalPages) return;

        filters.applyFilters({ pageValue: page, includePrint: false });
    };

    const handleVerificationPageChange = (page) => {
        if (filters.verificationLoading) return;
        if (page < 1 || page > pageData.verificationPagination.totalPages) {
            return;
        }

        filters.applyVerificationFilters({ pageValue: page });
    };

    const handleVerificationStationChange = (stationId) => {
        if (filters.verificationLoading) return;

        filters.applyVerificationFilters({
            stationValue: stationId,
            pageValue: 1,
        });
    };

    const handleSuggestionSelect = (suggestion) => {
        if (filters.summaryLoading) return;

        const nextValue = suggestion.search || suggestion.label || "";

        filters.setSearchInput(nextValue);
        suggestions.setShowSuggestions(false);
        filters.applySearch(`${suggestion.id} ${nextValue}`.trim());
    };

    const handleDownloadPDF = () => {
        if (filters.summaryLoading) return;

        filters.loadPrintSummary({
            onSuccess: downloadAfterPrintSummaryRender,
        });
    };

    return {
        applyFilters: filters.applyFilters,
        applySearch: filters.applySearch,
        filteredSummary: pageData.filteredSummary,
        handleDownloadPDF,
        handleSummaryPageChange,
        handleSuggestionSelect,
        handleVerificationPageChange,
        handleVerificationStationChange,
        isSchoolAdmin,
        offices: pageData.offices,
        pdfRef,
        searchBoxRef: suggestions.searchBoxRef,
        searchInput: filters.searchInput,
        selectedMonth,
        selectedOffice: filters.selectedOffice,
        selectedYear: filters.selectedYear,
        setSearchInput: filters.setSearchInput,
        setSelectedMonth,
        setSelectedOffice: filters.setSelectedOffice,
        setSelectedYear: filters.setSelectedYear,
        setShowSuggestions: suggestions.setShowSuggestions,
        showSuggestions: suggestions.showSuggestions,
        stationEmployees: stationVerification?.data || [],
        summaryPagination: pageData.summaryPagination,
        suggestionMatches: suggestions.suggestionMatches,
        suggestionsLoading: suggestions.suggestionsLoading,
        summaryLoading: filters.summaryLoading,
        verificationLoading: filters.verificationLoading,
        verificationPagination: pageData.verificationPagination,
        years: pageData.years,
    };
};

export default useTardinessSummaryManagement;
