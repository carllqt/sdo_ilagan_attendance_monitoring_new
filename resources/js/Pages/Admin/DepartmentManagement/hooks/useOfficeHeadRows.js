import { useEffect, useRef, useState } from "react";
import axios from "axios";

const useOfficeHeadRows = ({ officeHeadLimit, officeHeadRows, officeSearch }) => {
    const [rowsData, setRowsData] = useState(officeHeadRows);
    const [searchInput, setSearchInput] = useState(officeSearch);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [selectedOfficeId, setSelectedOfficeId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const requestRef = useRef(0);

    const paginatedRows = rowsData?.data || [];
    const currentPage = rowsData?.current_page || 1;
    const totalPages = rowsData?.last_page || 1;
    const totalEntries = rowsData?.total || 0;
    const startIndex = rowsData?.from || 0;
    const endIndex = rowsData?.to || 0;

    useEffect(() => {
        setRowsData(officeHeadRows);
    }, [officeHeadRows]);

    useEffect(() => {
        setSearchInput(officeSearch || "");
    }, [officeSearch]);

    const loadRows = ({
        page = currentPage,
        search,
        officeId = selectedOfficeId,
    } = {}) => {
        if (isLoading) return;

        const params = new URLSearchParams(window.location.search);
        const nextSearch = search === undefined ? searchInput : search;
        const requestId = requestRef.current + 1;
        requestRef.current = requestId;

        params.set("office_head_page", page);
        params.set("office_head_limit", officeHeadLimit);

        if (nextSearch?.trim()) {
            params.set("office_search", nextSearch.trim());
        } else {
            params.delete("office_search");
        }

        if (officeId) {
            params.set("office_head_office_id", officeId);
        } else {
            params.delete("office_head_office_id");
        }

        setIsLoading(true);

        axios
            .get(route("department.office-heads"), {
                params: Object.fromEntries(params),
            })
            .then((response) => {
                if (requestRef.current !== requestId) return;

                setRowsData(response.data.officeHeadRows);
                setSearchInput(response.data.office_search || "");
                setSelectedOfficeId(officeId || null);

                const nextParams = new URLSearchParams(window.location.search);
                nextParams.set(
                    "office_head_page",
                    response.data.officeHeadRows?.current_page || page,
                );
                nextParams.set(
                    "office_head_limit",
                    response.data.officeHeadLimit || officeHeadLimit,
                );

                if (response.data.office_search) {
                    nextParams.set("office_search", response.data.office_search);
                } else {
                    nextParams.delete("office_search");
                }
                nextParams.delete("office_head_office_id");

                window.history.replaceState(
                    {},
                    "",
                    `${route("department-management")}?${nextParams.toString()}`,
                );
            })
            .catch((error) => {
                if (requestRef.current !== requestId) return;

                console.error("Failed to load office head rows:", error);
            })
            .finally(() => {
                if (requestRef.current !== requestId) return;

                setIsLoading(false);
            });
    };

    const handlePageChange = (page) => {
        if (isLoading) return;
        if (page < 1 || page > totalPages) return;
        loadRows({ page, officeId: selectedOfficeId });
    };

    const runSearch = (value, officeId = null) => {
        if (isLoading) return;
        loadRows({ page: 1, search: value || "", officeId });
    };

    const updateSearchInput = (value) => {
        if (isLoading) return;
        setSearchInput(value);
        setSelectedOfficeId(null);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        if (isLoading) return;
        runSearch(searchInput);
    };

    return {
        currentPage,
        endIndex,
        handlePageChange,
        handleSearch,
        isSearchFocused,
        isLoading,
        paginatedRows,
        runSearch,
        searchInput,
        setIsSearchFocused,
        setSearchInput: updateSearchInput,
        startIndex,
        totalEntries,
        totalPages,
    };
};

export default useOfficeHeadRows;
