import React, { useState } from "react";
import { ChevronUp, Loader2, Search, SlidersHorizontal } from "lucide-react";
import FloatingInput from "@/components/floating-input";
import useSearchSuggestions from "../hooks/useSearchSuggestions";

const SchoolList = ({
    selectedStation,
    selectStation,
    setStationSearch,
    stationSearch,
    stations,
}) => {
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [showSchoolFilter, setShowSchoolFilter] = useState(true);
    const {
        searchBoxRef,
        showSuggestions,
        setShowSuggestions,
        suggestionMatches,
        setSuggestionMatches,
        suggestionsLoading,
    } = useSearchSuggestions({
        query: stationSearch,
        routeName: "attendance-monitoring.stations.suggestions",
    });

    const stationTabs = selectedSuggestion ? [selectedSuggestion] : stations;
    const stationGroups = stationTabs.length > 5 ? [0, 1] : [0];
    const hasOpenSuggestions = showSuggestions && Boolean(stationSearch.trim());

    const selectSuggestion = (station) => {
        setSelectedSuggestion(station);
        setStationSearch(station.name || "");
        setShowSuggestions(false);
        selectStation(station);
    };

    const clearSearch = () => {
        const sdoStation =
            stations.find((station) => station.code === "SDO") || stations[0];

        setSelectedSuggestion(null);
        setSuggestionMatches([]);
        setStationSearch("");
        setShowSuggestions(false);

        if (sdoStation) {
            selectStation(sdoStation);
        }
    };

    return (
        <div
            className={
                showSchoolFilter ? "relative z-30 mb-5" : "relative z-30 mb-2"
            }
        >
            <style>{`
                @keyframes school-drift {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>
            <div
                className={`relative z-40 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between ${
                    showSchoolFilter ? "mb-3" : "mb-0"
                }`}
            >
                {showSchoolFilter ? (
                    <h2 className="text-base font-black text-white">Schools</h2>
                ) : (
                    <div />
                )}

                <div className="flex items-center gap-3">
                    {showSchoolFilter ? (
                        <div
                            ref={searchBoxRef}
                            className="relative z-50 w-[340px] shrink-0"
                        >
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();

                                    if (suggestionMatches.length > 0) {
                                        selectSuggestion(suggestionMatches[0]);
                                    }
                                }}
                                className="relative"
                            >
                                <FloatingInput
                                    label="Station Name"
                                    icon={Search}
                                    name="attendance_station_search"
                                    value={stationSearch}
                                    variant="glass"
                                    clearable
                                    onClear={clearSearch}
                                    clearAriaLabel="Clear station search"
                                    onChange={(event) => {
                                        const value = event.target.value;

                                        setStationSearch(value);
                                        if (!value.trim()) {
                                            setSelectedSuggestion(null);
                                        }
                                        setShowSuggestions(true);
                                    }}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Enter" &&
                                            suggestionMatches.length > 0
                                        ) {
                                            event.preventDefault();
                                            selectSuggestion(
                                                suggestionMatches[0],
                                            );
                                        }
                                    }}
                                />
                            </form>

                            {hasOpenSuggestions ? (
                                <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                    <div className="border-b bg-[#f4f6ff] px-3 py-2 text-xs font-semibold uppercase text-[#141b6d]">
                                        Results for "{stationSearch.trim()}"
                                    </div>

                                    <div className="max-h-72 overflow-y-auto">
                                        {suggestionsLoading ? (
                                            <div className="flex items-center gap-3 px-3 py-4 text-sm text-slate-500">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef1ff] text-[#141b6d]">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                </span>
                                                <div>
                                                    <div className="font-medium text-slate-700">
                                                        Searching stations...
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        Checking names and codes
                                                    </div>
                                                </div>
                                            </div>
                                        ) : suggestionMatches.length > 0 ? (
                                            suggestionMatches.map((station) => (
                                                <button
                                                    key={station.id}
                                                    type="button"
                                                    onMouseDown={() =>
                                                        selectSuggestion(
                                                            station,
                                                        )
                                                    }
                                                    className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-[#f4f6ff]"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium text-slate-800">
                                                            {station.name}
                                                        </div>
                                                        <div className="truncate text-xs text-slate-500">
                                                            {station.code ||
                                                                "No code"}
                                                        </div>
                                                    </div>

                                                    <span className="shrink-0 rounded-full bg-[#eef1ff] px-2 py-1 text-[11px] font-semibold text-[#141b6d]">
                                                        Select
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-4 text-sm text-slate-500">
                                                No station matches found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    <button
                        type="button"
                        onClick={() => setShowSchoolFilter((value) => !value)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-[#071158]/80 text-white shadow-[0_0_16px_rgba(2,6,47,0.32)] ring-1 ring-violet-200/20 transition hover:-translate-y-0.5 hover:bg-[#0b1b74]"
                        title={
                            showSchoolFilter
                                ? "Hide school filter"
                                : "Show school filter"
                        }
                        aria-label={
                            showSchoolFilter
                                ? "Hide school filter"
                                : "Show school filter"
                        }
                    >
                        {showSchoolFilter ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                        )}
                    </button>
                </div>
            </div>
            {showSchoolFilter ? (
                <div
                    className={`relative z-30 overflow-hidden py-1 transition duration-200 ${
                        hasOpenSuggestions
                            ? "pointer-events-none blur-[2px] opacity-45"
                            : ""
                    }`}
                >
                    <div className="pointer-events-none absolute left-0 top-0 h-full" />
                    <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-8 bg-gradient-to-l from-[#2734a7]/80 to-transparent" />
                    <div
                        className="relative z-10 flex w-max flex-nowrap items-center gap-3"
                        style={{
                            animation:
                                stationTabs.length > 5
                                    ? "school-drift 750s linear infinite"
                                    : "none",
                        }}
                    >
                        {stationGroups.map((group) => (
                            <div
                                key={group}
                                className="relative flex shrink-0 flex-nowrap items-center gap-3"
                                aria-hidden={group === 1}
                            >
                                {stationTabs.map((station) => (
                                    <button
                                        key={`${group}-${station.id}`}
                                        type="button"
                                        onClick={() => selectStation(station)}
                                        className={`relative z-0 shrink-0 rounded-lg border px-5 py-3 text-xs font-black transition hover:z-30 hover:-translate-y-0.5 ${
                                            String(selectedStation) ===
                                            String(station.id)
                                                ? "border-white/30 bg-[#0b1b74] text-white shadow-[0_0_18px_rgba(2,6,47,0.42)] ring-1 ring-violet-200/35"
                                                : "border-white/20 bg-[#071158]/45 text-white shadow-sm hover:bg-[#0b1b74]/70 hover:text-white"
                                        }`}
                                    >
                                        {station.name}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default SchoolList;
