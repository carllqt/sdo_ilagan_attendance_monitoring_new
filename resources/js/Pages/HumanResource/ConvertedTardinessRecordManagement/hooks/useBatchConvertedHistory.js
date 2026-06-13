import { router } from "@inertiajs/react";
import { buildConvertedTardinessQuery } from "../utils";

const useBatchConvertedHistory = ({ batches = {} }) => {
    const batchItems = batches?.data || [];

    const handlePageChange = (page) => {
        router.get(
            route("converted-tardiness-record"),
            buildConvertedTardinessQuery({
                batch_page: page,
                batch_limit: batches?.per_page || 5,
            }),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return {
        batchItems,
        handlePageChange,
    };
};

export default useBatchConvertedHistory;
