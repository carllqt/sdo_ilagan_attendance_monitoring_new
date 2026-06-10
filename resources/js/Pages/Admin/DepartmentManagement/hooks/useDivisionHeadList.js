import { router } from "@inertiajs/react";
import { closeDepartmentModalParams } from "../utils";
import { getEmployeeName } from "@/lib/utils";
import { useState } from "react";

const useDivisionHeadList = ({
    divisionHeadLimit,
    divisionHeadRows,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const paginatedRows = divisionHeadRows?.data || [];
    const currentPage = divisionHeadRows?.current_page || 1;
    const totalPages = divisionHeadRows?.last_page || 1;
    const totalEntries = divisionHeadRows?.total || 0;
    const startIndex = divisionHeadRows?.from || 0;
    const endIndex = divisionHeadRows?.to || 0;

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;

        const query = new URLSearchParams(window.location.search);
        query.set("division_head_page", page);
        query.set("division_head_limit", divisionHeadLimit);

        router.get(route("departmentmanagement"), Object.fromEntries(query), {
            only: ["divisionHeadRows", "divisionHeadPage", "divisionHeadLimit"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
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

        router.get(route("departmentmanagement"), Object.fromEntries(query), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeDepartmentModal = () => {
        const query = new URLSearchParams(window.location.search);
        closeDepartmentModalParams(query);

        router.get(route("departmentmanagement"), Object.fromEntries(query), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
        closeDepartmentModal,
        currentPage,
        endIndex,
        getEmployeeName,
        handlePageChange,
        isLoading,
        openDepartmentModal,
        paginatedRows,
        startIndex,
        totalEntries,
        totalPages,
    };
};

export default useDivisionHeadList;

