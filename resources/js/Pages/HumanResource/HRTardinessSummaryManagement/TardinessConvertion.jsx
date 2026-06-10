import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Calculator } from "lucide-react";
import HrSummaryofTardinessReport from "@/Pages/DocumentsFormats/HrSummaryofTardinessReport";
import ConvertionTable from "./Partials/ConvertionTable";
import EmployeeList from "./Partials/EmployeeList";
import useTardinessConvertionManagement from "./hooks/useTardinessConvertionManagement";

const TardinessConvertion = ({
    records = {},
    monthList = [],
    offices: officeOptions = [],
    office = "all",
    search = "",
    selectedFirstMonth,
    selectedSecondMonth,
    conversionHours = [],
    conversionMinutes = [],
    editConvertionModal = null,
}) => {
    const {
        applySearch,
        groupedByEmployee,
        handleFirstMonthChange,
        handleOfficeChange,
        handlePageChange,
        handlePrintPDF,
        handleSecondMonthChange,
        handleSuggestionSelect,
        isLoading,
        monthRangeLabel,
        offices,
        pdfRef,
        searchBoxRef,
        searchInput,
        secondMonthList,
        selectedFirstMonth: selectedFirstMonthValue,
        selectedOffice,
        selectedSecondMonth: selectedSecondMonthValue,
        setSearchInput,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
        summaryPayload,
    } = useTardinessConvertionManagement({
        monthList,
        office,
        officeOptions,
        records,
        search,
        selectedFirstMonth,
        selectedSecondMonth,
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-5">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <span>Tardiness Summary / Convertion Management</span>
                </div>
            }
        >
            <Head title="Tardiness Summary / Convertion Management" />
            <main>
                <ConvertionTable
                    conversionHours={conversionHours}
                    conversionMinutes={conversionMinutes}
                    editConvertionModal={editConvertionModal}
                />

                <EmployeeList
                    groupedByEmployee={groupedByEmployee}
                    monthRangeLabel={monthRangeLabel}
                    searchBoxRef={searchBoxRef}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    applySearch={applySearch}
                    selectSuggestion={handleSuggestionSelect}
                    setShowSuggestions={setShowSuggestions}
                    showSuggestions={showSuggestions}
                    suggestionMatches={suggestionMatches}
                    suggestionsLoading={suggestionsLoading}
                    offices={offices}
                    selectedOffice={selectedOffice}
                    setSelectedOffice={handleOfficeChange}
                    monthList={monthList}
                    selectedFirstMonth={selectedFirstMonthValue}
                    setSelectedFirstMonth={handleFirstMonthChange}
                    selectedSecondMonth={selectedSecondMonthValue}
                    setSelectedSecondMonth={handleSecondMonthChange}
                    secondMonthList={secondMonthList}
                    onSaveSuccess={handlePrintPDF}
                    summaryPayload={summaryPayload}
                    isLoading={isLoading}
                    pagination={records}
                    onPageChange={handlePageChange}
                />

                <div style={{ display: "none" }}>
                    <HrSummaryofTardinessReport
                        ref={pdfRef}
                        groupedByEmployee={groupedByEmployee}
                        monthRangeLabel={monthRangeLabel}
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default TardinessConvertion;
