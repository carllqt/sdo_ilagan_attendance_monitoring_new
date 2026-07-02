import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { getStationHighlightKey, getWidePagination } from "../utils";

const useStationAdminRows = ({
    adminLimit,
    highlightedStationId,
    highlightRequestKey,
    search,
    stationRows,
}) => {
    const [animatedStationId, setAnimatedStationId] = useState(null);
    const [stationRowsData, setStationRowsData] = useState(stationRows);
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [isLoading, setIsLoading] = useState(false);
    const animationTimeoutRef = useRef(null);

    useEffect(() => {
        setSearchTerm(search || "");
    }, [search]);

    useEffect(() => {
        setStationRowsData(stationRows);
    }, [stationRows]);

    const visibleStationRows = stationRowsData?.data || [];
    const activePage = stationRowsData?.current_page || 1;
    const totalPages = stationRowsData?.last_page || 1;
    const totalEntries = stationRowsData?.total || 0;
    const startIndex = stationRowsData?.from || 0;
    const endIndex = stationRowsData?.to || 0;
    const pageNumbers = useMemo(
        () => getWidePagination(activePage, totalPages),
        [activePage, totalPages],
    );
    const highlightedStationIndex = useMemo(
        () =>
            visibleStationRows.findIndex(
                (row) =>
                    String(getStationHighlightKey(row.station)) ===
                    String(highlightedStationId),
            ),
        [highlightedStationId, visibleStationRows],
    );

    useEffect(() => {
        if (highlightedStationId == null || highlightedStationIndex < 0) {
            return;
        }

        setAnimatedStationId(highlightedStationId);

        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        animationTimeoutRef.current = setTimeout(() => {
            setAnimatedStationId(null);
        }, 2200);
    }, [highlightedStationId, highlightedStationIndex, highlightRequestKey]);

    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

    const loadAdminRows = (overrides = {}) => {
        if (isLoading) return;

        const params = new URLSearchParams(window.location.search);

        params.set("admin_page", overrides.admin_page || activePage);
        params.set("admin_limit", overrides.admin_limit || adminLimit);

        if (Object.prototype.hasOwnProperty.call(overrides, "search")) {
            if (overrides.search && overrides.search.trim()) {
                params.set("search", overrides.search.trim());
            } else {
                params.delete("search");
            }
        } else if (searchTerm.trim()) {
            params.set("search", searchTerm.trim());
        }

        setIsLoading(true);

        axios
            .get(route("stationadmin.list"), {
                params: Object.fromEntries(params),
            })
            .then((response) => {
                setStationRowsData(response.data.stationAdminRows);
                setSearchTerm(response.data.search || "");

                const nextParams = new URLSearchParams(window.location.search);
                nextParams.set("admin_page", response.data.adminPage || 1);
                nextParams.set(
                    "admin_limit",
                    response.data.adminLimit || adminLimit,
                );

                if (response.data.search) {
                    nextParams.set("search", response.data.search);
                } else {
                    nextParams.delete("search");
                }

                window.history.replaceState(
                    {},
                    "",
                    `${route("station-management")}?${nextParams.toString()}`,
                );
            })
            .catch((error) => {
                console.error("Failed to load station admin rows:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handlePageChange = (page) => {
        if (isLoading) return;
        if (page < 1 || page > totalPages) return;

        loadAdminRows({ admin_page: page });
    };

    const submitSearch = (value) => {
        if (isLoading) return;

        loadAdminRows({
            admin_page: 1,
            search: value?.trim() || "",
        });
    };

    return {
        activePage,
        animatedStationId,
        endIndex,
        handlePageChange,
        isLoading,
        pageNumbers,
        paginatedRows: visibleStationRows,
        searchTerm,
        setSearchTerm,
        startIndex,
        submitSearch,
        totalEntries,
        totalPages,
    };
};

export default useStationAdminRows;
