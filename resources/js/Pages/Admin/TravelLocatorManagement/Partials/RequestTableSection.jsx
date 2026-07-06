import React, { useEffect, useState } from "react";
import PaginationMain from "@/Components/PaginationMain";
import { SuggestionSkeletonList } from "@/Components/Skeletons";
import { CustomDropdownCheckboxObject } from "@/components/dropdown-menu-main";
import FloatingInput from "@/components/floating-input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { emptyPagination } from "../util";
import useTravelLocatorSuggestions from "../hooks/useTravelLocatorSuggestions";

const RequestTableSection = ({
    columns,
    filters,
    isLoading,
    onFilterChange,
    records = emptyPagination,
    renderRow,
    searchPlaceholder,
    stations = [],
    title,
    type,
}) => {
    const [searchInput, setSearchInput] = useState(filters.search || "");
    const items = records.data || [];
    const stationItems = stations.map((station) => ({
        ...station,
        division: station.code ? { name: station.code } : null,
    }));
    const selectedStation =
        stationItems.find(
            (station) => Number(station.id) === Number(filters.station_id),
        ) || stationItems[0];
    const {
        searchBoxRef,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
    } = useTravelLocatorSuggestions({
        enabled: !isLoading && Boolean(searchInput.trim()),
        query: searchInput,
        stationId: selectedStation?.id,
        type,
    });

    useEffect(() => {
        setSearchInput(filters.search || "");
    }, [filters.search]);

    const applySearch = () => {
        if (isLoading) return;

        onFilterChange({
            search: searchInput.trim(),
            page: 1,
        });
        setShowSuggestions(false);
    };

    const selectSuggestion = (suggestion) => {
        if (isLoading) return;

        const search = suggestion.search || suggestion.label || "";

        setSearchInput(suggestion.label || search);
        onFilterChange({
            search,
            page: 1,
        });
        setShowSuggestions(false);
    };

    const clearSearch = () => {
        if (isLoading) return;

        setSearchInput("");
        setShowSuggestions(false);
        onFilterChange({
            search: "",
            page: 1,
        });
    };

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">
                        {title}
                    </h2>
                    <p className="text-sm text-slate-500">
                        Showing submitted requests from the login form
                    </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <CustomDropdownCheckboxObject
                        label="Select Station"
                        items={stationItems}
                        selected={selectedStation?.id}
                        buttonLabel={selectedStation?.name || "Select Station"}
                        onChange={(stationId) =>
                            onFilterChange({
                                station_id: stationId,
                                page: 1,
                            })
                        }
                        disabled={isLoading}
                        buttonVariant="outline"
                        className="h-10 w-full border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 sm:w-[320px]"
                    />

                    <div
                        ref={searchBoxRef}
                        className="relative w-full sm:w-[360px]"
                    >
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                applySearch();
                            }}
                            className="relative"
                        >
                            <FloatingInput
                                label={searchPlaceholder}
                                icon={Search}
                                value={searchInput}
                                disabled={isLoading}
                                clearable
                                onClear={clearSearch}
                                clearAriaLabel={`Clear ${searchPlaceholder.toLowerCase()}`}
                                onChange={(event) => {
                                    setSearchInput(event.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        applySearch();
                                    }
                                }}
                            />
                        </form>

                        {showSuggestions && searchInput.trim() && !isLoading ? (
                            <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Results for "{searchInput.trim()}"
                                </div>

                                <div className="max-h-72 overflow-y-auto">
                                    {suggestionsLoading ? (
                                        <SuggestionSkeletonList />
                                    ) : suggestionMatches.length > 0 ? (
                                        suggestionMatches.map((suggestion) => (
                                            <button
                                                key={suggestion.id}
                                                type="button"
                                                onMouseDown={() =>
                                                    selectSuggestion(suggestion)
                                                }
                                                className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-slate-800">
                                                        {suggestion.label}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {suggestion.meta || "-"}
                                                    </div>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                    Search
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-4 text-sm text-slate-500">
                                            No request matches found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table className="min-w-[1180px]">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-900">
                            {columns.map((column) => (
                                <TableHead
                                    key={column}
                                    className="whitespace-nowrap px-3 text-white"
                                >
                                    {column}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length > 0 ? (
                            items.map(renderRow)
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="p-5 text-center text-slate-500"
                                >
                                    No submitted requests found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationMain
                pagination={records}
                entryLabel="requests"
                disabled={isLoading}
                onPageChange={(page) => onFilterChange({ page })}
            />
        </section>
    );
};

export default RequestTableSection;
