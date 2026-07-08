import React from "react";
import { Loader2, Search } from "lucide-react";

import FloatingInput from "@/components/floating-input";
import useEmployeeSearchBox from "../hooks/useEmployeeSearchBox";

const EmployeeSearchBox = ({
    search,
    selectedStationCode,
    selectedStationName,
    setSearch,
    submitSearch,
}) => {
    const {
        changeSearch,
        clearSearch,
        searchBoxRef,
        selectSuggestion,
        showSuggestions,
        submitCurrentSearch,
        submitOnEnter,
        suggestionsLoading,
        suggestionMatches,
    } = useEmployeeSearchBox({
        search,
        selectedStationCode,
        selectedStationName,
        setSearch,
        submitSearch,
    });

    return (
        <div ref={searchBoxRef} className="relative w-[340px] shrink-0">
            <form onSubmit={submitCurrentSearch} className="relative">
                <FloatingInput
                    label="Employee Name"
                    icon={Search}
                    name="attendance_employee_search"
                    value={search}
                    variant="glass"
                    clearable
                    onClear={clearSearch}
                    clearAriaLabel="Clear employee search"
                    onChange={changeSearch}
                    onKeyDown={submitOnEnter}
                />
            </form>

            {showSuggestions && search.trim() ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
                    <div className="border-b bg-[#f4f6ff] px-3 py-2 text-xs font-semibold uppercase text-[#141b6d]">
                        Results for "{search.trim()}"
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                        {suggestionsLoading ? (
                            <div className="flex items-center gap-3 px-3 py-4 text-sm text-slate-500">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef1ff] text-[#141b6d]">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </span>
                                <div>
                                    <div className="font-medium text-slate-700">
                                        Searching employees...
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        Checking names and ID
                                    </div>
                                </div>
                            </div>
                        ) : suggestionMatches.length > 0 ? (
                            suggestionMatches.map((suggestion) => (
                                <button
                                    key={suggestion.id}
                                    type="button"
                                    onMouseDown={() =>
                                        selectSuggestion(suggestion)
                                    }
                                    className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-[#f4f6ff]"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate font-medium text-slate-800">
                                            {suggestion.name}
                                        </div>
                                        <div className="truncate text-xs text-slate-500">
                                            {suggestion.position || "Employee"}
                                        </div>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-[#eef1ff] px-2 py-1 text-[11px] font-semibold text-[#141b6d]">
                                        Search
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-sm text-slate-500">
                                No employee matches found.
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default EmployeeSearchBox;
