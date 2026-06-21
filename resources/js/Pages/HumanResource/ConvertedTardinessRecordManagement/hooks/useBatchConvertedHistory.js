import { router } from "@inertiajs/react";
import { buildConvertedTardinessQuery } from "../utils";

const useBatchConvertedHistory = ({ batches = {} }) => {
    const batchItems = batches?.data || [];

    const handlePageChange = (page) => {
        router.get(
            route("converted-tardiness-record"),
            buildConvertedTardinessQuery({
                batch_id: null,
                batch_limit: batches?.per_page || 5,
                batch_page: page,
            }),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const openBatchDetails = (batchId) => {
        router.get(
            route("converted-tardiness-record"),
            buildConvertedTardinessQuery({ batch_id: batchId }),
            {
                only: ["selectedBatch"],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const closeBatchDetails = () => {
        router.get(
            route("converted-tardiness-record"),
            buildConvertedTardinessQuery({ batch_id: null }),
            {
                only: ["selectedBatch"],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return {
        batchItems,
        closeBatchDetails,
        handlePageChange,
        openBatchDetails,
    };
};

export default useBatchConvertedHistory;
