import { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import {
    blueBlackPalette,
    closeDepartmentModalParams,
} from "../utils";
import { sortAlphabetically } from "@/lib/utils";
import { buildPaginationItems } from "@/Components/PaginationMain";

const useDepartmentList = ({
    divisionLimit,
    divisionList,
    initialDivisionPage = 1,
    officeLimit,
    officeList,
    offices,
    office_heads,
}) => {
    const [chartReady, setChartReady] = useState(false);
    const [officeLoading, setOfficeLoading] = useState(false);
    const [divisionLoading, setDivisionLoading] = useState(false);
    const sortedOffices = useMemo(
        () => sortAlphabetically(offices, "name"),
        [offices],
    );
    const officeRows = officeList?.data || [];
    const officePage = officeList?.current_page || 1;
    const totalOfficePages = officeList?.last_page || 1;
    const officePaginationItems = useMemo(
        () => buildPaginationItems(officePage, totalOfficePages),
        [officePage, totalOfficePages],
    );
    const divisionRows = divisionList?.data || [];
    const divisionPage = divisionList?.current_page || initialDivisionPage || 1;
    const totalDivisionPages = divisionList?.last_page || 1;
    const divisionPaginationItems = useMemo(
        () => buildPaginationItems(divisionPage, totalDivisionPages),
        [divisionPage, totalDivisionPages],
    );
    const assignedCount = sortedOffices.filter((office) =>
        office_heads.some((head) => head.employee?.office_id === office.id),
    ).length;
    const missingOffices = sortedOffices.filter(
        (office) =>
            !office_heads.some((head) => head.employee?.office_id === office.id),
    );
    const coverage = Math.round(
        (assignedCount / (sortedOffices.length || 1)) * 100,
    );
    const chartData = {
        labels: ["Assigned", "Missing"],
        datasets: [
            {
                data: [assignedCount, missingOffices.length],
                backgroundColor: ["#1d4ed8", "#d1d5db"],
                borderWidth: 0,
            },
        ],
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: { legend: { display: false } },
    };
    const divisionAnalytics = useMemo(() => {
        const grouped = offices.reduce((acc, office) => {
            const divisionName =
                office?.division?.code || office?.division?.name || "Unknown";
            acc[divisionName] = (acc[divisionName] || 0) + 1;
            return acc;
        }, {});

        const labels = sortAlphabetically(Object.keys(grouped), (item) => item);

        return {
            labels,
            datasets: [
                {
                    data: Object.values(grouped),
                    backgroundColor: labels.map(
                        (_, index) =>
                            blueBlackPalette[index % blueBlackPalette.length],
                    ),
                    borderWidth: 0,
                },
            ],
        };
    }, [offices]);
    const divisionSummary = useMemo(() => {
        return offices.reduce((acc, office) => {
            const key =
                office?.division?.code || office?.division?.name || "Unknown";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }, [offices]);

    useEffect(() => {
        const timer = setTimeout(() => setChartReady(true), 200);
        return () => clearTimeout(timer);
    }, []);

    const loadOfficeList = ({ page = officePage } = {}) => {
        const query = new URLSearchParams(window.location.search);

        query.set("office_page", page);
        query.set("limit", officeLimit);
        query.delete("organization_search");

        router.get(route("department-management"), Object.fromEntries(query), {
            only: ["officeList", "officeLimit"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setOfficeLoading(true),
            onFinish: () => setOfficeLoading(false),
        });
    };

    const handleOfficePageChange = (page) => {
        if (page < 1 || page > totalOfficePages) return;

        loadOfficeList({ page });
    };

    const handleDivisionPageChange = (page) => {
        if (page < 1 || page > totalDivisionPages) return;

        const query = new URLSearchParams(window.location.search);

        query.set("division_page", page);
        query.set("division_limit", divisionLimit);

        router.get(route("department-management"), Object.fromEntries(query), {
            only: ["divisionList", "divisionPage", "divisionLimit"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setDivisionLoading(true),
            onFinish: () => setDivisionLoading(false),
        });
    };

    const openDepartmentModal = (modal, params = {}) => {
        const query = new URLSearchParams(window.location.search);

        query.delete("head_id");
        query.delete("division_id");
        query.delete("division_name");
        query.delete("office_id");
        query.set("modal", modal);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                query.set(key, value);
            }
        });

        router.get(route("department-management"), Object.fromEntries(query), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeDepartmentModal = () => {
        const query = new URLSearchParams(window.location.search);
        closeDepartmentModalParams(query);

        router.get(route("department-management"), Object.fromEntries(query), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
        assignedCount,
        blueBlackPalette,
        chartData,
        chartOptions,
        chartReady,
        closeDepartmentModal,
        coverage,
        divisionAnalytics,
        divisionChartOptions: chartOptions,
        divisionPage,
        divisionPaginationItems,
        divisionLoading,
        divisionRows,
        divisionSummary,
        handleDivisionPageChange,
        handleOfficePageChange,
        missingOffices,
        officeLoading,
        officePaginationItems,
        officePage,
        officeRows,
        openDepartmentModal,
        sortedOffices,
        totalDivisionPages,
        totalOfficePages,
    };
};

export default useDepartmentList;

