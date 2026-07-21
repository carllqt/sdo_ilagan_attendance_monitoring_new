import React, { useState } from "react";
import { Building2 } from "lucide-react";

import PaginationMain from "@/Components/PaginationMain";
import useEmployeePagination from "../hooks/useEmployeePagination";
import {
    EmployeeCardGrid,
    EmployeeCardSkeletonGrid,
} from "./EmployeeCards";
import EmployeeSearchBox from "./EmployeeSearchBox";
import SchoolList from "./SchoolList";
import SidePanels from "./SidePanels";

const EmployeeListHeader = ({
    search,
    selectedStationCode,
    selectedStationName,
    setEmployeeSearchSuggestionsOpen,
    setSearch,
    submitSearch,
}) => (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-violet-500 text-white shadow-lg shadow-blue-950/20 ring-1 ring-white/30">
                <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black text-white">
                {selectedStationName}
            </h2>
        </div>

        <div className="flex items-center gap-3">
            <EmployeeSearchBox
                search={search}
                selectedStationCode={selectedStationCode}
                selectedStationName={selectedStationName}
                onSuggestionOpenChange={setEmployeeSearchSuggestionsOpen}
                setSearch={setSearch}
                submitSearch={submitSearch}
            />
        </div>
    </div>
);

const EmployeeCardsSection = ({
    isFiltering,
    page,
    pageMotion,
    rows,
}) => (
    <>
        {isFiltering ? (
            <EmployeeCardSkeletonGrid />
        ) : (
            <EmployeeCardGrid
                page={page}
                pageMotion={pageMotion}
                rows={rows}
            />
        )}

        {!isFiltering && rows.length === 0 && (
            <div className="py-16 text-center text-sm font-semibold text-slate-500">
                No attendance records found.
            </div>
        )}
    </>
);

const EmployeeList = ({
    employees,
    goToPage,
    isFiltering = false,
    isStationFiltering = false,
    rows,
    search,
    selectedStation,
    selectedStationCode,
    selectedStationName,
    pageMotion = "next",
    selectStation,
    setSearch,
    setStationSearch,
    submitSearch,
    stationSearch,
    stations,
    recentLogs = [],
    topFirstTimeIns = [],
    travelOrders = [],
}) => {
    const { page, pageCount, total, startIndex, endIndex } =
        useEmployeePagination(employees);
    const [employeeSearchSuggestionsOpen, setEmployeeSearchSuggestionsOpen] =
        useState(false);

    return (
        <section className="relative z-10 mx-auto w-full max-w-[1840px] px-8 pb-7">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#050d49]/80 p-5 shadow-[0_24px_80px_rgba(2,6,47,0.42)] ring-1 ring-violet-200/10">
                <div className="relative z-10">
                    <SchoolList
                        selectedStation={selectedStation}
                        selectStation={selectStation}
                        setStationSearch={setStationSearch}
                        stationSearch={stationSearch}
                        stations={stations}
                    />

                    <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,1fr)_25%]">
                        <div className="rounded-2xl border border-white/15 bg-[#071158]/65 p-5 shadow-[0_18px_48px_rgba(2,6,47,0.20)] ring-1 ring-violet-200/10">
                            <EmployeeListHeader
                                search={search}
                                selectedStationCode={selectedStationCode}
                                selectedStationName={selectedStationName}
                                setEmployeeSearchSuggestionsOpen={
                                    setEmployeeSearchSuggestionsOpen
                                }
                                setSearch={setSearch}
                                submitSearch={submitSearch}
                            />

                            <div
                                className={`transition duration-200 ${
                                    employeeSearchSuggestionsOpen
                                        ? "pointer-events-none blur-[2px] opacity-45"
                                        : ""
                                }`}
                            >
                                <EmployeeCardsSection
                                    isFiltering={isFiltering}
                                    page={page}
                                    pageMotion={pageMotion}
                                    rows={rows}
                                />

                                <PaginationMain
                                    className="mt-7"
                                    currentPage={page}
                                    from={total === 0 ? 0 : startIndex}
                                    onPageChange={goToPage}
                                    showEntryLabel={false}
                                    to={endIndex}
                                    total={total}
                                    totalPages={pageCount}
                                    disabled={isFiltering}
                                    variant="glass"
                                />
                            </div>
                        </div>

                        <SidePanels
                            isStationFiltering={isStationFiltering}
                            recentLogs={recentLogs}
                            topFirstTimeIns={topFirstTimeIns}
                            travelOrders={travelOrders}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EmployeeList;
