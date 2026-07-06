import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import EmployeeList from "./Partials/EmployeeList";
import StationVerificationList from "./Partials/StationVerificationList";
import SummaryofTardinessReport from "@/Components/Reports/AdminSummaryofTardinessReport";
import useTardinessSummaryManagement from "./hooks/useTardinessSummaryManagement";
import { monthList } from "./utils";
import { ChartColumn } from "lucide-react";

const TardinessSummary = ({
    summary,
    printSummary = [],
    stationVerification,
    verificationStationId,
    verificationStations = [],
    offices: officeOptions = [],
    years: yearOptions = [],
    office = "All Offices",
    search = "",
    year,
}) => {
    const {
        applyFilters,
        applySearch,
        filteredSummary,
        handleDownloadPDF,
        handleSummaryPageChange,
        handleSuggestionSelect,
        handleVerificationPageChange,
        handleVerificationStationChange,
        isSchoolAdmin,
        offices,
        pdfRef,
        searchBoxRef,
        searchInput,
        selectedMonth,
        selectedOffice,
        selectedYear,
        setSearchInput,
        setSelectedMonth,
        setSelectedOffice,
        setSelectedYear,
        setShowSuggestions,
        showSuggestions,
        stationEmployees,
        summaryPagination,
        suggestionMatches,
        suggestionsLoading,
        summaryLoading,
        verificationLoading,
        verificationPagination,
        years,
    } = useTardinessSummaryManagement({
        office,
        officeOptions,
        search,
        stationVerification,
        summary,
        verificationStationId,
        verificationStations,
        year,
        yearOptions,
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-5">
                    <ChartColumn className="w-5 h-5 text-blue-600" />
                    <span>Tardiness Summary</span>
                </div>
            }
        >
            <Head title="Summary of Tardiness" />
            <main>
                <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-lg">
                    <EmployeeList
                        filteredSummary={filteredSummary}
                        monthList={monthList}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                        searchBoxRef={searchBoxRef}
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        applySearch={applySearch}
                        selectSuggestion={handleSuggestionSelect}
                        setShowSuggestions={setShowSuggestions}
                        showSuggestions={showSuggestions}
                        suggestionMatches={suggestionMatches}
                        suggestionsLoading={suggestionsLoading}
                        isLoading={summaryLoading}
                        years={years}
                        offices={offices}
                        selectedOffice={selectedOffice}
                        setSelectedOffice={setSelectedOffice}
                        applyFilters={applyFilters}
                        onDownloadPDF={handleDownloadPDF}
                        currentPage={summaryPagination.currentPage}
                        handlePageChange={handleSummaryPageChange}
                        pageNumbers={summaryPagination.pageNumbers}
                        paginationFrom={summaryPagination.paginationFrom}
                        paginationTo={summaryPagination.paginationTo}
                        totalPages={summaryPagination.totalPages}
                        totalRecords={summaryPagination.totalRecords}
                    />
                </div>
                {!isSchoolAdmin && (
                    <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-lg mt-5">
                        <StationVerificationList
                            currentPage={verificationPagination.currentPage}
                            employees={stationEmployees}
                            handlePageChange={handleVerificationPageChange}
                            isLoading={verificationLoading}
                            monthList={monthList}
                            onStationChange={handleVerificationStationChange}
                            pageNumbers={verificationPagination.pageNumbers}
                            paginationFrom={
                                verificationPagination.paginationFrom
                            }
                            paginationTo={verificationPagination.paginationTo}
                            selectedStationId={verificationStationId}
                            selectedYear={selectedYear}
                            stations={verificationStations}
                            totalRecords={verificationPagination.totalRecords}
                            totalPages={verificationPagination.totalPages}
                        />
                    </div>
                )}

                <div style={{ display: "none" }}>
                    <SummaryofTardinessReport
                        ref={pdfRef}
                        summary={printSummary}
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default TardinessSummary;
