import { useState } from "react";
import { router } from "@inertiajs/react";
import { buildConvertedTardinessQuery } from "../utils";

const useConvertedEmployeeList = ({ records = {} }) => {
    const [isLoading, setIsLoading] = useState(false);
    const recordItems = records?.data || [];
    const skeletonRows = Math.max(
        5,
        Math.min(Number(records?.per_page || 10), 10),
    );

    const handlePageChange = (page) => {
        router.get(
            route("converted-tardiness-record"),
            buildConvertedTardinessQuery({
                page,
                limit: records?.per_page || 10,
            }),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            },
        );
    };

    return {
        handlePageChange,
        isLoading,
        recordItems,
        skeletonRows,
    };
};

export default useConvertedEmployeeList;
